# SEO Architecture v1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved SEO Architecture v1.0 centralized module so ZolvStack is the primary brand, Fileora tools are product-SEO’d, and all metadata/schema/sitemap/robots/indexing are domain-agnostic and config-driven.

**Architecture:** `lib/seo/*` is the single source of truth (`routes.ts` + builders). App Router pages become thin consumers. Client components never import SEO builders. Validation and `seo:check` gate regressions.

**Tech Stack:** Next.js 16 App Router Metadata API, Vitest, TypeScript, existing `TOOL_CONFIG` / `toolHref` in `lib/utils.ts`.

**Spec:** `docs/superpowers/specs/2026-07-17-seo-architecture-design.md`

## Global Constraints

- Primary brand: ZolvStack; product: Fileora; titles like `{Tool} | Fileora by ZolvStack` for tools.
- Single-locale English (`en` / `en_US`); URL builders accept locale context for future i18n.
- No hard-coded production hosts, Netlify URLs, or `fileora.com` in SEO outputs.
- Domain not purchased yet — everything via `NEXT_PUBLIC_APP_URL`.
- Tools default to `index: false` / `sitemap: false` until explicitly enabled.
- No fake `aggregateRating` / reviews / empty schema properties.
- Server-only: never import `lib/seo/*` from client components.
- Fail-closed: unrecognized/non-production → noindex + empty sitemap.
- Do not commit `.env*` secrets; add placeholders to `.env.example` only.
- Work on a `feature/` or `chore/` branch; do not push to `main`.
- Follow recommended order; do not migrate everything in one commit.

---

## File Map

| Path | Responsibility |
|---|---|
| `lib/seo/types.ts` | Shared types (`RouteId`, `PageType`, `IndexFlags`, `SocialImage`, …) |
| `lib/seo/config.ts` | Site defaults, locale, env readers, production recognition |
| `lib/seo/brands.ts` | ZolvStack / Fileora brand tokens & title templates |
| `lib/seo/url.ts` | `getSiteOrigin`, `absoluteUrl`, locale-aware paths |
| `lib/seo/routes.ts` | SSOT route registry + path constants |
| `lib/seo/redirects.ts` | Redirect manifest for `next.config.ts` |
| `lib/seo/alternates.ts` | Canonical + hreflang helpers |
| `lib/seo/metadata.ts` | Metadata builders + inheritance |
| `lib/seo/open-graph.ts` | Project SocialMetadata → OG/Twitter |
| `lib/seo/indexability.ts` | Helpers over route index flags |
| `lib/seo/validate.ts` | Validators |
| `lib/seo/audit.ts` | Report writers |
| `lib/seo/og/*` | Image resolvers |
| `lib/seo/schema/*` | JSON-LD builders + registry |
| `lib/seo/index.ts` | Barrel exports |
| `components/seo/JsonLd.tsx` | Server JSON-LD injector |
| `scripts/seo-check.ts` | CLI for `npm run seo:check` |
| `docs/seo/*` | URL policy, runbook, budgets, rollback |
| `app/layout.tsx`, pages, `sitemap.ts`, `robots.ts`, `next.config.ts` | Thin consumers |
| `lib/seo/**/*.test.ts` | Vitest coverage |

---

### Task 1: Core types, config, brands, URL helpers

**Files:**
- Create: `lib/seo/types.ts`
- Create: `lib/seo/config.ts`
- Create: `lib/seo/brands.ts`
- Create: `lib/seo/url.ts`
- Create: `lib/seo/url.test.ts`
- Create: `lib/seo/index.ts` (partial exports)

**Interfaces:**
- Produces: `getSiteOrigin()`, `absoluteUrl(path, locale?)`, `SeoConfig`, brand constants, core types

- [ ] **Step 1: Write failing URL tests**

