# SEO Architecture v1.0 — Branch Summary

**Branch:** `feature/seo-architecture-v1`  
**Status:** Complete through Tasks 1–9; not merged  
**Plan:** `docs/superpowers/plans/2026-07-17-seo-architecture.md`  
**Spec:** `docs/superpowers/specs/2026-07-17-seo-architecture-design.md`  
**Scope:** ~21 commits, ~99 files, centralized SEO for ZolvStack + Fileora

This branch implements production-grade, domain-agnostic SEO for the Next.js App Router app. It is ready for review and testing. It is intentionally **not** merged to `main`.

---

## Product decisions (locked)

| Decision | Choice |
|---|---|
| Primary brand | ZolvStack (`/`) |
| Product | Fileora (`/fileora`, `/fileora/{slug}`) |
| Locale | English-only (`en` / `en_US`); i18n-ready URL helpers only |
| Domain | Not purchased yet — all origins from `NEXT_PUBLIC_APP_URL` |
| Architecture | Centralized `lib/seo/*` + `components/seo/JsonLd` |
| Schema | Single `@graph` per page; emit on valid noindex pages |
| Tool indexing | Default `index: false` / `sitemap: false` until quality gate |
| Fail-closed | Unrecognized / non-production → sitewide noindex + empty sitemap |
| robots.txt Host | Not emitted |

---

## What shipped

### Centralized SEO module (`lib/seo/*`)

Single source of truth for routes, metadata, Open Graph/Twitter, JSON-LD, sitemap, robots, redirects, validation, and audit.

Key public surface (curated barrel in `lib/seo/index.ts`):

- Config / brands / URL: `getSeoConfig`, `getSiteOrigin`, `absoluteUrl`, brand tokens
- Registry: `ROUTES`, `ROUTE_IDS`, `getRoute`, redirect helpers
- Metadata: `buildRootMetadata`, `buildMetadataForRoute`
- Schema: `buildJsonLdForRoute`
- Crawl: `buildSitemap`, `buildRobots`
- Indexability: effective flags via fail-closed helpers
- Validation / audit: validators + `buildAuditReport` + `npm run seo:check`

Server-only: never import `lib/seo/*` from client components.

### App migration

- Root layout uses `buildRootMetadata()`; legacy Fileora-as-default metadata, Netlify fallbacks, and fake `aggregateRating` JSON-LD removed.
- ZolvStack home metadata + JSON-LD on the nearest server layout (`app/(zolvstack)/layout.tsx`).
- Static/legal pages (about, contact, security, privacy, terms) use `buildMetadataForRoute`.
- Fileora hub + all 23 tool routes use centralized metadata and exactly one server-rendered JSON-LD graph.
- `ToolPage` no longer emits client JSON-LD or hard-coded `fileora.com`.
- Hub FAQ content shared via `lib/fileora-faq.ts` (visible UI + centralized `FAQPage`).
- `app/sitemap.ts` / `app/robots.ts` are thin adapters over registry-driven builders.
- Redirects centralized in `lib/seo/redirects.ts` and consumed from `next.config.ts`.

### Operational docs and CI

- Runbooks: `docs/seo/search-console.md`, `performance-budgets.md`, `rollback.md`, `url-policy.md`
- README SEO section + `.env.example` indexing/verification docs
- Deploy CI runs `seo:check` before build and injects verification/indexing env for artifact bake
- Local `prepush` includes `seo:check` and `build`, defaulting
`NEXT_PUBLIC_APP_URL` to `https://example.com` when unset so the gate is
usable without a purchased domain.

### Assets / tooling

- Default OG images under `public/og/`
- `scripts/seo-check.ts` + `tsx` devDependency
- `reports/` gitignored for audit output

---

## Task-by-task history

