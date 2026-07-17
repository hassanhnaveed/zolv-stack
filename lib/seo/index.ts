/**
 * Public barrel for `lib/seo/*`. Server-only — never import this module
 * (or any `lib/seo/*` module) from a client component.
 *
 * Explicit named exports only. Do **not** reintroduce `export *` as the
 * framework grows — keep this list as the curated public API surface so
 * internal helpers stay unexported.
 *
 * Task 1 surface: types, config, brands, and URL helpers. Later tasks
 * extend this list deliberately when new public APIs land.
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
