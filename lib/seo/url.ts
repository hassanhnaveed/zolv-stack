/**
 * URL helpers for the `lib/seo/*` module. Domain-agnostic: the only
 * source of truth for the site origin is `NEXT_PUBLIC_APP_URL`. There are
 * intentionally no hard-coded host fallbacks (no Netlify/Fileora domain).
 */

import type { Locale, SiteOrigin } from "./types";

/**
 * Path prefix per locale. Single-locale English ships with no prefix
 * today; future locales add an entry here (e.g. `{ en: "", fr: "/fr" }`)
 * without changing callers of `absoluteUrl`.
 */
const LOCALE_PATH_PREFIXES: Record<Locale, string> = {
  en: "",
};

/**
 * Resolves the site origin from `NEXT_PUBLIC_APP_URL`.
 *
 * Throws when the variable is missing/blank or not a valid absolute URL,
 * in any environment — there is no implicit fallback host. This keeps the
 * error visible in production builds instead of silently emitting a wrong
 * canonical/OG URL.
 */
export function getSiteOrigin(): SiteOrigin {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not set. Set it in your environment (see .env.example) " +
        "before resolving the SEO site origin; there is no hard-coded fallback host.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_APP_URL must be a valid absolute URL, received: "${raw}"`,
    );
  }

  return {
    origin: parsed.origin,
    protocol: parsed.protocol.replace(/:$/, ""),
    hostname: parsed.hostname,
  };
}

/** Normalizes a site-relative path: ensures a single leading slash and no
 * trailing slash, except the root path which stays `/`. */
function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

/**
 * Builds an absolute URL for a site-relative `path` using the configured
 * site origin. Accepts a `locale` for future i18n routing; no locale
 * prefix is emitted today (single-locale English), but callers should pass
 * locale context so this stays a drop-in point later.
 */
export function absoluteUrl(path: string, locale: Locale = "en"): string {
  const { origin } = getSiteOrigin();
  const prefix = LOCALE_PATH_PREFIXES[locale];
  const normalizedPath = normalizePath(path);

  if (!prefix) {
    return normalizedPath === "/" ? `${origin}/` : `${origin}${normalizedPath}`;
  }

  return normalizedPath === "/"
    ? `${origin}${prefix}/`
    : `${origin}${prefix}${normalizedPath}`;
}
