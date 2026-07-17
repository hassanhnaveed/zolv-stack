import { describe, expect, it } from "vitest";

import {
  deriveIntentTitleFromSlug,
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

describe("resolveRouteTitle (unchanged raw resolution, still used by validators)", () => {
  const toolConfig: ToolTextConfig = {
    "image-to-webp": { title: "WebP", description: "Convert to WebP." },
  };

  it("still returns the raw TOOL_CONFIG label, not a derived intent phrase", () => {
    const route = makeRoute({ id: "image-to-webp", pageType: "product-tool" });
    expect(resolveRouteTitle(route, toolConfig)).toBe("WebP");
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