| Task | Outcome |
|---|---|
| **1** Core types, config, brands, URL helpers | Origin validation (fail loud, no silent host fallback); explicit barrel; URL policy docs |
| **2** Route registry + redirects | SSOT routes from brand/static + `TOOL_CONFIG`; frozen redirect manifest; Next adapters |
| **3** Validate + audit + `seo:check` | Human + JSON reports; placeholder token detection; orphan/host scans |
| **4** Metadata + OG/Twitter | Final-title resolution; absolute route titles; shared social object; cache-busted OG assets |
| **5** Modular JSON-LD + `JsonLd` | Self-contained `@graph`s (Google does not merge cross-URL `@id`s); XSS-safe serialization; no fake ratings |
| **6** Root + brand/static migration | ZolvStack-first root; home server-layout metadata; integration tests |
| **7** Fileora hub + tools migration | 24 routes migrated; ToolPage schema removed; canonical consistency + migration tests; hub FAQ preserved |
| **8** Sitemap + robots | Registry + effective indexability; fail-closed empty sitemap; Allow `/`, Disallow `/api/`, no Host, no `/_next` block |
| **9** Indexing policy, verification, docs, final audit | Zero tools indexed initially; verification metadata; runbooks; CI gates; migration checklist verified |

---

## Current indexing policy (as of Task 9)

**Declared indexable / sitemap-eligible (when production indexing is active):**

1. Home (`/`)
2. About, Contact, Security, Privacy, Terms
3. Fileora hub (`/fileora`)

**All 23 Fileora tool routes:** `index: false`, `sitemap: false`, `follow: true`.

Rationale: no tool currently clears the full quality gate (unique substantial content + converter smoke evidence; several also have functional/deployment risks). Future opt-in is per-route in `lib/seo/routes.ts` after the gate passes.

**Effective indexing still requires:**

- `NODE_ENV=production`
- Valid HTTPS `NEXT_PUBLIC_APP_URL` recognized as production
- `SEO_INDEXING_ENABLED=true`

Otherwise fail-closed: noindex everywhere + empty sitemap.

---

## Environment variables

| Variable | Role |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Public origin (baked at build); required for SEO URLs |
| `SEO_INDEXING_ENABLED` | Server-only explicit indexing opt-in |
| `SEO_GOOGLE_SITE_VERIFICATION` | Optional GSC HTML-tag token (omit if blank/placeholder) |
| `SEO_BING_SITE_VERIFICATION` | Optional Bing HTML-tag token (`msvalidate.01`) |

For Lightsail artifact deploys, verification tokens and indexing flags must be present in the **GitHub Actions production environment** used by the build job. Setting them only on the host after the artifact is built will not update baked static HTML.

---

## Verification snapshot (Task 9 close)

- Full Vitest suite: **252** tests passing
- `npm run typecheck` / `npm run lint`: clean of errors (pre-existing unrelated lint warnings remain)
- Fail-closed `seo:check`: 0 indexed, 0 sitemap, 0 errors
- Recognized production + indexing enabled: **7** indexed / **7** in sitemap / **23** tools excluded
- Production build: succeeds; `/robots.txt` and `/sitemap.xml` generated
- Migration checklist items from the design spec: all verified done

Known non-blocking advisories: ~58 title/description length warnings until copy polish.

---

## How to review / test this branch

```bash
# From the worktree or after checking out the branch
git checkout feature/seo-architecture-v1
npm ci

NEXT_PUBLIC_APP_URL=https://example.com npm run seo:check
NEXT_PUBLIC_APP_URL=https://example.com npm test
NEXT_PUBLIC_APP_URL=https://example.com npm run typecheck
NEXT_PUBLIC_APP_URL=https://example.com npm run lint
NEXT_PUBLIC_APP_URL=https://example.com npm run build

# Optional: production-shaped audit (still example.com)
NODE_ENV=production \
NEXT_PUBLIC_APP_URL=https://example.com \
SEO_INDEXING_ENABLED=true \
npm run seo:check
```

Smoke ideas: home title is ZolvStack-first; `/fileora` and one tool each emit exactly one JSON-LD script; fail-closed `/sitemap.xml` is empty without production indexing; `/robots.txt` allows `/`, disallows `/api/`, no `Host`.

---

## Deferred / follow-ups (not in this branch)

- Per-tool content + converter smoke tests, then selective `index: true` opt-in
- Real domain purchase + DNS Domain-property verification (preferred over HTML tags)
- Title/description length copy polish
- Optional IndexNow / GSC API comparison (extension roadmap)
- Dynamic `ImageResponse` OG (resolver API already abstracts this)

---

## Intentionally not done on this branch

- No merge to `main`
- No pull request opened as part of this summary push
- No hard-coded production / Netlify / `fileora.com` hosts in SEO outputs
