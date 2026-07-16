# Microsoft Clarity Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize Microsoft Clarity once on the client in the Next.js App Router app when `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set, without changing UI or existing behavior.

**Architecture:** Idempotent `initClarity()` helper in `lib/clarity.ts` wraps `@microsoft/clarity`. A thin `"use client"` component mounts from the root Server Component layout and calls the helper in `useEffect`. Duplicate init is blocked by a module flag plus DOM/`window.clarity` checks.

**Tech Stack:** Next.js App Router, React 19, TypeScript, `@microsoft/clarity`, Vitest

## Global Constraints

- Do not change existing application functionality or UI
- Keep `app/layout.tsx` a Server Component
- Never initialize Clarity during SSR
- Initialize only when `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set (Option B)
- Never hardcode the project ID in source
- No consent banners, identify(), custom events, or privacy-copy changes in this plan
- TypeScript only; no `any`
- **Do not run `git commit`** — the user commits themselves; leave files ready to stage

**Spec:** `docs/superpowers/specs/2026-07-16-microsoft-clarity-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `lib/clarity.ts` | Idempotent client init helper |
| `lib/clarity.test.ts` | Unit tests for init gating / duplicate prevention |
| `components/analytics/MicrosoftClarity.tsx` | Client component; `useEffect` → `initClarity()`; renders `null` |
| `app/layout.tsx` | Mount `<MicrosoftClarity />` in `<body>` |
| `.env.example` | Document `NEXT_PUBLIC_CLARITY_PROJECT_ID=` |
| `.env.local` | Local project ID only (gitignored; never commit) |
| `package.json` / `package-lock.json` | Ensure `@microsoft/clarity` is installed |

---

### Task 1: Ensure package + env documentation

**Files:**
- Modify: `package.json` (verify `@microsoft/clarity` dependency)
- Modify: `package-lock.json` (if install updates lockfile)
- Modify: `.env.example`
- Create (local only): `.env.local` entry for Clarity ID

**Interfaces:**
- Consumes: nothing
- Produces: env var name `NEXT_PUBLIC_CLARITY_PROJECT_ID` documented for later tasks

- [ ] **Step 1: Ensure `@microsoft/clarity` is installed**

Run:

```bash
npm install @microsoft/clarity
```

Expected: `@microsoft/clarity` present under `dependencies` in `package.json` (already `^1.0.2` is fine).

- [ ] **Step 2: Document the env var in `.env.example`**

Append to `.env.example`:

```env

# Microsoft Clarity (browser analytics). Leave empty to disable.
NEXT_PUBLIC_CLARITY_PROJECT_ID=
```

- [ ] **Step 3: Set local project ID (do not commit)**

Ensure `.env.local` includes (create file if missing):

```env
NEXT_PUBLIC_CLARITY_PROJECT_ID=xnaw70fayd
```

Confirm `.env.local` is listed in `.gitignore` (it already is).

- [ ] **Step 4: Verify package types resolve**

Run: `npm run typecheck`

Expected: PASS (no new errors; helper not written yet — this is a baseline).

---

### Task 2: Idempotent `initClarity` helper + unit tests

**Files:**
- Create: `lib/clarity.ts`
- Create: `lib/clarity.test.ts`

**Interfaces:**
- Consumes: `Clarity.init(projectId: string)` from `@microsoft/clarity`
- Produces: `export function initClarity(): void`

- [ ] **Step 1: Write failing tests**

Create `lib/clarity.test.ts` (stubs `document`/`window` like other Node Vitest tests in this repo — no jsdom required):

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initMock = vi.fn();

vi.mock("@microsoft/clarity", () => ({
  default: {
    init: (...args: unknown[]) => initMock(...args),
  },
}));

