# SEO Architecture v1.0 — Design Spec

**Date:** 2026-07-17  
**Status:** Approved  
**Version:** SEO Architecture v1.0  
**Approach:** Centralized SEO module (`lib/seo/*`) — Approach 1  

## Goal

Ship production-grade, Next.js App Router SEO for zolv-stack that:

- Treats **ZolvStack** as the primary indexed brand (`/`).
- Treats **Fileora** as a product within the ecosystem (`/fileora`, `/fileora/*`) with tool-level SEO that still reinforces ZolvStack.
- Is fully **domain-agnostic** via `NEXT_PUBLIC_APP_URL` (production domain will be purchased later).
- Indexes only production-ready, high-quality tool pages (config-driven).
- Uses a single source of truth for routes, metadata, OG/Twitter, JSON-LD, sitemap, robots, and validation.

## Product Decisions

| Decision | Choice |
|---|---|
| Primary brand | ZolvStack |
| Product | Fileora (extensible to future products) |
| Locale | English-only (`en` / `en_US`); i18n-ready structure |
| Indexing | Explicit opt-in per route; default non-indexable for tools |
| Domain | Unknown until purchased; no hard-coded hosts |
| Architecture | Centralized `lib/seo/*` + `components/seo/JsonLd` |
| Schema style | Single `@graph` per page |
| Schema on noindex | Yes, when page content is accurate |
| Keywords meta | Optional; omit unless explicitly set |
| robots.txt Host | Not emitted |
| Verification | Next.js `verification` metadata + env vars |
| Fail-closed | Unrecognized / non-production → noindex + empty sitemap |

## Non-Goals (v1)

- Multi-language routing or translated content
- Dynamic `ImageResponse` OG routes (API ready only)
- Blog / docs / Article SEO content
- Search Console API ingestion dashboards
- IndexNow live pings
- Guaranteeing rankings or traffic
- Fake ratings, reviews, or invented FAQ content

## Architecture Diagram

```text
                    ┌─────────────────┐
                    │   routes.ts     │  SSOT: paths, titles,
                    │  (+ brands,     │  index policy, schema,
                    │   config, url)  │  OG refs, products
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ metadata        │
                    │ builder         │
                    │ (inheritance:   │
                    │  root→product→  │
                    │  route)         │
                    └────────┬────────┘
                             │
       ┌───────────┬─────────┼─────────┬───────────┬──────────┐
       ▼           ▼         ▼         ▼           ▼          ▼
   Metadata    Open Graph  Twitter  JSON-LD    Sitemap    robots.txt
   (App Router) (same obj) (same)  (schema/)   builder     builder
       │           │         │         │           │          │
       └───────────┴─────────┴─────────┴─────┬─────┴──────────┘
                                             ▼
                                      Validation /
                                      seo:check /
                                      audit report
```

All consumers read **route definitions**, never invent URLs from the request.

## Folder Structure

```text
lib/seo/
  config.ts
  types.ts
  brands.ts
  url.ts
  routes.ts                 # SSOT + path constants + index policy
  redirects.ts              # Redirect manifest (consumed by next.config)
  alternates.ts
  metadata.ts
  open-graph.ts
  indexability.ts           # Thin helpers over routes.ts policies
  validate.ts
  audit.ts                  # Report generation (JSON + Markdown)
  index.ts                  # Public barrel (server-only)
  og/
    default.ts
    product.ts
    tool.ts
    types.ts
    index.ts
  schema/
    organization.ts
    website.ts
    webpage.ts
    webapplication.ts
    softwareapplication.ts
    collectionpage.ts
    breadcrumb.ts
    faq.ts
    entities.ts             # Shared @id constants
    registry.ts             # pageType → schema builders
    graph.ts
    prune.ts                # Strip empty/null/undefined
    index.ts

components/seo/
  JsonLd.tsx                # Server Component only

docs/seo/
  url-policy.md             # Canonical URL contract
  search-console.md         # GSC/Bing runbook
  performance-budgets.md
  rollback.md

reports/                    # Generated (gitignored recommended)
  seo-audit.md
  seo-audit.json
```

### Server-only rule

- No client component may import from `lib/seo/*`.
- `JsonLd` is a lightweight Server Component.
- Client `ToolPage` must not build schema; tool `page.tsx` (server) injects `<JsonLd />`.

## Brand & Title Patterns

| Page type | Title pattern |
|---|---|
| `brand-home` | `ZolvStack — {tagline}` |
| `brand-static` / `legal` | `{Page} \| ZolvStack` |
| `product-hub` | `Fileora — Free File Converter \| ZolvStack` |
| `product-tool` | `{Intent title} \| Fileora by ZolvStack` |

