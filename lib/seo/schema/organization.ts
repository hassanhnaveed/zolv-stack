/**
 * `Organization` + canonical logo `ImageObject` builders (SEO
 * Architecture v1.0, Task 5).
 *
 * The logo `ImageObject` is defined in full exactly once (the brand-home
 * graph); every other page's `Organization` node references it by
 * `@id` only (spec: "shared logo entity referenced consistently — no
 * duplicated inline logo definitions").
 */

import { ZOLVSTACK_BRAND } from "../brands";
import { PATHS } from "../routes";
import { absoluteUrl } from "../url";

import { logoImageId, organizationId, ref } from "./entities";
import type { JsonLdNode, JsonLdRef } from "./types";

/** Site-relative path to the canonical square logo asset used for the
 * `Organization.logo` `ImageObject`. Reuses the existing PWA icon —
 * no new asset invented for this task. */
const LOGO_PATH = "/icons/icon-512.png";
const LOGO_WIDTH = 512;
const LOGO_HEIGHT = 512;

/**
 * Builds the single, site-wide `Organization` node (ZolvStack). Its
 * `logo` is always an `{ "@id" }` reference to the canonical logo
 * `ImageObject` (see {@link buildLogoImageNode}), never a re-embedded
 * copy.
 */
export function buildOrganizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": organizationId(),
    name: ZOLVSTACK_BRAND.name,
    url: absoluteUrl(PATHS.HOME),
    logo: ref(logoImageId()),
  };
}

/** `{ "@id" }` reference to the shared `Organization` node, for pages
 * that don't redefine the full node (e.g. product-tool pages). */
export function buildOrganizationRef(): JsonLdRef {
  return ref(organizationId());
}

/**
 * Builds the one canonical logo `ImageObject` node. Only ever included
 * in the brand-home graph — every other page references it by `@id`
 * via {@link buildOrganizationNode}'s `logo` field.
 */
export function buildLogoImageNode(): JsonLdNode {
  return {
    "@type": "ImageObject",
    "@id": logoImageId(),
    url: absoluteUrl(LOGO_PATH),
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    caption: `${ZOLVSTACK_BRAND.name} logo`,
  };
}

/** `{ "@id" }` reference to the canonical logo `ImageObject`. */
export function buildLogoRef(): JsonLdRef {
  return ref(logoImageId());
}