```ts
// lib/seo/url.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { absoluteUrl, getSiteOrigin } from "./url";

describe("getSiteOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("parses NEXT_PUBLIC_APP_URL and strips trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com/");
    expect(getSiteOrigin().origin).toBe("https://example.com");
  });

  it("rejects hard-coded fallbacks by requiring env in production mode", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(() => getSiteOrigin()).toThrow(/NEXT_PUBLIC_APP_URL/);
  });
});

describe("absoluteUrl", () => {
  it("joins origin and path without trailing slash (except root)", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    expect(absoluteUrl("/")).toBe("https://example.com/");
    expect(absoluteUrl("/fileora")).toBe("https://example.com/fileora");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/seo/url.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement types, config, brands, url**

Implement:

- `types.ts`: `PageType`, `ProductId`, `IndexFlags`, `SeoRoute`, `SocialImage`, etc.
- `config.ts`: read `NEXT_PUBLIC_APP_URL`, `SEO_INDEXING_ENABLED`, verification envs; `isProductionSeoEnvironment()` fail-closed helper
- `brands.ts`: ZolvStack / Fileora names, taglines, title template helpers
- `url.ts`: normalize origin; `absoluteUrl(path, locale = "en")` prepared for future `/en` prefixes (no prefix today)
- **No** Netlify/Fileora default fallbacks

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run lib/seo/url.test.ts`

- [ ] **Step 5: Commit**

```bash
git add lib/seo/types.ts lib/seo/config.ts lib/seo/brands.ts lib/seo/url.ts lib/seo/url.test.ts lib/seo/index.ts
git commit -m "$(cat <<'EOF'
feat(seo): add core URL and brand foundation for SEO v1

EOF
)"
```

---

### Task 2: Route registry, redirects, indexability helpers

**Files:**
- Create: `lib/seo/routes.ts`
- Create: `lib/seo/redirects.ts`
- Create: `lib/seo/indexability.ts`
- Create: `lib/seo/routes.test.ts`
- Modify: `next.config.ts` to import redirect manifest

**Interfaces:**
- Consumes: types, brands, `TOOL_CONFIG` / `toolHref` for tool path alignment
- Produces: `ROUTES`, `getRoute(id)`, `listRoutes()`, `getRedirects()`, index helpers

- [ ] **Step 1: Write failing route validation tests**

Cover: kebab-case paths, reserved path collisions, default tools `index: false`, unique paths, brand home + fileora hub exist.

- [ ] **Step 2: Implement `routes.ts`**

Register at minimum:

- ZolvStack: `/`, `/about`, `/contact`, `/security`, `/privacy`, `/terms`
- Fileora hub: `/fileora`
- Every `ToolSlug` from `TOOL_CONFIG` as `/fileora/{slug}` with SEO fields + **default non-indexable**

Include path constants used by metadata/nav (e.g. `PATHS.HOME`, `PATHS.FILEORA`).

- [ ] **Step 3: Implement `redirects.ts`**

Move current `next.config.ts` redirect sources (`/convoox`, bare tool slugs → `/fileora/...`) into the manifest. Export `getNextRedirects()`.

- [ ] **Step 4: Wire `next.config.ts`**

```ts
import { getNextRedirects } from "@/lib/seo/redirects";
// redirects() { return getNextRedirects(); }
```

- [ ] **Step 5: Tests pass + commit**

```bash
git commit -m "$(cat <<'EOF'
feat(seo): add route registry and redirect manifest

EOF
)"
```

---

### Task 3: Validation, audit report, `seo:check`

**Files:**
- Create: `lib/seo/validate.ts`
- Create: `lib/seo/audit.ts`
- Create: `lib/seo/validate.test.ts`
- Create: `scripts/seo-check.ts`
- Modify: `package.json` (`"seo:check": "tsx scripts/seo-check.ts"` or `vitest`/`node --import tsx` — use approach already available; prefer `npx tsx` or a small `vitest` project script without new deps if possible: `node --experimental-strip-types` or compile via vitest runner)
- Modify: `.gitignore` to ignore `reports/seo-audit.*` if desired
- Create: `docs/seo/url-policy.md` (canonical contract)

**Preferred script approach without new dependency:** export `runSeoAudit()` from `lib/seo/audit.ts` and invoke via:

```json
"seo:check": "vitest run lib/seo/audit.cli.test.ts"
```

or a tiny `scripts/seo-check.mjs` that imports built output. Prefer adding `tsx` only if already acceptable; otherwise implement audit as Vitest tests that write the report file.

- [ ] **Step 1: Implement validators**

Detect: invalid canonicals, relative URLs where absolute required, reserved collisions, duplicate paths/titles (indexable), missing required fields by page type, placeholder verification tokens, hard-coded host substrings in serialized outputs, index/sitemap flag inconsistencies.