describe("initClarity", () => {
  let clarityScriptPresent = false;
  let windowClarity: ((...args: unknown[]) => void) | undefined;

  beforeEach(() => {
    initMock.mockClear();
    vi.resetModules();
    clarityScriptPresent = false;
    windowClarity = undefined;
    delete process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

    vi.stubGlobal("document", {
      getElementById: (id: string) =>
        id === "clarity-script" && clarityScriptPresent ? { id } : null,
    });

    vi.stubGlobal("window", {
      get clarity() {
        return windowClarity;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  });

  it("does nothing when project ID is missing", async () => {
    const { initClarity } = await import("./clarity");
    initClarity();
    expect(initMock).not.toHaveBeenCalled();
  });

  it("does nothing when project ID is whitespace", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "   ";
    const { initClarity } = await import("./clarity");
    initClarity();
    expect(initMock).not.toHaveBeenCalled();
  });

  it("calls Clarity.init with the trimmed project ID", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "  xnaw70fayd  ";
    const { initClarity } = await import("./clarity");
    initClarity();
    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledWith("xnaw70fayd");
  });

  it("does not call Clarity.init twice in the same module lifetime", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "xnaw70fayd";
    const { initClarity } = await import("./clarity");
    initClarity();
    initClarity();
    expect(initMock).toHaveBeenCalledTimes(1);
  });

  it("skips init when #clarity-script already exists", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "xnaw70fayd";
    clarityScriptPresent = true;

    const { initClarity } = await import("./clarity");
    initClarity();
    expect(initMock).not.toHaveBeenCalled();
  });

  it("skips init when window.clarity is already a function", async () => {
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "xnaw70fayd";
    windowClarity = vi.fn();

    const { initClarity } = await import("./clarity");
    initClarity();
    expect(initMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm test -- lib/clarity.test.ts`

Expected: FAIL (cannot find module `./clarity` or `initClarity` undefined).

- [ ] **Step 3: Implement `lib/clarity.ts`**

Create `lib/clarity.ts`:

```ts
import Clarity from "@microsoft/clarity";

let initialized = false;

function hasExistingClarity(): boolean {
  if (typeof document !== "undefined" && document.getElementById("clarity-script")) {
    return true;
  }
  if (typeof window !== "undefined" && typeof window.clarity === "function") {
    return true;
  }
  return false;
}

/**
 * Initialize Microsoft Clarity once on the client.
 * No-ops when NEXT_PUBLIC_CLARITY_PROJECT_ID is unset or Clarity is already loaded.
 */
export function initClarity(): void {
  if (initialized) return;

  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  if (!projectId) return;

  if (hasExistingClarity()) {
    initialized = true;
    return;
  }

  Clarity.init(projectId);
  initialized = true;
}
```

If TypeScript complains about `window.clarity`, add this ambient declaration at the top of `lib/clarity.ts` (or in a small `types/clarity-window.d.ts` if preferred):

```ts
declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

export {};
```

When placing the `declare global` in `lib/clarity.ts`, keep a single `export` so the file stays a module — the existing `export function initClarity` already does that; do **not** add a second empty `export {}` if the function is already exported.

Preferred shape of the full file:

```ts
import Clarity from "@microsoft/clarity";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

let initialized = false;

function hasExistingClarity(): boolean {
  if (typeof document !== "undefined" && document.getElementById("clarity-script")) {
    return true;
  }
  if (typeof window !== "undefined" && typeof window.clarity === "function") {
    return true;
  }
  return false;
}

/**
 * Initialize Microsoft Clarity once on the client.
 * No-ops when NEXT_PUBLIC_CLARITY_PROJECT_ID is unset or Clarity is already loaded.
 */
export function initClarity(): void {
  if (initialized) return;

  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  if (!projectId) return;

  if (hasExistingClarity()) {
    initialized = true;
    return;
  }

  Clarity.init(projectId);
  initialized = true;
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npm test -- lib/clarity.test.ts`

Expected: all tests PASS.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`

Expected: PASS.

---

### Task 3: Client component + root layout wiring

**Files:**
- Create: `components/analytics/MicrosoftClarity.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `initClarity(): void` from `@/lib/clarity`
- Produces: `<MicrosoftClarity />` mounted in root layout

- [ ] **Step 1: Create the client component**

Create `components/analytics/MicrosoftClarity.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { initClarity } from "@/lib/clarity";

/**
 * Initializes Microsoft Clarity on the client after mount.
 * Renders nothing — safe to mount from the root Server Component layout.
 */
export function MicrosoftClarity() {
  useEffect(() => {
    initClarity();
  }, []);

  return null;
}
```

- [ ] **Step 2: Mount from root layout**

In `app/layout.tsx`:

1. Add import near the top (after existing imports):

```tsx
import { MicrosoftClarity } from "@/components/analytics/MicrosoftClarity";
```

2. Inside `<body>`, mount it next to existing children (no UI change):

```tsx
<body>
  {children}
  <MicrosoftClarity />
  <Toaster
    position="bottom-right"
    theme="dark"
    toastOptions={{
      style: {
        background: "#1C2028",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#F0F2F5",
        fontFamily: "Satoshi, sans-serif",
      },
    }}
  />
</body>
```

Do not mark `app/layout.tsx` with `"use client"`. Do not alter metadata, fonts, toaster, or JSON-LD.

- [ ] **Step 3: Typecheck + lint**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: PASS (no new errors from Clarity files).

- [ ] **Step 4: Manual localhost verification**

1. Ensure `.env.local` has `NEXT_PUBLIC_CLARITY_PROJECT_ID=xnaw70fayd`.
2. Restart the dev server (required after env changes):

```bash
npm run dev
```

3. Open `http://localhost:3000`.
4. DevTools → Network: confirm a request matching `clarity.ms/tag/`.
5. DevTools → Elements: confirm a single `<script id="clarity-script" …>`.
6. Console: no Clarity-related errors.
7. Client-navigate to another route: still only one `#clarity-script`; no duplicate init noise.
8. Optionally open Clarity dashboard Live mode and confirm the session.

**Disable check:** temporarily remove/comment the env var, restart, reload — no Clarity network requests and no errors.

---

## Spec Coverage Checklist

| Spec requirement | Task |
|---|---|
| Official `@microsoft/clarity` package | Task 1 |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` in `.env.example` / `.env.local` | Task 1 |
| Idempotent `lib/clarity.ts` with module flag + DOM/window checks | Task 2 |
| Client-only init via `useEffect` | Task 3 |
| Root layout stays Server Component | Task 3 |
| Option B (init only when env set) | Task 2 |
| Strict Mode / hydration / no UI change | Tasks 2–3 |
| Verification steps | Task 3 Step 4 |

---

## Execution Notes

- Skip all `git commit` steps; user commits.
- `@microsoft/clarity` may already be in `package.json` — `npm install` should be idempotent.
- After implementation, production still needs `NEXT_PUBLIC_CLARITY_PROJECT_ID` set in the host env at **build** time.
