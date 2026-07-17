/**
 * Brand tokens and title template helpers.
 *
 * ZolvStack is the primary/root brand; Fileora is a product nested under
 * it. See spec "Brand & Title Patterns" for the exact title shapes.
 *
 * Brand objects are frozen to prevent accidental runtime mutation.
 */

import type { BrandId, LocaleTag, ProductId } from "./types";

export interface Brand {
  id: BrandId;
  name: string;
  tagline: string;
  /** `og:locale` / schema `inLanguage` tag. */
  localeTag: LocaleTag;
}

/** Primary brand token for ZolvStack (root site). Frozen. */
export const ZOLVSTACK_BRAND: Readonly<Brand> = Object.freeze({
  id: "zolvstack",
  name: "ZolvStack",
  tagline: "Fast, Private Tools for Everyday Work",
  localeTag: "en_US",
});

/** Product brand token for Fileora. Frozen. */
export const FILEORA_BRAND: Readonly<Brand> = Object.freeze({
  id: "fileora",
  name: "Fileora",
  tagline: "Free File Converter",
  localeTag: "en_US",
});

/** All registered brands keyed by {@link BrandId}. Frozen. */
export const BRANDS: Readonly<Record<BrandId, Readonly<Brand>>> = Object.freeze(
  {
    zolvstack: ZOLVSTACK_BRAND,
    fileora: FILEORA_BRAND,
  },
);

/** Product brands keyed by {@link ProductId}. Frozen. */
export const PRODUCT_BRANDS: Readonly<Record<ProductId, Readonly<Brand>>> =
  Object.freeze({
    fileora: FILEORA_BRAND,
  });

/**
 * Looks up a brand token by id.
 *
 * @param id - Registered brand id (`zolvstack` | `fileora`)
 * @returns Frozen brand definition
 */
export function getBrand(id: BrandId): Readonly<Brand> {
  return BRANDS[id];
}

/**
 * Looks up a product brand token by product id.
 *
 * @param product - Registered product id (currently `fileora`)
 * @returns Frozen product brand definition
 */
export function getProductBrand(product: ProductId): Readonly<Brand> {
  return PRODUCT_BRANDS[product];
}

/**
 * Builds the brand-home document title.
 *
 * Pattern: `ZolvStack — {tagline}`
 *
 * @param tagline - Optional override; defaults to the ZolvStack tagline
 */
export function brandHomeTitle(
  tagline: string = ZOLVSTACK_BRAND.tagline,
): string {
  return `${ZOLVSTACK_BRAND.name} — ${tagline}`;
}

/**
 * Builds titles for brand-static and legal pages.
 *
 * Pattern: `{Page} | ZolvStack`
 *
 * @param pageTitle - Human-readable page name (e.g. `"About Us"`)
 */
export function brandStaticTitle(pageTitle: string): string {
  return `${pageTitle} | ${ZOLVSTACK_BRAND.name}`;
}

/**
 * Builds the product hub document title.
 *
 * Pattern: `Fileora — Free File Converter | ZolvStack`
 *
 * @param product - Product id; defaults to `fileora`
 * @param tagline - Optional product tagline override
 */
export function productHubTitle(
  product: ProductId = "fileora",
  tagline: string = getProductBrand(product).tagline,
): string {
  const brand = getProductBrand(product);
  return `${brand.name} — ${tagline} | ${ZOLVSTACK_BRAND.name}`;
}

/**
 * Builds product tool document titles.
 *
 * Pattern: `{Intent title} | Fileora by ZolvStack`
 *
 * @param intentTitle - Tool intent title (e.g. `"Image to WebP Converter"`)
 * @param product - Product id; defaults to `fileora`
 */
export function productToolTitle(
  intentTitle: string,
  product: ProductId = "fileora",
): string {
  const brand = getProductBrand(product);
  return `${intentTitle} | ${brand.name} by ${ZOLVSTACK_BRAND.name}`;
}
