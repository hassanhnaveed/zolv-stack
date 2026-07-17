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
 * No redirect destination declared here is itself a redirect source, so
 * no redirect chain is introduced — verified in `routes.test.ts`.
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

import { PATHS } from "./routes";

/** A single redirect rule. Structurally compatible with Next.js's
 * `NextConfig["redirects"]` return type without depending on Next's
 * internal (non-public) `Redirect` type export. */
export interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
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

/**
 * Full redirect manifest, framework-agnostic.
 *
 * @returns Every registered {@link RedirectRule}
 */
export function getRedirects(): RedirectRule[] {
  return [...CONVOOX_REDIRECTS, ...toolSlugRedirects()];
}

/**
 * Redirect manifest shaped for `next.config.ts`'s `redirects()` hook.
 *
 * @returns The same list as {@link getRedirects}
 */
export function getNextRedirects(): RedirectRule[] {
  return getRedirects();
}
