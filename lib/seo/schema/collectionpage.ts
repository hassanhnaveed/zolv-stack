/**
 * `CollectionPage` builder (SEO Architecture v1.0, Task 5).
 *
 * The Fileora hub uses `CollectionPage` — a `WebPage` subtype (spec:
 * "Fileora hub uses CollectionPage, a WebPage subtype") — so it reuses
 * the exact same shared page fields and `@id` scheme as `webpage.ts`'s
 * plain `WebPage` builder instead of a parallel implementation.
 */

import type { SeoRoute } from "../types";

import { webPageId } from "./entities";
import { buildPageFields, type BuildWebPageNodeOptions } from "./webpage";
import type { JsonLdNode } from "./types";

/**
 * Builds the `CollectionPage` node for the Fileora hub route. Its
 * `mainEntity` is the Fileora `WebApplication` (fully defined once on
 * this same page, see `webapplication.ts`).
 */
export function buildCollectionPageNode(
  route: SeoRoute,
  options: BuildWebPageNodeOptions = {},
): JsonLdNode {
  return {
    "@type": "CollectionPage",
    "@id": webPageId(route.path),
    ...buildPageFields(route),
    mainEntity: options.mainEntity,
    breadcrumb: options.breadcrumb,
  };
}
