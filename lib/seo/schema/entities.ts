/**
 * Shared `@id` constants/builders for `lib/seo/schema/*` (SEO
 * Architecture v1.0, Task 5).
 *
 * Every stable entity id in the JSON-LD graph is derived here, and only
 * here, from the configured site origin (`absoluteUrl` /
 * `getSiteOrigin`) — no builder file may hand-roll or re-derive an id.
 * This is what lets the same `Organization`, `WebSite`, canonical logo
 * `ImageObject`, and Fileora `WebApplication` keep identical stable
 * `@id`s on every page. Full definitions are still emitted in each
 * page's `@graph` (via `shared-entities.ts`) because Google does not
 * merge JSON-LD across URLs by `@id` (spec: "globally consistent
 * entity IDs ... shared entity helpers/constants").
 *
 * ## Fragment convention
 *
 * Site-wide singleton entities (Organization, WebSite, the canonical
 * logo) anchor their fragment to the *home* page URL, matching the
 * design spec's examples exactly: `{origin}/#organization`,
 * `{origin}/#website`. The Fileora product `WebApplication` anchors to
 * the Fileora hub path: `{origin}/fileora#webapp`. Per-route entities
 * (WebPage, SoftwareApplication, BreadcrumbList, FAQPage) anchor to that
 * route's own canonical URL, so every route gets its own stable id
 * without any global registry of used fragments.
 */

import { PATHS } from "../routes";
import { absoluteUrl } from "../url";

import type { JsonLdRef } from "./types";

const ORGANIZATION_FRAGMENT = "organization";
const WEBSITE_FRAGMENT = "website";
const LOGO_FRAGMENT = "logo";
const FILEORA_WEBAPP_FRAGMENT = "webapp";
const WEBPAGE_FRAGMENT = "webpage";
const SOFTWARE_APPLICATION_FRAGMENT = "software";
const BREADCRUMB_FRAGMENT = "breadcrumb";
const FAQ_FRAGMENT = "faq";

function withFragment(absoluteBaseUrl: string, fragment: string): string {
  return `${absoluteBaseUrl}#${fragment}`;
}

/** Stable id for the single site-wide `Organization` node (ZolvStack). */
export function organizationId(): string {
  return withFragment(absoluteUrl(PATHS.HOME), ORGANIZATION_FRAGMENT);
}

/** Stable id for the single site-wide `WebSite` node (ZolvStack). */
export function websiteId(): string {
  return withFragment(absoluteUrl(PATHS.HOME), WEBSITE_FRAGMENT);
}

/** Stable id for the one canonical logo `ImageObject`, referenced by the
 * `Organization` node everywhere rather than redefined per page. */
export function logoImageId(): string {
  return withFragment(absoluteUrl(PATHS.HOME), LOGO_FRAGMENT);
}

/** Stable id for the Fileora product `WebApplication` node, fully
 * defined once on the Fileora hub page and referenced from every tool
 * page's `SoftwareApplication.isPartOf`. */
export function fileoraWebApplicationId(): string {
  return withFragment(absoluteUrl(PATHS.FILEORA), FILEORA_WEBAPP_FRAGMENT);
}

/** Stable `WebPage` (or `CollectionPage`, a `WebPage` subtype) id for
 * `path`, derived from that route's own canonical URL. */
export function webPageId(path: string): string {
  return withFragment(absoluteUrl(path), WEBPAGE_FRAGMENT);
}

/** Stable `SoftwareApplication` id for the tool route at `path`. */
export function softwareApplicationId(path: string): string {
  return withFragment(absoluteUrl(path), SOFTWARE_APPLICATION_FRAGMENT);
}

/** Stable `BreadcrumbList` id for the route at `path`. */
export function breadcrumbListId(path: string): string {
  return withFragment(absoluteUrl(path), BREADCRUMB_FRAGMENT);
}

/** Stable `FAQPage` id for the route at `path`, only used when the route
 * has real FAQ content (see `faq.ts`). */
export function faqPageId(path: string): string {
  return withFragment(absoluteUrl(path), FAQ_FRAGMENT);
}

/** Builds an `{ "@id": id }` reference. The single helper every builder
 * uses to point at another node instead of rebuilding/duplicating it. */
export function ref(id: string): JsonLdRef {
  return { "@id": id };
}
