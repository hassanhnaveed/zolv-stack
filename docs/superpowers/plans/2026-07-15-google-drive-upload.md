# Google Drive Upload Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users pick files from Google Drive via the Select File menu and feed `File[]` into the existing `onDrop` pipeline with temporary GIS OAuth only—no site login and no backend download API.

**Architecture:** Provider-agnostic `CloudFileProvider` registry + `useCloudFilePicker` hook; Google Drive v1 uses GIS token client, Picker, and client-side Drive download. `SelectFileButton` stays UI-only; each tool passes the same `accept` / `maxFiles` / `maxSize` / `onDrop` already used by `useDropzone`.

**Tech Stack:** Next.js App Router, TypeScript, Sonner, Google Identity Services, Google Picker API, Google Drive API v3 (`alt=media`), Vitest for pure `lib/` unit tests, `@types/google.accounts` + `@types/google.picker`

## Global Constraints

- Provider-agnostic architecture so Dropbox/OneDrive can register without refactoring upload UI
- `onDrop` is the single upload pipeline and source of truth for type/size/count validation
- Client-side downloads only — no backend download API in v1
- OAuth access tokens in memory only — never localStorage, sessionStorage, cookies, or server
- Exclude Google Workspace MIME types (`application/vnd.google-apps.*`) from Picker in v1
- Generate Picker MIME filters from each tool’s existing `accept` map (`Object.keys(accept)`)
- Reuse existing validation / rejection toast behavior for files that reach `onDrop`
- Free-tier browser flow only: GIS + Picker + Drive API; no client secret
- `SelectFileButton` must not import Google Drive modules directly
- Preserve Computer / Dropbox / OneDrive / URL menu behavior (latter three remain “Coming soon”)
- OAuth scope exactly: `https://www.googleapis.com/auth/drive.file`
- TypeScript only; no `any`
- No deprecated `gapi.auth2` login flows

**Spec:** `docs/superpowers/specs/2026-07-15-google-drive-upload-design.md`

---

### Task 1: Cloud contracts, errors, env placeholders, Vitest

**Files:**
- Create: `lib/cloud/types.ts`
- Create: `lib/cloud/errors.ts`
- Create: `lib/cloud/errors.test.ts`
- Modify: `.env.example`
- Modify: `package.json` (add `test` script + vitest + Google types)

**Interfaces:**
- Consumes: nothing
- Produces: `CloudProviderId`, `AcceptMap`, `CloudPickOptions`, `CloudFileProvider`, `CloudErrorCode`, `CloudError`, `isCloudError`

- [ ] **Step 1: Install dev dependencies**

Run:

```bash
npm install -D vitest @types/google.accounts @types/google.picker
```

Expected: packages added under `devDependencies`.

- [ ] **Step 2: Add test script to `package.json`**

In `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Write failing error tests**

Create `lib/cloud/errors.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CloudError, isCloudError } from "./errors";

describe("CloudError", () => {
  it("sets code and isCloudError returns true", () => {
    const err = new CloudError("permission_denied", "denied");
    expect(err.code).toBe("permission_denied");
    expect(err.message).toBe("denied");
    expect(isCloudError(err)).toBe(true);
  });

  it("isCloudError returns false for normal errors", () => {
    expect(isCloudError(new Error("x"))).toBe(false);
  });
});
```

- [ ] **Step 4: Run tests — expect FAIL**

Run: `npm test -- lib/cloud/errors.test.ts`

Expected: FAIL (module not found / `CloudError` undefined)

- [ ] **Step 5: Implement types and errors**

Create `lib/cloud/types.ts`:

```ts
export type CloudProviderId = "google-drive" | "dropbox" | "onedrive";

/** Same shape as react-dropzone `accept`. */
export type AcceptMap = Record<string, readonly string[]>;

export interface CloudPickOptions {
  accept: AcceptMap;
  maxFiles: number;
  maxSize: number;
  /** Optional; Google Drive may ignore in v1. */
  signal?: AbortSignal;
}

export interface CloudFileProvider {
  id: CloudProviderId;
  pickFiles(options: CloudPickOptions): Promise<File[]>;
}
```

Create `lib/cloud/errors.ts`:

```ts
export type CloudErrorCode =
  | "cancelled"
  | "permission_denied"
  | "token_expired"
  | "network"
  | "scripts_failed"
  | "unsupported"
  | "invalid_selection"
  | "unknown";

export class CloudError extends Error {
  readonly code: CloudErrorCode;

  constructor(code: CloudErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CloudError";
    this.code = code;
  }
}

