import { afterEach, describe, expect, it, vi } from "vitest";

import { absoluteUrl } from "./url";
import { resolveOgImages } from "./og";
import { buildMetadataForRoute, buildRootMetadata } from "./metadata";
import type { SeoRoute } from "./types";

function stubOrigin(origin = "https://example.com") {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", origin);
}

describe("buildRootMetadata", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sets metadataBase from getSiteOrigin and a Next title default + template for layout inheritance", () => {
    stubOrigin();
    const metadata = buildRootMetadata();
    expect(metadata.metadataBase).toEqual(new URL("https://example.com"));
    expect(metadata.title).toEqual({
      default: "ZolvStack — Fast, Private Tools for Everyday Work",
      template: "%s | ZolvStack",
    });
  });

  it("keeps OG/Twitter titles as the plain final home title string", () => {
    stubOrigin();
    const metadata = buildRootMetadata();
    expect(metadata.openGraph?.title).toBe(
      "ZolvStack — Fast, Private Tools for Everyday Work",
    );
    expect(metadata.twitter?.title).toBe(
      "ZolvStack — Fast, Private Tools for Everyday Work",
    );
  });

  it("sets the canonical to the home route's absolute URL, never a request URL", () => {
    stubOrigin();
    const metadata = buildRootMetadata();
    expect(metadata.alternates?.canonical).toBe(absoluteUrl("/"));
  });

  it("uses the ZolvStack default OG image for the root brand page", () => {
    stubOrigin();
    const metadata = buildRootMetadata();
    const ogImages = metadata.openGraph?.images;
    expect(Array.isArray(ogImages)).toBe(true);
    const first = (ogImages as Array<{ url: string; alt?: string }>)[0];
    expect(first.url).toContain("/og/zolvstack-default");
    expect(first.alt).toMatch(/zolvstack/i);
  });

  it("does not set keywords when the route has none configured", () => {
    stubOrigin();
    const metadata = buildRootMetadata();
    expect(metadata.keywords).toBeUndefined();
  });
});

describe("buildMetadataForRoute — tool title pattern", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns an absolute title so the root template cannot double-suffix the composed brand title", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("image-to-webp");
    expect(metadata.title).toEqual({
      absolute: "Image to WebP Converter | Fileora by ZolvStack",
    });
    expect(metadata.openGraph?.title).toBe(
      "Image to WebP Converter | Fileora by ZolvStack",
    );
    expect(metadata.twitter?.title).toBe(
      "Image to WebP Converter | Fileora by ZolvStack",
    );
  });

  it("matches '{intent} | Fileora by ZolvStack' and never the bare TOOL_CONFIG label", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("image-to-webp");
    const absolute =
      typeof metadata.title === "object" && metadata.title !== null
        ? (metadata.title as { absolute?: string }).absolute
        : undefined;
    expect(absolute).toBe("Image to WebP Converter | Fileora by ZolvStack");
    expect(absolute).not.toBe("WebP");
    expect(absolute?.endsWith("| Fileora by ZolvStack")).toBe(true);
  });

  it("still produces a real intent phrase for tool slugs whose TOOL_CONFIG title is already multi-word", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("pdf-merge");
    expect(metadata.title).toEqual({
      absolute: "PDF Merge | Fileora by ZolvStack",
    });
  });
});

describe("buildMetadataForRoute — canonical + alternates", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds a self-referencing canonical + en/x-default alternates from the route registry", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("fileora-hub");
    const expectedCanonical = absoluteUrl("/fileora");
    expect(metadata.alternates?.canonical).toBe(expectedCanonical);
    expect(metadata.alternates?.languages?.en).toBe(expectedCanonical);
    expect(metadata.alternates?.languages?.["x-default"]).toBe(
      expectedCanonical,
    );
  });

  it("never derives the canonical from anything other than the route path", () => {
    stubOrigin("https://real-domain.example");
    const metadata = buildMetadataForRoute("about");
    expect(metadata.alternates?.canonical).toBe(
      "https://real-domain.example/about",
    );
  });
});

describe("buildMetadataForRoute — effective robots (fail-closed)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is noindex for a tool route outside a recognized production environment, follow stays true", () => {
    vi.stubEnv("NODE_ENV", "test");
    stubOrigin();
    const metadata = buildMetadataForRoute("image-to-webp");
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it("is noindex for the home route (declared index:true) when indexing is not effectively enabled", () => {
    vi.stubEnv("NODE_ENV", "test");
    stubOrigin();
    const metadata = buildRootMetadata();
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it("is indexable for the home route only in a recognized production environment with indexing explicitly enabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SEO_INDEXING_ENABLED", "true");
    stubOrigin();
    const metadata = buildRootMetadata();
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it("stays noindex in production when SEO_INDEXING_ENABLED is not explicitly true (fail-closed)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SEO_INDEXING_ENABLED", "false");
    stubOrigin();
    const metadata = buildRootMetadata();
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });
});

