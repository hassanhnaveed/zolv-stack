import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { buildMetadataForRoute, buildRootMetadata } from "./metadata";
import { ROUTE_IDS, type RouteId } from "./routes";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe("App Router metadata migration", () => {
  it("uses the centralized ZolvStack root metadata without legacy inline schema", async () => {
    const rootLayoutModule = await import("../../app/layout");
    const rootSource = await readFile(
      path.join(projectRoot, "app/layout.tsx"),
      "utf8",
    );

    expect(rootLayoutModule.metadata).toEqual(buildRootMetadata());
    expect(rootLayoutModule.metadata.title).toEqual({
      default: expect.stringContaining("ZolvStack"),
      template: expect.stringContaining("ZolvStack"),
    });
    expect(JSON.stringify(rootLayoutModule.metadata.title)).not.toContain(
      "Fileora",
    );
    expect(rootSource).not.toContain("application/ld+json");
    expect(rootSource).not.toContain("aggregateRating");
    expect(rootSource).not.toContain("fileora.netlify.app");
  });

  const staticPages: ReadonlyArray<{
    id: RouteId;
    load: () => Promise<{ metadata?: unknown }>;
  }> = [
    { id: ROUTE_IDS.ABOUT, load: () => import("../../app/about/page") },
    { id: ROUTE_IDS.PRODUCTS, load: () => import("../../app/(zolvstack)/products/page") },
    { id: ROUTE_IDS.CONTACT, load: () => import("../../app/contact/page") },
    { id: ROUTE_IDS.SECURITY, load: () => import("../../app/security/page") },
    { id: ROUTE_IDS.PRIVACY, load: () => import("../../app/privacy/page") },
    { id: ROUTE_IDS.TERMS, load: () => import("../../app/terms/page") },
  ];

  it.each(staticPages)(
    "exports registry metadata for $id",
    async ({ id, load }) => {
      const pageModule = await load();
      expect(pageModule.metadata).toEqual(buildMetadataForRoute(id));
    },
  );

  it("keeps the home page with home metadata and JSON-LD", async () => {
    const { default: ZolvStackHomePage, metadata } = await import(
      "../../app/(zolvstack)/page"
    );
    const markup = renderToStaticMarkup(<ZolvStackHomePage />);

    expect(metadata).toEqual(buildMetadataForRoute(ROUTE_IDS.HOME));
    expect(markup).toContain('type="application/ld+json"');
    expect(markup).toContain("ZolvStack");
    expect(markup).not.toContain("aggregateRating");
  });
});
