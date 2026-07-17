/**
 * Validators for the `lib/seo/*` module (SEO Architecture v1.0, Task 3).
 *
 * Every validator here is a pure function over plain data (routes,
 * redirects, config) — none of them throw. Each returns a
 * {@link ValidationIssue} list so `audit.ts` can still produce a full
 * report even when validation fails (spec: "report generated even when
 * validation fails; CLI exits nonzero on failures").
 *
 * Registry-shape invariants (duplicate ids/paths, malformed paths,
 * reserved-path collisions, redirect cycles/collisions) are **not**
 * reimplemented here — `assertValidRoutes` / `assertValidRedirects`
 * (Task 2) already own that logic and throw on violation. The wrappers
 * below simply catch those throws and convert them into
 * {@link ValidationIssue}s, so the invariants are consumed once, not
 * duplicated.
 *
 * `validateSeo()` is the intended aggregate entry point for `audit.ts`
 * and `scripts/seo-check.ts`. Individual validators are exported for
 * direct unit testing but are intentionally **not** re-exported from the
 * `lib/seo` public barrel — only `validateSeo` and its types are.
 */

import { getErrorMessage, TOOL_CONFIG } from "../utils";

import { getSeoConfig } from "./config";
import { assertValidRedirects, getRedirects, type RedirectRule } from "./redirects";
import { assertValidRoutes, listRoutes } from "./routes";
import { getSiteOrigin, absoluteUrl } from "./url";
import type { SeoRoute } from "./types";
import type { SeoConfig } from "./config";

/** Severity of a single validation finding. Errors fail `seo:check`;
 * warnings are advisory only. */
export type ValidationSeverity = "error" | "warning";

/** A single validation finding. `routeId` is present when the issue is
 * scoped to one route; registry-wide issues (e.g. an unresolved site
 * origin) omit it. */
export interface ValidationIssue {
  severity: ValidationSeverity;
  /** Stable machine-readable code (e.g. `"seo/duplicate-title"`),
   * namespaced under `seo/` so downstream tooling can filter reliably. */
  code: string;
  message: string;
  routeId?: string;
}

/** Minimal shape validators need from `TOOL_CONFIG` entries: just the
 * SEO-relevant fields, not the full converter config (accept map, icon,
 * etc.). Kept loose (`Record<string, ...>`) so fixtures in tests don't
 * need to satisfy the full `TOOL_CONFIG` shape. */
export type ToolTextConfig = Readonly<
  Record<string, { title?: string; description?: string } | undefined>
>;

const DEFAULT_TOOL_CONFIG = TOOL_CONFIG as ToolTextConfig;

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Resolves the effective SEO title for `route`: the route's own `title`
 * override when set, else the `TOOL_CONFIG` fallback for `product-tool`
 * routes (spec: "may fall back to `TOOL_CONFIG` for tools"). Non-tool
 * page types never fall back — an SEO title must be authored directly on
 * the route.
 */
export function resolveRouteTitle(
  route: SeoRoute,
  toolConfig: ToolTextConfig = DEFAULT_TOOL_CONFIG,
): string | undefined {
  if (isNonEmpty(route.title)) return route.title;
  if (route.pageType === "product-tool") {
    const fallback = toolConfig[route.id]?.title;
    if (isNonEmpty(fallback)) return fallback;
  }
  return undefined;
}

/** Resolves the effective SEO description for `route`. See
 * {@link resolveRouteTitle} for the fallback rule. */
export function resolveRouteDescription(
  route: SeoRoute,
  toolConfig: ToolTextConfig = DEFAULT_TOOL_CONFIG,
): string | undefined {
  if (isNonEmpty(route.description)) return route.description;
  if (route.pageType === "product-tool") {
    const fallback = toolConfig[route.id]?.description;
    if (isNonEmpty(fallback)) return fallback;
  }
  return undefined;
}

/**
 * Wraps {@link assertValidRoutes} (Task 2) and converts a thrown
 * violation into a single {@link ValidationIssue} instead of throwing.
 * Covers: duplicate route ids, duplicate route paths, malformed
 * (non-kebab-case) paths, and reserved-path collisions.
 */
export function validateRouteRegistryInvariants(
  routes: readonly SeoRoute[],
): ValidationIssue[] {
  try {
    assertValidRoutes(routes);
    return [];
  } catch (error) {
    return [
      {
        severity: "error",
        code: "seo/route-registry-invalid",
        message: getErrorMessage(error),
      },
    ];
  }
}

/**
 * Wraps {@link assertValidRedirects} (Task 2) and converts a thrown
 * violation into a single {@link ValidationIssue}. Redirect invariants
 * (duplicate sources, cycles, unresolved destinations, canonical
 * collisions, case/shape policy) are consumed here, not duplicated.
 */
