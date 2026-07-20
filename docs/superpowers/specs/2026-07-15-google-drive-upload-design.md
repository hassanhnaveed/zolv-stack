# Google Drive Upload Integration

**Date:** 2026-07-15  
**Status:** Approved  
**Approach:** Client-side GIS + Picker + Drive download → `File[]` → existing `onDrop` (Approach 1 — hook + thin menu wiring), with a provider-agnostic cloud contract

## Goal

Let users pick one or more files from Google Drive via the Select File menu and feed them into the **exact same** upload pipeline used for “From Computer”. No site login/signup. Authentication is temporary Google OAuth for the pick session only.

## Non-Goals (v1)

- Site-wide authentication or user accounts
- Backend download proxy / API route for Drive bytes
- Google Workspace native file export (Docs, Sheets, Slides, Forms)
- Dropbox, OneDrive, By URL implementations (menu items remain “Coming soon”)
- Permanently storing OAuth tokens or uploaded Drive files
- Full Drive access (`drive` / `drive.readonly` scopes)

## Product Decisions

| Decision | Choice |
|---|---|
| Download path | Client-side only with temporary access token |
| Selection | Multi-select up to each tool’s `maxFiles` |
| MIME filtering | Filter in Picker **and** validate after download |
| Workspace files | Exclude from Picker in v1 |
| UI architecture | Provider-agnostic hook + thin Select File menu wiring |
| Validation owner | Existing `useDropzone` / `onDrop` (source of truth) |

## Cost Assumptions (v1)

This integration targets Google’s free usage for a typical Fileora-scale app:

- **Google Picker API** — free to use
- **Google Drive API** — generous free quotas; sufficient for personal and small-to-medium apps; no per-user licensing fee for this pattern
- **Google Identity Services (OAuth)** — free
- **No backend download proxy** — no extra server/bandwidth cost beyond existing hosting; bytes transfer browser ↔ Google
- **No OAuth client secret** required for this browser-based token flow
- **Users authenticate with their own Google account**; Fileora does not need its own login system

If Fileora later adds server-side virus scanning, background processing, or a download proxy, those add **hosting** cost. The Google APIs themselves do not require a paid plan for this basic browser-based integration.

## Architecture

```
Select File menu
  ├─ Computer  → onOpenFilePicker() → existing file input
  ├─ Google Drive → useCloudFilePicker → GoogleDriveProvider.pickFiles()
  ├─ Dropbox / OneDrive / URL → "Coming soon" (unsupported provider / stub)
  └─ all successful picks produce File[] → onFilesSelected ≡ onDrop
```

```
load GIS + Picker scripts (once)
  → GIS token popup (drive.file only)
  → Google Picker (multi-select, MIME-filtered, no Workspace)
  → early reject (count / dupes / empty metadata)
  → client download each file (alt=media)
  → File[] → onDrop (type / size / count validation)
  → discard access token from memory
```

### Folder structure

```
lib/cloud/
  types.ts              # CloudProviderId, AcceptMap, CloudPickOptions, CloudFileProvider
  errors.ts             # CloudError + CloudErrorCode
  providers.ts          # Registry: id → CloudFileProvider (google-drive only in v1)

lib/google-drive/
  load-scripts.ts       # Load GIS + gapi picker scripts once
  auth.ts               # GIS token client (request / revoke / expiry); memory only
  picker.ts             # Build & open Google Picker
  download.ts           # Drive v3 alt=media → File
  mime.ts               # accept → Picker MIME list; subtract Workspace MIME set
  provider.ts           # GoogleDriveProvider implements CloudFileProvider

hooks/
  useCloudFilePicker.ts # Resolve provider from registry; loading; map CloudError → toast

components/tools/
  SelectFileButton.tsx      # UI-only dispatch by menu id (no Google imports)
  DropzoneIdleContent.tsx   # Pass accept / maxFiles / maxSize / onFilesSelected
```

### Provider-agnostic contracts

```ts
export type CloudProviderId = "google-drive" | "dropbox" | "onedrive";

export type AcceptMap = Record<string, readonly string[]>;

export interface CloudPickOptions {
  accept: AcceptMap;
  maxFiles: number;
  maxSize: number;
  signal?: AbortSignal; // optional; Google Drive may ignore in v1
}

export interface CloudFileProvider {
  id: CloudProviderId;
  pickFiles(options: CloudPickOptions): Promise<File[]>;
}

export type CloudErrorCode =
  | "cancelled"
  | "permission_denied"
  | "token_expired"
  | "network"
  | "scripts_failed"
  | "unsupported"
  | "unknown";
```

**Provider registry** (`lib/cloud/providers.ts`): map `CloudProviderId` → implementation. Adding Dropbox later = register one provider; UI and hook stay unchanged.

**Single hook:** `useCloudFilePicker()` resolves the provider by id and exposes `pick(id, options)` + `isPicking`. No per-provider wrapper hooks.

**Providers are UI-agnostic:** they throw `CloudError`; only the hook maps errors to Sonner toasts.

## UI Integration

### SelectFileButton

- Remains a menu / chrome component.
- Menu actions:
  - `computer` → `onOpenFilePicker()`
  - `google-drive` → `pick("google-drive", { accept, maxFiles, maxSize })` then `onFilesSelected(files)`
  - `dropbox` / `onedrive` / `url` → toast “Coming soon”
- Receives: `onOpenFilePicker`, `onFilesSelected`, `accept`, `maxFiles`, `maxSize`, `disabled`
- Must not import Google scripts, GIS, or Drive helpers directly

### DropzoneIdleContent

Pass through the same constraints each tool already gives `useDropzone`:

```ts
<SelectFileButton
  onOpenFilePicker={onOpenFilePicker}
  onFilesSelected={onFilesSelected} // same function as onDrop
  accept={accept}
  maxFiles={maxFiles}
  maxSize={maxSize}
  disabled={disabled}
/>
```

### Tool pages

Every consumer (`Converter`, `SmartUploadWidget`, `BackgroundRemover`, `ImageEnhancer`, `pdfSplitter`, `pdfToWord`, …) wires:

- `onFilesSelected={onDrop}` (or equivalent)
- The same `accept` / `maxFiles` / `maxSize` already used by that tool’s `useDropzone`

No separate Convert / upload flow for Drive files.

## MIME Filtering vs Validation

| Layer | Role |
|---|---|
| **Picker filtering** (`mime.ts`) | UX: derive MIME list from `Object.keys(accept)`; remove Workspace MIME types (`application/vnd.google-apps.*`). Data-driven — new tool formats in `accept` automatically appear in Picker. |
| **Validation** (`useDropzone` / `onDrop`) | Source of truth: type, size, count, and any other existing rejection rules after `File[]` arrives. |

Picker misbehavior must never bypass upload rules.

### Early reject (before download)

Inside the Google Drive provider (or shared helper), before network download:

- selection count > `maxFiles`
- duplicate Picker file IDs
- missing name / zero-byte when size metadata is present

Surface these as typed errors so the hook can toast consistently with local upload messaging where applicable. Do **not** re-implement full type/size validation here — that stays with `onDrop`.

## Auth, Token & Security

- **Scope:** `https://www.googleapis.com/auth/drive.file` only (files opened via Picker count as app-opened).
- **Libraries:** Google Identity Services (GIS) + Google Picker API. No deprecated `gapi.auth2` login flows.
- **Token lifetime:** requested on click; held in memory for that pick session; discarded after success, cancel, or failure. Never written to `localStorage`, `sessionStorage`, cookies, or the server.
- **Secrets:** no client secret in the browser flow. Do not create a site auth system.
- **APIs enabled:** Google Drive API, Google Picker API.

## Environment Variables

All browser-exposed and restricted in Google Cloud Console:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_API_KEY=
NEXT_PUBLIC_GOOGLE_APP_ID=
```

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | APIs & Services → Credentials → OAuth 2.0 Client ID (Web application) |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Credentials → API key (HTTP referrer restricted) |
| `NEXT_PUBLIC_GOOGLE_APP_ID` | Project number (Project settings), required by Picker `setAppId` |

### Google Cloud setup (summary)

1. Create/select a Google Cloud project  
2. Enable **Google Drive API** and **Google Picker API**  
3. Configure **OAuth consent screen** (External), add `drive.file` only  
4. Create **OAuth Client ID** (Web) with authorized JavaScript origins (`http://localhost:3000`, production origin)  
5. Create **API key** with HTTP referrer restrictions for those origins  
6. Copy Client ID, API key, and project number into `.env.local` / hosting env  
7. Document the same keys in `.env.example` as empty placeholders (no real secrets)

## Errors & Loading UX

| Code | When | UX |
|---|---|---|
| `cancelled` | User closes sign-in or Picker | Silent (no error toast) |
| `permission_denied` | OAuth denied | Toast: “Google Drive access was denied.” |
| `token_expired` | 401 during download; one silent re-auth retry then fail | Toast: “Session expired. Please try again.” |
| `network` | Script or fetch failure | Toast: “Couldn’t reach Google Drive. Check your connection.” |
| `scripts_failed` | GIS/Picker scripts fail to load | Toast: “Google Drive couldn’t load. Please try again.” |
| `unsupported` | Unregistered provider | Toast: “Coming soon” |
| `unknown` | Fallback | Toast: “Something went wrong with Google Drive.” |

**Loading:** `isPicking` disables Select File + menu while active. Prefer lightweight feedback (disabled controls / brief status) over a blocking modal. Preserve Fileora visual language (existing tokens, Sonner toasts).

## npm Packages

Prefer the official browser GIS + Picker script loaders (no deprecated auth packages). Add only what TypeScript needs for ambient typings if the repo does not already have them — e.g. `@types/google.accounts` / `@types/google.picker` **if** they exist and are maintained; otherwise maintain local typed declarations under `lib/google-drive/types` or ambient `.d.ts` with **no `any`**.

No Google backend SDK is required for v1.

## Testing (manual)

1. Google Drive → sign in → pick one allowed file → appears like a local upload and converts/processes normally  
2. Multi-select within `maxFiles`; selecting over the limit shows the same class of validation feedback as computer uploads  
3. Cancel Picker → silent (no error toast); deny OAuth → “Google Drive access was denied.”
4. Expired token path (re-auth retry then friendly failure)  
5. Network failure while downloading → network toast  
6. Unsupported MIME that slips through → rejected by existing dropzone validation  
7. Workspace files not listed in Picker  
8. From Computer still works; Dropbox / OneDrive / URL still “Coming soon”  
9. Works across tools that share `DropzoneIdleContent` (converter + single-file tools)

## Future Extensions (explicitly deferred)

- Dropbox / OneDrive providers registered in `lib/cloud/providers.ts`
- Google Workspace export → `File` then same `onDrop`
- Optional backend proxy for virus scan / large-file policy
- Honor `AbortSignal` in Google Drive downloads when cancelling mid-flight

## Success Criteria

- Clicking **Google Drive** yields a normal `File` / `File[]` consumed by existing converters/tools  
- No permanent Google session on the site after the pick completes  
- Minimum OAuth scope (`drive.file`)  
- No secrets beyond public, referrer-restricted Client ID / API key / App ID  
- Existing computer upload path unbroken  
- Architecture ready for additional cloud providers without changing `onDrop`
