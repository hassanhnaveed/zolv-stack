import { promises as fsp } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildAuditReport, renderAuditMarkdown, runSeoAudit } from "./audit";
import { getRedirects } from "./redirects";
import { ROUTES } from "./routes";
import type { SeoRoute } from "./types";
import {
  isPlaceholderVerificationToken,
  partitionValidationIssues,
  resolveRouteDescription,
  resolveRouteTitle,
  validateCanonicalUrls,
  validateDuplicateTitles,
  validateHardcodedHosts,
  validateIndexSitemapConsistency,
  validateRedirectInvariants,
  validateRequiredFields,
  validateRouteRegistryInvariants,
  validateSeo,
  validateVerificationTokens,
} from "./validate";

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

describe("validateRouteRegistryInvariants", () => {
  it("returns no issues for a well-formed route list", () => {
    expect(
      validateRouteRegistryInvariants([
        makeRoute({ id: "a", path: "/a" }),
        makeRoute({ id: "b", path: "/b" }),
      ]),
    ).toEqual([]);
  });

  it("reports duplicate route ids as an error instead of throwing", () => {
    const issues = validateRouteRegistryInvariants([
      makeRoute({ id: "dup", path: "/a" }),
      makeRoute({ id: "dup", path: "/b" }),
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ severity: "error" });
    expect(issues[0]?.message).toMatch(/duplicate route id/i);
  });

  it("reports reserved-path collisions as an error", () => {
    const issues = validateRouteRegistryInvariants([
      makeRoute({ id: "a", path: "/api/whoami" }),
    ]);
    expect(issues[0]?.message).toMatch(/reserved/i);
  });
});

describe("validateRedirectInvariants", () => {
  const routes: readonly SeoRoute[] = [
    makeRoute({ id: "hub", path: "/fileora" }),
    makeRoute({ id: "about", path: "/about" }),
  ];

  it("returns no issues for a well-formed redirect list", () => {
    expect(
      validateRedirectInvariants(
        [{ source: "/old", destination: "/fileora", permanent: true }],
        routes,
      ),
    ).toEqual([]);
  });

  it("reports an unresolved redirect destination as an error instead of throwing", () => {
    const issues = validateRedirectInvariants(
      [{ source: "/old", destination: "/missing", permanent: true }],
      routes,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ severity: "error" });
    expect(issues[0]?.message).toMatch(/destination.*(?:registered|canonical)/i);
  });
});

describe("validateCanonicalUrls", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports an origin error instead of throwing when NEXT_PUBLIC_APP_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    const issues = validateCanonicalUrls([makeRoute({ id: "a", path: "/a" })]);
    expect(issues.some((issue) => issue.code === "seo/origin-unresolved")).toBe(
      true,
    );
  });

  it("accepts a resolvable absolute canonical with no ogImage", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    const issues = validateCanonicalUrls([makeRoute({ id: "a", path: "/a" })]);
    expect(issues).toEqual([]);
  });

  it("rejects a relative ogImage.url where an absolute URL is required", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    const issues = validateCanonicalUrls([
      makeRoute({
        id: "a",
        path: "/a",
        ogImage: { url: "/og/a.png", alt: "Meaningful alt text" },
      }),
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      severity: "error",
      code: "seo/relative-og-image-url",
      routeId: "a",
    });
  });

  it("accepts an absolute ogImage.url", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    const issues = validateCanonicalUrls([
      makeRoute({
        id: "a",
        path: "/a",
        ogImage: {
          url: "https://example.com/og/a.png",
          alt: "Meaningful alt text",
        },
      }),
    ]);
    expect(issues).toEqual([]);
  });
});

describe("validateRequiredFields", () => {
  const toolConfig = {
    "image-to-webp": { title: "WebP", description: "Convert to WebP." },
  };

  it("requires title and description on brand/legal/hub page types", () => {
    const issues = validateRequiredFields([
      makeRoute({ id: "about", path: "/about", pageType: "brand-static" }),
    ]);
    expect(issues).toHaveLength(2);
    expect(issues.map((issue) => issue.code).sort()).toEqual([
      "seo/missing-description",
      "seo/missing-title",
    ]);
  });

  it("accepts a route-level title/description override", () => {
    const issues = validateRequiredFields([
      makeRoute({
        id: "about",
        path: "/about",
        pageType: "brand-static",
        title: "About | ZolvStack",
        description: "Learn about ZolvStack.",
      }),
    ]);
    expect(issues).toEqual([]);
  });

  it("allows a product-tool route to fall back to TOOL_CONFIG for title/description", () => {
    const issues = validateRequiredFields(
      [
        makeRoute({
          id: "image-to-webp",
          path: "/fileora/image-to-webp",
          pageType: "product-tool",
        }),
      ],
      toolConfig,
    );
    expect(issues).toEqual([]);
  });

  it("reports a missing-fallback error for a product-tool route with no override and no TOOL_CONFIG entry", () => {
    const issues = validateRequiredFields(
      [
        makeRoute({
          id: "unknown-tool",
          path: "/fileora/unknown-tool",
          pageType: "product-tool",
        }),
      ],
      toolConfig,
    );
    expect(issues).toHaveLength(2);
    for (const issue of issues) {
      expect(issue.message).toMatch(/TOOL_CONFIG/);
    }
  });
});

