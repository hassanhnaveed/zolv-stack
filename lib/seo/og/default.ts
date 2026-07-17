/**
 * ZolvStack (root brand) default Open Graph / Twitter card image (SEO
 * Architecture v1.0, Task 4).
 */

import { absoluteUrl } from "../url";
import type { SocialImage } from "../types";

import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  withOgAssetVersion,
} from "./types";

/** Site-relative path to the ZolvStack default social card. See
 * `public/og/zolvstack-default.jpg` (JPEG keeps this dark, photographic
 * gradient card well under 100KB at full 1200x630 quality — the
 * lossless PNG export of the same asset was ~7x larger for no visible
 * quality difference in the wordmark/tagline text). */
export const ZOLVSTACK_DEFAULT_OG_PATH = "/og/zolvstack-default.jpg";

/**
 * Builds the normalized {@link SocialImage} for the ZolvStack root brand
 * default social card. Used whenever a root (non-product) route has no
 * more specific `ogImage` override.
 */
export function buildZolvstackDefaultOgImage(): SocialImage {
  return {
    url: withOgAssetVersion(absoluteUrl(ZOLVSTACK_DEFAULT_OG_PATH)),
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    type: "image/jpeg",
    alt: "ZolvStack — fast, private tools for everyday work",
  };
}