export function isCloudError(error: unknown): error is CloudError {
  return error instanceof CloudError;
}
```

Note: `invalid_selection` covers early reject (too many files, dupes, empty metadata) so the hook can toast without inventing ad-hoc strings in providers.

- [ ] **Step 6: Run tests — expect PASS**

Run: `npm test -- lib/cloud/errors.test.ts`

Expected: PASS

- [ ] **Step 7: Update `.env.example`**

Append:

```bash
# Google Drive picker (browser-safe; restrict by HTTP referrer / JS origin in Google Cloud)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_API_KEY=
NEXT_PUBLIC_GOOGLE_APP_ID=
```

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json lib/cloud .env.example
git commit -m "$(cat <<'EOF'
Add cloud upload contracts, CloudError, and Google env placeholders.

Install Vitest and Google GIS/Picker type packages for the Drive integration.
EOF
)"
```

---

### Task 2: MIME filter helper (data-driven + Workspace exclusion)

**Files:**
- Create: `lib/google-drive/mime.ts`
- Create: `lib/google-drive/mime.test.ts`

**Interfaces:**
- Consumes: `AcceptMap` from `lib/cloud/types.ts`
- Produces: `WORKSPACE_MIME_PREFIX`, `mimeTypesFromAccept(accept: AcceptMap): string[]`

- [ ] **Step 1: Write failing MIME tests**

Create `lib/google-drive/mime.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mimeTypesFromAccept } from "./mime";

describe("mimeTypesFromAccept", () => {
  it("returns MIME keys from accept map", () => {
    expect(
      mimeTypesFromAccept({
        "image/png": [".png"],
        "application/pdf": [".pdf"],
      }),
    ).toEqual(["image/png", "application/pdf"]);
  });

  it("excludes Google Workspace MIME types", () => {
    expect(
      mimeTypesFromAccept({
        "application/pdf": [".pdf"],
        "application/vnd.google-apps.document": [],
        "application/vnd.google-apps.spreadsheet": [],
      }),
    ).toEqual(["application/pdf"]);
  });

  it("skips empty MIME keys", () => {
    expect(
      mimeTypesFromAccept({
        "": [".x"],
        "image/jpeg": [".jpg", ".jpeg"],
      }),
    ).toEqual(["image/jpeg"]);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- lib/google-drive/mime.test.ts`

Expected: FAIL (module not found)

- [ ] **Step 3: Implement `mime.ts`**

Create `lib/google-drive/mime.ts`:

```ts
import type { AcceptMap } from "@/lib/cloud/types";

export const WORKSPACE_MIME_PREFIX = "application/vnd.google-apps.";

/**
 * Build Google Picker MIME filter from tool accept config.
 * Picker filtering is UX only — onDrop remains the validation source of truth.
 */
export function mimeTypesFromAccept(accept: AcceptMap): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const mime of Object.keys(accept)) {
    if (!mime || mime.startsWith(WORKSPACE_MIME_PREFIX)) continue;
    if (seen.has(mime)) continue;
    seen.add(mime);
    result.push(mime);
  }

  return result;
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npm test -- lib/google-drive/mime.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/google-drive/mime.ts lib/google-drive/mime.test.ts
git commit -m "$(cat <<'EOF'
Add data-driven Google Picker MIME filters from accept maps.

Exclude Workspace MIME types so Docs/Sheets are hidden in v1.
EOF
)"
```

---

### Task 3: Script loader + GIS auth (memory-only token)

**Files:**
- Create: `lib/google-drive/config.ts`
- Create: `lib/google-drive/load-scripts.ts`
- Create: `lib/google-drive/auth.ts`

**Interfaces:**
- Consumes: `CloudError` from `lib/cloud/errors.ts`
- Produces:
  - `getGoogleDrivePublicConfig(): { clientId: string; apiKey: string; appId: string }`
  - `loadGoogleDriveScripts(): Promise<void>`
  - `requestDriveAccessToken(): Promise<string>`
  - `revokeDriveAccessToken(token: string): void`
  - `DRIVE_FILE_SCOPE` constant

- [ ] **Step 1: Implement public config reader**

Create `lib/google-drive/config.ts`:

```ts
import { CloudError } from "@/lib/cloud/errors";

export interface GoogleDrivePublicConfig {
  clientId: string;
  apiKey: string;
  appId: string;
}

export function getGoogleDrivePublicConfig(): GoogleDrivePublicConfig {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY?.trim() ?? "";
  const appId = process.env.NEXT_PUBLIC_GOOGLE_APP_ID?.trim() ?? "";

  if (!clientId || !apiKey || !appId) {
    throw new CloudError(
      "scripts_failed",
      "Google Drive is not configured. Missing NEXT_PUBLIC_GOOGLE_* env vars.",
    );
  }

  return { clientId, apiKey, appId };
}
```

