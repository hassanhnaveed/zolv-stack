/**
 * Shared types/constants for the `lib/seo/og/*` static social-card
 * resolvers (SEO Architecture v1.0, Task 4).
 */

export type { SocialImage } from "../types";

/**
 * Cache-busting version token appended to every static OG asset URL as a
 * `?v=` query param (spec: "Static assets under `public/og/` with
 * versioning strategy"). Bump this when a static asset's *content*
 * changes at the same filename, so CDNs/social crawlers that cached the
 * old bytes re-fetch instead of showing a stale card.
 */
export const OG_ASSET_VERSION = "seo1";

/**
 * Appends the {@link OG_ASSET_VERSION} cache-busting query param to an
 * absolute static asset URL.
 *
 * @param absoluteImageUrl - Absolute URL already resolved via
 * `absoluteUrl()` (never a site-relative path)
 */
export function withOgAssetVersion(absoluteImageUrl: string): string {
  return `${absoluteImageUrl}?v=${OG_ASSET_VERSION}`;
}

/** Standard dimensions for every static OG/Twitter card asset this
 * module ships (spec: "1200x630 PNG/JPEG"). */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
