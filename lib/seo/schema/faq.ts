/**
 * `FAQPage` builder (SEO Architecture v1.0, Task 5).
 *
 * Only ever built from real, route-authored `SeoRoute.faq` content —
 * never fabricated (spec: "FAQPage only if real `route.faq` data
 * exists; omit entirely otherwise").
 */

import type { FaqEntry, SeoRoute } from "../types";

import { faqPageId } from "./entities";
import type { JsonLdNode } from "./types";

/**
 * Builds the `FAQPage` node for `route`, or `undefined` when the route
 * has no real FAQ content.
 */
export function buildFaqPageNode(route: SeoRoute): JsonLdNode | undefined {
  if (!route.faq || route.faq.length === 0) return undefined;

  return {
    "@type": "FAQPage",
    "@id": faqPageId(route.path),
    mainEntity: route.faq.map((entry: FaqEntry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}
