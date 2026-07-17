import { afterEach, describe, expect, it, vi } from "vitest";

import { PATHS, ROUTE_IDS, ROUTES } from "../routes";
import type { SeoRoute } from "../types";
import { absoluteUrl } from "../url";

import { buildFaqPageNode } from "./faq";
import {
  breadcrumbListId,
  fileoraWebApplicationId,
  logoImageId,
  organizationId,
  softwareApplicationId,
  webPageId,
  websiteId,
} from "./entities";
import { buildJsonLdForRoute } from "./graph";
import { prune } from "./prune";
import type { JsonLdGraph, JsonLdNode } from "./types";

function stubOrigin(origin = "https://example.com") {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", origin);
}

function nodesOfType(graph: JsonLdGraph, type: string): JsonLdNode[] {
  return graph["@graph"].filter((node) => node["@type"] === type);
}

function findNode(graph: JsonLdGraph, type: string): JsonLdNode | undefined {
  return nodesOfType(graph, type)[0];
}

function asRef(value: unknown): string | undefined {
  if (value && typeof value === "object" && "@id" in value) {
    return (value as { "@id": string })["@id"];
  }
  return undefined;
}

/** Recursively collects every path in `value` whose leaf is empty
 * (undefined/null/""/[]/{}). Used to assert a built graph never emits an
 * empty property (prune must have removed it upstream). */
function collectEmptyPaths(value: unknown, path = "root"): string[] {
  if (value === undefined || value === null || value === "") return [path];
  if (Array.isArray(value)) {
    if (value.length === 0) return [path];
    return value.flatMap((item, index) =>
      collectEmptyPaths(item, `${path}[${index}]`),
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return [path];
    return entries.flatMap(([key, val]) =>
      collectEmptyPaths(val, `${path}.${key}`),
    );
  }
  return [];
}

function makeToolRoute(overrides: Partial<SeoRoute> = {}): SeoRoute {
  return {
    id: "fixture-tool",
    path: "/fileora/fixture-tool",
    product: "fileora",
    pageType: "product-tool",
    title: "Fixture Tool Converter",
    description: "Convert fixtures for testing purposes only.",
    index: false,
    sitemap: false,
    follow: true,
    ...overrides,
  };
}

describe("buildJsonLdForRoute — single @graph shape (every registered route)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns exactly one @context + @graph object for every registered route", () => {
    stubOrigin();
    for (const route of ROUTES) {
      const graph = buildJsonLdForRoute(route.id as never);
      expect(Object.keys(graph).sort()).toEqual(["@context", "@graph"]);
      expect(graph["@context"]).toBe("https://schema.org");
      expect(Array.isArray(graph["@graph"])).toBe(true);
      expect(graph["@graph"].length).toBeGreaterThan(0);
    }
  });
});

describe("buildJsonLdForRoute — brand home", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("includes Organization, canonical logo ImageObject, WebSite, and WebPage", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute(ROUTE_IDS.HOME);

    const organization = findNode(graph, "Organization");
    const logo = findNode(graph, "ImageObject");
    const website = findNode(graph, "WebSite");
    const webPage = findNode(graph, "WebPage");

    expect(organization?.["@id"]).toBe(organizationId());
    expect(logo?.["@id"]).toBe(logoImageId());
    expect(website?.["@id"]).toBe(websiteId());
    expect(webPage?.["@id"]).toBe(webPageId(PATHS.HOME));

    expect(asRef(organization?.logo)).toBe(logoImageId());
    expect(asRef(webPage?.isPartOf)).toBe(websiteId());
  });

  it("never emits a BreadcrumbList for the home page", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute(ROUTE_IDS.HOME);
    expect(nodesOfType(graph, "BreadcrumbList")).toHaveLength(0);
  });
});

describe("buildJsonLdForRoute — brand-static / legal", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("includes Organization (shared @id), WebPage, and a 2-item BreadcrumbList", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute(ROUTE_IDS.ABOUT);

    const organization = findNode(graph, "Organization");
    const webPage = findNode(graph, "WebPage");
    const breadcrumb = findNode(graph, "BreadcrumbList");

    expect(organization?.["@id"]).toBe(organizationId());
    expect(webPage?.["@id"]).toBe(webPageId(PATHS.ABOUT));
    expect(breadcrumb?.["@id"]).toBe(breadcrumbListId(PATHS.ABOUT));

    const items = breadcrumb?.itemListElement as Array<{
      position: number;
      item: string;
      name: string;
    }>;
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.position)).toEqual([1, 2]);
    for (const item of items) {
      expect(item.item.startsWith("https://example.com")).toBe(true);
    }
    expect(items[0].name).toBe("Home");
  });

  it("does not redefine the shared logo ImageObject or WebSite node on static pages", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute(ROUTE_IDS.PRIVACY);
    expect(nodesOfType(graph, "ImageObject")).toHaveLength(0);
    expect(nodesOfType(graph, "WebSite")).toHaveLength(0);
  });
});

