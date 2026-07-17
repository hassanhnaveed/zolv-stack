/**
 * Server-only SEO configuration. Never import this module from a client
 * component — it reads server-side environment variables
 * (`SEO_INDEXING_ENABLED`, verification tokens) that must not be exposed
 * to the browser.
 */

import { getSiteOrigin } from "./url";

/** Resolved SEO configuration for the current process. */
export interface SeoConfig {
  /** Raw `NEXT_PUBLIC_APP_URL`, trimmed. Empty string when unset. */
  siteUrl: string;
  /** Explicit server-side opt-in for indexing. Must stay unprefixed
   * (never `NEXT_PUBLIC_*`) since it gates production indexing decisions.
   * Defaults to `false` — tools/routes default to non-indexable. */
  indexingEnabled: boolean;
  /** Google Search Console verification token, when configured. */
  googleSiteVerification?: string;
  /** Bing Webmaster Tools verification token, when configured. */
  bingSiteVerification?: string;
  /** Raw `NODE_ENV`, defaulting to `"development"` when unset. */
  nodeEnv: string;
}

function readBooleanEnv(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

function readOptionalEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Reads SEO configuration from environment variables. Performs no
 * caching, so tests can stub env vars per-case with `vi.stubEnv`.
 */
export function getSeoConfig(): SeoConfig {
  return {
    siteUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "",
    indexingEnabled: readBooleanEnv(process.env.SEO_INDEXING_ENABLED),
    googleSiteVerification: readOptionalEnv(
      process.env.SEO_GOOGLE_SITE_VERIFICATION,
    ),
    bingSiteVerification: readOptionalEnv(
      process.env.SEO_BING_SITE_VERIFICATION,
    ),
    nodeEnv: process.env.NODE_ENV ?? "development",
  };
}

/**
 * Fail-closed recognition of a genuine production SEO environment.
 *
 * Returns `true` only when `NODE_ENV === "production"` *and* the site
 * origin resolves to a valid absolute URL from `NEXT_PUBLIC_APP_URL`.
 * Every other state — non-production `NODE_ENV`, or a missing/invalid
 * origin — returns `false`.
 *
 * Downstream indexing/sitemap helpers (Task 2+) must treat `false` as
 * "noindex + empty sitemap", per the spec's fail-closed policy, even when
 * `SEO_INDEXING_ENABLED` is accidentally `true`. This function
 * intentionally does not read `SEO_INDEXING_ENABLED` itself — that flag is
 * a separate, explicit opt-in layered on top by indexability helpers.
 */
export function isProductionSeoEnvironment(): boolean {
  if (process.env.NODE_ENV !== "production") return false;

  try {
    getSiteOrigin();
    return true;
  } catch {
    return false;
  }
}