- [ ] **Step 2: Implement script loader**

Create `lib/google-drive/load-scripts.ts`:

```ts
import { CloudError } from "@/lib/cloud/errors";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const GAPI_SRC = "https://apis.google.com/js/api.js";

let scriptsPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new CloudError("scripts_failed")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () =>
      reject(new CloudError("scripts_failed", "Failed to load Google scripts."));
    document.head.appendChild(script);
  });
}

function loadPickerApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      reject(new CloudError("scripts_failed", "gapi missing after script load."));
      return;
    }
    window.gapi.load("picker", {
      callback: () => resolve(),
      onerror: () =>
        reject(new CloudError("scripts_failed", "Failed to load Google Picker.")),
    });
  });
}

/** Load GIS + gapi picker once per page session. */
export function loadGoogleDriveScripts(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new CloudError("scripts_failed", "Google Drive is browser-only."),
    );
  }
  if (!scriptsPromise) {
    scriptsPromise = (async () => {
      await Promise.all([loadScript(GIS_SRC), loadScript(GAPI_SRC)]);
      await loadPickerApi();
      if (!window.google?.accounts?.oauth2 || !window.google?.picker) {
        throw new CloudError(
          "scripts_failed",
          "Google APIs unavailable after load.",
        );
      }
    })().catch((error: unknown) => {
      scriptsPromise = null;
      if (error instanceof CloudError) throw error;
      throw new CloudError("scripts_failed", "Google Drive couldn’t load.");
    });
  }
  return scriptsPromise;
}
```

Add ambient `gapi` if needed — `@types/google.picker` typically expects `gapi.load`. If `tsc` complains about `window.gapi`, create `lib/google-drive/gapi.d.ts`:

```ts
export {};

declare global {
  interface Window {
    gapi: {
      load: (
        api: string,
        options: { callback: () => void; onerror?: () => void },
      ) => void;
    };
  }
}
```

- [ ] **Step 3: Implement memory-only auth**

Create `lib/google-drive/auth.ts`:

```ts
import { CloudError } from "@/lib/cloud/errors";
import { getGoogleDrivePublicConfig } from "./config";

export const DRIVE_FILE_SCOPE =
  "https://www.googleapis.com/auth/drive.file";

/**
 * Request a short-lived access token via GIS.
 * Token is returned to the caller only — never persisted.
 */
export function requestDriveAccessToken(): Promise<string> {
  const { clientId } = getGoogleDrivePublicConfig();

  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: DRIVE_FILE_SCOPE,
        callback: (response) => {
          if (response.error) {
            if (
              response.error === "access_denied" ||
              response.error === "popup_closed_by_user"
            ) {
              reject(
                new CloudError(
                  response.error === "access_denied"
                    ? "permission_denied"
                    : "cancelled",
                ),
              );
              return;
            }
            reject(new CloudError("unknown", response.error));
            return;
          }
          if (!response.access_token) {
            reject(new CloudError("unknown", "No access token returned."));
            return;
          }
          resolve(response.access_token);
        },
        error_callback: (err) => {
          const type = err?.type;
          if (type === "popup_closed") {
            reject(new CloudError("cancelled"));
            return;
          }
          if (type === "popup_failed_to_open") {
            reject(
              new CloudError(
                "permission_denied",
                "Google sign-in popup was blocked.",
              ),
            );
            return;
          }
          reject(new CloudError("unknown", "Google sign-in failed."));
        },
      });
      client.requestAccessToken({ prompt: "" });
    } catch {
      reject(new CloudError("scripts_failed", "Could not start Google sign-in."));
    }
  });
}

/** Best-effort revoke; ignore failures. Never store the token. */
export function revokeDriveAccessToken(token: string): void {
  try {
    window.google.accounts.oauth2.revoke(token, () => undefined);
  } catch {
    // ignore
  }
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`

Expected: PASS (or only unrelated pre-existing errors — fix any new errors in these files)

- [ ] **Step 5: Commit**

```bash
git add lib/google-drive
git commit -m "$(cat <<'EOF'
Add Google Drive script loader and GIS memory-only token auth.

Uses drive.file scope only and never persists access tokens.
EOF
)"
```

---

### Task 4: Picker + client-side download

**Files:**
- Create: `lib/google-drive/picker.ts`
- Create: `lib/google-drive/download.ts`

**Interfaces:**
- Consumes: `mimeTypesFromAccept`, `getGoogleDrivePublicConfig`, `CloudError`, `CloudPickOptions`
- Produces:
  - `openGooglePicker(args): Promise<GooglePickedFile[]>`
  - `downloadDriveFile(file, accessToken, signal?): Promise<File>`
  - type `GooglePickedFile = { id: string; name: string; mimeType: string; sizeBytes?: number }`

