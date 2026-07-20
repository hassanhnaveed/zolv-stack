# Performance Budgets (SEO-adjacent)

Field-data-first performance guidance for zolv-stack. Complements
`docs/seo/url-policy.md` and the SEO Architecture v1.0 spec's "Performance &
CWV" section. These budgets exist because Core Web Vitals (CWV) are a
Google ranking signal and directly affect user experience on conversion
tools — not to chase a Lighthouse score in isolation.

## Field data first

- **Primary source of truth: Chrome UX Report (CrUX) and Search Console's
  Core Web Vitals report**, once the site has enough real-user traffic to
  populate them. Field data reflects real devices/networks; lab data does
  not.
- **Lab tools (Lighthouse, PageSpeed Insights, WebPageTest) are a
  pre-launch sanity check only**, run locally or in CI, never treated as
  the target metric. A page can pass Lighthouse and still fail field CWV
  (e.g. due to real-world 3G/mid-tier-device traffic), and vice versa.
- Until CrUX has enough traffic to report (new domain, low traffic), use lab
  checks as a directional proxy, but do not publish or promise a Lighthouse
  number as a deliverable.

## Metrics and budgets

Google's current "good" thresholds (75th percentile, field data):

| Metric  | Good  | Needs improvement | Poor    |
| ------- | ----- | ------------------ | ------- |
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s–4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms–500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |

zolv-stack budget: target **"Good"** on all three for every indexable route
class below. A route that is not indexable (most tools today — see
`lib/seo/routes.ts`) still benefits from these budgets for UX, but is not a
crawl/ranking-signal priority until it passes the index quality gate and
becomes indexable.

## Route profiles

Different route types have different content/JS shapes, so budget risk
differs:

### Home (`/`)

- Mostly static marketing content. Budget risk is almost entirely
  **LCP** (hero image/text) and unnecessary client JS blocking hydration.
- Keep the hero's LCP element server-rendered, not client-fetched.
- Avoid loading tool-specific (e.g. image/PDF processing) JS on this route.

### Fileora hub (`/fileora`)

- Lists every tool as a grid/list of links — link-heavy, moderate DOM size.
- **LCP** risk: hero/heading render should stay server-rendered (this route
  already migrated to centralized SEO metadata + JSON-LD in Task 6/7).
  **CLS** risk: reserve space for icons/thumbnails in the tool grid so
  cards don't shift as icons load.
- **INP** risk is typically low here (little interactivity beyond
  navigation), but any client-side search/filter UI must debounce input
  handling to avoid long tasks.

### Image tools (e.g. `image-to-webp`, background remover, enhancer)

- Client-heavy: image decode/encode, canvas, and (for some tools) ML-model
  inference happen in the browser.
- **INP** is the primary risk: heavy image-processing work must run off the
  main thread (Web Worker/WASM where already implemented) so a click/drop
  interaction doesn't block for hundreds of ms.
- **LCP**: the tool's dropzone/hero text should render before any
  heavy processing library is fetched — do not block first paint on an ML
  model or WASM binary download. Code-split conversion libraries so the
  initial route JS stays small.
- **CLS**: preview thumbnails must have reserved dimensions (explicit
  width/height or aspect-ratio CSS) before the actual image loads.

### PDF tools (merge, split, compress)

- Client-heavy via `pdf-lib`; multi-file drag-and-drop UI.
- **INP**: PDF parsing/writing for larger files must not run as one long
  synchronous main-thread task; chunk or offload where the existing
  implementation allows.
- **LCP**: same dropzone-first-paint principle as image tools — don't block
  the initial render on `pdf-lib` being fully loaded/parsed.
- **CLS**: file-list rows must not reflow the page as file metadata
  (page count, size) resolves asynchronously — reserve row height.

### Document tools

- Similar profile to PDF tools: client-side parsing/conversion libraries,
  file-list UI. Apply the same INP (offload heavy parsing) and CLS
  (reserved layout for async metadata) guidance.

## Hydration / JS / image considerations

- **Hydration**: SEO-critical HTML (title text, headings, JSON-LD) must be
  server-rendered so it is present before hydration, not injected
  client-side after mount — this is already the architecture for
  `buildMetadataForRoute` / `buildJsonLdForRoute` (Task 4/5). Do not
  reintroduce client-only title/description/schema injection.
- **JS budget**: keep route-level JS proportional to what that route
  actually needs. A conversion tool's processing library (image codec,
  PDF engine, ML model) should not be part of the Home or Fileora hub
  bundle.
- **Images**: use `next/image` (already used across the app) for anything
  that is not a user-uploaded/generated preview; it handles responsive
  sizing and lazy-loading, both of which affect LCP/CLS. OG images
  (`lib/seo/og/*`) are static assets served directly — they are not subject
  to this guidance since they're never rendered as visible `<img>` tags in
  the page itself.
- **Resource hints**: only add `preload`/`preconnect` for a resource that
  is verifiably on the LCP critical path (e.g. a hero image or font) for a
  specific route. Blanket or speculative resource hints add overhead
  without a measured benefit — don't add one without a specific target.

## Lab checks (pre-launch / regression sanity)

Run locally before a release that touches a route's rendering path:

```bash
NEXT_PUBLIC_APP_URL=https://example.com npm run build
npm run start
# Then run Lighthouse (Chrome DevTools) or `npx lighthouse <url>` against
# the affected route(s) in an incognito profile with no extensions.
```

Treat a large lab regression (e.g. LCP jumping by seconds, or a new
render-blocking script) as a signal to investigate before shipping — not as
the budget itself. Once real traffic exists, prefer the CrUX/GSC numbers
over any local lab run.

## Accessibility must not be sacrificed for performance

- Do not remove alt text, ARIA labelling, semantic headings, or focus
  management to save bytes or reduce render work. Accessibility and
  performance budgets here are complementary, not competing — e.g. a
  properly `alt`-labelled, correctly-sized `next/image` helps both.
- Any performance change (lazy-loading, code-splitting, deferred hydration)
  must preserve existing keyboard navigation and screen-reader behavior for
  the affected component.

## Related

- `docs/seo/search-console.md` — verification and indexing runbook
- `docs/seo/rollback.md` — safe rollback guidance
- SEO Architecture v1.0 design spec, "Performance & CWV" section
