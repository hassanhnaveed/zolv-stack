/**
 * Metadata builder for the `lib/seo/*` module (SEO Architecture v1.0, Task 4).
 *
 * `buildRootMetadata()` / `buildMetadataForRoute(routeId)` are the only two
 * public entry points. Both are plain, synchronous, server-only functions
 * returning a complete Next.js `Metadata` object.
 *
 * ## Title / metadataBase contract (layout-safe)
 *
 * - {@link buildRootMetadata} is intended for `app/layout.tsx`. It sets
 *   `metadataBase` from `getSiteOrigin()` so relative asset URLs resolve,
 *   and `title: { default, template: "%s | ZolvStack" }` so child segments
 *   that export a short title inherit the brand suffix.
 * - {@link buildMetadataForRoute} always returns
 *   `title: { absolute: finalTitle }` because route titles are already
 *   fully brand-composed (via {@link resolveFinalTitle}). Without
 *   `absolute`, Next would apply the root template and produce
 *   `… | ZolvStack | ZolvStack`.
 * - Open Graph / Twitter titles stay plain final strings from the same
 *   normalized social object — they do not use Next's title template API.
 *
 * Inheritance (spec: "root defaults -> product defaults -> route overrides"):
 *
 * - Title/description resolve via `content-resolver.ts` (final title from
 *   {@link resolveFinalTitle}; description from
 *   {@link resolveRouteDescription}).
 * - Open Graph image resolves via `resolveOgImages`.
 * - `siteName` / OG `locale` use the root brand for non-product routes and
 *   the product brand for product routes.
 *
 * This module never imports from `validate.ts` — both consume
 * `content-resolver.ts` directly so neither depends on the other.
 *
 * Not in scope here (later tasks): `app/layout.tsx` / page migration
 * (Task 6/7), JSON-LD (Task 5), sitemap/robots.txt file builders (Task 8),
 * and `verification` metadata wiring (Task 9).
 */

import type { Metadata } from "next";

import { buildAlternates } from "./alternates";
import { getProductBrand, ZOLVSTACK_BRAND } from "./brands";
import {
  resolveFinalTitleOrBrandFallback,
  resolveRouteDescription,
} from "./content-resolver";
import { getRobotsDirective } from "./indexability";
import { resolveOgImages } from "./og";
import { buildSocialMetadata, toOpenGraph, toTwitter } from "./open-graph";
import { getRoute, ROUTE_IDS, type RouteId } from "./routes";
import type { SeoRoute } from "./types";
import { getSiteOrigin } from "./url";

/** Resolves the brand whose identity a route's OG `siteName` / `locale`
 * should reflect: the owning product's brand for product routes, else the
 * root ZolvStack brand (spec: "siteName brand-aware"). */
function resolveBrandForRoute(route: SeoRoute) {
  return route.product ? getProductBrand(route.product) : ZOLVSTACK_BRAND;
}

/** For product routes, reinforce the parent ZolvStack brand in
 * `og:site_name` (mirrors the `productToolTitle` / `productHubTitle` title
 * suffix pattern). Root routes use the bare ZolvStack name. */
function resolveSiteName(route: SeoRoute): string {
  if (!route.product) return ZOLVSTACK_BRAND.name;
  const brand = getProductBrand(route.product);
  return `${brand.name} by ${ZOLVSTACK_BRAND.name}`;
}

function buildRobotsMetadata(route: SeoRoute): Metadata["robots"] {
  const { index, follow } = getRobotsDirective(route);
  return { index, follow };
}

/**
 * Builds the complete Next.js `Metadata` object for `route`. Internal —
 * `buildRootMetadata` / `buildMetadataForRoute` are the public surface so
 * every caller goes through the route registry, never a raw path.
 *
 * Always emits `title: { absolute }` so callers cannot accidentally inherit
 * the root layout title template. {@link buildRootMetadata} replaces this
 * with `{ default, template }` for the layout segment only.
 */
function buildMetadataForSeoRoute(route: SeoRoute): Metadata {
  const finalTitle = resolveFinalTitleOrBrandFallback(route);
  const description = resolveRouteDescription(route);
  const alternates = buildAlternates(route.path);
  const images = resolveOgImages(route);
  const brand = resolveBrandForRoute(route);

  const social = buildSocialMetadata({
    title: finalTitle,
    description,
    canonicalUrl: alternates.canonical,
    siteName: resolveSiteName(route),
    locale: brand.localeTag,
    images,
  });

  const metadata: Metadata = {
    // Absolute prevents double brand suffixes under a root title template.
    title: { absolute: finalTitle },
    alternates,
    robots: buildRobotsMetadata(route),
    openGraph: toOpenGraph(social),
    twitter: toTwitter(social),
  };

  if (description) {
    metadata.description = description;
  }

  // Keywords meta: omit unless explicitly configured on the route (spec:
  // "keywords omitted unless explicitly configured" — never invent or infer
  // them, e.g. from TOOL_CONFIG).
  if (route.keywords && route.keywords.length > 0) {
    metadata.keywords = [...route.keywords];
  }

  return metadata;
}

/**
 * Builds root layout metadata for `app/layout.tsx`.
 *
 * Sets `metadataBase` and a Next title `{ default, template }` so child
 * segments can inherit `"%s | ZolvStack"`. Fully composed brand/product/tool
 * pages must still use {@link buildMetadataForRoute}'s `absolute` titles.
 */
export function buildRootMetadata(): Metadata {
  const route = getRoute(ROUTE_IDS.HOME);
  const metadata = buildMetadataForSeoRoute(route);
  const finalTitle = resolveFinalTitleOrBrandFallback(route);

  return {
    ...metadata,
    metadataBase: new URL(getSiteOrigin().origin),
    title: {
      default: finalTitle,
      template: `%s | ${ZOLVSTACK_BRAND.name}`,
    },
  };
}

/**
 * Builds the complete Next.js `Metadata` object for the registered route
 * `routeId` (any `RouteId`: a non-tool id or a `ToolSlug`).
 *
 * Title is always `{ absolute: finalTitle }` so already-composed titles do
 * not inherit the root layout template.
 *
 * @throws {Error} When `routeId` has no registered route (via `getRoute`),
 * or when the site origin cannot be resolved for the canonical URL (via
 * `absoluteUrl` / `getSiteOrigin`)
 */
export function buildMetadataForRoute(routeId: RouteId): Metadata {
  return buildMetadataForSeoRoute(getRoute(routeId));
}