- [ ] **Step 1: Implement picker helper**

Create `lib/google-drive/picker.ts`:

```ts
import { CloudError } from "@/lib/cloud/errors";
import type { AcceptMap } from "@/lib/cloud/types";
import { getGoogleDrivePublicConfig } from "./config";
import { mimeTypesFromAccept } from "./mime";

export interface GooglePickedFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
}

export function openGooglePicker(args: {
  accessToken: string;
  accept: AcceptMap;
  maxFiles: number;
}): Promise<GooglePickedFile[]> {
  const { apiKey, appId } = getGoogleDrivePublicConfig();
  const mimeTypes = mimeTypesFromAccept(args.accept);

  return new Promise((resolve, reject) => {
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS);
    view.setIncludeFolders(false);
    view.setSelectFolderEnabled(false);
    if (mimeTypes.length > 0) {
      view.setMimeTypes(mimeTypes.join(","));
    }

    const builder = new google.picker.PickerBuilder()
      .setAppId(appId)
      .setOAuthToken(args.accessToken)
      .setDeveloperKey(apiKey)
      .addView(view)
      .setCallback((data: google.picker.ResponseObject) => {
        const action = data[google.picker.Response.ACTION];
        if (action === google.picker.Action.CANCEL) {
          reject(new CloudError("cancelled"));
          return;
        }
        if (action !== google.picker.Action.PICKED) return;

        const docs = data[google.picker.Response.DOCUMENTS] ?? [];
        const picked: GooglePickedFile[] = docs.map((doc) => ({
          id: String(doc.id),
          name: String(doc.name ?? ""),
          mimeType: String(doc.mimeType ?? ""),
          sizeBytes:
            typeof doc.sizeBytes === "number"
              ? doc.sizeBytes
              : doc.sizeBytes
                ? Number(doc.sizeBytes)
                : undefined,
        }));
        resolve(picked);
      });

    if (args.maxFiles > 1) {
      builder.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);
    }

    const picker = builder.build();
    picker.setVisible(true);
  });
}
```

If `DocsView` / `sizeBytes` typings differ, adapt to `@types/google.picker` shapes while keeping return type stable. Prefer `google.picker.DocsView()` + `ViewId.DOCS` as supported by current types.

- [ ] **Step 2: Implement download helper**

Create `lib/google-drive/download.ts`:

```ts
import { CloudError } from "@/lib/cloud/errors";
import type { GooglePickedFile } from "./picker";

export async function downloadDriveFile(
  file: GooglePickedFile,
  accessToken: string,
  signal?: AbortSignal,
): Promise<File> {
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    });
  } catch {
    throw new CloudError(
      "network",
      "Couldn’t reach Google Drive. Check your connection.",
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new CloudError("token_expired");
  }
  if (!response.ok) {
    throw new CloudError(
      "network",
      "Couldn’t download the selected Google Drive file.",
    );
  }

  const blob = await response.blob();
  const type = file.mimeType || blob.type || "application/octet-stream";
  return new File([blob], file.name, { type, lastModified: Date.now() });
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`

Expected: PASS for these modules

- [ ] **Step 4: Commit**

```bash
git add lib/google-drive/picker.ts lib/google-drive/download.ts
git commit -m "$(cat <<'EOF'
Add Google Picker open helper and client-side Drive file download.

Selected files download with the temporary OAuth token and become File objects.
EOF
)"
```

---

### Task 5: GoogleDriveProvider + registry

**Files:**
- Create: `lib/google-drive/provider.ts`
- Create: `lib/google-drive/early-validate.ts`
- Create: `lib/google-drive/early-validate.test.ts`
- Create: `lib/cloud/providers.ts`

**Interfaces:**
- Consumes: scripts, auth, picker, download, `CloudFileProvider`, `CloudPickOptions`
- Produces: `googleDriveProvider`, `getCloudProvider(id)`, `CLOUD_PROVIDERS`

- [ ] **Step 1: Write early-validate tests**

