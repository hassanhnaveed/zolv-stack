# Task 9 Report: Indexing policy, verification metadata, runbooks, final audit

## Status

DONE

## Scope

Implemented Task 9 only, per the approved conservative policy: wired
verification metadata into `buildRootMetadata()`, hardened/extended
regression coverage for the already-conservative tool indexing defaults
(no route flags changed), added operational runbooks, updated
`.env.example`/README, and ran a full migration-checklist + fail-closed +
recognized-production audit. Task 1–8 public APIs and runtime page behavior
were not altered.

## Policy decision (as approved)

- **Initial indexable tool allowlist is empty.** Every `product-tool` route
  keeps `index: false`, `sitemap: false`, `follow: true`
  (`TOOL_ROUTE_DEFAULTS` in `lib/seo/routes.ts` — unchanged, already
  conservative from Task 2).
- **Home and the Fileora hub retain their already-approved
  index/sitemap settings** (`index: true`, `sitemap: true` — also
  unchanged, from Task 2's `BRAND_ROUTES` / `FILEORA_HUB_ROUTE`).
- **Clarification vs. the task brief:** the brief's audit summary states
  "expected sitemap/indexed routes are Home + Fileora hub only." The real,
  already-approved (Task 2) registry also declares `about`, `contact`,
  `security`, `privacy`, and `terms` as `index: true` — none of these are
  tools, and Task 9's scope/instructions explicitly forbid altering Task
  1–8 behavior. I kept these five legal/static pages indexable and did
  **not** narrow them to noindex, since doing so would itself violate "Do
  not alter Task 1–8 public APIs or runtime page behavior." All Task 9
  regression tests assert the true state (7 non-tool routes indexable, 0
  tools) rather than the brief's abbreviated "Home + Fileora hub" phrasing.
  This is called out explicitly here rather than silently reinterpreted.
- No content or converter smoke tests were added (out of scope, per brief
  — prerequisites for future per-tool opt-in).
- No new "allowlist" abstraction was introduced; `routes.ts` remains the
  single source of truth, per a new focused comment above
  `TOOL_ROUTE_DEFAULTS` documenting the Task 9 decision and the opt-in path.

## Files

- Created `lib/seo/verification.ts` (shared placeholder-token detection)
- Created `docs/seo/search-console.md`
- Created `docs/seo/performance-budgets.md`
- Created `docs/seo/rollback.md`
- Modified `lib/seo/metadata.ts` (wired `verification` into
  `buildRootMetadata()`)
- Modified `lib/seo/validate.ts` (re-exports
  `isPlaceholderVerificationToken` from `./verification` instead of
  defining it; no behavior change)
- Modified `lib/seo/routes.ts` (Task 9 policy comment only; no flags
  changed)
- Modified `lib/seo/metadata.test.ts`, `lib/seo/routes.test.ts`,
  `lib/seo/validate.test.ts` (new regression coverage)
- Modified `.env.example` (indexing-policy + verification doc comments)
- Modified `README.md` (new "SEO architecture" section + env var docs)

## Architecture

- **Verification metadata**: `buildRootMetadata()` (root-only — verification
  meta tags are site-wide, not per-route) now calls
  `buildVerificationMetadata()`, which reads `getSeoConfig()` and emits
  Next's native `Metadata.verification` shape:
  - Google → native `verification.google` key.
  - Bing → `verification.other["msvalidate.01"]` (Next has no native Bing
    field; this is Next's documented escape hatch).
  - A token is omitted completely when unset/blank (never an empty string
    or an empty nested `other` object) and also omitted (never thrown) when
    it looks like a placeholder — `validateVerificationTokens` /
    `seo:check` remains the loud failure path for that same condition.
- **Shared placeholder detection**: extracted `isPlaceholderVerificationToken`
  (previously defined in `validate.ts`) into a new `lib/seo/verification.ts`
  module. `validate.ts` now imports and re-exports it unchanged (existing
  imports/tests are untouched); `metadata.ts` imports it directly from
  `verification.ts`. This satisfies "reuse existing placeholder validation
  logic; do not create parallel regexes" while preserving `metadata.ts`'s
  documented invariant that it "never imports from `validate.ts`" — both
  now consume the same lower-level shared module instead.
- **Indexing policy**: no route flags changed. Added a focused comment
  block above `TOOL_ROUTE_DEFAULTS` in `routes.ts` explaining the Task 9
  audit outcome (zero tools approved, absence-of-evidence-means-exclude)
  and the per-route opt-in path for future tools — no new allowlist data
  structure.
- **Regression coverage**: added explicit, registry-level tests (not just
  fixture-level) proving the *real* `ROUTES` registry's effective
  indexable/sitemap set under a recognized-production + indexing-enabled
  environment equals exactly the non-tool route ids, and that no tool ever
  appears in that set — both in `routes.test.ts` (via
  `listIndexableRoutes`/`listSitemapRoutes`) and `validate.test.ts` (via
  `buildAuditReport()` with the real registry, no route override).

## TDD evidence

### RED (verification metadata)

Command:

```bash
npm test -- lib/seo/metadata.test.ts
```

Result before implementation (5 new tests failing against the
pre-Task-9 `buildRootMetadata`, which had no `verification` wiring):

```text
FAIL  lib/seo/metadata.test.ts > buildRootMetadata — verification (Task 9) > emits only the Bing verification field ...
FAIL  lib/seo/metadata.test.ts > buildRootMetadata — verification (Task 9) > emits both Google and Bing verification fields together
FAIL  lib/seo/metadata.test.ts > buildRootMetadata — verification (Task 9) > never emits an empty nested `other` object when only Google is set
FAIL  lib/seo/metadata.test.ts > buildRootMetadata — verification (Task 9) > still emits a real-looking Google token in a recognized production environment
Test Files  1 failed (1)
     Tests  5 failed | 33 passed (38)
```

(The "Google-only" and "missing omission" cases already passed trivially
against `undefined`, confirming the test file itself was exercising real
behavior, not tautologies.)

### GREEN

After implementing `buildVerificationMetadata()` + wiring it into
`buildRootMetadata()`:

```bash
npm test -- lib/seo/metadata.test.ts lib/seo/validate.test.ts
```

```text
Test Files  2 passed (2)
     Tests  84 passed (84)
```

### RED → GREEN (indexing-policy regression coverage)

Added a new test in `routes.test.ts` asserting the real registry's
effective indexable/sitemap set under
`stubProductionEnabled()` equals exactly `Object.values(ROUTE_IDS)` (the 7
non-tool ids). First assertion attempt used a hardcoded
`[FILEORA_HUB, HOME]` expectation and failed, correctly proving the test
harness was exercising the real registry rather than a tautology:

```text
FAIL lib/seo/routes.test.ts > indexability helpers > Task 9: ...
AssertionError: expected [ 'about', 'contact', …(5) ] to deeply equal [ 'fileora-hub', 'home' ]
```

This surfaced the brief-vs-registry discrepancy documented in "Policy
decision" above. Corrected the expectation to the true already-approved
set (`Object.values(ROUTE_IDS)`, all declared `index: true`) plus an
explicit "no tool slug ever appears" assertion:

```bash
npm test -- lib/seo/routes.test.ts lib/seo/validate.test.ts
```

```text
Test Files  2 passed (2)
     Tests  96 passed (96)
```

### Full suite GREEN

```bash
npm test
```

```text
Test Files  18 passed (18)
     Tests  252 passed (252)
```

(Baseline after Task 8 was 239 tests; Task 9 added 13: 9 in
`metadata.test.ts`, 2 in `routes.test.ts`, 1 in `validate.test.ts`, plus a
duplicate-count correction — exact delta verified by running each file
individually above.)

All tests use `vi.stubEnv` and restore via `afterEach(() => vi.unstubAllEnvs())`
(existing convention in every touched test file), so they are
order-independent and do not leak env state between tests.

## Verification

- Focused tests (metadata, routes, validate): PASS — see TDD evidence above.
- `npm test`: PASS — 18 files, 252 tests, 0 failures.
- `npm run lint`: PASS — 0 errors, 10 pre-existing warnings, none in any
  Task 9 file (unused-var/`<img>` warnings in unrelated components —
  identical set as Task 8's report).
- `npm run typecheck`: PASS — 0 errors.
- Fail-closed audit:
  `NEXT_PUBLIC_APP_URL=https://example.com npm run seo:check` (no
  `NODE_ENV=production`, no `SEO_INDEXING_ENABLED`) →
  `SEO audit: 30 routes, 0 indexed, 0 in sitemap, 30 excluded.` /
  `effectiveIndexingActive=false`. `Issues: 0 error(s), 58 warning(s)`
  (identical warning count to Task 8's report — all pre-existing
  title/description-length advisories, none new).
- Recognized-production + indexing-enabled audit (real registry, no
  fixture override):
  `NODE_ENV=production NEXT_PUBLIC_APP_URL=https://example.com SEO_INDEXING_ENABLED=true npm run seo:check`
  → `SEO audit: 30 routes, 7 indexed, 7 in sitemap, 23 excluded.` The audit
  Markdown route table confirms the indexed set is exactly
  `about, contact, fileora-hub, home, privacy, security, terms` (7 rows
  with `yes | yes`); every one of the 23 `product-tool` rows reads
  `no | no | ... | not opted in (route.index=false)`. `0 error(s)`.
- `NEXT_PUBLIC_APP_URL=https://example.com npm run build`: PASS. Compiled,
  typechecked, and generated 44 static pages (same route list as Task 8).
  Built (no `SEO_INDEXING_ENABLED`) `/sitemap.xml` is `<urlset ...></urlset>`
  (empty, fail-closed) and `/robots.txt` allows `/`, disallows `/api/`, no
  `Host`, per the existing (Task 8) contract — unaffected by Task 9.
  Retained the pre-existing multi-lockfile workspace-root warning (outside
  this repo's control).
- Placeholder-token production regression (direct, deterministic — chosen
  over the sandboxed `seo:check` exit code, which triggered an
  auto-review credential-material block when run non-interactively with an
  injected placeholder token):
  ```
  NODE_ENV=production SEO_INDEXING_ENABLED=true NEXT_PUBLIC_APP_URL=https://example.com \
    SEO_GOOGLE_SITE_VERIFICATION=your-token-here SEO_BING_SITE_VERIFICATION=REPLACE_ME \
    npx tsx -e 'import { buildRootMetadata } from "./lib/seo/metadata";
      const m = buildRootMetadata();
      console.log("verification field:", JSON.stringify(m.verification));
      console.log("has verification key:", "verification" in m);'
  ```
  Output: `verification field: undefined` / `has verification key: false`
  — both placeholder tokens are fully rejected (omitted) in a recognized
  production environment, and `buildRootMetadata()` did not throw. A
  contrasting run with real-looking tokens
  (`Ab3xQz9-real-looking-token` / `9F3k2-real-looking-token`) in the same
  production environment printed
  `verification field: {"google":"Ab3xQz9-real-looking-token","other":{"msvalidate.01":"9F3k2-real-looking-token"}}`,
  confirming the rejection is placeholder-specific, not a general
  suppression. Separately, `npm run seo:check` with
  `SEO_GOOGLE_SITE_VERIFICATION=your-token-here` printed
  `[seo/placeholder-verification-token] Google Search Console verification
  token looks like an unfilled placeholder ("your-token-here"); set the
  real token before deploying.` and `seo:check failed — see errors above.`,
  confirming the audit's independent loud-failure path for the same
  condition (unit-tested exhaustively in `validate.test.ts`, unchanged by
  this task).
- `git diff --check`: PASS, no output, exit 0.
- IDE diagnostics (`ReadLints`) for every changed/created TypeScript file:
  no errors.
- Working tree after cleanup contains only the intended Task 9 files (see
  "Files" above) plus this report; no `reports/` or `.next/` artifacts.

## Migration checklist evidence (spec "Migration Checklist")

Delegated to a read-only exploration pass across the full worktree
(grep + file reads), confirmed against the current codebase state:

1. **VERIFIED-DONE** — No Fileora-as-site-default title/description/OG in
   `app/layout.tsx`; it uses `buildRootMetadata()` (ZolvStack-centric).
2. **VERIFIED-DONE** — No inline/hand-written JSON-LD or fake
   `aggregateRating` in `app/layout.tsx` (fonts + children only).
3. **VERIFIED-DONE** — No client-side JSON-LD and no hard-coded
   `fileora.com` string anywhere in `components/tools/ToolPage.tsx`.
4. **VERIFIED-DONE** — `app/(marketing)/fileora/page.tsx` uses the
   centralized `JsonLd` component + `buildJsonLdForRoute`, not inline
   JSON-LD.
5. **VERIFIED-DONE** — All 23 tool pages under
   `app/(marketing)/fileora/(tools)/*/page.tsx` export
   `metadata = buildMetadataForRoute(routeId)`; no hand-rolled metadata or
   ad-hoc canonicals remain.
6. **VERIFIED-DONE** — No commented-out `metadata` exports remain on any
   tool page (including `remove-bg`, `image-enhance`); both have live
   metadata and registry entries. Every `ToolSlug` in `TOOL_CONFIG`
   (`lib/utils.ts`) has a corresponding `lib/seo/routes.ts` entry (0
   missing, verified via `Object.keys(TOOL_CONFIG)` diffed against
   `ROUTES`).
7. **VERIFIED-DONE** — No page (including document tools) is missing
   metadata coverage; every tool/hub/static/legal route resolves metadata
   via the centralized builder.
8. **VERIFIED-DONE** — No hard-coded `fileora.netlify.app` / `netlify.app`
   fallback remains anywhere under `app/`, `lib/`, or `components/` as
   production defaults. The only occurrences are the intentional
   `LEGACY_HOST_PATTERNS` deny-list in `validate.ts` and its test fixtures
   (used to *detect*, not emit, the legacy host).
9. **VERIFIED-DONE** — `app/sitemap.ts` / `app/robots.ts` are thin
   wrappers delegating to `lib/seo/sitemap.ts#buildSitemap()` /
   `lib/seo/robots.ts#buildRobots()`; no ad-hoc logic remains.
10. **VERIFIED-DONE** — No redirect slug list is duplicated outside
    `lib/seo/redirects.ts`; `next.config.ts` only calls
    `getNextRedirects()`.

All 10 checklist items are complete; none required Task 9 code changes
(they were already resolved by Tasks 1–8), and none are BLOCKED.

## Environment / deployment impact

- No new required env vars. `SEO_GOOGLE_SITE_VERIFICATION` /
  `SEO_BING_SITE_VERIFICATION` already existed in `.env.example` (Task
  1/earlier); this task only wires their *consumption* into metadata and
  clarifies their documentation — leaving either blank remains fully
  supported and non-fatal.
- `SEO_INDEXING_ENABLED=true` in a real production deploy today makes
  exactly 7 routes indexable (home + 5 legal/static pages + the Fileora
  hub) and 0 tools — operators should not expect any tool URL to appear in
  Search Console until it is individually opted in via `routes.ts` after
  passing the index quality gate (documented in `docs/seo/search-console.md`
  and the `TOOL_ROUTE_DEFAULTS` comment).
- No deployment script, CI workflow, or build command changed.

## Assumptions and limitations

- Interpreted "reject placeholder/example tokens in recognized production
  before emitting metadata" as *omit, never throw* — consistent with "keep
  missing tokens optional and non-fatal" for the *same* function, and with
  `validateVerificationTokens`/`seo:check` already owning the loud-failure
  path for the identical condition. `buildRootMetadata()` applies this
  omission in every environment (not gated behind an
  `isProductionSeoEnvironment()` check) since a placeholder token is never
  a legitimate value to emit regardless of environment; the TDD suite
  specifically exercises the recognized-production case per the brief.
- Corrected the brief's "Home + Fileora hub only" audit expectation to the
  registry's true state (7 non-tool routes) — see "Policy decision" above
  for the explicit rationale; this was necessary to avoid violating the
  brief's own "do not alter Task 1–8 behavior" constraint.
- Docs (`search-console.md`, `performance-budgets.md`, `rollback.md`) are
  operational runbooks, not enforced by tests — they were reviewed for
  consistency with the actual implementation (function/field names, env
  var names, script names) but their prose guidance is not executable.
- Did not add a numeric-exit-code assertion for `seo:check` with an
  injected placeholder token via the shell (sandbox auto-review flagged
  that specific invocation as credential-adjacent); relied instead on the
  captured stdout (`seo:check failed`, exact error code/message) plus the
  pre-existing, unmodified `validate.test.ts` unit coverage for
  `validateVerificationTokens`, which asserts the same condition
  deterministically without shelling out.

## Self-review

- Confirmed no route's `index`/`sitemap`/`follow` flags changed from their
  Task 1–8 values (diff of `routes.ts` is comment-only in the
  `TOOL_ROUTE_DEFAULTS` area).
- Confirmed `buildMetadataForRoute` (non-root) is untouched — verification
  is root-only, per the brief.
- Confirmed `metadata.ts`'s existing "never imports from `validate.ts`"
  architectural invariant is preserved by extracting the shared helper to
  `verification.ts` rather than importing `validate.ts` directly.
- Confirmed `validate.ts`'s public exports (`isPlaceholderVerificationToken`
  and everything else) are unchanged from a consumer's perspective — same
  name, same signature, same module path.
- Confirmed the new tests fail meaningfully before implementation (RED)
  rather than passing vacuously — demonstrated above via the actual
  pre-implementation failure output for both the verification tests and
  the indexing-policy regression test (which caught a real
  brief-vs-registry mismatch).
- Confirmed generated `.next/` and `reports/` artifacts are not present in
  the final `git status`.

## Concerns

- The task brief's stated audit expectation ("Home + Fileora hub only")
  does not match the already-approved (Task 2) registry, which also
  indexes five legal/static pages. I resolved this by keeping the
  Task 1–8 behavior intact (per this same brief's explicit constraint) and
  documenting the discrepancy rather than silently narrowing indexing
  further or silently deviating from the brief's literal audit claim.
  Flagging this for maintainer awareness rather than treating it as
  self-evidently resolved.
- No other blocking concerns.

## Fix Report

### Files

- `.github/workflows/deploy-main.yml`: passed both verification secrets and
  the indexing variable into the production build job; added the blocking
  `npm run seo:check` step immediately before the build.
- `package.json`: inserted `npm run seo:check` between tests and build in
  `prepush`.
- `docs/seo/search-console.md`: documented GitHub Environment build-time
  configuration for the Lightsail artifact flow, local pre-push origin
  requirements, and the complete seven-route non-tool indexing scope.
- `README.md`: corrected the Vitest command to `npm test`, aligned indexing
  scope, and documented the expanded pre-push checks.
- `.superpowers/sdd/task-9-report.md`: appended this follow-up report.

### RED / GREEN

Not applicable: this follow-up changes workflow gates, package scripts, and
documentation only; it does not change production metadata behavior. The
optional metadata assertion was not added because placeholder omission outside
production is already implemented and covered indirectly by the existing
non-production `example-token` test, so a truthful test-first RED state was not
available without deliberately regressing production code.

### Commands / results

- `npm test -- lib/seo/metadata.test.ts lib/seo/routes.test.ts lib/seo/validate.test.ts`
  — PASS, 3 files / 134 tests.
- `npm test` — PASS, 18 files / 252 tests.
- `npm run typecheck` — PASS, 0 errors.
- `npm run lint` — PASS, 0 errors / 10 pre-existing warnings in unrelated
  files.
- `NEXT_PUBLIC_APP_URL=https://example.com npm run seo:check` — PASS,
  30 routes / 0 indexed / 0 sitemap / 0 errors / 58 advisory warnings.
- `git diff --check` — PASS.
- Ruby `YAML.load_file` for `.github/workflows/deploy-main.yml` — PASS.
- Node JSON parse for `package.json` — PASS.
- IDE diagnostics for all four edited workflow/config/docs files — no errors.

### Self-review

- Confirmed the CI SEO gate receives the same GitHub Environment origin,
  verification secrets, and indexing variable used for the production build.
- Confirmed pre-push ordering remains lint → typecheck → tests → SEO check →
  build and does not hard-code a deployment origin.
- Confirmed no indexing flags or tool routes changed; every tool remains
  `noindex` / excluded from the sitemap.
- Confirmed no token values, production hosts, generated audit reports, or
  unrelated files were added.
