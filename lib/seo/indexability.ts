/**
 * Thin indexability helpers over `routes.ts` policies (SEO Architecture
 * v1.0).
 *
 * These helpers compute the *effective* index/sitemap eligibility for a
 * route by combining the route's own declared intent (`route.index`,
 * `route.sitemap`) with the process-wide fail-closed gate: indexing is
 * only ever effective in a recognized production environment (per
 * `isProductionSeoEnvironment`) **and** when `SEO_INDEXING_ENABLED` is
 * explicitly `true`. Every other combination — a route marked `index:
 * true` while running in development, a production deploy missing a
 * valid `NEXT_PUBLIC_APP_URL`, or `SEO_INDEXING_ENABLED` left unset —
 * resolves to non-indexable (spec: "Fail-closed").
 *
 * `follow` is intentionally independent and is never gated by the
 * production/indexing check: crawlers may still follow links from a
 * noindex page.
 */

import { getSeoConfig, isProductionSeoEnvironment } from "./config";
import { ROUTES } from "./routes";
import type { IndexFlags, SeoRoute } from "./types";

/**
 * Site-wide fail-closed indexing gate.
 *
 * @returns `true` only when running in a recognized production SEO
 * environment (valid origin) **and** `SEO_INDEXING_ENABLED` is explicitly
 * `true`; `false` in every other case, even if `SEO_INDEXING_ENABLED` is
 * accidentally `true` outside production.
 */
export function isSeoIndexingEnabled(): boolean {
  return isProductionSeoEnvironment() && getSeoConfig().indexingEnabled;
}

/**
 * Resolves the effective `index`/`sitemap`/`follow` flags for a route.
 *
 * - `index`: the route's declared intent, gated by
 *   {@link isSeoIndexingEnabled}.
 * - `sitemap`: only ever `true` when both the effective `index` and the
 *   route's declared `sitemap` intent are `true` (spec: "Sitemap includes
 *   only routes with `index: true` and `sitemap: true`").
 * - `follow`: always the route's own declared value — independent of the
 *   production/indexing gate.
 *
 * @param route - Route to resolve effective flags for
 */
export function resolveIndexFlags(route: SeoRoute): IndexFlags {
  const effectiveIndex = route.index && isSeoIndexingEnabled();
  return {
    index: effectiveIndex,
    sitemap: effectiveIndex && route.sitemap,
    follow: route.follow,
  };
}

/** Whether `route` is effectively indexable right now. */
export function isRouteIndexable(route: SeoRoute): boolean {
  return resolveIndexFlags(route).index;
}

/** Whether `route` should appear in `sitemap.xml` right now. */
export function isRouteInSitemap(route: SeoRoute): boolean {
  return resolveIndexFlags(route).sitemap;
}

/** Robots directive pair (`index`/`follow`) for `route`, for a future
 * `metadata.robots` builder. */
export function getRobotsDirective(
  route: SeoRoute,
): Pick<IndexFlags, "index" | "follow"> {
  const { index, follow } = resolveIndexFlags(route);
  return { index, follow };
}

/** Every registered route that is effectively indexable right now. */
export function listIndexableRoutes(): SeoRoute[] {
  return ROUTES.filter((route) => isRouteIndexable(route));
}

/** Every registered route that should appear in `sitemap.xml` right now. */
export function listSitemapRoutes(): SeoRoute[] {
  return ROUTES.filter((route) => isRouteInSitemap(route));
}