Create `lib/google-drive/early-validate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { assertValidPickerSelection } from "./early-validate";
import { CloudError } from "@/lib/cloud/errors";
import type { GooglePickedFile } from "./picker";

const file = (
  partial: Partial<GooglePickedFile> & Pick<GooglePickedFile, "id" | "name">,
): GooglePickedFile => ({
  mimeType: "application/pdf",
  sizeBytes: 10,
  ...partial,
});

describe("assertValidPickerSelection", () => {
  it("throws when over maxFiles", () => {
    expect(() =>
      assertValidPickerSelection(
        [file({ id: "1", name: "a.pdf" }), file({ id: "2", name: "b.pdf" })],
        1,
      ),
    ).toThrow(CloudError);
  });

  it("throws on duplicate ids", () => {
    expect(() =>
      assertValidPickerSelection(
        [file({ id: "1", name: "a.pdf" }), file({ id: "1", name: "b.pdf" })],
        5,
      ),
    ).toThrow(CloudError);
  });

  it("throws on missing name or zero size", () => {
    expect(() =>
      assertValidPickerSelection([file({ id: "1", name: "" })], 5),
    ).toThrow(CloudError);
    expect(() =>
      assertValidPickerSelection(
        [file({ id: "1", name: "a.pdf", sizeBytes: 0 })],
        5,
      ),
    ).toThrow(CloudError);
  });

  it("allows valid selection", () => {
    expect(() =>
      assertValidPickerSelection([file({ id: "1", name: "a.pdf" })], 5),
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm test -- lib/google-drive/early-validate.test.ts`

Expected: FAIL

- [ ] **Step 3: Implement early-validate + provider + registry**

Create `lib/google-drive/early-validate.ts`:

```ts
import { CloudError } from "@/lib/cloud/errors";
import type { GooglePickedFile } from "./picker";

export function assertValidPickerSelection(
  files: GooglePickedFile[],
  maxFiles: number,
): void {
  if (files.length === 0) {
    throw new CloudError("cancelled");
  }
  if (files.length > maxFiles) {
    throw new CloudError(
      "invalid_selection",
      `You can select at most ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`,
    );
  }

  const seen = new Set<string>();
  for (const file of files) {
    if (!file.id || seen.has(file.id)) {
      throw new CloudError(
        "invalid_selection",
        "Duplicate or invalid Google Drive selection.",
      );
    }
    seen.add(file.id);

    if (!file.name.trim()) {
      throw new CloudError(
        "invalid_selection",
        "A selected file is missing a name.",
      );
    }
    if (file.sizeBytes !== undefined && file.sizeBytes <= 0) {
      throw new CloudError(
        "invalid_selection",
        "A selected file is empty.",
      );
    }
  }
}
```

Create `lib/google-drive/provider.ts`:

```ts
import { CloudError } from "@/lib/cloud/errors";
import type { CloudFileProvider, CloudPickOptions } from "@/lib/cloud/types";
import { requestDriveAccessToken, revokeDriveAccessToken } from "./auth";
import { downloadDriveFile } from "./download";
import { assertValidPickerSelection } from "./early-validate";
import { loadGoogleDriveScripts } from "./load-scripts";
import { openGooglePicker } from "./picker";

async function downloadAll(
  picked: Awaited<ReturnType<typeof openGooglePicker>>,
  token: string,
  signal?: AbortSignal,
): Promise<File[]> {
  const files: File[] = [];
  for (const item of picked) {
    files.push(await downloadDriveFile(item, token, signal));
  }
  return files;
}

export const googleDriveProvider: CloudFileProvider = {
  id: "google-drive",

  async pickFiles(options: CloudPickOptions): Promise<File[]> {
    await loadGoogleDriveScripts();

    let token = await requestDriveAccessToken();
    try {
      const picked = await openGooglePicker({
        accessToken: token,
        accept: options.accept,
        maxFiles: options.maxFiles,
      });
      assertValidPickerSelection(picked, options.maxFiles);

      try {
        return await downloadAll(picked, token, options.signal);
      } catch (error) {
        if (error instanceof CloudError && error.code === "token_expired") {
          revokeDriveAccessToken(token);
          token = await requestDriveAccessToken();
          return await downloadAll(picked, token, options.signal);
        }
        throw error;
      }
    } finally {
      revokeDriveAccessToken(token);
    }
  },
};
```

Create `lib/cloud/providers.ts`:

```ts
import { CloudError } from "@/lib/cloud/errors";
import type { CloudFileProvider, CloudProviderId } from "@/lib/cloud/types";
import { googleDriveProvider } from "@/lib/google-drive/provider";

export const CLOUD_PROVIDERS: Partial<
  Record<CloudProviderId, CloudFileProvider>
> = {
  "google-drive": googleDriveProvider,
};

export function getCloudProvider(id: CloudProviderId): CloudFileProvider {
  const provider = CLOUD_PROVIDERS[id];
  if (!provider) {
    throw new CloudError("unsupported");
  }
  return provider;
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npm test -- lib/google-drive/early-validate.test.ts`

Expected: PASS

- [ ] **Step 5: Typecheck + commit**

