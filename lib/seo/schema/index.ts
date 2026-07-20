/**
 * Public barrel for `lib/seo/schema/*` (SEO Architecture v1.0, Task 5).
 *
 * Curated on purpose: `buildJsonLdForRoute` is the only builder entry
 * point most callers (route `page.tsx` files, `components/seo/JsonLd`)
 * need. Individual node builders (`organization.ts`, `website.ts`,
 * `webpage.ts`, etc.), the `pageType` registry, and `prune` stay internal
 * — import them directly from their own module only when truly needed
 * (e.g. focused unit tests), the same convention `lib/seo/index.ts`
 * documents for its own internal validators.
 */

export type { JsonLdGraph, JsonLdNode } from "./types";
export { buildJsonLdForRoute } from "./graph";
