/**
 * URL helpers for the `lib/seo/*` module. Domain-agnostic: the only
 * source of truth for the site origin is `NEXT_PUBLIC_APP_URL`. There are
 * intentionally no hard-coded host fallbacks (no Netlify/Fileora domain).
 *
 * ## Environment contract (stricter than production-only)
 *
 * `getSiteOrigin()` requires a valid `NEXT_PUBLIC_APP_URL` in **every**
 * environment (development, test, and production). Missing, blank, or
 * invalid values throw — there is no silent fallback host. This prevents
 * accidental Netlify/Fileora/localhost canonicals from leaking into SEO
 * outputs when env configuration is incomplete.
 *
 * See `docs/seo/url-policy.md` for the full canonical URL contract.
 */

import type { Locale, SiteOrigin } from "./types";

/**
 * Path prefix per locale. Single-locale English ships with no prefix
 * today; future locales add an entry here (e.g. `{ en: "", fr: "/fr" }`)
 * without changing callers of `absoluteUrl`.
 */
const LOCALE_PATH_PREFIXES: Readonly<Record<Locale, string>> = Object.freeze({
  en: "",
});

/**
 * Resolves and validates the site origin from `NEXT_PUBLIC_APP_URL`.
 *
 * **Required in all environments** — not only production. Throws when the
 * variable is missing/blank or fails validation. Valid origins must be
 * absolute URLs with:
 * - no username/password credentials
 * - no query string
 * - no URL fragment
 * - no pathname (other than `/`)
 * - `https:` in production; `http:` or `https:` outside production
 *   (so local `http://localhost:3000` remains valid in development)
 *
 * @returns Normalized origin parts (`origin` has no trailing slash)
 * @throws {Error} When `NEXT_PUBLIC_APP_URL` is unset or invalid
 */
export function getSiteOrigin(): SiteOrigin {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not set. Set it in your environment (see .env.example) " +
        "before resolving the SEO site origin; there is no hard-coded fallback host. " +
        "This is required in every environment (development, test, and production).",
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

  if (parsed.username || parsed.password) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must not contain credentials (username/password).",
    );
  }

  if (parsed.search) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must not include a query string; use a bare origin.",
    );
  }

  if (parsed.hash) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must not include a URL fragment; use a bare origin.",
    );
  }

  if (parsed.pathname && parsed.pathname !== "/") {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must not include a pathname; use a bare origin " +
        '(e.g. "https://example.com", not "https://example.com/app").',
    );
  }

  const protocol = parsed.protocol.replace(/:$/, "");
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && protocol !== "https") {
    throw new Error(
      'NEXT_PUBLIC_APP_URL must use the "https" protocol in production.',
    );
  }

  if (protocol !== "http" && protocol !== "https") {
    throw new Error(
      `NEXT_PUBLIC_APP_URL must use http or https, received protocol: "${protocol}"`,
    );
  }

  return {
    origin: parsed.origin,
    protocol,
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
 * site origin from {@link getSiteOrigin}.
 *
 * Accepts a `locale` for future i18n routing; no locale prefix is emitted
 * today (single-locale English), but callers should pass locale context so
 * this stays a drop-in point later.
 *
 * @param path - Site-relative path (e.g. `/`, `/fileora`, `/about`)
 * @param locale - Locale id; defaults to `"en"` (no path prefix today)
 * @returns Absolute URL with no trailing slash except for the site root
 * @throws {Error} When {@link getSiteOrigin} rejects the configured origin
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