```bash
npm run typecheck
git add lib/cloud/providers.ts lib/google-drive/provider.ts lib/google-drive/early-validate.ts lib/google-drive/early-validate.test.ts
git commit -m "$(cat <<'EOF'
Register GoogleDriveProvider behind the cloud provider registry.

Add early Picker selection checks before downloading files.
EOF
)"
```

---

### Task 6: `useCloudFilePicker` hook (toasts + loading)

**Files:**
- Create: `hooks/useCloudFilePicker.ts`

**Interfaces:**
- Consumes: `getCloudProvider`, `isCloudError`, Sonner `toast`
- Produces: `useCloudFilePicker(): { pick, isPicking }`

- [ ] **Step 1: Implement hook**

Create `hooks/useCloudFilePicker.ts`:

```ts
"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { isCloudError, type CloudErrorCode } from "@/lib/cloud/errors";
import { getCloudProvider } from "@/lib/cloud/providers";
import type { CloudPickOptions, CloudProviderId } from "@/lib/cloud/types";

const TOAST_BY_CODE: Partial<Record<CloudErrorCode, string>> = {
  permission_denied: "Google Drive access was denied.",
  token_expired: "Session expired. Please try again.",
  network: "Couldn’t reach Google Drive. Check your connection.",
  scripts_failed: "Google Drive couldn’t load. Please try again.",
  unsupported: "Coming soon",
  unknown: "Something went wrong with Google Drive.",
};

function toastForCloudError(error: unknown): void {
  if (!isCloudError(error)) {
    toast.error("Something went wrong with Google Drive.");
    return;
  }
  if (error.code === "cancelled") return;
  if (error.code === "invalid_selection") {
    toast.error(error.message || "Invalid file selection.");
    return;
  }
  toast.error(TOAST_BY_CODE[error.code] ?? error.message);
}

export function useCloudFilePicker() {
  const [isPicking, setIsPicking] = useState(false);
  const inflight = useRef(false);

  const pick = useCallback(
    async (
      providerId: CloudProviderId,
      options: CloudPickOptions,
    ): Promise<File[] | null> => {
      if (inflight.current) return null;
      inflight.current = true;
      setIsPicking(true);
      try {
        const provider = getCloudProvider(providerId);
        return await provider.pickFiles(options);
      } catch (error) {
        toastForCloudError(error);
        return null;
      } finally {
        inflight.current = false;
        setIsPicking(false);
      }
    },
    [],
  );

  return { pick, isPicking };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add hooks/useCloudFilePicker.ts
git commit -m "$(cat <<'EOF'
Add useCloudFilePicker hook with loading state and Sonner error mapping.

Providers stay UI-agnostic; toasts live only in the hook.
EOF
)"
```

---

### Task 7: Wire SelectFileButton + DropzoneIdleContent

**Files:**
- Modify: `components/tools/SelectFileButton.tsx`
- Modify: `components/tools/DropzoneIdleContent.tsx`

**Interfaces:**
- Consumes: `useCloudFilePicker`, `AcceptMap`
- Produces: UI dispatch for `google-drive` → `pick` → `onFilesSelected`

- [ ] **Step 1: Update `SelectFileButton`**

Replace menu action typing and props so the button stays free of Google imports (only cloud provider ids via the hook):

```tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  ChevronDown,
  Cloud,
  FilePlus2,
  Link2,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { useCloudFilePicker } from "@/hooks/useCloudFilePicker";
import type { AcceptMap } from "@/lib/cloud/types";

type MenuAction = "computer" | "google-drive" | "coming-soon";

const MENU_ITEMS: {
  id: string;
  label: string;
  icon: typeof Monitor;
  action: MenuAction;
}[] = [
  { id: "computer", label: "From Computer", icon: Monitor, action: "computer" },
  {
    id: "google-drive",
    label: "Google Drive",
    icon: Cloud,
    action: "google-drive",
  },
  { id: "dropbox", label: "Dropbox", icon: Cloud, action: "coming-soon" },
  { id: "onedrive", label: "OneDrive", icon: Cloud, action: "coming-soon" },
  { id: "url", label: "By URL", icon: Link2, action: "coming-soon" },
];

interface SelectFileButtonProps {
  onOpenFilePicker: () => void;
  onFilesSelected: (files: File[]) => void;
  accept: AcceptMap;
  maxFiles: number;
  maxSize: number;
  disabled?: boolean;
}

export function SelectFileButton({
  onOpenFilePicker,
  onFilesSelected,
  accept,
  maxFiles,
  maxSize,
  disabled,
}: SelectFileButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { pick, isPicking } = useCloudFilePicker();
  const isDisabled = Boolean(disabled || isPicking);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleMainClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isDisabled) return;
    setMenuOpen(false);
    onOpenFilePicker();
  };

  const handleChevronClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isDisabled) return;
    setMenuOpen((open) => !open);
  };

  const handleMenuItem = async (
    event: ReactMouseEvent<HTMLButtonElement>,
    action: MenuAction,
  ) => {
    event.stopPropagation();
    setMenuOpen(false);
    if (isDisabled) return;

    if (action === "computer") {
      onOpenFilePicker();
      return;
    }

    if (action === "google-drive") {
      const files = await pick("google-drive", { accept, maxFiles, maxSize });
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
      return;
    }

    toast.info("Coming soon");
  };

  return (
    <div className="dropzone__actions" ref={rootRef}>
      <div
        className={`select-file-btn${menuOpen ? " select-file-btn--open" : ""}${
          isDisabled ? " select-file-btn--disabled" : ""
        }`}
      >
        <button
          type="button"
          className="select-file-btn__main"
          onClick={handleMainClick}
          disabled={isDisabled}
        >
          <FilePlus2 size={16} strokeWidth={2.25} aria-hidden />
          {isPicking ? "Opening…" : "Select File"}
        </button>
        <button
          type="button"
          className="select-file-btn__chevron"
          onClick={handleChevronClick}
          disabled={isDisabled}
          aria-label="More upload options"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <ChevronDown
            size={16}
            aria-hidden
            className={
              menuOpen ? "select-file-btn__chevron-icon--open" : undefined
            }
          />
        </button>

        {menuOpen && (
          <div className="select-file-btn__menu" role="menu">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className="select-file-btn__menu-item"
                  onClick={(event) => handleMenuItem(event, item.action)}
                  disabled={isDisabled}
                >
                  <Icon size={14} aria-hidden />
                  <span className="select-file-btn__menu-item-label">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `DropzoneIdleContent`**

```tsx
"use client";

import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import type { ReactNode } from "react";
import type { AcceptMap } from "@/lib/cloud/types";
import { SelectFileButton } from "./SelectFileButton";

interface DropzoneIdleContentProps {
  isDragActive: boolean;
  onOpenFilePicker: () => void;
  onFilesSelected: (files: File[]) => void;
  accept: AcceptMap;
  maxFiles: number;
  maxSize: number;
  dragTitle: string;
  meta: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
}

