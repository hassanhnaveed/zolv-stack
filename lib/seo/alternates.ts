/**
 * Canonical + `alternates.languages` builder for the `lib/seo/*` module
 * (SEO Architecture v1.0, Task 4).
 *
 * Canonicals always come from the route registry via {@link absoluteUrl}
 * — never from the incoming request URL (spec: "Canonicals always from
 * route definition, never from request URL"). Every route self-references
 * its own canonical for both `en` and `x-default` (spec: "alternates
 * self-reference canonical with `en` and `x-default`") since this is a
 * single-locale (English) site today; future locales add real per-locale
 * URLs here without changing callers.
 */

import { absoluteUrl } from "./url";
import type { Locale } from "./types";

/** The exact shape Next's `Metadata["alternates"]` expects, narrowed to
 * what this module ever produces (a plain canonical string plus `en` /
 * `x-default` language self-references). */
export interface RouteAlternates {
  canonical: string;
  languages: Readonly<{
    en: string;
    "x-default": string;
  }>;
}

/**
 * Builds the canonical + self-referencing language alternates for
 * `path`.
 *
 * @param path - Site-relative path from the route registry (e.g. the
 * `SeoRoute.path` for the route being rendered)
 * @param locale - Locale id; defaults to `"en"` (the only locale today)
 * @returns Frozen {@link RouteAlternates}, ready to assign to
 * `Metadata.alternates`
 * @throws {Error} When {@link absoluteUrl} rejects the configured origin
 */
export function buildAlternates(
  path: string,
  locale: Locale = "en",
): RouteAlternates {
  const canonical = absoluteUrl(path, locale);
  return Object.freeze({
    canonical,
    languages: Object.freeze({
      en: canonical,
      "x-default": canonical,
    }),
  });
}
