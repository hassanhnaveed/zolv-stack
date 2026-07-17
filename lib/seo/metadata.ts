/**
 * Metadata builder for the `lib/seo/*` module (SEO Architecture v1.0, Task 4).
 *
 * `buildRootMetadata()` / `buildMetadataForRoute(routeId)` are the only two
 * public entry points. Both are plain, synchronous, server-only functions
 * returning a complete Next.js `Metadata` object.
 *
 * Inheritance (spec: "root defaults -> product defaults -> route overrides"):
 *
 * - Title/description resolve via `resolveRouteTitle` / `resolveRouteDescription`
 *   from `content-resolver.ts` (route override, else `TOOL_CONFIG` fallback for
 *   tools). The final tool title additionally wraps a derived intent phrase in
 *   the `productToolTitle` brand pattern via `resolveToolIntentTitle`.
 * - Open Graph image resolves via `resolveOgImages` (route `ogImage` override,
 *   else product default, else root ZolvStack default).
 * - `siteName` / OG `locale` use the root brand for non-product routes and the
 *   product brand (e.g. Fileora) for product routes.
 *
 * This module never imports from `validate.ts` — both consume
 * `content-resolver.ts` directly so neither depends on the other.
 *
 * Not in scope here (later tasks): `app/layout.tsx` / page migration
 * (Task 6/7), JSON-LD (Task 5), sitemap/robots.txt file builders (Task 8),
 * and `verification` metadata wiring (Task 9) — the env vars it will read
 * already exist (`SEO_GOOGLE_SITE_VERIFICATION`, `SEO_BING_SITE_VERIFICATION`),
 * but this module does not emit `metadata.verification` yet.
 */

import type { Metadata } from "next";

import { buildAlternates } from "./alternates";
import { getProductBrand, productToolTitle, ZOLVSTACK_BRAND } from "./brands";
import {
  resolveRouteDescription,
  resolveRouteTitle,
  resolveToolIntentTitle,
} from "./content-resolver";
import { getRobotsDirective } from "./indexability";
import { resolveOgImages } from "./og";
import { buildSocialMetadata, toOpenGraph, toTwitter } from "./open-graph";
import { getRoute, ROUTE_IDS, type RouteId } from "./routes";
import type { SeoRoute } from "./types";

/**
 * Resolves the final, brand-composed page title for `route`.
 *
 * Product-tool routes always wrap a resolved intent phrase in the
 * "{Intent} | Fileora by ZolvStack" pattern (spec: "tool final title matches
 * ... {intent} | Fileora by ZolvStack"). Every other page type uses its own
 * resolved title as-is, since those routes already author their full final
 * title directly (see the `brandHomeTitle` / `brandStaticTitle` /
 * `productHubTitle` callers in `routes.ts`).
 */
function resolveFinalTitle(route: SeoRoute): string {
  if (route.pageType === "product-tool") {
    const intent = resolveToolIntentTitle(route);
    if (intent) {
      return productToolTitle(intent, route.product ?? "fileora");
    }
  }

  const title = resolveRouteTitle(route);
  if (title) return title;

  // No route ever reaches this without a resolved title in the real registry
  // (validated by Task 3's validateRequiredFields); this is a last-resort
  // safety net for a malformed/fixture route, not a designed fallback path.
  return ZOLVSTACK_BRAND.name;
}

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
 */
function buildMetadataForSeoRoute(route: SeoRoute): Metadata {
  const title = resolveFinalTitle(route);
  const description = resolveRouteDescription(route);
  const alternates = buildAlternates(route.path);
  const images = resolveOgImages(route);
  const brand = resolveBrandForRoute(route);

  const social = buildSocialMetadata({
    title,
    description,
    canonicalUrl: alternates.canonical,
    siteName: resolveSiteName(route),
    locale: brand.localeTag,
    images,
  });

  const metadata: Metadata = {
    title,
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
 * Builds the root ("/", ZolvStack home) page metadata. Equivalent to
 * `buildMetadataForRoute(ROUTE_IDS.HOME)`, exposed as its own named entry
 * point since the root layout is the most common caller.
 */
export function buildRootMetadata(): Metadata {
  return buildMetadataForSeoRoute(getRoute(ROUTE_IDS.HOME));
}

/**
 * Builds the complete Next.js `Metadata` object for the registered route
 * `routeId` (any `RouteId`: a non-tool id or a `ToolSlug`).
 *
 * @throws {Error} When `routeId` has no registered route (via `getRoute`),
 * or when the site origin cannot be resolved for the canonical URL (via
 * `absoluteUrl` / `getSiteOrigin`)
 */
export function buildMetadataForRoute(routeId: RouteId): Metadata {
  return buildMetadataForSeoRoute(getRoute(routeId));
}
