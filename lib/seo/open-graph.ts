/**
 * Normalized social metadata for Open Graph + Twitter (SEO Architecture
 * v1.0, Task 4).
 *
 * `buildSocialMetadata` produces exactly **one** {@link SocialMetadata}
 * object per page. `toOpenGraph` / `toTwitter` are thin, lossless
 * projections of that single object — this is what guarantees "no silent
 * title/description/image divergence" between the two surfaces (spec:
 * "One normalized social object → both OG and Twitter"). Neither
 * projection re-resolves title/description/images itself.
 */

import type { Metadata } from "next";

import type { LocaleTag, SocialImage } from "./types";

/** Next.js does not export `OpenGraph` / `Twitter` from its package root
 * — derive them from the public `Metadata` interface instead of reaching
 * into `next/dist/lib/metadata/types/*` internals. */
type OpenGraphMetadata = NonNullable<Metadata["openGraph"]>;
type TwitterMetadata = NonNullable<Metadata["twitter"]>;

/** The single source of truth both Open Graph and Twitter render from. */
export interface SocialMetadata {
  title: string;
  description?: string;
  /** Always the page's canonical URL (spec: "OG URL equals canonical") */
  url: string;
  siteName: string;
  locale: LocaleTag;
  images: readonly SocialImage[];
}

export interface BuildSocialMetadataInput {
  title: string;
  description?: string;
  canonicalUrl: string;
  siteName: string;
  locale: LocaleTag;
  images: readonly SocialImage[];
}

/** Builds the single normalized {@link SocialMetadata} object for a page. */
export function buildSocialMetadata(
  input: BuildSocialMetadataInput,
): SocialMetadata {
  return Object.freeze({
    title: input.title,
    description: input.description,
    url: input.canonicalUrl,
    siteName: input.siteName,
    locale: input.locale,
    images: input.images,
  });
}

function toOgImage(image: SocialImage) {
  return {
    url: image.url,
    width: image.width,
    height: image.height,
    alt: image.alt,
    ...(image.type ? { type: image.type } : {}),
  };
}

/**
 * Projects {@link SocialMetadata} onto Next's Open Graph metadata shape.
 * `type: "website"` for every page today — no `article`/product-specific
 * OG type is in scope for Task 4.
 */
export function toOpenGraph(social: SocialMetadata): OpenGraphMetadata {
  return {
    type: "website",
    title: social.title,
    ...(social.description ? { description: social.description } : {}),
    url: social.url,
    siteName: social.siteName,
    locale: social.locale,
    images: social.images.map(toOgImage),
  };
}

/**
 * Projects {@link SocialMetadata} onto Next's Twitter metadata shape.
 * `summary_large_image` is the default card type (spec:
 * "`summary_large_image` default").
 */
export function toTwitter(social: SocialMetadata): TwitterMetadata {
  return {
    card: "summary_large_image",
    title: social.title,
    ...(social.description ? { description: social.description } : {}),
    images: social.images.map(toOgImage),
  };
}