describe("validateDuplicateTitles", () => {
  it("reports duplicate titles among declared-indexable routes", () => {
    const issues = validateDuplicateTitles([
      makeRoute({ id: "a", path: "/a", index: true, title: "Same Title" }),
      makeRoute({ id: "b", path: "/b", index: true, title: "Same Title" }),
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      severity: "error",
      code: "seo/duplicate-title",
    });
    expect(issues[0]?.message).toMatch(/"a".*"b"|"b".*"a"/);
  });

  it("does not flag duplicate titles among non-indexable routes", () => {
    const issues = validateDuplicateTitles([
      makeRoute({ id: "a", path: "/a", index: false, title: "Same Title" }),
      makeRoute({ id: "b", path: "/b", index: false, title: "Same Title" }),
    ]);
    expect(issues).toEqual([]);
  });

  it("does not flag distinct titles", () => {
    const issues = validateDuplicateTitles([
      makeRoute({ id: "a", path: "/a", index: true, title: "Title A" }),
      makeRoute({ id: "b", path: "/b", index: true, title: "Title B" }),
    ]);
    expect(issues).toEqual([]);
  });
});

describe("validateIndexSitemapConsistency", () => {
  it("rejects sitemap:true paired with index:false", () => {
    const issues = validateIndexSitemapConsistency([
      makeRoute({ id: "a", path: "/a", index: false, sitemap: true }),
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      severity: "error",
      code: "seo/sitemap-without-index",
      routeId: "a",
    });
  });

  it("accepts sitemap:true paired with index:true", () => {
    const issues = validateIndexSitemapConsistency([
      makeRoute({ id: "a", path: "/a", index: true, sitemap: true }),
    ]);
    expect(issues).toEqual([]);
  });

  it("accepts sitemap:false regardless of index", () => {
    const issues = validateIndexSitemapConsistency([
      makeRoute({ id: "a", path: "/a", index: false, sitemap: false }),
      makeRoute({ id: "b", path: "/b", index: true, sitemap: false }),
    ]);
    expect(issues).toEqual([]);
  });
});

describe("validateHardcodedHosts", () => {
  it("flags a legacy Netlify host embedded in a route description", () => {
    const issues = validateHardcodedHosts([
      makeRoute({
        id: "a",
        path: "/a",
        description: "See https://fileora.netlify.app for legacy details.",
      }),
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      severity: "error",
      code: "seo/hardcoded-legacy-host",
      routeId: "a",
    });
  });

  it("flags a legacy host embedded in an ogImage URL", () => {
    const issues = validateHardcodedHosts([
      makeRoute({
        id: "a",
        path: "/a",
        ogImage: {
          url: "https://fileora.netlify.app/og.png",
          alt: "Fileora preview",
        },
      }),
    ]);
    expect(issues).toHaveLength(1);
  });

  it("does not flag ordinary copy with no legacy host substrings", () => {
    const issues = validateHardcodedHosts([
      makeRoute({
        id: "a",
        path: "/a",
        title: "About | ZolvStack",
        description: "Learn about ZolvStack and Fileora.",
        keywords: ["convert files", "free file converter"],
      }),
    ]);
    expect(issues).toEqual([]);
  });
});

describe("isPlaceholderVerificationToken / validateVerificationTokens", () => {
  it("flags common placeholder token shapes", () => {
    expect(isPlaceholderVerificationToken("your-token-here")).toBe(true);
    expect(isPlaceholderVerificationToken("REPLACE_ME")).toBe(true);
    expect(isPlaceholderVerificationToken("example-token")).toBe(true);
    expect(isPlaceholderVerificationToken("PLACEHOLDER")).toBe(true);
  });

  it("does not flag a real-looking opaque token", () => {
    expect(isPlaceholderVerificationToken("Ab3xQz9-Ff21LmN0pQ")).toBe(false);
  });

  it("reports a validation error when a configured token is a placeholder", () => {
    const issues = validateVerificationTokens({
      googleSiteVerification: "your-token-here",
      bingSiteVerification: undefined,
    });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      severity: "error",
      code: "seo/placeholder-verification-token",
    });
  });

  it("returns no issues when tokens are unset or look real", () => {
    expect(
      validateVerificationTokens({
        googleSiteVerification: undefined,
        bingSiteVerification: undefined,
      }),
    ).toEqual([]);
    expect(
      validateVerificationTokens({
        googleSiteVerification: "Ab3xQz9-Ff21LmN0pQ",
        bingSiteVerification: "9F3k2-real-looking-token",
      }),
    ).toEqual([]);
  });
});

