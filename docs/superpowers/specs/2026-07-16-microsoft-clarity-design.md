# Microsoft Clarity Integration

**Date:** 2026-07-16  
**Status:** Approved  
**Approach:** Official `@microsoft/clarity` package + dedicated client component (Approach 1)

## Goal

Integrate Microsoft Clarity into the Fileora Next.js App Router app so session recordings and heatmaps work in production and can be verified on localhost when a project ID is configured — without changing existing UI or application behavior.

## Non-Goals (v1)

- Consent banners or cookie UI
- Privacy/security page copy updates
- `Clarity.identify()`, custom events, tags, or feature-flag tracking
- Production-only gating (can switch later)
- Hardcoding the Clarity project ID in source

## Product Decisions

| Decision | Choice |
|---|---|
| Package | Official `@microsoft/clarity` (already in `package.json`) |
| Init gate | Initialize only when `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set (Option B) |
| Environments | Works in production and local development when env var is present |
| SSR | Never initialize on the server |
| Root layout | Remain a Server Component; mount a thin client child |
| Duplicate init | Module-level flag **plus** defensive DOM/`window.clarity` check |
| Project ID storage | `.env.local` (gitignored); documented in `.env.example` only |

## Architecture

```
app/layout.tsx (Server Component)
  └─ <MicrosoftClarity />  ("use client")
       └─ useEffect → initClarity()
            └─ lib/clarity.ts
                 ├─ read NEXT_PUBLIC_CLARITY_PROJECT_ID
                 ├─ skip if missing
                 ├─ skip if already initialized (module flag + DOM/window check)
                 └─ Clarity.init(projectId)
```

Clarity’s SPA-friendly script continues tracking during App Router client navigations after a single init; no per-route re-init is required.

### Folder structure

```
lib/
  clarity.ts                         # Idempotent client init helper

components/
  analytics/
    MicrosoftClarity.tsx             # Client component; useEffect → initClarity()

app/
  layout.tsx                         # Mount <MicrosoftClarity /> (no UI change)

.env.example                         # Document NEXT_PUBLIC_CLARITY_PROJECT_ID=
.env.local                           # Real project ID (gitignored; not committed)
```

## Init Helper Contract (`lib/clarity.ts`)

`initClarity(): void`

1. Read `process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID` (trimmed).
2. Return immediately if empty/missing.
3. Return if already marked initialized (module-level `let initialized = false`).
4. Defensive check: if `document.getElementById("clarity-script")` exists **or** `typeof window.clarity === "function"`, mark initialized and return (covers Fast Refresh / accidental remounts; mirrors SDK’s own script-id guard).
5. Call `Clarity.init(projectId)`.
6. Set `initialized = true`.

Caller is responsible for invoking only on the client (via `useEffect`). The helper itself may assume browser globals when called.

## Client Component (`components/analytics/MicrosoftClarity.tsx`)

- `"use client"`
- `useEffect(() => { initClarity(); }, [])`
- Renders `null` (no DOM/UI impact)
- Mounted once from root layout so it survives client-side route changes without re-mounting (layout persistence)

## Root Layout Change

In `app/layout.tsx` `<body>`:

```tsx
{children}
<MicrosoftClarity />
<Toaster ... />
```

No other layout or page changes.

## Environment Variables

`.env.example`:

```env
NEXT_PUBLIC_CLARITY_PROJECT_ID=
```

`.env.local` (local only, not committed):

```env
NEXT_PUBLIC_CLARITY_PROJECT_ID=xnaw70fayd
```

Production hosts (e.g. Netlify) must set the same `NEXT_PUBLIC_*` variable at build time.

## Strict Mode, Hydration, Performance

| Concern | Mitigation |
|---|---|
| React Strict Mode double-mount | Module flag + DOM/`window.clarity` check; SDK also no-ops if `#clarity-script` exists |
| Hydration | Component renders `null`; init only in `useEffect` — no server/client markup mismatch |
| Performance | Script loads async via Clarity npm inject (`?ref=npm`); afterInteractive-equivalent, non-blocking |
| TypeScript | Package ships `index.d.ts`; helper and component are typed |

## Error Handling

- Missing project ID: silent no-op (expected for environments that opt out).
- Init failures: Clarity’s `injectScript` already swallows errors; do not throw from `initClarity`.
- No user-facing errors or toasts.

## Verification Plan

**Localhost (with `.env.local` set):**

1. Restart `npm run dev` after adding the env var (Next.js embeds `NEXT_PUBLIC_*` at startup).
2. Open DevTools → Network; confirm a request to `https://www.clarity.ms/tag/...`.
3. Confirm no console errors related to Clarity.
4. Navigate between routes client-side; confirm no second `Clarity.init` / no duplicate `#clarity-script`.
5. Optionally open Clarity dashboard Live mode and confirm the session appears.

**Localhost (env var unset):**

1. App loads normally; no Clarity network requests; no errors.

**Production:**

1. Ensure `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set in the host’s env for the build.
2. Deploy and confirm Clarity tag loads on the live site.
3. Within ~minutes, confirm sessions appear in the Clarity project dashboard.

## Future Enhancements (out of scope)

- `Clarity.identify()` after auth
- Custom tags / events
- Consent management (`consent` / `consentV2`)
- Switch to production-only gating if local sessions pollute dashboards
- Session masking/unmasking APIs if/when needed
