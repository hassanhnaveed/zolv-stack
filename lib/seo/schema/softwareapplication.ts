/**
 * Per-tool `SoftwareApplication` builder (SEO Architecture v1.0,
 * Task 5).
 *
 * One stable `SoftwareApplication` per tool route, `isPartOf` the
 * Fileora `WebApplication` (same-page `@id` pointer; the full product
 * node is emitted via `buildSharedProductEntityNodes`) and reciprocally
 * linked to its `WebPage` via `mainEntityOfPage` (spec:
 * "SoftwareApplication `mainEntityOfPage` points back to WebPage").
 */

import {
  resolveFinalTitleOrBrandFallback,
  resolveRouteDescription,
} from "../content-resolver";
import type { SeoRoute } from "../types";
import { absoluteUrl } from "../url";

import { ref, softwareApplicationId } from "./entities";
import { buildOrganizationRef } from "./organization";
import {
  buildFileoraWebApplicationRef,
  buildFreeOffer,
  FILE_TOOL_APPLICATION_CATEGORY,
} from "./webapplication";
import type { JsonLdNode, JsonLdRef } from "./types";

export interface BuildToolSoftwareApplicationOptions {
  /** Reference back to this tool's `WebPage` (the reciprocal half of
   * `WebPage.mainEntity` -> this node). */
  mainEntityOfPage: JsonLdRef;
}

/**
 * Builds the `SoftwareApplication` node for a `product-tool` route. Name
 * and description resolve through the same Task 4 content-resolver
 * helpers metadata uses (`resolveFinalTitleOrBrandFallback` /
 * `resolveRouteDescription`), so schema never invents a parallel title
 * pattern. Only currently-accurate fields are emitted — a genuinely free
 * `Offer`, `Web` operating system, and `provider`/`isPartOf`
 * relationships; never `aggregateRating`, reviews, or invented features.
 */
export function buildToolSoftwareApplicationNode(
  route: SeoRoute,
  options: BuildToolSoftwareApplicationOptions,
): JsonLdNode {
  return {
    "@type": "SoftwareApplication",
    "@id": softwareApplicationId(route.path),
    name: resolveFinalTitleOrBrandFallback(route),
    url: absoluteUrl(route.path),
    description: resolveRouteDescription(route),
    applicationCategory: FILE_TOOL_APPLICATION_CATEGORY,
    operatingSystem: "Web",
    offers: buildFreeOffer(),
    provider: buildOrganizationRef(),
    isPartOf: buildFileoraWebApplicationRef(),
    mainEntityOfPage: options.mainEntityOfPage,
    inLanguage: "en",
  };
}

/** `{ "@id" }` reference to the tool `SoftwareApplication` node at
 * `path`. */
export function buildToolSoftwareApplicationRef(path: string): JsonLdRef {
  return ref(softwareApplicationId(path));
}
