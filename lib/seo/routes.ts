/**
 * Route registry (SSOT) for the `lib/seo/*` module (SEO Architecture v1.0).
 *
 * This is the single source of truth for every ZolvStack/Fileora route:
 * its path, page type, SEO title/description overrides, and its
 * independent index/sitemap/follow intent. Later tasks (metadata, JSON-LD,
 * sitemap, robots) read from {@link ROUTES} / {@link getRoute} — they must
 * never invent paths themselves.
 *
 * ## Index defaults and fail-closed policy
 *
 * - **Declared intent** lives on each route (`index` / `sitemap` / `follow`).
 *   These flags are independent: a page may be `follow: true` while
 *   `index: false`, and `sitemap` must never outrun effective `index`
 *   (enforced by `indexability.ts`).
 * - **Tool routes default to non-indexable:** `index: false`,
 *   `sitemap: false`, `follow: true`. A tool becomes indexable only via
 *   **explicit opt-in** in this registry after it passes the index quality
 *   gate (fully functional, unique substantial content, correct
 *   metadata/schema, crawlable links, smoke tests).
 * - **Effective indexability is fail-closed:** `indexability.ts` ANDs
 *   declared intent with a recognized production environment *and*
 *   `SEO_INDEXING_ENABLED=true`. Outside that gate, every route is
 *   treated as noindex / omitted from the sitemap — even if declared
 *   `index: true`.
 *
 * ## Import note
 *
 * This file is transitively loaded by `next.config.ts` (via
 * `redirects.ts`). Next's config-ts transpiler loads that dependency
 * graph outside the normal app build, where it does not rewrite the
 * `@/*` tsconfig path alias — only plain relative imports resolve there.
 * So `lib/utils` is imported by relative path here, not via `@/lib/utils`,
 * even though this file is otherwise a normal part of the app.
 */

import { FILEORA_FAQS } from "../fileora-faq";
import { FILEORA_BASE, TOOL_CONFIG, toolHref, type ToolSlug } from "../utils";

import { brandHomeTitle, brandStaticTitle, productHubTitle } from "./brands";
import type { IndexFlags, SeoRoute } from "./types";

/** Stable ids for non-tool routes. Tool routes use their `ToolSlug` as the
 * id directly (already unique, kebab-case, and stable). Frozen. */
export const ROUTE_IDS = Object.freeze({
  HOME: "home",
  ABOUT: "about",
  PRODUCTS: "products",
  CONTACT: "contact",
  SECURITY: "security",
  PRIVACY: "privacy",
  TERMS: "terms",
  FILEORA_HUB: "fileora-hub",
} as const);

/** Union of every registrable route id: non-tool ids plus every `ToolSlug`. */
export type RouteId = (typeof ROUTE_IDS)[keyof typeof ROUTE_IDS] | ToolSlug;

/** Site-relative path constants used by nav/metadata/redirects so no
 * caller ever hand-writes a route path. Frozen. */
export const PATHS = Object.freeze({
  HOME: "/",
  ABOUT: "/about",
  PRODUCTS: "/products",
  CONTACT: "/contact",
  SECURITY: "/security",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  FILEORA: FILEORA_BASE,
} as const);


/** Reserved paths that must never collide with a registered SEO route
 * (spec "URL Strategy": "Reserved paths validated"). Prefix matches (e.g.
 * `/api/health`) are also rejected — see {@link isReservedPath}. */
export const RESERVED_PATHS: readonly string[] = Object.freeze([
  "/api",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]);

/**
 * Whether `path` is, or is nested under, a reserved path.
 *
 * @param path - Site-relative path to check (e.g. `/api/health`)
 */
export function isReservedPath(path: string): boolean {
  return RESERVED_PATHS.some(
    (reserved) => path === reserved || path.startsWith(`${reserved}/`),
  );
}

const KEBAB_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Whether `path` is lowercase kebab-case with a single leading slash and
 * no trailing slash (root `/` is the sole exception). */