export function DropzoneIdleContent({
  isDragActive,
  onOpenFilePicker,
  onFilesSelected,
  accept,
  maxFiles,
  maxSize,
  dragTitle,
  meta,
  icon,
  children,
  disabled,
}: DropzoneIdleContentProps) {
  return (
    <motion.div
      className="dropzone__body"
      animate={isDragActive ? { scale: 1.02 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="dropzone__icon">
        {icon ?? (
          <Upload
            size={24}
            color={isDragActive ? "var(--color-brand)" : "var(--color-text-2)"}
          />
        )}
      </div>
      <p className="dropzone__title">
        {isDragActive ? dragTitle : "Select your file here to get started"}
      </p>
      {!isDragActive && (
        <>
          <p className="dropzone__subtitle">or drop your file here.</p>
          {children}
          <SelectFileButton
            onOpenFilePicker={onOpenFilePicker}
            onFilesSelected={onFilesSelected}
            accept={accept}
            maxFiles={maxFiles}
            maxSize={maxSize}
            disabled={disabled}
          />
        </>
      )}
      <p className="dropzone__meta">{meta}</p>
    </motion.div>
  );
}
```

- [ ] **Step 3: Typecheck (expect tool files to fail until Task 8)**

Run: `npm run typecheck`

Expected: errors only in tool call sites missing new `DropzoneIdleContent` props — fixed next.

- [ ] **Step 4: Commit**

```bash
git add components/tools/SelectFileButton.tsx components/tools/DropzoneIdleContent.tsx
git commit -m "$(cat <<'EOF'
Wire Google Drive into Select File via provider-agnostic cloud picker.

Pass accept/maxFiles/maxSize through DropzoneIdleContent; keep button UI-only.
EOF
)"
```

---

### Task 8: Pass constraints from every tool consumer

**Files:**
- Modify: `components/tools/Converter.tsx`
- Modify: `components/tools/SmartUploadWidget.tsx`
- Modify: `components/tools/BackgroundRemover.tsx`
- Modify: `components/tools/ImageEnhancer.tsx`
- Modify: `components/tools/pdfSplitter.tsx`
- Modify: `components/tools/pdfToWord.tsx`

**Interfaces:**
- Consumes: updated `DropzoneIdleContent` props
- Produces: each tool feeds `onFilesSelected={onDrop}` with matching `accept` / `maxFiles` / `maxSize`

- [ ] **Step 1: Update each `DropzoneIdleContent` usage**

For every call site, pass the **same** values already given to that file’s `useDropzone`. Pattern:

**Converter.tsx**

```tsx
<DropzoneIdleContent
  isDragActive={isDragActive}
  onOpenFilePicker={open}
  onFilesSelected={onDrop}
  accept={ALL_ACCEPT}
  maxFiles={20}
  maxSize={200 * 1024 * 1024}
  dragTitle="Drop files here"
  meta={/* existing */}
>
```

**SmartUploadWidget.tsx**

```tsx
onFilesSelected={onDrop}
accept={ALL_ACCEPT}
maxFiles={1}
maxSize={200 * 1024 * 1024}
```

**BackgroundRemover.tsx**

```tsx
onFilesSelected={onDrop}
accept={{
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
}}
maxFiles={1}
maxSize={15 * 1024 * 1024}
```

**ImageEnhancer.tsx** (active implementation ~line 541)

```tsx
onFilesSelected={onDrop}
accept={{
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
}}
maxFiles={1}
maxSize={15 * 1024 * 1024}
```

**pdfSplitter.tsx / pdfToWord.tsx**

```tsx
onFilesSelected={onDrop}
accept={{ "application/pdf": [".pdf"] }}
maxFiles={1}
maxSize={50 * 1024 * 1024}
```

Do not change conversion / processing logic.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`

Expected: PASS

- [ ] **Step 3: Lint**

Run: `npm run lint`

Expected: PASS (fix any new issues in touched files)

- [ ] **Step 4: Commit**

```bash
git add components/tools/Converter.tsx components/tools/SmartUploadWidget.tsx components/tools/BackgroundRemover.tsx components/tools/ImageEnhancer.tsx components/tools/pdfSplitter.tsx components/tools/pdfToWord.tsx
git commit -m "$(cat <<'EOF'
Connect tool dropzones to Google Drive via shared onDrop constraints.

Every consumer reuses its existing accept, maxFiles, maxSize, and onDrop.
EOF
)"
```

---

### Task 9: Local env setup checklist + end-to-end verification

**Files:**
- Create (local only, do not commit secrets): `.env.local` entries
- No code changes required if Tasks 1–8 passed

**Interfaces:**
- Consumes: working app + Google Cloud project credentials
- Produces: verified manual E2E

- [ ] **Step 1: Configure Google Cloud (manual)**

1. Create/select project  
2. Enable **Google Drive API** + **Google Picker API**  
3. OAuth consent screen (External) with scope `https://www.googleapis.com/auth/drive.file` only  
4. OAuth Client ID (Web) — authorized JS origins: `http://localhost:3000` (+ production)  
5. API key — HTTP referrer restrictions for those origins  
6. Copy Client ID, API key, project **number** into `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_GOOGLE_API_KEY=...
NEXT_PUBLIC_GOOGLE_APP_ID=...
```

- [ ] **Step 2: Run app**

```bash
npm run dev
```

Expected: app starts on localhost.

- [ ] **Step 3: Manual checklist**

1. Converter → Google Drive → sign in → pick one allowed file → appears in file list and converts  
2. Pick multiple files ≤ 20 → all land in `onDrop`  
3. Try > `maxFiles` → `invalid_selection` toast; no download spam  
4. Cancel Picker → silent  
5. Deny OAuth → “Google Drive access was denied.”  
6. PDF tool → Google Drive → only PDFs useful in Picker filter; Computer still works  
7. Dropbox / OneDrive / URL → “Coming soon”  
8. Confirm no token in Application → Local Storage / Session Storage after pick  

- [ ] **Step 4: Final automated verification**

```bash
npm test
npm run typecheck
npm run lint
```

Expected: all PASS

- [ ] **Step 5: Commit only if any leftover doc/config fixes (no secrets)**

If `.env.example` or docs need a small tweak from setup learnings, commit that only — never commit `.env.local`.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|---|---|
| Provider-agnostic `CloudFileProvider` + registry | 1, 5 |
| Client-side download; no backend proxy | 4, 5 |
| GIS + Picker + `drive.file` | 3, 4 |
| Memory-only token + revoke | 3, 5 |
| MIME from `accept`; exclude Workspace | 2, 4 |
| Early reject before download | 5 |
| `useCloudFilePicker` toasts / loading | 6 |
| `SelectFileButton` UI-only dispatch | 7 |
| `onDrop` single pipeline; wire all tools | 7, 8 |
| Env vars + free-tier Cloud setup | 1, 9 |
| Manual E2E | 9 |

**Placeholder scan:** none intentional.  
**Type consistency:** `AcceptMap` / `CloudPickOptions` / `CloudProviderId` / `CloudError` used uniformly across tasks.
