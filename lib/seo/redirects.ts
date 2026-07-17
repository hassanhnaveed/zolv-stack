/**
 * Redirect manifest (SEO Architecture v1.0).
 *
 * Single source of truth for every HTTP redirect. Consumed by
 * `next.config.ts` via {@link getNextRedirects}. Preserves every redirect
 * that was previously declared inline in `next.config.ts`, unchanged:
 *
 * - `/convoox` and `/convoox/:path*` -> `/fileora` and `/fileora/:path*`
 * - every current `ToolSlug` bare path (e.g. `/image-to-webp`) ->
 *   `/fileora/{slug}` (derived from `TOOL_CONFIG`, so this list can never
 *   drift out of sync with the actual set of converters)
 *
 * The canonical manifest is frozen and validated at module load via
 * {@link assertValidRedirects}. {@link getRedirects} returns that frozen
 * snapshot; {@link getNextRedirects} returns a shallow mutable copy for
 * Next.js `redirects()` compatibility without exposing mutable shared state.
 *
 * ## Import note
 *
 * This file is imported directly by `next.config.ts`, which loads its
 * dependency graph via Next's config-ts transpiler — a step that runs
 * outside the normal app build and does not rewrite the `@/*` tsconfig
 * path alias (only plain relative imports resolve there). So `lib/utils`
 * is imported by relative path here, not via `@/lib/utils`.
 */

import { TOOL_CONFIG, toolHref, type ToolSlug } from "../utils";

import { PATHS, ROUTES } from "./routes";
import type { SeoRoute } from "./types";

/** A single redirect rule. Structurally compatible with Next.js's
 * `NextConfig["redirects"]` return type without depending on Next's
 * internal (non-public) `Redirect` type export. */
export interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
}

/** Strip an optional query string for path comparisons. */
function pathOnly(value: string): string {
  return value.split("?")[0] ?? value;
}

/** Whether `path` contains a Next.js-style dynamic segment (`:param`). */
function hasDynamicSegment(path: string): boolean {
  return path.split("/").some((segment) => segment.startsWith(":"));
}

/**
 * Static base of a path/pattern for registry lookups.
 * `/fileora/:path*` → `/fileora`; `/fileora` → `/fileora`; `/` → `/`.
 */
function staticBasePath(path: string): string {
  const normalized = pathOnly(path);
  if (normalized === "/") return "/";
  const parts = normalized.split("/").filter(Boolean);
  const staticParts: string[] = [];
  for (const part of parts) {
    if (part.startsWith(":")) break;
    staticParts.push(part);
  }
  return staticParts.length === 0 ? "/" : `/${staticParts.join("/")}`;
}

/**
 * Case / shape policy for redirect sources and destinations: lowercase
 * site-relative paths only. Mixed-case is rejected — never silently
 * normalized. Dynamic segments (`:path*`) are allowed; static segments
 * must be lowercase kebab-case (or a single `*` catch-all token is not
 * used here — Next uses `:path*`).
 */
function assertLowercasePathPattern(kind: "source" | "destination", path: string): void {
  const value = pathOnly(path);
  if (value !== value.toLowerCase()) {
    throw new Error(
      `lib/seo/redirects: redirect ${kind} "${path}" must be lowercase ` +
        "(mixed-case is rejected; paths are not silently normalized).",
    );
  }
}

/** Structural checks for a destination path (leading slash, no trailing
 * slash except `/`, non-empty). Dynamic destinations like `/fileora/:path*`
 * are allowed when otherwise well-formed. */
function assertWellFormedDestination(destination: string): void {
  const value = pathOnly(destination);
  if (!value) {
    throw new Error(
      'lib/seo/redirects: malformed destination "" (empty).',
    );
  }
  if (!value.startsWith("/")) {
    throw new Error(
      `lib/seo/redirects: malformed destination "${destination}" ` +
        "(must be a site-relative path starting with `/`).",
    );
  }
  if (value !== "/" && value.endsWith("/")) {
    throw new Error(
      `lib/seo/redirects: malformed destination "${destination}" ` +
        "(trailing slash is not allowed except for `/`).",
    );
  }
}

/**
 * Validates redirect invariants against a route registry:
 * unique sources, no source/canonical collisions, destinations resolve to
 * registered routes (wildcard destinations via their static base), no
 * self-loops or cycles, lowercase-only paths (no silent normalize), and
 * well-formed destinations.
 *
 * Exported for direct unit tests; intentionally **not** re-exported from
 * the `lib/seo` public barrel.
 *
 * @param redirects - Candidate redirect list
 * @param routes - Canonical route registry to validate against
 */
