/**
 * `BreadcrumbList` builder (SEO Architecture v1.0, Task 5).
 *
 * Uses the real route hierarchy — Home for every page; Home -> Fileora
 * for the hub; Home -> Fileora -> Tool for tool pages — with positions
 * always contiguous starting at 1 and every `item` an absolute,
 * same-origin URL via `absoluteUrl` (spec: "breadcrumbs use route
 * hierarchy ... positions contiguous from 1; absolute canonical route
 * URLs"). Never called for the brand-home route, which has no
 * breadcrumb.
 */

import { FILEORA_BRAND } from "../brands";
import {
  resolveFinalTitleOrBrandFallback,
  resolveToolIntentTitle,
} from "../content-resolver";
import { getRoute, PATHS, ROUTE_IDS } from "../routes";
import type { SeoRoute } from "../types";
import { absoluteUrl } from "../url";

import { breadcrumbListId } from "./entities";
import type { JsonLdNode } from "./types";

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Derives a clean, non-brand-suffixed breadcrumb label for `route`.
 * Never fabricates copy — always derived from the same Task 4
 * content-resolver helpers metadata uses, or a fixed short brand token
 * for Home/Fileora.
 */
function breadcrumbLabel(route: SeoRoute): string {
  if (route.pageType === "product-hub") return FILEORA_BRAND.name;

  if (route.pageType === "product-tool") {
    return resolveToolIntentTitle(route) ?? FILEORA_BRAND.name;
  }

  // brand-static / legal: the route's final title is already fully
  // brand-composed as "{Page} | ZolvStack" (see brands.ts's
  // `brandStaticTitle`) — the breadcrumb wants only the page-specific
  // segment, never the trailing brand suffix.
  const finalTitle = resolveFinalTitleOrBrandFallback(route);
  const [pageLabel] = finalTitle.split(" | ");
  return pageLabel?.trim() || finalTitle;
}

function buildBreadcrumbItems(route: SeoRoute): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "Home", url: absoluteUrl(PATHS.HOME) },
  ];

  if (route.pageType === "product-tool") {
    const hubRoute = getRoute(ROUTE_IDS.FILEORA_HUB);
    items.push({
      name: breadcrumbLabel(hubRoute),
      url: absoluteUrl(hubRoute.path),
    });
  }

  items.push({ name: breadcrumbLabel(route), url: absoluteUrl(route.path) });
  return items;
}

/**
 * Builds the `BreadcrumbList` node for `route`. Positions are contiguous
 * starting at 1; every `item` is an absolute URL.
 */
export function buildBreadcrumbListNode(route: SeoRoute): JsonLdNode {
  const items = buildBreadcrumbItems(route);

  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbListId(route.path),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
