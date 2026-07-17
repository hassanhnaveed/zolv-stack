/**
 * Brand tokens and title template helpers.
 *
 * ZolvStack is the primary/root brand; Fileora is a product nested under
 * it. See spec "Brand & Title Patterns" for the exact title shapes.
 */

import type { BrandId, LocaleTag, ProductId } from "./types";

export interface Brand {
  id: BrandId;
  name: string;
  tagline: string;
  /** `og:locale` / schema `inLanguage` tag. */
  localeTag: LocaleTag;
}

export const ZOLVSTACK_BRAND: Brand = {
  id: "zolvstack",
  name: "ZolvStack",
  tagline: "Fast, Private Tools for Everyday Work",
  localeTag: "en_US",
};

export const FILEORA_BRAND: Brand = {
  id: "fileora",
  name: "Fileora",
  tagline: "Free File Converter",
  localeTag: "en_US",
};

export const BRANDS: Record<BrandId, Brand> = {
  zolvstack: ZOLVSTACK_BRAND,
  fileora: FILEORA_BRAND,
};

/** Brand tokens keyed by product id (product brands are a subset of
 * `BRANDS`; kept separate so callers with a `ProductId` don't need to
 * narrow `BrandId` themselves). */
export const PRODUCT_BRANDS: Record<ProductId, Brand> = {
  fileora: FILEORA_BRAND,
};

export function getBrand(id: BrandId): Brand {
  return BRANDS[id];
}

export function getProductBrand(product: ProductId): Brand {
  return PRODUCT_BRANDS[product];
}

/** `ZolvStack — {tagline}` — root brand-home title. */
export function brandHomeTitle(
  tagline: string = ZOLVSTACK_BRAND.tagline,
): string {
  return `${ZOLVSTACK_BRAND.name} — ${tagline}`;
}

/** `{Page} | ZolvStack` — brand-static and legal pages. */
export function brandStaticTitle(pageTitle: string): string {
  return `${pageTitle} | ${ZOLVSTACK_BRAND.name}`;
}

/** `Fileora — Free File Converter | ZolvStack` — product hub title. */
export function productHubTitle(
  product: ProductId = "fileora",
  tagline: string = getProductBrand(product).tagline,
): string {
  const brand = getProductBrand(product);
  return `${brand.name} — ${tagline} | ${ZOLVSTACK_BRAND.name}`;
}

/** `{Intent title} | Fileora by ZolvStack` — product tool pages. */
export function productToolTitle(
  intentTitle: string,
  product: ProductId = "fileora",
): string {
  const brand = getProductBrand(product);
  return `${intentTitle} | ${brand.name} by ${ZOLVSTACK_BRAND.name}`;
}
