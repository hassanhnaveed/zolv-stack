/**
 * Shared route text resolution for the `lib/seo/*` module (SEO
 * Architecture v1.0, Task 4).
 *
 * `resolveRouteTitle` / `resolveRouteDescription` originated in Task 3's
 * `validate.ts`. They are extracted here so both the validator and the
 * Task 4 metadata builder consume a single resolution path instead of two
 * independent (and potentially drifting) implementations. `validate.ts`
 * re-exports them unchanged for backward compatibility with existing
 * imports/tests — this module does not depend on `validate.ts`, and
 * `metadata.ts` never imports from `validate.ts`.
 *
 * `resolveToolIntentTitle` is new in Task 4: it derives a human-readable
 * "intent" phrase for product-tool routes (e.g. `"Image to WebP
 * Converter"`) instead of the bare TOOL_CONFIG format label (`"WebP"`),
 * used only when composing the *final* page title in `metadata.ts`.
 * `resolveRouteTitle` itself keeps returning the raw resolved value
 * (route override, else the raw TOOL_CONFIG label) so Task 3's validators
 * — required-field checks, duplicate-title detection, length advisories,
 * hard-coded-host scanning — keep inspecting the same literal SEO text
 * they always have.
 */

import { TOOL_CONFIG } from "../utils";

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
 * Resolves the effective SEO title for `route`: the route's own `title`
 * override when set, else the raw `TOOL_CONFIG` fallback for
 * `product-tool` routes (spec: "may fall back to `TOOL_CONFIG` for
 * tools"). Non-tool page types never fall back — an SEO title must be
 * authored directly on the route.
 *
 * Returns the *raw* resolved text (e.g. `"WebP"`), not a derived intent
 * phrase — see {@link resolveToolIntentTitle} for the final-title version
 * `metadata.ts` uses.
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
 * route — never a bare format label like `"WebP"` (Task 4 brief:
 * "TOOL_CONFIG fallback must become a useful intent title"). Used only to
 * compose the *final* page title in `metadata.ts`; `resolveRouteTitle`
 * (above) keeps returning the raw resolved text for validators.
 *
 * Resolution order:
 * 1. The route's own authored `title` override wins outright (spec:
 *    "route-authored SEO title wins") — the author already chose the
 *    full intent phrase.
 * 2. For slugs following the `"x-to-y"` conversion pattern, derive a
 *    phrase from the slug itself (e.g. `"image-to-webp"` ->
 *    `"Image to WebP Converter"`) — this is what turns the bare `"WebP"`
 *    TOOL_CONFIG label into something meaningful.
 * 3. Otherwise, fall back to the raw `TOOL_CONFIG` title, which is
 *    already a real intent phrase for the current registry's non-`-to-`
 *    tool slugs (e.g. `"PDF Merge"`, `"Image Enhancer"`,
 *    `"Background Remover"`).
 *
 * Returns `undefined` for non-`product-tool` routes or when nothing
 * resolves (mirrors {@link resolveRouteTitle}'s "no fallback" contract).
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
