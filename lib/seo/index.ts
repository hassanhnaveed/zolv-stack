/**
 * Public barrel for `lib/seo/*`. Server-only — never import this module
 * (or any `lib/seo/*` module) from a client component.
 *
 * Explicit named exports only. Do **not** reintroduce `export *` as the
 * framework grows — keep this list as the curated public API surface so
 * internal helpers stay unexported.
 *
 * Task 1 surface: types, config, brands, and URL helpers. Task 2 adds the
 * route registry, redirect manifest, and indexability helpers. Later
 * tasks extend this list deliberately when new public APIs land.
 */

// Types
export type {
  BrandId,
  ChangeFrequency,
  FaqEntry,
  IndexFlags,
  Locale,
  LocaleTag,
  PageType,
  ProductId,
  SeoRoute,
  SiteOrigin,
  SocialImage,
} from "./types";

// Config
export type { SeoConfig } from "./config";
export { getSeoConfig, isProductionSeoEnvironment } from "./config";

// Brands
export type { Brand } from "./brands";
export {
  BRANDS,
  FILEORA_BRAND,
  PRODUCT_BRANDS,
  ZOLVSTACK_BRAND,
  brandHomeTitle,
  brandStaticTitle,
  getBrand,
  getProductBrand,
  productHubTitle,
  productToolTitle,
} from "./brands";

// URL helpers
export { absoluteUrl, getSiteOrigin } from "./url";

// Route registry
export type { RouteId } from "./routes";
export {
  PATHS,
  RESERVED_PATHS,
  ROUTE_IDS,
  ROUTES,
  getRoute,
  isReservedPath,
  listRoutes,
} from "./routes";

// Redirect manifest
export type { RedirectRule } from "./redirects";
export { getNextRedirects, getRedirects } from "./redirects";

// Indexability helpers
export {
  getRobotsDirective,
  isRouteIndexable,
  isRouteInSitemap,
  isSeoIndexingEnabled,
  listIndexableRoutes,
  listSitemapRoutes,
  resolveIndexFlags,
} from "./indexability";
