import { afterEach, describe, expect, it, vi } from "vitest";

import { TOOL_CONFIG, toolHref, type ToolSlug } from "@/lib/utils";

import { getNextRedirects, getRedirects } from "./redirects";
import {
  isRouteIndexable,
  isRouteInSitemap,
  isSeoIndexingEnabled,
  listIndexableRoutes,
  listSitemapRoutes,
  resolveIndexFlags,
} from "./indexability";
import {
  assertValidRoutes,
  getRoute,
  isReservedPath,
  listRoutes,
  PATHS,
  RESERVED_PATHS,
  ROUTE_IDS,
  ROUTES,
} from "./routes";
import type { SeoRoute } from "./types";

const KEBAB_CASE_PATH =
  /^\/$|^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

function makeRoute(overrides: Partial<SeoRoute>): SeoRoute {
  return {
    id: "test-route",
    path: "/test-route",
    pageType: "brand-static",
    index: false,
    sitemap: false,
    follow: true,
    ...overrides,
  };
}

describe("ROUTES registry", () => {
  it("registers the ZolvStack brand routes at their expected paths", () => {
    expect(getRoute(ROUTE_IDS.HOME).path).toBe("/");
    expect(getRoute(ROUTE_IDS.ABOUT).path).toBe(PATHS.ABOUT);
    expect(getRoute(ROUTE_IDS.CONTACT).path).toBe(PATHS.CONTACT);
    expect(getRoute(ROUTE_IDS.SECURITY).path).toBe(PATHS.SECURITY);
    expect(getRoute(ROUTE_IDS.PRIVACY).path).toBe(PATHS.PRIVACY);
    expect(getRoute(ROUTE_IDS.TERMS).path).toBe(PATHS.TERMS);
  });

  it("registers the Fileora hub as a product-hub route", () => {
    const hub = getRoute(ROUTE_IDS.FILEORA_HUB);
    expect(hub.path).toBe("/fileora");
    expect(hub.pageType).toBe("product-hub");
    expect(hub.product).toBe("fileora");
  });

  it("registers every current ToolSlug from TOOL_CONFIG under /fileora/{slug}", () => {
    const toolSlugs = Object.keys(TOOL_CONFIG) as ToolSlug[];
    expect(toolSlugs.length).toBeGreaterThan(0);
    for (const slug of toolSlugs) {
      const route = getRoute(slug);
      expect(route.path).toBe(toolHref(slug));
      expect(route.pageType).toBe("product-tool");
      expect(route.product).toBe("fileora");
    }
  });

  it("defaults every tool route to index:false, sitemap:false, follow:true", () => {
    const toolSlugs = Object.keys(TOOL_CONFIG) as ToolSlug[];
    for (const slug of toolSlugs) {
      const route = getRoute(slug);
      expect(route.index).toBe(false);
      expect(route.sitemap).toBe(false);
      expect(route.follow).toBe(true);
    }
  });

  it("has unique route ids", () => {
    const ids = ROUTES.map((route) => route.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique route paths", () => {
    const paths = ROUTES.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("uses lowercase kebab-case paths for every registered route", () => {
    for (const route of ROUTES) {
      expect(route.path).toMatch(KEBAB_CASE_PATH);
    }
  });

  it("never registers a route path colliding with a reserved path", () => {
    for (const route of ROUTES) {
      expect(isReservedPath(route.path)).toBe(false);
    }
  });

  it("throws a descriptive error when getRoute is called with an unregistered id", () => {
    expect(() => getRoute("does-not-exist")).toThrow(/does-not-exist/);
  });

  it("listRoutes returns the full registry", () => {
    expect(listRoutes()).toEqual(ROUTES);
  });
});

describe("RESERVED_PATHS / isReservedPath", () => {
  it("flags exact reserved paths", () => {
    expect(isReservedPath("/favicon.ico")).toBe(true);
    expect(isReservedPath("/robots.txt")).toBe(true);
    expect(isReservedPath("/sitemap.xml")).toBe(true);
  });

  it("flags reserved path prefixes", () => {
    expect(isReservedPath("/api")).toBe(true);
    expect(isReservedPath("/api/health")).toBe(true);
    expect(isReservedPath("/_next")).toBe(true);
    expect(isReservedPath("/_next/static/chunk.js")).toBe(true);
  });

  it("does not flag unrelated paths", () => {
    expect(isReservedPath("/fileora")).toBe(false);
    expect(isReservedPath("/about")).toBe(false);
  });

  it("exposes the reserved path list used by isReservedPath", () => {
    expect(RESERVED_PATHS).toEqual(
      expect.arrayContaining([
        "/api",
        "/_next",
        "/favicon.ico",
        "/robots.txt",
        "/sitemap.xml",
      ]),
    );
  });
});

describe("assertValidRoutes", () => {
  it("accepts a well-formed route list", () => {
    expect(() =>
      assertValidRoutes([
        makeRoute({ id: "a", path: "/a" }),
        makeRoute({ id: "b", path: "/b" }),
      ]),
    ).not.toThrow();
  });

  it("rejects duplicate route ids", () => {
    expect(() =>
      assertValidRoutes([
        makeRoute({ id: "dup", path: "/a" }),
        makeRoute({ id: "dup", path: "/b" }),
      ]),
    ).toThrow(/duplicate route id/i);
  });

  it("rejects duplicate route paths", () => {
    expect(() =>
      assertValidRoutes([
        makeRoute({ id: "a", path: "/same" }),
        makeRoute({ id: "b", path: "/same" }),
      ]),
    ).toThrow(/duplicate route path/i);
  });

  it("rejects non-kebab-case paths", () => {
    expect(() =>
      assertValidRoutes([makeRoute({ id: "a", path: "/Not_Kebab" })]),
    ).toThrow(/kebab-case/i);
  });

  it("rejects paths with a trailing slash (other than root)", () => {
    expect(() =>
      assertValidRoutes([makeRoute({ id: "a", path: "/trailing/" })]),
    ).toThrow(/kebab-case/i);
  });

  it("rejects paths colliding with reserved routes", () => {
    expect(() =>
      assertValidRoutes([makeRoute({ id: "a", path: "/api/whoami" })]),
    ).toThrow(/reserved/i);

    expect(() =>
      assertValidRoutes([makeRoute({ id: "b", path: "/favicon.ico" })]),
    ).toThrow(/reserved/i);
  });
});

describe("getRedirects / getNextRedirects", () => {
  it("preserves the /convoox -> /fileora redirects", () => {
    const redirects = getRedirects();
    expect(redirects).toEqual(
      expect.arrayContaining([
        { source: "/convoox", destination: "/fileora", permanent: true },
        {
          source: "/convoox/:path*",
          destination: "/fileora/:path*",
          permanent: true,
        },
      ]),
    );
  });

  it("redirects every bare ToolSlug path to /fileora/{slug}", () => {
    const redirects = getRedirects();
    const toolSlugs = Object.keys(TOOL_CONFIG) as ToolSlug[];
    for (const slug of toolSlugs) {
      expect(redirects).toEqual(
        expect.arrayContaining([
          {
            source: `/${slug}`,
            destination: toolHref(slug),
            permanent: true,
          },
        ]),
      );
    }
  });

  it("only emits permanent redirects (matches current next.config.ts behavior)", () => {
    for (const redirect of getRedirects()) {
      expect(redirect.permanent).toBe(true);
    }
  });

  it("never introduces a redirect chain (no destination is itself a source)", () => {
    const redirects = getRedirects();
    const sources = new Set(redirects.map((redirect) => redirect.source));
    for (const redirect of redirects) {
      const destinationPath = redirect.destination.split("?")[0];
      expect(sources.has(destinationPath)).toBe(false);
    }
  });

  it("getNextRedirects mirrors getRedirects for next.config.ts consumption", () => {
    expect(getNextRedirects()).toEqual(getRedirects());
  });
});

describe("indexability helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function stubProductionEnabled() {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    vi.stubEnv("SEO_INDEXING_ENABLED", "true");
  }

  it("fails closed outside production even if SEO_INDEXING_ENABLED is true", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    vi.stubEnv("SEO_INDEXING_ENABLED", "true");

    expect(isSeoIndexingEnabled()).toBe(false);
    const route = makeRoute({ index: true, sitemap: true, follow: true });
    expect(isRouteIndexable(route)).toBe(false);
    expect(isRouteInSitemap(route)).toBe(false);
  });

  it("fails closed in production when SEO_INDEXING_ENABLED is not explicitly true", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    vi.stubEnv("SEO_INDEXING_ENABLED", "");

    const route = makeRoute({ index: true, sitemap: true, follow: true });
    expect(isRouteIndexable(route)).toBe(false);
  });

  it("is indexable only when the route opts in AND the site-wide gate is enabled", () => {
    stubProductionEnabled();

    const optedIn = makeRoute({ index: true, sitemap: true, follow: true });
    expect(isRouteIndexable(optedIn)).toBe(true);
    expect(isRouteInSitemap(optedIn)).toBe(true);

    const optedOut = makeRoute({ index: false, sitemap: false, follow: true });
    expect(isRouteIndexable(optedOut)).toBe(false);
    expect(isRouteInSitemap(optedOut)).toBe(false);
  });

  it("never lists a noindex route in the sitemap, even if route.sitemap is true", () => {
    stubProductionEnabled();

    const misconfigured = makeRoute({
      index: false,
      sitemap: true,
      follow: true,
    });
    expect(isRouteInSitemap(misconfigured)).toBe(false);
  });

  it("keeps follow independent of the index/sitemap fail-closed gate", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");

    const followableNoindex = makeRoute({
      index: true,
      sitemap: true,
      follow: true,
    });
    expect(resolveIndexFlags(followableNoindex)).toEqual({
      index: false,
      sitemap: false,
      follow: true,
    });

    const noFollow = makeRoute({ index: false, sitemap: false, follow: false });
    expect(resolveIndexFlags(noFollow).follow).toBe(false);
  });

  it("listIndexableRoutes / listSitemapRoutes are empty outside production for the real registry", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    vi.stubEnv("SEO_INDEXING_ENABLED", "true");

    expect(listIndexableRoutes()).toEqual([]);
    expect(listSitemapRoutes()).toEqual([]);
  });

  it("listSitemapRoutes never contains a route missing from listIndexableRoutes", () => {
    stubProductionEnabled();

    const indexable = new Set(listIndexableRoutes().map((route) => route.id));
    for (const route of listSitemapRoutes()) {
      expect(indexable.has(route.id)).toBe(true);
    }
  });
});
