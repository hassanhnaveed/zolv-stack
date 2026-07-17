/**
 * Public barrel for `lib/seo/*`. Server-only — never import this module
 * (or any `lib/seo/*` module) from a client component.
 *
 * Partial export surface: Task 1 only ships types, config, brands, and URL
 * helpers. Later tasks (routes, redirects, metadata, open-graph, schema,
 * sitemap, robots, validate, audit) extend this barrel as they land.
 */

export * from "./types";
export * from "./config";
export * from "./brands";
export * from "./url";
