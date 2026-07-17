/**
 * `WebSite` builder (SEO Architecture v1.0, Task 5).
 *
 * Fully defined on every page that needs site context (via
 * `buildSharedSiteEntityNodes`); referenced by `@id` from
 * `WebPage.isPartOf` within the same graph. No `potentialAction`
 * (`SearchAction`) is emitted — there is no real site search to describe
 * (spec: "do not invent social/search actions").
 */

import { ZOLVSTACK_BRAND } from "../brands";
import { PATHS } from "../routes";
import { absoluteUrl } from "../url";

import { buildOrganizationRef } from "./organization";
import { websiteId, ref } from "./entities";
import type { JsonLdNode, JsonLdRef } from "./types";

/** Builds the single, site-wide `WebSite` node (ZolvStack). */
export function buildWebsiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    name: ZOLVSTACK_BRAND.name,
    url: absoluteUrl(PATHS.HOME),
    publisher: buildOrganizationRef(),
    inLanguage: "en",
  };
}

/** In-graph `{ "@id" }` pointer to the shared `WebSite` node.
 * Callers must also emit the full node via `buildShared*EntityNodes`. */
export function buildWebsiteRef(): JsonLdRef {
  return ref(websiteId());
}