function isKebabCasePath(path: string): boolean {
  if (path === "/") return true;
  if (!path.startsWith("/") || path.endsWith("/")) return false;
  return path
    .slice(1)
    .split("/")
    .every((segment) => KEBAB_SEGMENT.test(segment));
}

/**
 * Validates structural invariants for a route list: unique ids, unique
 * paths, lowercase kebab-case paths, and no collisions with
 * {@link RESERVED_PATHS}. Throws a descriptive `Error` on the first
 * violation found.
 *
 * Exported so `routes.test.ts` can exercise it directly with fixtures, in
 * addition to it being run once against {@link ROUTES} at module load.
 * Intentionally **not** re-exported from the `lib/seo` public barrel.
 *
 * @param routes - Candidate route list to validate
 */
export function assertValidRoutes(routes: readonly SeoRoute[]): void {
  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();

  for (const route of routes) {
    if (seenIds.has(route.id)) {
      throw new Error(`lib/seo/routes: duplicate route id "${route.id}".`);
    }
    seenIds.add(route.id);

    if (seenPaths.has(route.path)) {
      throw new Error(
        `lib/seo/routes: duplicate route path "${route.path}" (route id "${route.id}").`,
      );
    }
    seenPaths.add(route.path);

    if (isReservedPath(route.path)) {
      throw new Error(
        `lib/seo/routes: route "${route.id}" path "${route.path}" collides with a reserved path.`,
      );
    }

    if (!isKebabCasePath(route.path)) {
      throw new Error(
        `lib/seo/routes: route "${route.id}" path "${route.path}" must be lowercase ` +
          'kebab-case with a leading slash and no trailing slash (except "/").',
      );
    }
  }
}

/** Default index policy for every tool route until it passes the index
 * quality gate and is explicitly opted in (spec: "Default for tools:
 * `index: false`, `sitemap: false` until quality gate passes"). Fail-closed
 * effective indexing still requires production + `SEO_INDEXING_ENABLED`.
 *
 * ## Task 9 initial policy decision
 *
 * Task 9's index-quality-gate audit reviewed every current tool and
 * approved **zero** for indexing: no tool had both substantial unique page
 * content and converter smoke-test evidence at review time, and some also
 * carried placeholder, binary-dependency, or functional risk. Per the
 * gate's rule — "absence of evidence means exclude" — every `ToolSlug`
 * below keeps {@link TOOL_ROUTE_DEFAULTS} unchanged rather than gaining a
 * per-route override.
 *
 * This is a conservative *initial* decision, not a permanent one. A tool
 * becomes indexable only by individually satisfying the full index quality
 * gate above (fully functional, unique substantial content, correct
 * metadata/schema, crawlable internal links, passing content/converter
 * smoke tests) and then flipping its own `index`/`sitemap` flags to `true`
 * — future opt-in is a per-route change here, not a new abstraction. There
 * is deliberately no separate "allowlist" data structure to keep in sync:
 * this registry is already the single source of truth for tool indexing
 * intent. */
const TOOL_ROUTE_DEFAULTS: IndexFlags = {
  index: false,
  sitemap: false,
  follow: true,
};

