import { describe, expect, it } from "vitest";

import {
  deriveIntentTitleFromSlug,
  resolveFinalTitle,
  resolveRouteDescription,
  resolveRouteTitle,
  resolveToolIntentTitle,
  type ToolTextConfig,
} from "./content-resolver";
import type { SeoRoute } from "./types";

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

describe("deriveIntentTitleFromSlug", () => {
  it("derives a readable intent phrase from an x-to-y slug", () => {
    expect(deriveIntentTitleFromSlug("image-to-webp")).toBe(
      "Image to WebP Converter",
    );
    expect(deriveIntentTitleFromSlug("heic-to-jpg")).toBe(
      "HEIC to JPG Converter",
    );
    expect(deriveIntentTitleFromSlug("document-to-docx")).toBe(
      "Document to DOCX Converter",
    );
    expect(deriveIntentTitleFromSlug("md-to-pdf")).toBe(
      "Markdown to PDF Converter",
    );
  });

  it("falls back to capitalized segments for unknown tokens", () => {
    expect(deriveIntentTitleFromSlug("foo-to-bar")).toBe("Foo to Bar Converter");
  });
});

describe("resolveToolIntentTitle", () => {
  const toolConfig: ToolTextConfig = {
    "image-to-webp": { title: "WebP", description: "Convert to WebP." },
    "pdf-merge": { title: "PDF Merge", description: "Combine PDFs." },
  };

  it("never returns a bare format label for an x-to-y slug", () => {
    const route = makeRoute({ id: "image-to-webp", pageType: "product-tool" });
    const intent = resolveToolIntentTitle(route, toolConfig);
    expect(intent).toBe("Image to WebP Converter");
    expect(intent).not.toBe("WebP");
  });

  it("uses the raw TOOL_CONFIG title for non x-to-y slugs (already a real intent phrase)", () => {
    const route = makeRoute({ id: "pdf-merge", pageType: "product-tool" });
    expect(resolveToolIntentTitle(route, toolConfig)).toBe("PDF Merge");
  });

  it("lets a route-authored title override win outright", () => {
    const route = makeRoute({
      id: "image-to-webp",
      pageType: "product-tool",
      title: "Custom Authored Title",
    });
    expect(resolveToolIntentTitle(route, toolConfig)).toBe(
      "Custom Authored Title",
    );
  });

  it("returns undefined for non-product-tool routes", () => {
    const route = makeRoute({ id: "image-to-webp", pageType: "brand-static" });
    expect(resolveToolIntentTitle(route, toolConfig)).toBeUndefined();
  });
});

describe("resolveRouteTitle (raw source text for required-field checks)", () => {
  const toolConfig: ToolTextConfig = {
    "image-to-webp": { title: "WebP", description: "Convert to WebP." },
  };

  it("still returns the raw TOOL_CONFIG label, not a derived intent phrase", () => {
    const route = makeRoute({ id: "image-to-webp", pageType: "product-tool" });
    expect(resolveRouteTitle(route, toolConfig)).toBe("WebP");
  });
});

describe("resolveFinalTitle (single composition path for metadata + audit)", () => {
  const toolConfig: ToolTextConfig = {
    "image-to-webp": { title: "WebP", description: "Convert to WebP." },
    "pdf-merge": { title: "PDF Merge", description: "Combine PDFs." },
  };

  it("composes '{intent} | Fileora by ZolvStack' exactly once for product-tool routes", () => {
    const route = makeRoute({ id: "image-to-webp", pageType: "product-tool" });
    expect(resolveFinalTitle(route, toolConfig)).toBe(
      "Image to WebP Converter | Fileora by ZolvStack",
    );
  });

  it("treats a product-tool route.title override as the INTENT title and still composes the brand suffix once", () => {
    const route = makeRoute({
      id: "image-to-webp",
      pageType: "product-tool",
      title: "Convert Images to WebP Free",
    });
    // route.title is the intent phrase, NOT an already-branded final string.
    expect(resolveFinalTitle(route, toolConfig)).toBe(
      "Convert Images to WebP Free | Fileora by ZolvStack",
    );
    expect(resolveFinalTitle(route, toolConfig)).not.toMatch(
      /ZolvStack \| Fileora by ZolvStack|Fileora by ZolvStack \| Fileora/,
    );
  });

  it("returns already-authored brand titles as-is for non-tool page types", () => {
    const route = makeRoute({
      id: "about",
      pageType: "brand-static",
      title: "About | ZolvStack",
    });
    expect(resolveFinalTitle(route, toolConfig)).toBe("About | ZolvStack");
  });

  it("returns undefined when a product-tool has no route title and no TOOL_CONFIG fallback", () => {
    const route = makeRoute({
      id: "unknown-tool",
      pageType: "product-tool",
    });
    // Final title must not invent a title from the slug alone when there is
    // no authored source — required-field validation stays authoritative.
    expect(resolveRouteTitle(route, toolConfig)).toBeUndefined();
    expect(resolveFinalTitle(route, toolConfig)).toBeUndefined();
  });
});

describe("resolveRouteDescription (prefers longDesc for tool fallback)", () => {
  it("prefers longDesc over the short description when both are present", () => {
    const toolConfig: ToolTextConfig = {
      "image-to-webp": {
        title: "WebP",
        description: "JPG, PNG, AVIF, BMP, TIFF, GIF",
        longDesc:
          "Convert any image to WebP format and reduce file size by up to 80% without losing quality.",
      },
    };
    const route = makeRoute({ id: "image-to-webp", pageType: "product-tool" });
    expect(resolveRouteDescription(route, toolConfig)).toBe(
      "Convert any image to WebP format and reduce file size by up to 80% without losing quality.",
    );
  });

  it("falls back to the short description when longDesc is absent", () => {
    const toolConfig: ToolTextConfig = {
      "image-to-webp": { title: "WebP", description: "Convert to WebP." },
    };
    const route = makeRoute({ id: "image-to-webp", pageType: "product-tool" });
    expect(resolveRouteDescription(route, toolConfig)).toBe(
      "Convert to WebP.",
    );
  });

  it("prefers a route-level description override over any TOOL_CONFIG fallback", () => {
    const toolConfig: ToolTextConfig = {
      "image-to-webp": { longDesc: "Long description." },
    };
    const route = makeRoute({
      id: "image-to-webp",
      pageType: "product-tool",
      description: "Route-authored description.",
    });
    expect(resolveRouteDescription(route, toolConfig)).toBe(
      "Route-authored description.",
    );
  });
});
