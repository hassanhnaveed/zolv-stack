/**
 * `pageType -> composer` schema registry (SEO Architecture v1.0, Task 5).
 *
 * Each composer assembles the raw (unpruned) JSON-LD node list for one
 * `PageType`, combining the smaller per-entity builders into the graph
 * shapes the design spec's "Structured Data" table describes — with the
 * production-grade constraint that **every page graph is self-contained**
 * for entities it references (Google does not merge graphs across URLs
 * by `@id`). Shared entity nodes still use the same stable `@id`s from
 * `entities.ts`; they are fully defined on every page that needs them
 * via {@link buildSharedSiteEntityNodes} /
 * {@link buildSharedProductEntityNodes}.
 *
 * Adding a future page type is additive: register one more composer
 * function under its `PageType` key — no existing entry changes (spec:
 * "avoid large switch statements ... adding future page type should be
 * additive").
 */

import type { PageType, SeoRoute } from "../types";

import { buildBreadcrumbListNode } from "./breadcrumb";
import { buildCollectionPageNode } from "./collectionpage";
import { breadcrumbListId, ref } from "./entities";
import { buildFaqPageNode } from "./faq";
import {
  buildSharedProductEntityNodes,
  buildSharedSiteEntityNodes,
} from "./shared-entities";
import {
  buildToolSoftwareApplicationNode,
  buildToolSoftwareApplicationRef,
} from "./softwareapplication";
import type { JsonLdNode } from "./types";
import { buildFileoraWebApplicationRef } from "./webapplication";
import { buildWebPageNode, buildWebPageRef } from "./webpage";

type SchemaComposer = (route: SeoRoute) => JsonLdNode[];

/** Brand home: Organization + canonical logo/ImageObject + WebSite +
 * WebPage. No breadcrumb — home is the root of the hierarchy. */
function composeBrandHome(route: SeoRoute): JsonLdNode[] {
  return [...buildSharedSiteEntityNodes(), buildWebPageNode(route)];
}

/** Static/legal: full Organization + logo + WebSite + WebPage +
 * BreadcrumbList — self-contained so Organization.logo and
 * WebPage.isPartOf resolve within this page's graph. */
function composeBrandStatic(route: SeoRoute): JsonLdNode[] {
  const breadcrumbRef = ref(breadcrumbListId(route.path));

  return [
    ...buildSharedSiteEntityNodes(),
    buildWebPageNode(route, { breadcrumb: breadcrumbRef }),
    buildBreadcrumbListNode(route),
  ];
}

/** Product hub: shared site entities + Fileora WebApplication +
 * CollectionPage (mainEntity -> WebApplication) + BreadcrumbList. */
function composeProductHub(route: SeoRoute): JsonLdNode[] {
  const breadcrumbRef = ref(breadcrumbListId(route.path));

  const nodes: JsonLdNode[] = [
    ...buildSharedProductEntityNodes(),
    buildCollectionPageNode(route, {
      mainEntity: buildFileoraWebApplicationRef(),
      breadcrumb: breadcrumbRef,
    }),
    buildBreadcrumbListNode(route),
  ];

  const faqNode = buildFaqPageNode(route);
  if (faqNode) {
    nodes.push(faqNode);
  }

  return nodes;
}

/** Product tool: shared product entities + WebPage (mainEntity ->
 * SoftwareApplication) + SoftwareApplication (mainEntityOfPage ->
 * WebPage) + BreadcrumbList (+ FAQPage only with real content). */
function composeProductTool(route: SeoRoute): JsonLdNode[] {
  const breadcrumbRef = ref(breadcrumbListId(route.path));
  const webPageRef = buildWebPageRef(route.path);
  const softwareApplicationRef = buildToolSoftwareApplicationRef(route.path);

  const nodes: JsonLdNode[] = [
    ...buildSharedProductEntityNodes(),
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
