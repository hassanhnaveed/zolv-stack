/**
 * Top-level JSON-LD graph builder (SEO Architecture v1.0, Task 5).
 *
 * `buildJsonLdForRoute` is the only entry point route `page.tsx` files
 * (Tasks 6/7) need: it looks up the route, composes its nodes via the
 * `pageType` registry, prunes every empty property, and wraps the result
 * in the single `{ "@context", "@graph" }` shape `<JsonLd data={...} />`
 * renders.
 */

import { getRoute, type RouteId } from "../routes";

import { prune } from "./prune";
import { composeGraphNodes } from "./registry";
import type { JsonLdGraph, JsonLdNode } from "./types";

/**
 * Builds the complete JSON-LD graph for the registered route `routeId` —
 * exactly one `{ "@context": "https://schema.org", "@graph": [...] }`
 * object, with every empty property recursively pruned (spec: "exactly
 * one @graph object per route/page").
 *
 * @param routeId - Registered route id (any `RouteId`: a non-tool id or
 * a `ToolSlug`)
 * @throws {Error} When `routeId` has no registered route (via
 * `getRoute`), its `pageType` has no registered schema composer (via
 * `composeGraphNodes`), or the site origin cannot be resolved (via
 * `absoluteUrl` / `getSiteOrigin`, used by every entity id)
 */
export function buildJsonLdForRoute(routeId: RouteId): JsonLdGraph {
  const route = getRoute(routeId);
  const nodes = composeGraphNodes(route);
  const prunedNodes = prune(nodes) as JsonLdNode[];

  return {
    "@context": "https://schema.org",
    "@graph": prunedNodes,
  };
}
