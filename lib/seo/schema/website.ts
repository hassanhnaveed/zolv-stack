/**
 * `WebSite` builder (SEO Architecture v1.0, Task 5).
 *
 * Fully defined once (brand-home and Fileora-hub graphs, per the design
 * spec's page-type table); referenced by `@id` from every other page's
 * `WebPage.isPartOf`. No `potentialAction` (`SearchAction`) is emitted —
 * there is no real site search to describe (spec: "do not invent
 * social/search actions").
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

/** `{ "@id" }` reference to the shared `WebSite` node, for pages that
 * don't redefine the full node (e.g. static/legal, product-tool pages). */
export function buildWebsiteRef(): JsonLdRef {
  return ref(websiteId());
}