export function validateRedirectInvariants(
  redirects: readonly RedirectRule[],
  routes: readonly SeoRoute[],
): ValidationIssue[] {
  try {
    assertValidRedirects(redirects, routes);
    return [];
  } catch (error) {
    return [
      {
        severity: "error",
        code: "seo/redirect-registry-invalid",
        message: getErrorMessage(error),
      },
    ];
  }
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * Validates canonical-URL invariants:
 *
 * - The site origin must resolve (via {@link getSiteOrigin}); when it
 *   does not, reports one `seo/origin-unresolved` error instead of
 *   throwing — every other canonical check is skipped for this call
 *   since no absolute canonical can be built without an origin.
 * - Any `route.ogImage.url` present must be an absolute `http(s)` URL,
 *   never a site-relative path (spec: "relative URLs where absolute
 *   required").
 */
export function validateCanonicalUrls(
  routes: readonly SeoRoute[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  let originResolved = false;

  try {
    getSiteOrigin();
    originResolved = true;
  } catch (error) {
    issues.push({
      severity: "error",
      code: "seo/origin-unresolved",
      message: `Cannot resolve the site origin for canonical URLs: ${getErrorMessage(error)}`,
    });
  }

  for (const route of routes) {
    if (originResolved) {
      const canonical = absoluteUrl(route.path);
      if (!isAbsoluteHttpUrl(canonical)) {
        issues.push({
          severity: "error",
          code: "seo/invalid-canonical",
          message: `Route "${route.id}" canonical "${canonical}" is not an absolute http(s) URL.`,
          routeId: route.id,
        });
      }
    }

    if (route.ogImage && !isAbsoluteHttpUrl(route.ogImage.url)) {
      issues.push({
        severity: "error",
        code: "seo/relative-og-image-url",
        message: `Route "${route.id}" ogImage.url "${route.ogImage.url}" must be an absolute URL, not a relative path.`,
        routeId: route.id,
      });
    }
  }

  return issues;
}

function routeMissingFieldMessage(
  route: SeoRoute,
  field: "title" | "description",
): string {
  if (route.pageType === "product-tool") {
    return (
      `Route "${route.id}" is missing a resolved ${field}: no route.${field} ` +
      `override, and no TOOL_CONFIG["${route.id}"].${field} fallback is available.`
    );
  }
  return `Route "${route.id}" (pageType "${route.pageType}") is missing a required ${field}.`;
}

/**
 * Validates that every route has a resolved `title` and `description`
 * (spec: "required fields by page type"), respecting the `product-tool`
 * fallback to `TOOL_CONFIG` (spec: "while respecting tool fallback
 * design"). Every other page type must author `title`/`description`
 * directly on the route — there is no fallback for brand/legal/hub pages.
 */
export function validateRequiredFields(
  routes: readonly SeoRoute[],
  toolConfig: ToolTextConfig = DEFAULT_TOOL_CONFIG,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const route of routes) {
    if (!resolveRouteTitle(route, toolConfig)) {
      issues.push({
        severity: "error",
        code: "seo/missing-title",
        message: routeMissingFieldMessage(route, "title"),
        routeId: route.id,
      });
    }
    if (!resolveRouteDescription(route, toolConfig)) {
      issues.push({
        severity: "error",
        code: "seo/missing-description",
        message: routeMissingFieldMessage(route, "description"),
        routeId: route.id,
      });
    }
  }

  return issues;
}

/**
 * Validates that no two **declared-indexable** routes (`route.index ===
 * true`) resolve to the same title (spec: "No duplicate ... titles among
 * indexable routes"). Uses declared intent rather than the fail-closed
 * *effective* index state so this check stays meaningful in every
 * environment, including local dev and CI, where effective indexing is
 * always inactive outside production.
 */
export function validateDuplicateTitles(
  routes: readonly SeoRoute[],
  toolConfig: ToolTextConfig = DEFAULT_TOOL_CONFIG,
): ValidationIssue[] {
  const routeIdsByTitle = new Map<string, string[]>();

  for (const route of routes) {
    if (!route.index) continue;
    const title = resolveRouteTitle(route, toolConfig);
    if (!title) continue;

    const key = title.trim().toLowerCase();
    const ids = routeIdsByTitle.get(key) ?? [];
    ids.push(route.id);
    routeIdsByTitle.set(key, ids);
  }

  const issues: ValidationIssue[] = [];
  for (const [title, ids] of routeIdsByTitle) {
    if (ids.length > 1) {
      const sortedIds = [...ids].sort();
      issues.push({
        severity: "error",
        code: "seo/duplicate-title",
        message: `Duplicate title "${title}" is used by ${sortedIds.length} indexable routes: ${sortedIds
          .map((id) => `"${id}"`)
          .join(", ")}.`,
      });
    }
  }

  return issues;
}

/**
 * Validates the independent index/sitemap/follow flags for internal
 * consistency: `sitemap: true` must never be paired with `index: false`
 * (spec: "at least sitemap=true with index=false"). `sitemap.ts` (a
 * later task) also gates on the fail-closed *effective* state via
 * `indexability.ts`; this check only guards the *declared* intent stored
 * in the registry itself.
 */
export function validateIndexSitemapConsistency(
  routes: readonly SeoRoute[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const route of routes) {
    if (route.sitemap && !route.index) {
      issues.push({
        severity: "error",
        code: "seo/sitemap-without-index",
        message: `Route "${route.id}" declares sitemap:true with index:false; a noindex route must never appear in the sitemap.`,
        routeId: route.id,
      });
    }
  }

  return issues;
}

/** Known legacy/production hostnames that must never appear hard-coded in
 * serialized SEO route fields (spec: "Zero hard-coded production /
 * Netlify / Fileora-domain URLs in SEO outputs"). Deliberately a short,
 * specific list (not generic substrings like "localhost" or "app") to
 * avoid broad false positives. */
export const LEGACY_HOST_PATTERNS: readonly string[] = Object.freeze([
  "fileora.netlify.app",
  "netlify.app",
]);

function collectRouteStrings(
  route: SeoRoute,
  toolConfig: ToolTextConfig = DEFAULT_TOOL_CONFIG,
): string[] {
  const values: string[] = [];
  // Prefer resolved title/description so product-tool routes that fall back
  // to TOOL_CONFIG are scanned the same way as required-field validators.
  const title = resolveRouteTitle(route, toolConfig);
  const description = resolveRouteDescription(route, toolConfig);
  if (title) values.push(title);
  if (description) values.push(description);
  if (route.ogImage?.url) values.push(route.ogImage.url);
  if (route.ogImage?.alt) values.push(route.ogImage.alt);
  if (route.keywords) values.push(...route.keywords);
  if (route.faq) {
    for (const entry of route.faq) {
      values.push(entry.question, entry.answer);
    }
  }
  return values;
}

/**
 * Scans every serialized SEO field on each route (resolved `title` /
 * `description`, plus `ogImage`, `keywords`, `faq`) for hard-coded
 * legacy/production host substrings from {@link LEGACY_HOST_PATTERNS}.
 * Resolved text uses the same `product-tool` → `TOOL_CONFIG` fallback as
 * {@link validateRequiredFields}. Callers may pass an explicit `patterns`
 * override in tests/fixtures without affecting the default scan of the
 * real registry.
 */
export function validateHardcodedHosts(
  routes: readonly SeoRoute[],
  patterns: readonly string[] = LEGACY_HOST_PATTERNS,
  toolConfig: ToolTextConfig = DEFAULT_TOOL_CONFIG,
): ValidationIssue[] {
  const resolvedPatterns = patterns ?? LEGACY_HOST_PATTERNS;
  const issues: ValidationIssue[] = [];

  for (const route of routes) {
    for (const value of collectRouteStrings(route, toolConfig)) {
      const lowerValue = value.toLowerCase();
      const matched = resolvedPatterns.find((pattern) =>
        lowerValue.includes(pattern.toLowerCase()),
      );
      if (matched) {
        issues.push({
          severity: "error",
          code: "seo/hardcoded-legacy-host",
          message: `Route "${route.id}" contains the legacy/hard-coded host "${matched}" in a serialized SEO field: "${value}".`,
          routeId: route.id,
        });
      }
    }
  }

  return issues;
}

const PLACEHOLDER_TOKEN_PATTERNS: readonly RegExp[] = [
  /your[-_ ]?token/i,
  /replace[-_ ]?me/i,
  /example/i,
  /change[-_ ]?me/i,
  /placeholder/i,
  /insert[-_ ]?token/i,
  /sample[-_ ]?token/i,
  /dummy[-_ ]?token/i,
  /^x{4,}$/i,
  /^todo$/i,
];

/** Whether `token` looks like an unfilled placeholder value (e.g.
 * `"your-token-here"`, `"REPLACE_ME"`) rather than a real verification
 * token (spec: "Reject placeholder/example tokens"). */
export function isPlaceholderVerificationToken(token: string): boolean {
  return PLACEHOLDER_TOKEN_PATTERNS.some((pattern) => pattern.test(token));
}

/** Subset of {@link SeoConfig} needed to validate verification tokens. */
export type VerificationConfig = Pick<
  SeoConfig,
  "googleSiteVerification" | "bingSiteVerification"
>;

/**
 * Validates that configured GSC/Bing verification tokens are not
 * placeholder/example values. A token that is simply unset is not an
 * error — verification is optional (spec: "Next.js native `verification`
 * metadata only when set").
 */
export function validateVerificationTokens(
  config: VerificationConfig,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const checks: ReadonlyArray<
    readonly ["google" | "bing", string | undefined]
  > = [
    ["google", config.googleSiteVerification],
    ["bing", config.bingSiteVerification],
  ];

  for (const [engine, token] of checks) {
    if (token && isPlaceholderVerificationToken(token)) {
      issues.push({
        severity: "error",
        code: "seo/placeholder-verification-token",
        message: `${engine === "google" ? "Google Search Console" : "Bing Webmaster Tools"} verification token looks like an unfilled placeholder ("${token}"); set the real token before deploying.`,
      });
    }
  }

  return issues;
}

const TITLE_LENGTH_RANGE = { min: 50, max: 60 } as const;
const DESCRIPTION_LENGTH_RANGE = { min: 140, max: 160 } as const;

/**
 * Advisory (warning-only) check for title/description length against the
 * spec's recommended SERP ranges (Metadata Strategy: "Title length warn:
 * 50–60; description warn: 140–160"). Never fails `seo:check`.
 */
export function validateTitleAndDescriptionLength(
  routes: readonly SeoRoute[],
  toolConfig: ToolTextConfig = DEFAULT_TOOL_CONFIG,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const route of routes) {
    const title = resolveRouteTitle(route, toolConfig);
    if (title && (title.length < TITLE_LENGTH_RANGE.min || title.length > TITLE_LENGTH_RANGE.max)) {
      issues.push({
        severity: "warning",
        code: "seo/title-length",
        message: `Route "${route.id}" title is ${title.length} characters (recommended ${TITLE_LENGTH_RANGE.min}–${TITLE_LENGTH_RANGE.max}): "${title}".`,
        routeId: route.id,
      });
    }

    const description = resolveRouteDescription(route, toolConfig);
    if (
      description &&
      (description.length < DESCRIPTION_LENGTH_RANGE.min ||
        description.length > DESCRIPTION_LENGTH_RANGE.max)
    ) {
      issues.push({
        severity: "warning",
        code: "seo/description-length",
        message: `Route "${route.id}" description is ${description.length} characters (recommended ${DESCRIPTION_LENGTH_RANGE.min}–${DESCRIPTION_LENGTH_RANGE.max}).`,
        routeId: route.id,
      });
    }
  }

  return issues;
}

/** Splits a flat issue list into `errors` and `warnings`, preserving
 * relative order within each group. */
export function partitionValidationIssues(issues: readonly ValidationIssue[]): {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
} {
  return {
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning"),
  };
}

function compareIssues(a: ValidationIssue, b: ValidationIssue): number {
  if (a.code !== b.code) return a.code < b.code ? -1 : 1;
  const aId = a.routeId ?? "";
  const bId = b.routeId ?? "";
  if (aId !== bId) return aId < bId ? -1 : 1;
  if (a.message !== b.message) return a.message < b.message ? -1 : 1;
  return 0;
}

/** Options for {@link validateSeo}. Every field defaults to the real,
 * live `lib/seo/*` data so `scripts/seo-check.ts` can call it with no
 * arguments; tests override individual fields with fixtures. */
export interface ValidateSeoOptions {
  routes?: readonly SeoRoute[];
  redirects?: readonly RedirectRule[];
  config?: VerificationConfig;
  toolConfig?: ToolTextConfig;
}

/**
 * Runs every validator and returns a single, deterministically sorted
 * {@link ValidationIssue} list (sorted by `code`, then `routeId`, then
 * `message` — stable regardless of input route ordering, for
 * diff-friendly audit reports).
 */
export function validateSeo(options: ValidateSeoOptions = {}): ValidationIssue[] {
  const routes = options.routes ?? listRoutes();
  const redirects = options.redirects ?? getRedirects();
  const config = options.config ?? getSeoConfig();
  const toolConfig = options.toolConfig ?? DEFAULT_TOOL_CONFIG;

  const issues: ValidationIssue[] = [
    ...validateRouteRegistryInvariants(routes),
    ...validateRedirectInvariants(redirects, routes),
    ...validateCanonicalUrls(routes),
    ...validateRequiredFields(routes, toolConfig),
    ...validateDuplicateTitles(routes, toolConfig),
    ...validateIndexSitemapConsistency(routes),
    ...validateHardcodedHosts(routes, LEGACY_HOST_PATTERNS, toolConfig),
    ...validateVerificationTokens(config),
    ...validateTitleAndDescriptionLength(routes, toolConfig),
  ];

  return [...issues].sort(compareIssues);
}
