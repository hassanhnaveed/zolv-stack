/**
 * Shared site-wide entity node lists for self-contained JSON-LD graphs
 * (SEO Architecture v1.0, Task 5 follow-up).
 *
 * Google parses each page's JSON-LD independently and does **not** merge
 * graphs across URLs by `@id`. Every page that references Organization,
 * the canonical logo, WebSite, or the Fileora WebApplication must
 * therefore include their **full** definitions in that page's `@graph`,
 * while still using the same stable shared `@id`s from `entities.ts`.
 *
 * Composers call these helpers instead of copy-pasting the same three
 * (or four) builder calls.
 */

import { buildLogoImageNode, buildOrganizationNode } from "./organization";
import type { JsonLdNode } from "./types";
import { buildFileoraWebApplicationNode } from "./webapplication";
import { buildWebsiteNode } from "./website";

/**
 * Full Organization + canonical logo ImageObject + WebSite nodes —
 * always the same shared `@id`s. Used by every page type that needs a
 * self-contained brand/site context (home, static/legal, hub, tools).
 */
export function buildSharedSiteEntityNodes(): JsonLdNode[] {
  return [
    buildOrganizationNode(),
    buildLogoImageNode(),
    buildWebsiteNode(),
  ];
}

/**
 * Shared site entities plus the Fileora product `WebApplication` —
 * used by product-hub and product-tool pages so tool graphs resolve
 * `SoftwareApplication.isPartOf` / CollectionPage `mainEntity` without
 * dangling cross-page `@id` references.
 */
export function buildSharedProductEntityNodes(): JsonLdNode[] {
  return [...buildSharedSiteEntityNodes(), buildFileoraWebApplicationNode()];
}
