/**
 * `WebPage` builder + shared page fields (SEO Architecture v1.0, Task 5).
 *
 * {@link buildPageFields} is reused by `collectionpage.ts` so the Fileora
 * hub's `CollectionPage` (a `WebPage` subtype) shares the exact same
 * title/description/language/publisher/isPartOf resolution as every
 * plain `WebPage` — no separate, potentially-divergent implementation.
 */

import {
  resolveFinalTitleOrBrandFallback,
  resolveRouteDescription,
} from "../content-resolver";
import type { SeoRoute } from "../types";
import { absoluteUrl } from "../url";

import { webPageId, ref } from "./entities";
import { buildOrganizationRef } from "./organization";
import { buildWebsiteRef } from "./website";
import type { JsonLdNode, JsonLdRef } from "./types";

/** Fields shared by every `WebPage` and `CollectionPage` node. Title and
 * description resolve through the same Task 4 content-resolver used by
 * `buildMetadataForRoute`, so schema and `<title>`/`<meta description>`
 * can never diverge (spec: "final title/description resolution must
 * match Task 4 metadata content-resolver"). */
export function buildPageFields(route: SeoRoute): JsonLdNode {
  return {
    name: resolveFinalTitleOrBrandFallback(route),
    description: resolveRouteDescription(route),
    url: absoluteUrl(route.path),
    inLanguage: "en",
    isPartOf: buildWebsiteRef(),
    publisher: buildOrganizationRef(),
  };
}

export interface BuildWebPageNodeOptions {
  /** Reference to this page's primary entity (e.g. a tool's
   * `SoftwareApplication`, or the Fileora `WebApplication` for the
   * hub). Omit when the page has no single main entity. */
  mainEntity?: JsonLdRef;
  /** Reference to this page's `BreadcrumbList`. Omit for the brand-home
   * page, which has no breadcrumb. */
  breadcrumb?: JsonLdRef;
}

/**
 * Builds the `WebPage` node for `route`. Every valid registry route gets
 * exactly one `WebPage` (or `WebPage`-subtype) node per its graph (spec:
 * "every valid registry page includes a WebPage node").
 */
export function buildWebPageNode(
  route: SeoRoute,
  options: BuildWebPageNodeOptions = {},
): JsonLdNode {
  return {
    "@type": "WebPage",
    "@id": webPageId(route.path),
    ...buildPageFields(route),
    mainEntity: options.mainEntity,
    breadcrumb: options.breadcrumb,
  };
}

/** `{ "@id" }` reference to the `WebPage` node at `path`. */
export function buildWebPageRef(path: string): JsonLdRef {
  return ref(webPageId(path));
}