- [ ] **Step 2: Implement audit report**

Write `reports/seo-audit.json` + `reports/seo-audit.md` with indexed/excluded pages, reasons, totals, verification health, warnings/failures.

- [ ] **Step 3: Tests + `npm run seo:check`**

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(seo): add validators and seo:check audit report

EOF
)"
```

---

### Task 4: Metadata + OG/Twitter builders (with tests)

**Files:**
- Create: `lib/seo/alternates.ts`
- Create: `lib/seo/open-graph.ts`
- Create: `lib/seo/og/types.ts`, `default.ts`, `product.ts`, `tool.ts`, `index.ts`
- Create: `lib/seo/metadata.ts`
- Create: `lib/seo/metadata.test.ts`
- Create: `public/og/zolvstack-default.png`, `public/og/fileora-default.png` (or reuse/adapt existing `/og.png` with versioning helper)
- Modify: `.env.example` for new SEO vars (placeholders)

**Interfaces:**
- Produces: `buildRootMetadata()`, `buildMetadataForRoute(routeId)`, `resolveOgImages(route)`

- [ ] **Step 1: Failing tests for inheritance, robots, alternates, OG/Twitter parity**

Assert:

- Brand home title contains `ZolvStack`
- Tool title matches `… | Fileora by ZolvStack`
- `openGraph.url === alternates.canonical`
- Twitter title/description/images match normalized social object
- Non-indexable → `robots.index === false`, `follow === true`
- Keywords absent unless set

- [ ] **Step 2: Implement builders**

- Length warnings (50–60 / 140–160) via validate warn API
- Multi-image resolver returning array; emit primary initially
- Include `og:image:type` when known
- Version query helper for OG assets (e.g. `?v=seo1`)

- [ ] **Step 3: Tests pass + commit**

```bash
git commit -m "$(cat <<'EOF'
feat(seo): add metadata and social card builders

EOF
)"
```

---

### Task 5: JSON-LD schema module + JsonLd component

**Files:**
- Create: `lib/seo/schema/*` (entities, organization, website, webpage, webapplication, softwareapplication, collectionpage, breadcrumb, faq, prune, registry, graph, index)
- Create: `components/seo/JsonLd.tsx`
- Create: `lib/seo/schema/graph.test.ts`

**Interfaces:**
- Produces: `buildJsonLdForRoute(routeId)`, `<JsonLd data={…} />`

- [ ] **Step 1: Failing schema tests**

- Shared `@id` reuse
- Tool graph includes WebPage + `mainEntity` → SoftwareApplication
- Hub uses CollectionPage
- No `aggregateRating`
- Absolute URLs; pruned empties
- Single `@graph` shape

- [ ] **Step 2: Implement schema registry + prune**

- [ ] **Step 3: Implement `JsonLd.tsx`**

```tsx
// Server Component — no "use client"
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 4: Tests pass + commit**

```bash
git commit -m "$(cat <<'EOF'
feat(seo): add modular JSON-LD builders and JsonLd component

EOF
)"
```

---

### Task 6: Migrate root layout + ZolvStack / static pages metadata

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/(zolvstack)/layout.tsx` and/or introduce server metadata export for home
- Modify: `app/about/page.tsx`, `contact`, `security`, `privacy`, `terms`
- Create: integration test asserting no Fileora-as-default root title

- [ ] **Step 1: Replace root `metadata` with `buildRootMetadata()`**

Remove inline JSON-LD and fake ratings from layout.

- [ ] **Step 2: Ensure ZolvStack home has correct metadata**

If page is client-only, put `export const metadata` / `generateMetadata` on the nearest **server** layout for `(zolvstack)`.

- [ ] **Step 3: Point static pages at `buildMetadataForRoute`**

- [ ] **Step 4: Manually verify `curl -s localhost:3000 | head` shows ZolvStack title (dev server)**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(seo): migrate root and brand pages to SEO module

EOF
)"
```

---

### Task 7: Migrate Fileora hub + all tool pages (metadata + JsonLd)

**Files:**
- Modify: `app/(marketing)/fileora/page.tsx`
- Modify: every `app/(marketing)/fileora/(tools)/*/page.tsx`
- Modify: `components/tools/ToolPage.tsx` — **remove** client JSON-LD scripts and hard-coded `fileora.com`
- Create: `lib/seo/canonical-consistency.test.ts` (integration-style)

**Pattern for each tool page:**

```tsx
import { ToolPage } from "@/components/tools/ToolPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadataForRoute, buildJsonLdForRoute } from "@/lib/seo";
import { ROUTES } from "@/lib/seo/routes";

