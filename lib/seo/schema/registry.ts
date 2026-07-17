/**
 * `pageType -> composer` schema registry (SEO Architecture v1.0, Task 5).
 *
 * Each composer assembles the raw (unpruned) JSON-LD node list for one
 * `PageType`, combining the smaller per-entity builders (`organization`,
 * `website`, `webapplication`, `webpage`/`collectionpage`,
 * `softwareapplication`, `breadcrumb`, `faq`) into the graph shapes the
 * design spec's "Structured Data" table describes. Adding a future page
 * type is additive: register one more composer function under its
 * `PageType` key — no existing entry changes (spec: "avoid large switch
 * statements ... adding future page type should be additive").
 */

import type { PageType, SeoRoute } from "../types";

import { buildBreadcrumbListNode } from "./breadcrumb";
import { buildCollectionPageNode } from "./collectionpage";
import { breadcrumbListId, ref } from "./entities";
import { buildFaqPageNode } from "./faq";
import { buildLogoImageNode, buildOrganizationNode } from "./organization";
import {
  buildToolSoftwareApplicationNode,
  buildToolSoftwareApplicationRef,
} from "./softwareapplication";
import type { JsonLdNode } from "./types";
import {
  buildFileoraWebApplicationNode,
  buildFileoraWebApplicationRef,
} from "./webapplication";
import { buildWebPageNode, buildWebPageRef } from "./webpage";
import { buildWebsiteNode } from "./website";

type SchemaComposer = (route: SeoRoute) => JsonLdNode[];

/** Brand home: Organization + canonical logo/ImageObject + WebSite +
 * WebPage. No breadcrumb — home is the root of the hierarchy. */
function composeBrandHome(route: SeoRoute): JsonLdNode[] {
  return [
    buildOrganizationNode(),
    buildLogoImageNode(),
    buildWebsiteNode(),
    buildWebPageNode(route),
  ];
}

/** Static/legal: Organization (full node, shared @id) + WebPage +
 * BreadcrumbList. WebSite/logo are referenced (via WebPage.isPartOf /
 * Organization.logo) rather than redefined here — they're fully defined
 * once on the home page. */
function composeBrandStatic(route: SeoRoute): JsonLdNode[] {
  const breadcrumbRef = ref(breadcrumbListId(route.path));

  return [
    buildOrganizationNode(),
    buildWebPageNode(route, { breadcrumb: breadcrumbRef }),
    buildBreadcrumbListNode(route),
  ];
}

/** Product hub: Organization + logo (via Organization.logo ref) +
 * WebSite + Fileora WebApplication + CollectionPage (mainEntity ->
 * WebApplication) + BreadcrumbList. */
function composeProductHub(route: SeoRoute): JsonLdNode[] {
  const breadcrumbRef = ref(breadcrumbListId(route.path));

  return [
    buildOrganizationNode(),
    buildWebsiteNode(),
    buildFileoraWebApplicationNode(),
    buildCollectionPageNode(route, {
      mainEntity: buildFileoraWebApplicationRef(),
      breadcrumb: breadcrumbRef,
    }),
    buildBreadcrumbListNode(route),
  ];
}

/** Product tool: WebPage (mainEntity -> SoftwareApplication) +
 * SoftwareApplication (mainEntityOfPage -> WebPage, isPartOf -> Fileora
 * WebApplication) + BreadcrumbList (+ FAQPage only with real content).
 * Organization/WebSite/Fileora WebApplication are referenced by @id
 * only — never redefined per tool page, since there can be many tools. */
function composeProductTool(route: SeoRoute): JsonLdNode[] {
  const breadcrumbRef = ref(breadcrumbListId(route.path));
  const webPageRef = buildWebPageRef(route.path);
  const softwareApplicationRef = buildToolSoftwareApplicationRef(route.path);

  const nodes: JsonLdNode[] = [
    buildWebPageNode(route, {
      mainEntity: softwareApplicationRef,
      breadcrumb: breadcrumbRef,
    }),
    buildToolSoftwareApplicationNode(route, {
      mainEntityOfPage: webPageRef,
    }),
    buildBreadcrumbListNode(route),
  ];

  const faqNode = buildFaqPageNode(route);
  if (faqNode) {
    nodes.push(faqNode);
  }

  return nodes;
}

const PAGE_TYPE_COMPOSERS: Readonly<Record<PageType, SchemaComposer>> =
  Object.freeze({
    "brand-home": composeBrandHome,
    "brand-static": composeBrandStatic,
    legal: composeBrandStatic,
    "product-hub": composeProductHub,
    "product-tool": composeProductTool,
  });

/**
 * Composes the raw (unpruned) JSON-LD node list for `route`, via its
 * `pageType`'s registered composer. `graph.ts` prunes and wraps the
 * result in `{ "@context", "@graph" }`.
 *
 * @throws {Error} When `route.pageType` has no registered composer.
 * Every current `PageType` is covered; this only guards a future
 * `PageType` shipping without an accompanying registry entry.
 */
export function composeGraphNodes(route: SeoRoute): JsonLdNode[] {
  const composer = PAGE_TYPE_COMPOSERS[route.pageType];
  if (!composer) {
    throw new Error(
      `lib/seo/schema/registry: no schema composer registered for pageType "${route.pageType}".`,
    );
  }
  return composer(route);
}
