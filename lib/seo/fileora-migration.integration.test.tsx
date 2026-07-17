import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Metadata } from "next";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { JsonLd } from "../../components/seo/JsonLd";
import { ToolPage } from "../../components/tools/ToolPage";
import { buildJsonLdForRoute, buildMetadataForRoute } from "./index";
import { ROUTE_IDS, ROUTES, type RouteId } from "./routes";

type PageModule = {
  default: () => ReactElement;
  metadata?: Metadata;
};

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const toolPageLoaders: Record<string, () => Promise<PageModule>> = {
  "document-to-docx": () =>
    import("../../app/(marketing)/fileora/(tools)/document-to-docx/page"),
  "document-to-html": () =>
    import("../../app/(marketing)/fileora/(tools)/document-to-html/page"),
  "document-to-odt": () =>
    import("../../app/(marketing)/fileora/(tools)/document-to-odt/page"),
  "document-to-pdf": () =>
    import("../../app/(marketing)/fileora/(tools)/document-to-pdf/page"),
  "document-to-rtf": () =>
    import("../../app/(marketing)/fileora/(tools)/document-to-rtf/page"),
  "document-to-txt": () =>
    import("../../app/(marketing)/fileora/(tools)/document-to-txt/page"),
  "heic-to-jpg": () =>
    import("../../app/(marketing)/fileora/(tools)/heic-to-jpg/page"),
  "image-enhance": () =>
    import("../../app/(marketing)/fileora/(tools)/image-enhance/page"),
  "image-to-avif": () =>
    import("../../app/(marketing)/fileora/(tools)/image-to-avif/page"),
  "image-to-bmp": () =>
    import("../../app/(marketing)/fileora/(tools)/image-to-bmp/page"),
  "image-to-gif": () =>
    import("../../app/(marketing)/fileora/(tools)/image-to-gif/page"),
  "image-to-jpg": () =>
    import("../../app/(marketing)/fileora/(tools)/image-to-jpg/page"),
  "image-to-pdf": () =>
    import("../../app/(marketing)/fileora/(tools)/image-to-pdf/page"),
  "image-to-png": () =>
    import("../../app/(marketing)/fileora/(tools)/image-to-png/page"),
  "image-to-tiff": () =>
    import("../../app/(marketing)/fileora/(tools)/image-to-tiff/page"),
  "image-to-webp": () =>
    import("../../app/(marketing)/fileora/(tools)/image-to-webp/page"),
  "md-to-pdf": () =>
    import("../../app/(marketing)/fileora/(tools)/md-to-pdf/page"),
  "pdf-compress": () =>
    import("../../app/(marketing)/fileora/(tools)/pdf-compress/page"),
  "pdf-merge": () =>
    import("../../app/(marketing)/fileora/(tools)/pdf-merge/page"),
  "pdf-split": () =>
    import("../../app/(marketing)/fileora/(tools)/pdf-split/page"),
  "pdf-to-jpg": () =>
    import("../../app/(marketing)/fileora/(tools)/pdf-to-jpg/page"),
  "pdf-to-txt": () =>
    import("../../app/(marketing)/fileora/(tools)/pdf-to-txt/page"),
  "remove-bg": () =>
    import("../../app/(marketing)/fileora/(tools)/remove-bg/page"),
};

function childElements(element: ReactElement): ReactElement[] {
  const children = (element.props as { children?: ReactNode }).children;
  return Children.toArray(children).filter(isValidElement);
}

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe("Fileora centralized SEO route migration", () => {
  it("migrates the hub to a server page with one centralized graph", async () => {
    const source = await readFile(
      path.join(projectRoot, "app/(marketing)/fileora/page.tsx"),
      "utf8",
    );

    expect(source).not.toContain('"use client"');
    expect(source).not.toContain("application/ld+json");

    const pageModule = (await import(
      "../../app/(marketing)/fileora/page"
    )) as PageModule;
    const page = pageModule.default();
    const jsonLdElements = childElements(page).filter(
      (child) => child.type === JsonLd,
    );

    expect(pageModule.metadata).toEqual(
      buildMetadataForRoute(ROUTE_IDS.FILEORA_HUB),
    );
    expect(jsonLdElements).toHaveLength(1);
    expect(jsonLdElements[0].props).toEqual({
      data: buildJsonLdForRoute(ROUTE_IDS.FILEORA_HUB),
    });
  });

  it("migrates every registered tool route and preserves route/component association", async () => {
    const registeredTools = ROUTES.filter(
      (route) => route.pageType === "product-tool",
    );
    const modulesBySlug = new Map(
      await Promise.all(
        Object.entries(toolPageLoaders).map(async ([slug, load]) => [
          slug as RouteId,
          await load(),
        ] as const),
      ),
    );

    expect([...modulesBySlug.keys()].sort()).toEqual(
      registeredTools.map((route) => route.id).sort(),
    );

    for (const route of registeredTools) {
      const routeId = route.id as RouteId;
      const pageModule = modulesBySlug.get(routeId);
      expect(pageModule, `missing page module for ${route.id}`).toBeDefined();
      if (!pageModule) continue;

      const page = pageModule.default();
      const children = childElements(page);
      const jsonLdElements = children.filter((child) => child.type === JsonLd);
      const toolPageElements = children.filter(
        (child) => child.type === ToolPage,
      );

      expect(pageModule.metadata, `${route.id} metadata`).toEqual(
        buildMetadataForRoute(routeId),
      );
      expect(jsonLdElements, `${route.id} JSON-LD count`).toHaveLength(1);
      expect(jsonLdElements[0].props, `${route.id} JSON-LD route`).toEqual({
        data: buildJsonLdForRoute(routeId),
      });

      if (toolPageElements.length > 0) {
        expect(toolPageElements, `${route.id} ToolPage count`).toHaveLength(1);
        expect(toolPageElements[0].props).toMatchObject({ slug: route.id });
      } else {
        expect(["image-enhance", "remove-bg"]).toContain(route.id);
      }
    }
  });

  it("removes legacy client schema and hard-coded production hosts from ToolPage", async () => {
    const source = await readFile(
      path.join(projectRoot, "components/tools/ToolPage.tsx"),
      "utf8",
    );

    expect(source).not.toContain("application/ld+json");
    expect(source).not.toContain("breadcrumbSchema");
    expect(source).not.toContain("softwareSchema");
    expect(source).not.toContain("fileora.com");
  });
});
