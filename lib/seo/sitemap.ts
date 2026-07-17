import type { MetadataRoute } from "next";

import { isRouteInSitemap } from "./indexability";
import { ROUTES } from "./routes";
import type { SeoRoute } from "./types";
import { absoluteUrl } from "./url";

/**
 * Builds the sitemap from the centralized route registry and effective
 * indexability policy.
 */
export function buildSitemap(
  routes: readonly SeoRoute[] = ROUTES,
): MetadataRoute.Sitemap {
  const seenUrls = new Set<string>();

  return routes
    .filter((route) => isRouteInSitemap(route))
    .flatMap((route) => {
      const url = absoluteUrl(route.path);
      if (seenUrls.has(url)) return [];
      seenUrls.add(url);

      return [
        {
          url,
          ...(route.lastModified === undefined
            ? {}
            : { lastModified: route.lastModified }),
          ...(route.changeFrequency === undefined
            ? {}
            : { changeFrequency: route.changeFrequency }),
          ...(route.sitemapPriority === undefined
            ? {}
            : { priority: route.sitemapPriority }),
        },
      ];
    });
}