describe("resolveRouteTitle / resolveRouteDescription", () => {
  const toolConfig = {
    "image-to-webp": { title: "WebP", description: "Convert to WebP." },
  };

  it("prefers the route-level override over the TOOL_CONFIG fallback", () => {
    const route = makeRoute({
      id: "image-to-webp",
      pageType: "product-tool",
      title: "Custom Title",
    });
    expect(resolveRouteTitle(route, toolConfig)).toBe("Custom Title");
  });

  it("falls back to TOOL_CONFIG for product-tool routes", () => {
    const route = makeRoute({
      id: "image-to-webp",
      pageType: "product-tool",
    });
    expect(resolveRouteTitle(route, toolConfig)).toBe("WebP");
    expect(resolveRouteDescription(route, toolConfig)).toBe("Convert to WebP.");
  });

  it("does not fall back to TOOL_CONFIG for non-tool page types", () => {
    const route = makeRoute({ id: "image-to-webp", pageType: "brand-static" });
    expect(resolveRouteTitle(route, toolConfig)).toBeUndefined();
  });
});

describe("partitionValidationIssues", () => {
  it("splits issues into errors and warnings", () => {
    const { errors, warnings } = partitionValidationIssues([
      { severity: "error", code: "e1", message: "boom" },
      { severity: "warning", code: "w1", message: "hmm" },
      { severity: "error", code: "e2", message: "boom2" },
    ]);
    expect(errors).toHaveLength(2);
    expect(warnings).toHaveLength(1);
  });
});

describe("validateSeo (aggregate)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a deterministically sorted issue list for a fixture with multiple problems", () => {
    const routes: SeoRoute[] = [
      makeRoute({ id: "a", path: "/a", index: true, sitemap: true, title: "Same" }),
      makeRoute({ id: "b", path: "/b", index: true, sitemap: true, title: "Same" }),
      makeRoute({ id: "c", path: "/c", index: false, sitemap: true }),
    ];
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");

    const first = validateSeo({ routes, redirects: [] });
    const second = validateSeo({ routes, redirects: [] });
    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThan(0);

    const codes = first.map((issue) => issue.code);
    expect(codes).toContain("seo/duplicate-title");
    expect(codes).toContain("seo/sitemap-without-index");
  });

  it("produces no errors for the real ROUTES registry and redirect manifest", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    const issues = validateSeo({ routes: ROUTES, redirects: getRedirects() });
    const { errors } = partitionValidationIssues(issues);
    expect(errors).toEqual([]);
  });
});