describe("buildMetadataForRoute — OG/Twitter parity from one normalized object", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps openGraph.url equal to the canonical", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("about");
    expect(metadata.openGraph?.url).toBe(metadata.alternates?.canonical);
  });

  it("never lets twitter title/description/images silently diverge from openGraph", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("image-to-webp");
    expect(metadata.twitter?.title).toBe(metadata.openGraph?.title);
    expect(metadata.twitter?.description).toBe(
      metadata.openGraph?.description,
    );
    expect(metadata.twitter?.images).toEqual(metadata.openGraph?.images);
  });

  it("uses summary_large_image as the Twitter card type", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("about");
    const twitter = metadata.twitter as { card?: string } | null | undefined;
    expect(twitter?.card).toBe("summary_large_image");
  });

  it("sets locale to en_US and a brand-aware siteName for root vs product pages", () => {
    stubOrigin();
    const rootMetadata = buildRootMetadata();
    const toolMetadata = buildMetadataForRoute("image-to-webp");

    expect(rootMetadata.openGraph?.locale).toBe("en_US");
    expect(rootMetadata.openGraph?.siteName).toBe("ZolvStack");

    expect(toolMetadata.openGraph?.locale).toBe("en_US");
    expect(toolMetadata.openGraph?.siteName).toBe("Fileora by ZolvStack");
  });
});

describe("buildMetadataForRoute — image type/dimensions/version", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("emits a 1200x630 image with a MIME type and a versioned absolute URL", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("image-to-webp");
    const images = metadata.openGraph?.images as Array<{
      url: string;
      width?: string | number;
      height?: string | number;
      type?: string;
      alt?: string;
    }>;
    expect(images).toHaveLength(1);
    const [image] = images;
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
    expect(image.type).toBeTruthy();
    expect(image.url.startsWith("https://example.com/")).toBe(true);
    expect(image.url).toMatch(/\?v=seo1$/);
  });

  it("requires a meaningful alt, never a generic placeholder", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("fileora-hub");
    const images = metadata.openGraph?.images as Array<{ alt?: string }>;
    const alt = images[0]?.alt ?? "";
    expect(alt.length).toBeGreaterThan(5);
    expect(["image", "logo", "preview"]).not.toContain(alt.toLowerCase());
  });
});

describe("buildMetadataForRoute — fallback hierarchy (root -> product -> route overrides)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the product default OG image for the Fileora hub (no per-route override)", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("fileora-hub");
    const images = metadata.openGraph?.images as Array<{ url: string }>;
    expect(images[0]?.url).toContain("/og/fileora-default");
  });

  it("uses the ZolvStack root default OG image for a brand-static page", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("about");
    const images = metadata.openGraph?.images as Array<{ url: string }>;
    expect(images[0]?.url).toContain("/og/zolvstack-default");
  });

  it("prefers the substantive longDesc-backed description over the short TOOL_CONFIG label list", () => {
    stubOrigin();
    const metadata = buildMetadataForRoute("image-to-webp");
    expect(metadata.description).toMatch(/webp format/i);
    expect((metadata.description as string).length).toBeGreaterThan(40);
  });
});

describe("resolveOgImages — immutable, multi-image-ready array", () => {
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

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a frozen (immutable) array", () => {
    stubOrigin();
    const images = resolveOgImages(makeRoute({}));
    expect(Object.isFrozen(images)).toBe(true);
    expect(() => {
      (images as unknown as unknown[]).push({});
    }).toThrow();
  });

  it("emits exactly one primary image today, but the return type is already an array for future multi-image support", () => {
    stubOrigin();
    const images = resolveOgImages(makeRoute({}));
    expect(images).toHaveLength(1);
  });

  it("honors an explicit per-route ogImage override ahead of any default", () => {
    stubOrigin();
    const override = {
      url: "https://example.com/custom-og.png",
      width: 1200,
      height: 630,
      alt: "A meaningful custom description of this page",
    };
    const images = resolveOgImages(makeRoute({ ogImage: override }));
    expect(images).toEqual([override]);
    // Deep-freeze the returned image object without mutating route config.
    expect(Object.isFrozen(images[0])).toBe(true);
    expect(Object.isFrozen(override)).toBe(false);
  });
});

describe("index enabled/disabled safely with env stubs", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws / fails fast when NEXT_PUBLIC_APP_URL is unset (builders require a resolvable origin)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SEO_INDEXING_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(() => buildRootMetadata()).toThrow();
  });

  it("flips index to true only when every fail-closed condition is simultaneously satisfied", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SEO_INDEXING_ENABLED", "true");
    stubOrigin();
    expect(buildRootMetadata().robots).toMatchObject({ index: true });

    vi.stubEnv("SEO_INDEXING_ENABLED", "false");
    expect(buildRootMetadata().robots).toMatchObject({ index: false });
  });
});