Root layout defaults are **ZolvStack**, not Fileora.

## Route Configuration (`routes.ts`)

Each route entry is the SSOT for:

- `id`, `path` (constant), `product`, `pageType`
- `title`, `description` (SEO overrides; may fall back to `TOOL_CONFIG` for tools)
- `index` / `sitemap` / `follow` (independent flags)
- `sitemapPriority`, `changeFrequency`, `lastModified` (optional; never fabricate “now”)
- `schemaKinds` or registry key via `pageType`
- `ogImage` (optional override)
- `keywords` (optional; usually omitted)
- `faq` (optional; only real content)

**Default for tools:** `index: false`, `sitemap: false`, `follow: true` until quality gate passes.

### Index quality gate (tools)

A tool may be set to indexable only when it is fully functional, has unique substantial content, correct metadata/schema, crawlable internal links, and passes smoke tests.

## URL Strategy

See also `docs/seo/url-policy.md`.

- Origin only from `NEXT_PUBLIC_APP_URL` via `getSiteOrigin()` / `absoluteUrl(path, locale?)`.
- **Implementation note (v1.0):** `getSiteOrigin()` requires a valid origin in **every** environment (dev/test/prod), not only production. Invalid values throw; there is no silent fallback host. Origins must be bare (no credentials, query, fragment, or pathname); production requires `https`.
- Paths: lowercase kebab-case; no trailing slash except `/`.
- Canonicals always from route definition, never from request URL.
- Locale context accepted by URL builders; currently always `en`.
- Redirects live in `lib/seo/redirects.ts` and are applied from `next.config.ts`.
- Reserved paths validated: `/api`, `/_next`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`.
- Pagination (future): own canonicals per page; no incorrect page-1 canonicalization of distinct content.

## Metadata Strategy

- Builders: `buildRootMetadata()`, `buildMetadataForRoute(routeId)`.
- Inheritance: root defaults → product defaults → route overrides.
- Required fields enforced **per page type**.
- Title length warn: 50–60; description warn: 140–160.
- Canonical + `alternates.languages`: `{ en, 'x-default' }` self-referencing.
- Robots from independent index/follow flags.
- Keywords omitted unless explicit.
- Static tools use `export const metadata`; API stable for future `generateMetadata`.

## Open Graph & Twitter

- One normalized social object → both OG and Twitter (no silent divergence).
- `summary_large_image` default; `og:image:type` when MIME known.
- Resolver API returns `SocialImage[]` (may emit one today).
- Static assets under `public/og/` with versioning strategy; dynamic `ImageResponse` later without metadata API change.
- Meaningful `alt` required (no generic “image” / “logo” / “preview”).
- Validate image accessibility (resolves, correct type, expected dimensions).

## Structured Data

Shared entity IDs (examples):

- `{origin}/#organization`
- `{origin}/#website`
- `{origin}/fileora#webapp` (product)

Registry maps `pageType` → builders. Typical graphs:

| Page type | Graph |
|---|---|
| Brand home | Organization, WebSite, WebPage |
| Legal / static | Organization, WebPage, BreadcrumbList |
| Product hub | Organization, WebSite, CollectionPage (+ Fileora WebApplication), BreadcrumbList |
| Product tool | Organization (by @id), WebSite (by @id), WebPage (`mainEntity` → SoftwareApplication), SoftwareApplication, BreadcrumbList |

Rules:

- Single `@graph` script per page.
- Prune empty arrays/strings/null/undefined.
- No `aggregateRating` / reviews unless verified later.
- Emit accurate schema on valid noindex pages; never on error/placeholder pages.
- One canonical logo asset referenced everywhere.

## Sitemap, robots, indexing

- Sitemap includes only routes with `index: true` **and** `sitemap: true`.
- Fail-closed outside explicitly recognized production: noindex + empty sitemap (even if `SEO_INDEXING_ENABLED` is accidentally true).
- `SEO_INDEXING_ENABLED` is server-only (not `NEXT_PUBLIC_`).
- robots.txt: `Allow: /`, `Disallow: /api/`, `Sitemap: {origin}/sitemap.xml` — **no Host**.
- Do not block `/_next`.
- Human-readable + JSON audit reports; orphan detection (zero inbound links, redirect-only, isolated tools).
- Architecture remains ready to compare configured routes ↔ sitemap ↔ GSC indexed URLs later.

## Verification (GSC / Bing)

- Env: `SEO_GOOGLE_SITE_VERIFICATION`, `SEO_BING_SITE_VERIFICATION` (server-side).
- Next.js native `verification` metadata only when set.
- Recommended production: Google **Domain** property + DNS TXT; Bing via import from GSC when possible.
- Reject placeholder/example tokens in production builds.
- IndexNow / GSC API: deferred (extension roadmap).