const BRAND_ROUTES: readonly SeoRoute[] = [
  {
    id: ROUTE_IDS.HOME,
    path: PATHS.HOME,
    pageType: "brand-home",
    title: brandHomeTitle(),
    description:
      "ZolvStack builds fast, private, browser-based tools for everyday work — starting with Fileora, a free file converter.",
    index: true,
    sitemap: true,
    follow: true,
    sitemapPriority: 1.0,
    changeFrequency: "weekly",
  },
  {
    id: ROUTE_IDS.ABOUT,
    path: PATHS.ABOUT,
    pageType: "brand-static",
    title: brandStaticTitle("About"),
    description:
      "Learn about ZolvStack — our mission, vision, and the products we build, including Fileora.",
    index: true,
    sitemap: true,
    follow: true,
    sitemapPriority: 0.5,
    changeFrequency: "monthly",
  },
  {
    id: ROUTE_IDS.PRODUCTS,
    path: PATHS.PRODUCTS,
    pageType: "brand-static",
    title: brandStaticTitle("Products"),
    description:
      "Explore ZolvStack products, including Fileora — free file conversion for images, PDFs, and documents.",
    index: true,
    sitemap: true,
    follow: true,
    sitemapPriority: 0.7,
    changeFrequency: "monthly",
  },
  {
    id: ROUTE_IDS.CONTACT,
    path: PATHS.CONTACT,
    pageType: "brand-static",
    title: brandStaticTitle("Contact"),
    description: "Get in touch with the ZolvStack team.",
    index: true,
    sitemap: true,
    follow: true,
    sitemapPriority: 0.5,
    changeFrequency: "monthly",
  },
  {
    id: ROUTE_IDS.SECURITY,
    path: PATHS.SECURITY,
    pageType: "legal",
    title: brandStaticTitle("Security"),
    description: "How ZolvStack protects your data and files.",
    index: true,
    sitemap: true,
    follow: true,
    sitemapPriority: 0.3,
    changeFrequency: "yearly",
  },
  {
    id: ROUTE_IDS.PRIVACY,
    path: PATHS.PRIVACY,
    pageType: "legal",
    title: brandStaticTitle("Privacy Policy"),
    description:
      "ZolvStack's privacy policy covering data handling and file processing.",
    index: true,
    sitemap: true,
    follow: true,
    sitemapPriority: 0.3,
    changeFrequency: "yearly",
  },
  {
    id: ROUTE_IDS.TERMS,
    path: PATHS.TERMS,
    pageType: "legal",
    title: brandStaticTitle("Terms of Service"),
    description:
      "Terms of Service for using ZolvStack products, including Fileora.",
    index: true,
    sitemap: true,
    follow: true,
    sitemapPriority: 0.3,
    changeFrequency: "yearly",
  },
];

const FILEORA_HUB_ROUTE: SeoRoute = {
  id: ROUTE_IDS.FILEORA_HUB,
  path: PATHS.FILEORA,
  product: "fileora",
  pageType: "product-hub",
  title: productHubTitle(),
  description:
    "Fileora by ZolvStack — free, unlimited file conversion tools for images, PDFs, and documents. No signup required.",
  faq: [...FILEORA_FAQS],
  index: true,
  sitemap: true,
  follow: true,
  sitemapPriority: 0.9,
  changeFrequency: "weekly",
};

function buildToolRoute(slug: ToolSlug): SeoRoute {
  return {
    id: slug,
    path: toolHref(slug),
    product: "fileora",
    pageType: "product-tool",
    ...TOOL_ROUTE_DEFAULTS,
  };
}

const TOOL_ROUTES: readonly SeoRoute[] = (
  Object.keys(TOOL_CONFIG) as ToolSlug[]
).map(buildToolRoute);

/**
 * The full, frozen route registry — every ZolvStack brand route, the
 * Fileora hub, and every current `ToolSlug`. Validated once at module
 * load via {@link assertValidRoutes}.
 */
export const ROUTES: readonly SeoRoute[] = Object.freeze(
  [...BRAND_ROUTES, FILEORA_HUB_ROUTE, ...TOOL_ROUTES].map((route) =>
    Object.freeze({ ...route }),
  ),
);

assertValidRoutes(ROUTES);

const ROUTES_BY_ID: ReadonlyMap<string, SeoRoute> = new Map(
  ROUTES.map((route) => [route.id, route]),
);

/**
 * Looks up a registered route by id.
 *
 * The public signature accepts only {@link RouteId} so callers get
 * compile-time exhaustiveness. A runtime guard remains for values that
 * escape the type system (e.g. dynamic strings cast to `RouteId`).
 *
 * @param id - Registered route id (e.g. `"home"` or a `ToolSlug` like
 * `"image-to-webp"`)
 * @throws {Error} When no route is registered under `id`
 */
export function getRoute(id: RouteId): SeoRoute {
  const route = ROUTES_BY_ID.get(id);
  if (!route) {
    throw new Error(`lib/seo/routes: no registered route with id "${id}".`);
  }
  return route;
}

/** Returns the full, frozen route registry. */
export function listRoutes(): readonly SeoRoute[] {
  return ROUTES;
}