describe("buildJsonLdForRoute — Fileora hub (product-hub -> CollectionPage)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses CollectionPage (a WebPage subtype) whose mainEntity is the Fileora WebApplication", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute(ROUTE_IDS.FILEORA_HUB);

    const collectionPage = findNode(graph, "CollectionPage");
    const webApp = findNode(graph, "WebApplication");

    expect(collectionPage?.["@id"]).toBe(webPageId(PATHS.FILEORA));
    expect(webApp?.["@id"]).toBe(fileoraWebApplicationId());
    expect(asRef(collectionPage?.mainEntity)).toBe(fileoraWebApplicationId());
  });

  it("includes Organization + WebSite full nodes and a 2-item breadcrumb (Home -> Fileora)", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute(ROUTE_IDS.FILEORA_HUB);

    expect(findNode(graph, "Organization")?.["@id"]).toBe(organizationId());
    expect(findNode(graph, "WebSite")?.["@id"]).toBe(websiteId());

    const breadcrumb = findNode(graph, "BreadcrumbList");
    const items = breadcrumb?.itemListElement as Array<{
      position: number;
      item: string;
      name: string;
    }>;
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.position)).toEqual([1, 2]);
    expect(items[1].name).toMatch(/fileora/i);
  });

  it("gives the Fileora WebApplication accurate, non-fabricated fields only", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute(ROUTE_IDS.FILEORA_HUB);
    const webApp = findNode(graph, "WebApplication");

    expect(webApp?.operatingSystem).toBe("Web");
    expect(webApp?.applicationCategory).toBeTruthy();
    expect(webApp?.offers).toMatchObject({
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    });
    expect(asRef(webApp?.provider)).toBe(organizationId());
    expect(webApp).not.toHaveProperty("aggregateRating");
    expect(webApp).not.toHaveProperty("review");
  });
});

describe("buildJsonLdForRoute — product tool", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("gives the WebPage a mainEntity pointing to the SoftwareApplication, and vice versa (mainEntityOfPage)", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute("image-to-webp");

    const webPage = findNode(graph, "WebPage");
    const softwareApp = findNode(graph, "SoftwareApplication");

    expect(webPage?.["@id"]).toBe(webPageId("/fileora/image-to-webp"));
    expect(softwareApp?.["@id"]).toBe(
      softwareApplicationId("/fileora/image-to-webp"),
    );

    expect(asRef(webPage?.mainEntity)).toBe(softwareApp?.["@id"]);
    expect(asRef(softwareApp?.mainEntityOfPage)).toBe(webPage?.["@id"]);
  });

  it("references (not redefines) Organization / WebSite / Fileora WebApplication on tool pages", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute("image-to-webp");

    expect(nodesOfType(graph, "Organization")).toHaveLength(0);
    expect(nodesOfType(graph, "WebSite")).toHaveLength(0);
    expect(nodesOfType(graph, "WebApplication")).toHaveLength(0);

    const webPage = findNode(graph, "WebPage");
    const softwareApp = findNode(graph, "SoftwareApplication");

    expect(asRef(webPage?.publisher)).toBe(organizationId());
    expect(asRef(webPage?.isPartOf)).toBe(websiteId());
    expect(asRef(softwareApp?.isPartOf)).toBe(fileoraWebApplicationId());
    expect(asRef(softwareApp?.provider)).toBe(organizationId());
  });

  it("emits a 3-item, contiguous, absolute-URL breadcrumb: Home -> Fileora -> Tool", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute("image-to-webp");
    const breadcrumb = findNode(graph, "BreadcrumbList");
    const items = breadcrumb?.itemListElement as Array<{
      position: number;
      item: string;
      name: string;
    }>;

    expect(items).toHaveLength(3);
    expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(items[0]).toMatchObject({ name: "Home", item: absoluteUrl("/") });
    expect(items[1].item).toBe(absoluteUrl(PATHS.FILEORA));
    expect(items[2].item).toBe(absoluteUrl("/fileora/image-to-webp"));
    for (const item of items) {
      expect(item.item.startsWith("https://example.com")).toBe(true);
    }
  });

  it("gives the tool SoftwareApplication accurate, non-fabricated fields only", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute("image-to-webp");
    const softwareApp = findNode(graph, "SoftwareApplication");

    expect(softwareApp?.operatingSystem).toBe("Web");
    expect(softwareApp?.applicationCategory).toBeTruthy();
    expect(softwareApp?.offers).toMatchObject({
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    });
    expect(softwareApp).not.toHaveProperty("aggregateRating");
    expect(softwareApp).not.toHaveProperty("review");
  });

  it("still returns full, accurate schema for a route that is currently noindex", () => {
    stubOrigin();
    const route = ROUTES.find((r) => r.id === "image-to-webp");
    expect(route?.index).toBe(false);

    const graph = buildJsonLdForRoute("image-to-webp");
    expect(findNode(graph, "WebPage")).toBeTruthy();
    expect(findNode(graph, "SoftwareApplication")).toBeTruthy();
  });

  it("omits FAQPage entirely when the route has no real FAQ content", () => {
    stubOrigin();
    const graph = buildJsonLdForRoute("image-to-webp");
    expect(nodesOfType(graph, "FAQPage")).toHaveLength(0);
  });
});

