/**
 * Shared route text resolution for the `lib/seo/*` module (SEO
 * Architecture v1.0, Task 4).
 *
 * `resolveRouteTitle` / `resolveRouteDescription` originated in Task 3's
 * `validate.ts`. They are extracted here so both the validator and the
 * metadata builder consume a single resolution path. `validate.ts`
 * re-exports them for backward compatibility — this module does not depend
 * on `validate.ts`, and `metadata.ts` never imports from `validate.ts`.
 *
 * ## Title semantics
 *
 * - {@link resolveRouteTitle} returns the *raw* authored source (route
 *   override, else TOOL_CONFIG label). Used by required-field checks to
 *   decide whether a title source exists.
 * - {@link resolveToolIntentTitle} returns the human-readable *intent*
 *   phrase for product-tool routes. For `product-tool`, an authored
 *   `SeoRoute.title` is the **intent title only** — never an already
 *   brand-suffixed final string. Composition happens once in
 *   {@link resolveFinalTitle}.
 * - {@link resolveFinalTitle} is the single place that produces the
 *   document title actually emitted in metadata / OG / Twitter and
 *   inspected by length, duplicate-title, and hard-coded-host audits.
 */

import { TOOL_CONFIG } from "../utils";

import { productToolTitle, ZOLVSTACK_BRAND } from "./brands";
import type { SeoRoute } from "./types";

/** Minimal shape resolvers need from `TOOL_CONFIG` entries: just the
 * SEO-relevant fields, not the full converter config (accept map, icon,
 * etc.). Kept loose (`Record<string, ...>`) so fixtures in tests don't
 * need to satisfy the full `TOOL_CONFIG` shape. `longDesc` is the
 * substantive, sentence-length copy Task 4 prefers over the short
 * `description` format-label list when resolving tool descriptions. */
export type ToolTextConfig = Readonly<
  Record<
    string,
    { title?: string; description?: string; longDesc?: string } | undefined
  >
>;

