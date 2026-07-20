import { afterEach, describe, expect, it, vi } from "vitest";

import { buildRobots } from "./robots";
import { ROUTES } from "./routes";
import { buildSitemap } from "./sitemap";
import type { SeoRoute } from "./types";

function stubEnvironment({
  nodeEnv = "production",
  appUrl = "https://example.com",
  indexingEnabled = "true",
}: {
  nodeEnv?: string;
  appUrl?: string;
  indexingEnabled?: string;
} = {}): void {
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.stubEnv("NEXT_PUBLIC_APP_URL", appUrl);
  vi.stubEnv("SEO_INDEXING_ENABLED", indexingEnabled);
}

function makeRoute(overrides: Partial<SeoRoute>): SeoRoute {
  return {
    id: "fixture",
    path: "/fixture",
    pageType: "brand-static",
    index: true,
    sitemap: true,
    follow: true,
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("buildSitemap", () => {
  it("includes the exact registry-derived route set in enabled production", () => {
    stubEnvironment();

    const expectedRoutes = ROUTES.filter(
      (route) => route.index && route.sitemap,
    );
    const sitemap = buildSitemap();

    expect(sitemap.map((entry) => new URL(entry.url).pathname)).toEqual(
      expectedRoutes.map((route) => route.path),
    );
  });

  it("requires both index and sitemap route flags", () => {
    stubEnvironment();
    const routes = [
      makeRoute({ id: "included", path: "/included" }),
      makeRoute({ id: "no-index", path: "/no-index", index: false }),
      makeRoute({ id: "no-sitemap", path: "/no-sitemap", sitemap: false }),
    ];

    expect(buildSitemap(routes).map((entry) => entry.url)).toEqual([
      "https://example.com/included",
    ]);
  });

  it("emits no duplicate URLs", () => {
    stubEnvironment();

    const urls = buildSitemap().map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("preserves an HTTPS origin in every absolute URL", () => {
    stubEnvironment({ appUrl: "https://www.example.com" });

    for (const entry of buildSitemap()) {
      expect(entry.url).toMatch(/^https:\/\/www\.example\.com\//);
      expect(new URL(entry.url).protocol).toBe("https:");
    }
  });

  it("maps optional registry sitemap fields without fabricating values", () => {
    stubEnvironment();
    const routes = [
      makeRoute({
        changeFrequency: "daily",
        sitemapPriority: 0.75,
        lastModified: "2026-07-01",
      }),
    ];

    expect(buildSitemap(routes)).toEqual([
      {
        url: "https://example.com/fixture",
        changeFrequency: "daily",
        priority: 0.75,
        lastModified: "2026-07-01",
      },
    ]);
  });

  it("does not fabricate lastModified for registry routes", () => {
    stubEnvironment();

    for (const entry of buildSitemap()) {
      expect(entry).not.toHaveProperty("lastModified");
    }
  });

  it.each([
    {
      name: "development with accidental enablement",
      env: {
        nodeEnv: "development",
        appUrl: "https://example.com",
        indexingEnabled: "true",
      },
    },
    {
      name: "test with accidental enablement",
      env: {
        nodeEnv: "test",
        appUrl: "https://example.com",
        indexingEnabled: "true",
      },
    },
    {
      name: "unrecognized production origin",
      env: {
        nodeEnv: "production",
        appUrl: "http://example.com",
        indexingEnabled: "true",
      },
    },
    {
      name: "production with indexing disabled",
      env: {
        nodeEnv: "production",
        appUrl: "https://example.com",
        indexingEnabled: "false",
      },
    },
  ])("returns an empty sitemap in $name", ({ env }) => {
    stubEnvironment(env);
    expect(buildSitemap()).toEqual([]);
  });
});

describe("buildRobots", () => {
  it("returns the exact crawl and sitemap semantics", () => {
    stubEnvironment();

    expect(buildRobots()).toEqual({
      rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
      sitemap: "https://example.com/sitemap.xml",
    });
  });

  it("does not emit Host or disallow Next.js assets", () => {
    stubEnvironment();

    const robots = buildRobots();
    expect(robots).not.toHaveProperty("host");
    expect(JSON.stringify(robots.rules)).not.toContain("/_next");
  });
});

describe("App Router metadata route adapters", () => {
  it("returns the centralized sitemap builder result", async () => {
    stubEnvironment();
    const { default: sitemap } = await import("../../app/sitemap");

    expect(sitemap()).toEqual(buildSitemap());
  });

  it("returns the centralized robots builder result", async () => {
    stubEnvironment();
    const { default: robots } = await import("../../app/robots");

    expect(robots()).toEqual(buildRobots());
  });
});
