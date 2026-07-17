/**
 * Product-tool Open Graph / Twitter card image resolver (SEO
 * Architecture v1.0, Task 4).
 */

import type { SeoRoute, SocialImage } from "../types";

import { buildProductDefaultOgImage } from "./product";

/**
 * Builds the normalized {@link SocialImage} for a `product-tool` route.
 *
 * No per-tool social cards exist yet, so every tool page reuses its
 * product's default card today rather than shipping with no image at
 * all — the spec only requires emitting a primary image now ("multi-image
 * resolver API returns readonly image array; emit primary now"). A future
 * per-tool (or dynamic `ImageResponse`) card slots in here without
 * changing `resolveOgImages`'s public shape.
 */
export function buildToolOgImage(route: SeoRoute): SocialImage {
  return buildProductDefaultOgImage(route.product ?? "fileora");
}