describe("shared entity ids — reused exactly, never rebuilt", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves the same organization/website ids regardless of which route computes them", () => {
    stubOrigin();
    expect(organizationId()).toBe(organizationId());
    expect(websiteId()).toBe(websiteId());

    const homeGraph = buildJsonLdForRoute(ROUTE_IDS.HOME);
    const toolGraph = buildJsonLdForRoute("image-to-webp");

    const homeOrg = findNode(homeGraph, "Organization");
    const toolWebPage = findNode(toolGraph, "WebPage");

    expect(homeOrg?.["@id"]).toBe(asRef(toolWebPage?.publisher));
  });

  it("derives every id from the configured origin via absoluteUrl, never a hard-coded host", () => {
    stubOrigin("https://another-example.test");
    expect(organizationId().startsWith("https://another-example.test")).toBe(
      true,
    );
    expect(
      softwareApplicationId("/fileora/image-to-webp").startsWith(
        "https://another-example.test",
      ),
    ).toBe(true);
  });
});

describe("no fabricated data anywhere in the built graphs", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("never emits aggregateRating, review, or invented search/social actions for any registered route", () => {
    stubOrigin();
    for (const route of ROUTES) {
      const graph = buildJsonLdForRoute(route.id as never);
      const serialized = JSON.stringify(graph);
      expect(serialized).not.toMatch(/aggregateRating/i);
      expect(serialized).not.toMatch(/"review"/i);
      expect(serialized).not.toMatch(/potentialAction/i);
      expect(serialized).not.toMatch(/sameAs/i);
    }
  });
});

describe("no empty properties anywhere in the built graphs", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("never emits undefined/null/empty-string/empty-array/empty-object values", () => {
    stubOrigin();
    for (const route of ROUTES) {
      const graph = buildJsonLdForRoute(route.id as never);
      expect(collectEmptyPaths(graph)).toEqual([]);
    }
  });
});

describe("prune — recursive empty removal, preserving 0/false", () => {
  it("strips undefined, null, empty strings, empty arrays, and empty objects at every depth", () => {
    const input = {
      keep: "value",
      dropUndefined: undefined,
      dropNull: null,
      dropEmptyString: "",
      dropEmptyArray: [],
      dropEmptyObject: {},
      nested: {
        keep: "nested value",
        dropUndefined: undefined,
        list: [1, "", { a: undefined, b: "b" }, {}],
      },
    };

    expect(prune(input)).toEqual({
      keep: "value",
      nested: {
        keep: "nested value",
        list: [1, { b: "b" }],
      },
    });
  });

  it("preserves falsy-but-meaningful 0 and false at every depth", () => {
    const input = {
      zero: 0,
      falseFlag: false,
      nested: { zero: 0, falseFlag: false },
      list: [0, false, ""],
    };

    expect(prune(input)).toEqual({
      zero: 0,
      falseFlag: false,
      nested: { zero: 0, falseFlag: false },
      list: [0, false],
    });
  });
});

describe("buildFaqPageNode — real content only", () => {
  it("returns undefined when the route has no faq entries", () => {
    const route = makeToolRoute({ faq: undefined });
    expect(buildFaqPageNode(route)).toBeUndefined();
  });

  it("returns undefined when the route's faq array is empty", () => {
    const route = makeToolRoute({ faq: [] });
    expect(buildFaqPageNode(route)).toBeUndefined();
  });

  it("builds an accurate FAQPage node from real fixture/config FAQ data", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    const route = makeToolRoute({
      faq: [
        { question: "Is it free?", answer: "Yes, completely free." },
        { question: "Is a signup required?", answer: "No signup required." },
      ],
    });

    const node = buildFaqPageNode(route);
    expect(node?.["@type"]).toBe("FAQPage");
    expect(node?.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "Is it free?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, completely free." },
      },
      {
        "@type": "Question",
        name: "Is a signup required?",
        acceptedAnswer: { "@type": "Answer", text: "No signup required." },
      },
    ]);
    vi.unstubAllEnvs();
  });
});
