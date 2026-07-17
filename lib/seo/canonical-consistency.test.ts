import type { Metadata } from "next";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  absoluteUrl,
  buildJsonLdForRoute,
  buildMetadataForRoute,
  getRoute,
} from "./index";
import { ROUTE_IDS, type RouteId } from "./routes";

type MetadataModule = { metadata: Metadata };

const routeModules: ReadonlyArray<{
  id: RouteId;
  load: () => Promise<MetadataModule>;
}> = [
  {
    id: ROUTE_IDS.HOME,
    load: () => import("../../app/(zolvstack)/layout"),
  },
  {
    id: ROUTE_IDS.FILEORA_HUB,
    load: () => import("../../app/(marketing)/fileora/page"),
  },
  {
    id: "image-to-webp",
    load: () =>
      import(
        "../../app/(marketing)/fileora/(tools)/image-to-webp/page"
      ),
  },
];

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (!value || typeof value !== "object") return [];
  return Object.values(value as Record<string, unknown>).flatMap(collectStrings);
}

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe("canonical consistency across migrated route modules", () => {
  it.each(routeModules)(
    "keeps metadata, social cards, JSON-LD URLs, and breadcrumbs aligned for $id",
    async ({ id, load }) => {
      const pageModule = await load();
      const expectedMetadata = buildMetadataForRoute(id);
      const graph = buildJsonLdForRoute(id);
      const canonical = expectedMetadata.alternates?.canonical;

      expect(pageModule.metadata).toEqual(expectedMetadata);
      expect(canonical).toBe(absoluteUrl(getRoute(id).path));
      expect(expectedMetadata.openGraph?.url).toBe(canonical);
      expect(expectedMetadata.twitter?.title).toBe(
        expectedMetadata.openGraph?.title,
      );
      expect(expectedMetadata.twitter?.description).toBe(
        expectedMetadata.openGraph?.description,
      );
      expect(expectedMetadata.twitter?.images).toEqual(
        expectedMetadata.openGraph?.images,
      );

      const graphStrings = collectStrings(graph);
      expect(graphStrings).toContain(canonical);
      expect(
        graph["@graph"]
          .filter((node) => node["@type"] === "BreadcrumbList")
          .flatMap((node) =>
            (node.itemListElement as Array<{ item?: string }> | undefined) ??
            [],
          )
          .every((item) => item.item?.startsWith("https://example.com")),
      ).toBe(true);
    },
  );
});
