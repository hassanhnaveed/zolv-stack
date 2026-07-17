/**
 * Product-level (Fileora hub) default Open Graph / Twitter card image
 * (SEO Architecture v1.0, Task 4).
 */

import { getProductBrand } from "../brands";
import { absoluteUrl } from "../url";
import type { ProductId, SocialImage } from "../types";

import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  withOgAssetVersion,
} from "./types";

/** Site-relative path to each product's default social card, keyed by
 * {@link ProductId}. Extend this map when a new product ships. */
const PRODUCT_DEFAULT_OG_PATHS: Readonly<Record<ProductId, string>> =
  Object.freeze({
    fileora: "/og/fileora-default.png",
  });

/**
 * Builds the normalized {@link SocialImage} for `product`'s default
 * social card. Used for the product hub page, and reused by tool pages
 * (Task 4 emits one primary image; per-tool cards are a future
 * extension — see `og/tool.ts`).
 */
export function buildProductDefaultOgImage(product: ProductId): SocialImage {
  const brand = getProductBrand(product);
  return {
    url: withOgAssetVersion(absoluteUrl(PRODUCT_DEFAULT_OG_PATHS[product])),
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    type: "image/png",
    alt: `${brand.name} — ${brand.tagline}`,
  };
}
