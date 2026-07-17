/**
 * Fileora product `WebApplication` builder (SEO Architecture v1.0,
 * Task 5).
 *
 * Fully defined once, on the Fileora hub (`CollectionPage`) graph;
 * referenced by `@id` from every tool page's
 * `SoftwareApplication.isPartOf`. Only accurate, currently-true fields
 * are emitted: a genuinely free `Offer`, `Web` operating system, and a
 * `provider` relationship back to the ZolvStack `Organization` — no
 * `aggregateRating`, reviews, or invented features.
 */

import { FILEORA_BRAND } from "../brands";
import { resolveRouteDescription } from "../content-resolver";
import { PATHS, ROUTE_IDS, getRoute } from "../routes";
import { absoluteUrl } from "../url";

import { buildOrganizationRef } from "./organization";
import { fileoraWebApplicationId, ref } from "./entities";
import type { JsonLdNode, JsonLdRef } from "./types";

/** Shared, accurate application category for both the Fileora product
 * `WebApplication` and every tool `SoftwareApplication` — a general,
 * legitimate schema.org category for browser-based utility tools, not
 * an invented specialization. */
export const FILE_TOOL_APPLICATION_CATEGORY = "UtilitiesApplication";

/** Builds the currently-free `Offer` shared by the Fileora `WebApplication`
 * and every tool `SoftwareApplication` (spec: "free Offer if currently
 * genuinely free"). */
export function buildFreeOffer(): JsonLdNode {
  return { "@type": "Offer", price: "0", priceCurrency: "USD" };
}

/**
 * Builds the single Fileora product `WebApplication` node. Its
 * description is resolved through the same Task 4 content-resolver as
 * the hub's metadata description, so schema and `<meta description>`
 * never diverge.
 */
export function buildFileoraWebApplicationNode(): JsonLdNode {
  const hubRoute = getRoute(ROUTE_IDS.FILEORA_HUB);

  return {
    "@type": "WebApplication",
    "@id": fileoraWebApplicationId(),
    name: FILEORA_BRAND.name,
    url: absoluteUrl(PATHS.FILEORA),
    description: resolveRouteDescription(hubRoute),
    applicationCategory: FILE_TOOL_APPLICATION_CATEGORY,
    operatingSystem: "Web",
    offers: buildFreeOffer(),
    provider: buildOrganizationRef(),
    inLanguage: "en",
  };
}

/** `{ "@id" }` reference to the Fileora `WebApplication` node, for tool
 * pages that don't redefine the full node. */
export function buildFileoraWebApplicationRef(): JsonLdRef {
  return ref(fileoraWebApplicationId());
}