describe("buildAuditReport", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports resolved canonicals, indexed/excluded routes, and totals with a valid production-like origin", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    vi.stubEnv("SEO_INDEXING_ENABLED", "true");

    const routes: SeoRoute[] = [
      makeRoute({ id: "indexed", path: "/indexed", index: true, sitemap: true, title: "Indexed", description: "Indexed page." }),
      makeRoute({ id: "excluded", path: "/excluded", index: false, sitemap: false, title: "Excluded", description: "Excluded page." }),
    ];

    const report = buildAuditReport({ routes, redirects: [] });

    expect(report.summary.totalRoutes).toBe(2);
    expect(report.summary.indexedRoutes).toBe(1);
    expect(report.summary.sitemapRoutes).toBe(1);
    expect(report.summary.excludedRoutes).toBe(1);
    expect(report.summary.environment.origin).toBe("https://example.com");
    expect(report.summary.environment.isRecognizedProduction).toBe(true);
    expect(report.summary.environment.effectiveIndexingActive).toBe(true);

    const indexed = report.routes.find((r) => r.id === "indexed");
    const excluded = report.routes.find((r) => r.id === "excluded");
    expect(indexed?.canonical).toBe("https://example.com/indexed");
    expect(indexed?.exclusionReason).toBeUndefined();
    expect(excluded?.exclusionReason).toMatch(/not opted in/i);
  });

  it("explains fail-closed exclusion reasons outside a recognized production environment", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    vi.stubEnv("SEO_INDEXING_ENABLED", "true");

    const routes: SeoRoute[] = [
      makeRoute({ id: "wants-index", path: "/wants-index", index: true, sitemap: true, title: "Wants Index", description: "Wants index." }),
    ];

    const report = buildAuditReport({ routes, redirects: [] });
    const entry = report.routes.find((r) => r.id === "wants-index");
    expect(entry?.effectiveIndex).toBe(false);
    expect(entry?.exclusionReason).toMatch(/fail-closed/i);
    expect(entry?.exclusionReason).toMatch(/production/i);
  });

  it("degrades gracefully (no throw) and reports an origin error when NEXT_PUBLIC_APP_URL is unresolvable", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");

    const routes: SeoRoute[] = [
      makeRoute({ id: "a", path: "/a", title: "A", description: "A page." }),
    ];

    const report = buildAuditReport({ routes, redirects: [] });
    expect(report.summary.environment.origin).toBeNull();
    expect(report.summary.environment.originError).toBeTruthy();
    expect(report.routes[0]?.canonical).toBeNull();
    expect(report.errors.some((e) => e.code === "seo/origin-unresolved")).toBe(
      true,
    );
  });

  it("still builds a report when validation fails (report generated even on failure)", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    const routes: SeoRoute[] = [
      makeRoute({ id: "dup", path: "/a", title: "Dup" }),
      makeRoute({ id: "dup", path: "/b", title: "Dup" }),
    ];

    const report = buildAuditReport({ routes, redirects: [] });
    expect(report.errors.length).toBeGreaterThan(0);
    expect(report.summary.totalRoutes).toBe(2);
  });

  it("produces deterministic (sorted) route and issue ordering regardless of input order", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    const routesAsc: SeoRoute[] = [
      makeRoute({ id: "a", path: "/a", title: "A", description: "A page." }),
      makeRoute({ id: "b", path: "/b", title: "B", description: "B page." }),
    ];
    const routesDesc = [...routesAsc].reverse();

    const reportAsc = buildAuditReport({ routes: routesAsc, redirects: [] });
    const reportDesc = buildAuditReport({ routes: routesDesc, redirects: [] });

    expect(reportAsc.routes.map((r) => r.id)).toEqual(["a", "b"]);
    expect(reportDesc.routes.map((r) => r.id)).toEqual(["a", "b"]);
  });
});

describe("renderAuditMarkdown", () => {
  it("renders a human-readable Markdown report with summary, routes, and issues", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    const routes: SeoRoute[] = [
      makeRoute({ id: "a", path: "/a", index: true, sitemap: true, title: "A", description: "A page." }),
    ];
    const report = buildAuditReport({ routes, redirects: [] });
    vi.unstubAllEnvs();

    const markdown = renderAuditMarkdown(report);
    expect(markdown).toMatch(/# SEO Audit Report/);
    expect(markdown).toMatch(/\/a/);
    expect(markdown).toMatch(/Total routes/i);
  });
});

describe("runSeoAudit (report + exit semantics)", () => {
  let tmpDir: string;

  afterEach(async () => {
    vi.unstubAllEnvs();
    if (tmpDir) {
      await fsp.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("writes both JSON and Markdown reports and signals no failures for a clean fixture", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), "seo-audit-test-"));

    const routes: SeoRoute[] = [
      makeRoute({ id: "a", path: "/a", title: "A", description: "A page." }),
    ];

    const result = runSeoAudit({
      routes,
      redirects: [],
      jsonPath: "audit.json",
      markdownPath: "audit.md",
      cwd: tmpDir,
    });

    expect(result.hasFailures).toBe(false);
    const jsonContents = await fsp.readFile(result.jsonPath, "utf8");
    const markdownContents = await fsp.readFile(result.markdownPath, "utf8");
    expect(JSON.parse(jsonContents)).toEqual(result.report);
    expect(markdownContents).toMatch(/# SEO Audit Report/);
  });

  it("signals failures (nonzero-exit semantics) while still writing the report", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), "seo-audit-test-"));

    const routes: SeoRoute[] = [
      makeRoute({ id: "dup", path: "/a", title: "Dup" }),
      makeRoute({ id: "dup", path: "/b", title: "Dup" }),
    ];

    const result = runSeoAudit({
      routes,
      redirects: [],
      jsonPath: "audit.json",
      markdownPath: "audit.md",
      cwd: tmpDir,
    });

    expect(result.hasFailures).toBe(true);
    expect(result.report.errors.length).toBeGreaterThan(0);
    const jsonExists = await fsp
      .access(result.jsonPath)
      .then(() => true)
      .catch(() => false);
    expect(jsonExists).toBe(true);
  });
});