export function assertValidRedirects(
  redirects: readonly RedirectRule[],
  routes: readonly SeoRoute[],
): void {
  const routePaths = new Set(routes.map((route) => route.path));
  const seenSources = new Set<string>();
  const sourceToDestination = new Map<string, string>();

  for (const redirect of redirects) {
    const source = pathOnly(redirect.source);
    const destination = pathOnly(redirect.destination);

    assertLowercasePathPattern("source", redirect.source);
    assertLowercasePathPattern("destination", redirect.destination);
    assertWellFormedDestination(redirect.destination);

    if (seenSources.has(source)) {
      throw new Error(
        `lib/seo/redirects: duplicate redirect source "${source}".`,
      );
    }
    seenSources.add(source);
    sourceToDestination.set(source, destination);

    if (source === destination) {
      throw new Error(
        `lib/seo/redirects: redirect self-loop on "${source}".`,
      );
    }
  }

  // Cycle detection over the redirect graph (source → destination when the
  // destination is itself a redirect source). Runs before registry checks
  // so A → B → A surfaces as a cycle rather than a missing destination.
  for (const start of sourceToDestination.keys()) {
    const visited = new Set<string>();
    let current: string | undefined = start;
    while (current !== undefined && sourceToDestination.has(current)) {
      if (visited.has(current)) {
        throw new Error(
          `lib/seo/redirects: redirect cycle detected involving "${start}".`,
        );
      }
      visited.add(current);
      current = sourceToDestination.get(current);
    }
  }

  for (const redirect of redirects) {
    const source = pathOnly(redirect.source);
    const destination = pathOnly(redirect.destination);

    const sourceBase = staticBasePath(source);
    if (routePaths.has(source) || routePaths.has(sourceBase)) {
      throw new Error(
        `lib/seo/redirects: redirect source "${redirect.source}" collides ` +
          "with a canonical registry route.",
      );
    }

    const destinationCanonical = hasDynamicSegment(destination)
      ? staticBasePath(destination)
      : destination;
    if (!routePaths.has(destinationCanonical)) {
      throw new Error(
        `lib/seo/redirects: redirect destination "${redirect.destination}" ` +
          `does not resolve to a registered canonical route (resolved to "${destinationCanonical}").`,
      );
    }
  }
}

/** Legacy `/convoox` branding -> `/fileora`. */
const CONVOOX_REDIRECTS: readonly RedirectRule[] = [
  { source: "/convoox", destination: PATHS.FILEORA, permanent: true },
  {
    source: "/convoox/:path*",
    destination: `${PATHS.FILEORA}/:path*`,
    permanent: true,
  },
];

/** Legacy bare tool slugs (e.g. `/image-to-webp`) -> `/fileora/{slug}`,
 * derived from `TOOL_CONFIG` so every current `ToolSlug` is covered. */
function toolSlugRedirects(): RedirectRule[] {
  const slugs = Object.keys(TOOL_CONFIG) as ToolSlug[];
  return slugs.map((slug) => ({
    source: `/${slug}`,
    destination: toolHref(slug),
    permanent: true,
  }));
}

function freezeRedirect(rule: RedirectRule): Readonly<RedirectRule> {
  return Object.freeze({ ...rule });
}

/**
 * Frozen canonical redirect manifest. Validated once at module load.
 * Callers must not mutate this; use {@link getRedirects} /
 * {@link getNextRedirects}.
 */
const REDIRECT_MANIFEST: readonly Readonly<RedirectRule>[] = Object.freeze(
  [...CONVOOX_REDIRECTS, ...toolSlugRedirects()].map(freezeRedirect),
);

assertValidRedirects(REDIRECT_MANIFEST, ROUTES);

/**
 * Full redirect manifest, framework-agnostic.
 *
 * Returns the frozen canonical snapshot. Callers cannot push/splice or
 * mutate individual rules; use {@link getNextRedirects} when a mutable
 * array is required (e.g. Next.js config).
 *
 * @returns Frozen {@link RedirectRule} list
 */
export function getRedirects(): readonly RedirectRule[] {
  return REDIRECT_MANIFEST;
}

/**
 * Redirect manifest shaped for `next.config.ts`'s `redirects()` hook.
 *
 * Returns a **shallow mutable copy** of each rule so Next.js may own the
 * array without sharing mutable state with the frozen canonical manifest.
 *
 * @returns Mutable {@link RedirectRule}[] copy
 */
export function getNextRedirects(): RedirectRule[] {
  return REDIRECT_MANIFEST.map((rule) => ({ ...rule }));
}