## Performance & CWV (SEO-adjacent)

- Success measured primarily by **CrUX / Search Console field data**, not Lighthouse scores.
- Documented budgets in `docs/seo/performance-budgets.md`.
- Server-render SEO-critical HTML (title, copy, JSON-LD); monitor hydration / client boundaries.
- Route-level performance profiles: Home, Fileora hub, Image/PDF/Document tools.
- Intentional resource hints only; image pipeline via `next/image` remains separate from SEO layer.
- Accessibility must not be sacrificed for performance.

## Migration Checklist (replace / remove)

During implementation, remove or replace:

- [ ] Fileora-as-site-default titles/descriptions/OG in `app/layout.tsx`
- [ ] Inline JSON-LD in `app/layout.tsx` (including fake `aggregateRating`)
- [ ] Client-side JSON-LD in `components/tools/ToolPage.tsx` (hard-coded `fileora.com`)
- [ ] Inline JSON-LD in `app/(marketing)/fileora/page.tsx`
- [ ] Hand-rolled / inconsistent `metadata` and canonicals on tool pages (relative vs Netlify absolute)
- [ ] Commented-out metadata on tools (e.g. remove-bg, image-enhance) without route registry entries
- [ ] Missing metadata on document tools and others
- [ ] Hard-coded fallbacks to `https://fileora.netlify.app` in layout/sitemap/robots
- [ ] Ad-hoc sitemap/robots logic not driven by `routes.ts`
- [ ] Redirect slug lists duplicated outside `lib/seo/redirects.ts` (centralize)

## Rollback Guidance

Documented in `docs/seo/rollback.md` (implementation):

1. **Disable indexing safely:** set production env so fail-closed applies, or set `SEO_INDEXING_ENABLED=false` / unrecognized production flag → sitewide `noindex` + empty sitemap.
2. **Per-route:** set tool `index: false` / `sitemap: false` in `routes.ts` and redeploy.
3. **Metadata:** revert the PR/commit that migrated root or route metadata; framework remains but prior titles can be restored via route config.
4. **Sitemap:** confirm `/sitemap.xml` after rollback; should list only remaining indexable routes or be empty when indexing disabled.
5. **Canonicals:** run `npm run seo:check` and URL Inspection on home + one tool; ensure `NEXT_PUBLIC_APP_URL` still matches the live host.
6. Prefer config/env rollback over deleting `lib/seo` unless the framework itself is at fault.

## Extension Roadmap (deferred)

| Item | Notes |
|---|---|
| Dynamic `ImageResponse` OG | `lib/seo/og/*` resolvers already abstract this |
| Blog / Article SEO | New `pageType` + schema registry entry |
| Documentation SEO | TechArticle / docs page types |
| Multi-language | Locale-aware `url.ts` + route alternates |
| Search Console API | Compare configured ↔ sitemap ↔ indexed |
| IndexNow | Key + ping on publish; fail-closed aware |
| Additional rich results | FAQ only with real content; HowTo etc. as needed |
| Additional products | New brand token + route group only |

## Success Criteria (Acceptance)

- [ ] Zero hard-coded production / Netlify / Fileora-domain URLs in SEO outputs
- [ ] 100% metadata coverage for all registry routes (indexable and intentional noindex)
- [ ] All SEO validation tests passing (`vitest` + `seo:check`)
- [ ] Single source of truth: `routes.ts` drives metadata, schema, sitemap, robots, indexing
- [ ] No duplicate canonicals or duplicate titles among indexable routes
- [ ] No fake aggregate ratings / empty schema properties
- [ ] ZolvStack root branding; Fileora tools use “Fileora by ZolvStack” pattern
- [ ] Production go-live requires only env vars + DNS (domain purchased later) — no code edits for host
- [ ] Fail-closed indexing outside explicit production
- [ ] Migration checklist items removed/replaced

## Common Mistakes (project-specific)

Documented fully in Phase 9; highlights: hard-coded hosts, indexing thin tools, sitemap∋noindex, blocking `/_next`, divergent OG/Twitter, client-only landings, soft 404s, preview indexing, keyword stuffing, Lighthouse-as-target.

## Implementation Order

1. Create `lib/seo/*` framework  
2. Add validation and tests  
3. Migrate metadata  
4. Migrate JSON-LD  
5. Migrate Open Graph/Twitter (normalize with metadata)  
6. Migrate sitemap and robots  
7. Enable indexing policies (explicit opt-in)  
8. Configure verification hooks + docs  
9. Final audit and production validation  

## Related Documents

- Implementation plan: `docs/superpowers/plans/2026-07-17-seo-architecture.md`
- Operational docs (created during implementation): `docs/seo/*`
