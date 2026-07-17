import type { MetadataRoute } from "next";

import { absoluteUrl } from "./url";

/** Builds the public crawler policy from the configured site origin. */
export function buildRobots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
