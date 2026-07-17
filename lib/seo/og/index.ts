/**
 * Open Graph / Twitter static social-card resolvers (SEO Architecture
 * v1.0, Task 4).
 *
 * {@link resolveOgImages} is the single entry point `metadata.ts` (and
 * any future JSON-LD `image` field) should call — it owns the
 * inheritance order (route override -> product default -> root default)
 * so no other module re-implements it.
 */

import type { SeoRoute, SocialImage } from "../types";

import { buildZolvstackDefaultOgImage } from "./default";
import { buildProductDefaultOgImage } from "./product";
import { buildToolOgImage } from "./tool";

export type { SocialImage } from "../types";
export { OG_ASSET_VERSION, withOgAssetVersion } from "./types";
export { buildZolvstackDefaultOgImage, ZOLVSTACK_DEFAULT_OG_PATH } from "./default";
export { buildProductDefaultOgImage } from "./product";
export { buildToolOgImage } from "./tool";

/**
 * Resolves the ordered list of social share images for `route`.
 *
 * Inheritance order (spec: "root defaults -> product defaults -> route
 * overrides", applied here in override-first precedence):
 * 1. `route.ogImage` — an explicit per-route override, when set.
 * 2. `product-tool` routes fall back to the product's default card
 *    ({@link buildToolOgImage}).
 * 3. Any other route with a `product` (e.g. the Fileora hub) falls back
 *    to that product's default card.
 * 4. Root (no `product`) routes fall back to the ZolvStack default card.
 *
 * Always returns exactly one image today — the array shape is
 * deliberate so a future multi-image gallery or dynamic `ImageResponse`
 * resolver can add more without changing this function's signature
 * (spec: "multi-image resolver API returns readonly image array; emit
 * primary now"). The returned array is frozen so callers cannot mutate a
 * shared resolver result.
 */
export function resolveOgImages(route: SeoRoute): readonly SocialImage[] {
  if (route.ogImage) {
    return Object.freeze([route.ogImage]);
  }

  if (route.pageType === "product-tool") {
    return Object.freeze([buildToolOgImage(route)]);
  }

  if (route.product) {
    return Object.freeze([buildProductDefaultOgImage(route.product)]);
  }

  return Object.freeze([buildZolvstackDefaultOgImage()]);
}