const DEFAULT_TOOL_CONFIG = TOOL_CONFIG as ToolTextConfig;

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Resolves the effective SEO title *source* for `route`: the route's own
 * `title` override when set, else the raw `TOOL_CONFIG` fallback for
 * `product-tool` routes (spec: "may fall back to `TOOL_CONFIG` for
 * tools"). Non-tool page types never fall back — an SEO title must be
 * authored directly on the route.
 *
 * For `product-tool` routes, when `route.title` is set it is the **intent
 * title** (e.g. `"Convert Images to WebP Free"`), not a pre-composed
 * `"… | Fileora by ZolvStack"` string — see {@link resolveFinalTitle}.
 *
 * Returns the *raw* resolved text (e.g. `"WebP"`), not a derived intent
 * phrase or brand-composed final title.
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

/**
 * Resolves the effective SEO description for `route`: the route's own
 * `description` override when set, else — for `product-tool` routes —
 * the substantive `longDesc` copy when available, falling back to the
 * short `description` format-label list only when `longDesc` is absent
 * (spec/Task 4 brief: "tool fallback should use substantive `longDesc`
 * ... rather than short format labels").
 */
export function resolveRouteDescription(
  route: SeoRoute,
  toolConfig: ToolTextConfig = DEFAULT_TOOL_CONFIG,
): string | undefined {
  if (isNonEmpty(route.description)) return route.description;
  if (route.pageType === "product-tool") {
    const entry = toolConfig[route.id];
    if (isNonEmpty(entry?.longDesc)) return entry.longDesc;
    if (isNonEmpty(entry?.description)) return entry.description;
  }
  return undefined;
}

/** Maps slug segments to their properly-cased format/word label for
 * {@link deriveIntentTitleFromSlug}. Unknown segments fall back to a
 * simple capitalized form so a future `ToolSlug` never throws — it just
 * gets a slightly less polished (but still readable) derived title. */
const SLUG_SEGMENT_LABELS: Readonly<Record<string, string>> = Object.freeze({
  to: "to",
  image: "Image",
  document: "Document",
  webp: "WebP",
  jpg: "JPG",
  jpeg: "JPEG",
  png: "PNG",
  avif: "AVIF",
  gif: "GIF",
  bmp: "BMP",
  tiff: "TIFF",
  heic: "HEIC",
  heif: "HEIF",
  pdf: "PDF",
  docx: "DOCX",
  doc: "DOC",
  odt: "ODT",
  rtf: "RTF",
  txt: "TXT",
  html: "HTML",
  md: "Markdown",
});

function capitalize(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function labelSlugSegment(segment: string): string {
  return SLUG_SEGMENT_LABELS[segment] ?? capitalize(segment);
}

/**
 * Derives a human-readable intent phrase from a `"x-to-y"` tool slug,
 * e.g. `"image-to-webp"` -> `"Image to WebP Converter"`. Only meaningful
 * for slugs following the `"...-to-..."` conversion pattern — callers
 * check that shape before calling this.
 */
export function deriveIntentTitleFromSlug(slug: string): string {
  const words = slug.split("-").map(labelSlugSegment).join(" ");
  return `${words} Converter`;
}

/**
 * Resolves a useful, human-readable "intent" title for a `product-tool`
 * route — never a bare format label like `"WebP"` and never a
 * brand-suffixed final string.
 *
 * For `product-tool`, an authored `SeoRoute.title` is the **intent title**
 * only (e.g. `"Convert Images to WebP Free"`). Brand composition happens
 * exactly once in {@link resolveFinalTitle}.
 *
 * Resolution order:
 * 1. The route's own authored `title` override wins outright as the intent
 *    phrase (spec: "route-authored SEO title wins").
 * 2. For slugs following the `"x-to-y"` conversion pattern, derive a
 *    phrase from the slug itself (e.g. `"image-to-webp"` ->
 *    `"Image to WebP Converter"`).
 * 3. Otherwise, fall back to the raw `TOOL_CONFIG` title, which is
 *    already a real intent phrase for the current registry's non-`-to-`
 *    tool slugs (e.g. `"PDF Merge"`, `"Image Enhancer"`).
 *
 * Returns `undefined` for non-`product-tool` routes or when nothing
 * resolves.
 */
export function resolveToolIntentTitle(
  route: SeoRoute,
  toolConfig: ToolTextConfig = DEFAULT_TOOL_CONFIG,
): string | undefined {
  if (isNonEmpty(route.title)) return route.title;
  if (route.pageType !== "product-tool") return undefined;

  if (route.id.includes("-to-")) {
    return deriveIntentTitleFromSlug(route.id);
  }

  const fallback = toolConfig[route.id]?.title;
  return isNonEmpty(fallback) ? fallback.trim() : undefined;
}

/**
 * Resolves the **final rendered document title** for `route` — the same
 * string metadata, Open Graph, Twitter, and title-related audits must
 * inspect.
 *
 * Composition rules:
 * - `product-tool`: gate on {@link resolveRouteTitle} so required-field
 *   fallback semantics stay authoritative (no inventing a title from the
 *   slug alone when TOOL_CONFIG/route title is missing), then wrap the
 *   intent from {@link resolveToolIntentTitle} in
 *   `{intent} | Fileora by ZolvStack` **exactly once**.
 * - Every other page type: the authored {@link resolveRouteTitle} value
 *   is already the final title (e.g. `"About | ZolvStack"`).
 *
 * @returns The final title string, or `undefined` when no authored title
 * source exists.
 */
export function resolveFinalTitle(
  route: SeoRoute,
  toolConfig: ToolTextConfig = DEFAULT_TOOL_CONFIG,
): string | undefined {
  if (route.pageType === "product-tool") {
    // Required-field gate: composition only when a title source exists.
    if (!resolveRouteTitle(route, toolConfig)) return undefined;
    const intent = resolveToolIntentTitle(route, toolConfig);
    if (!intent) return undefined;
    return productToolTitle(intent, route.product ?? "fileora");
  }

  return resolveRouteTitle(route, toolConfig);
}

/** Last-resort brand name when a malformed fixture has no title source.
 * Real registry routes never hit this — Task 3 required-field validation
 * rejects missing titles. */
export function resolveFinalTitleOrBrandFallback(
  route: SeoRoute,
  toolConfig: ToolTextConfig = DEFAULT_TOOL_CONFIG,
): string {
  return resolveFinalTitle(route, toolConfig) ?? ZOLVSTACK_BRAND.name;
}