export const metadata = buildMetadataForRoute(ROUTES.FILEORA_IMAGE_TO_WEBP.id);

export default function Page() {
  return (
    <>
      <JsonLd data={buildJsonLdForRoute(ROUTES.FILEORA_IMAGE_TO_WEBP.id)} />
      <ToolPage slug="image-to-webp" />
    </>
  );
}
```

- [ ] **Step 1: Remove ToolPage schema**

- [ ] **Step 2: Migrate Fileora hub page**

- [ ] **Step 3: Migrate all tool pages** (batch by category: image, pdf, document, ai)

- [ ] **Step 4: Canonical consistency test** for representative routes (home, hub, one tool): metadata, OG, Twitter, JSON-LD, breadcrumbs all share one canonical

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(seo): migrate Fileora hub and tool pages to centralized SEO

EOF
)"
```

---

### Task 8: Sitemap + robots migration

**Files:**
- Create: `lib/seo/sitemap.ts` (builder)
- Create: `lib/seo/robots.ts` (builder)
- Modify: `app/sitemap.ts`, `app/robots.ts`
- Create: `lib/seo/sitemap.test.ts`

- [ ] **Step 1: Failing tests**

- Only index+sitemap routes included
- No duplicates; absolute HTTPS when origin is https
- Empty sitemap when fail-closed
- robots: allow `/`, disallow `/api/`, sitemap URL set, **no Host**
- `/_next` not disallowed

- [ ] **Step 2: Implement builders; thin app routes**

- [ ] **Step 3: Tests pass + commit**

```bash
git commit -m "$(cat <<'EOF'
feat(seo): drive sitemap and robots from route registry

EOF
)"
```

---

### Task 9: Indexing policies, verification, docs, final audit

**Files:**
- Modify: `lib/seo/routes.ts` — enable `index: true` only for tools that pass the quality gate (start conservative; prefer few high-quality tools over mass-index)
- Modify: `lib/seo/config.ts` / metadata for `verification`
- Modify: `.env.example`
- Create: `docs/seo/search-console.md`, `docs/seo/performance-budgets.md`, `docs/seo/rollback.md`
- Modify: `README.md` — brief SEO/env section
- Create: verification health checks in audit

- [ ] **Step 1: Wire verification into `buildRootMetadata`**

Omit empty tags; reject placeholder tokens in production builds.

- [ ] **Step 2: Write runbooks** (one-time / per-deploy / per-release; Domain property + DNS recommended)

- [ ] **Step 3: Explicitly enable indexing for approved production-ready tools only**

Leave unfinished/AI/thin tools `noindex`.

- [ ] **Step 4: Run full validation**

```bash
npm run lint
npm run typecheck
npm test
npm run seo:check
npm run build
```

(With `NEXT_PUBLIC_APP_URL` set to a temporary https origin for build, e.g. `https://example.com`, until real domain is purchased.)

- [ ] **Step 5: Confirm migration checklist in the spec is complete**

- [ ] **Step 6: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(seo): add verification, docs, and initial index policies

EOF
)"
```

---

## Self-Review (plan vs spec)

| Spec requirement | Task(s) |
|---|---|
| Centralized `lib/seo/*` | 1–5 |
| `routes.ts` SSOT | 2 |
| Modular schema + registry | 5 |
| validate + audit + seo:check | 3 |
| Domain-agnostic URLs | 1, 4, 8 |
| ZolvStack primary brand | 6 |
| Fileora tool SEO | 7 |
| OG/Twitter parity + og module | 4 |
| Sitemap/robots + fail-closed | 8–9 |
| Verification + runbooks | 9 |
| Migration / rollback / success criteria | Spec + Task 9 |
| No app code until plan approved | Honored — plan only |

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-17-seo-architecture.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks  
2. **Inline Execution** — execute tasks in this session with checkpoints  

**Do not start implementation until you explicitly approve.** Domain purchase can happen later; use a placeholder HTTPS origin in env for builds and real DNS when ready.
