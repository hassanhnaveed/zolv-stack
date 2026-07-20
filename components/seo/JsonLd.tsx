/**
 * Server Component that renders a single JSON-LD `<script>` tag (SEO
 * Architecture v1.0, Task 5).
 *
 * No `"use client"` directive — this must stay a lightweight Server
 * Component. Route `page.tsx` files (Tasks 6/7) render
 * `<JsonLd data={buildJsonLdForRoute(routeId)} />` directly; client
 * components (e.g. `components/tools/ToolPage.tsx`) must not import
 * from `lib/seo/*` or build schema themselves.
 */

/**
 * Serializes `data` for safe embedding in an inline `<script
 * type="application/ld+json">` tag — stricter than raw `JSON.stringify`
 * while still producing valid JSON (every escape below happens *inside*
 * a JSON string literal, which `JSON.parse` reads back identically to
 * the unescaped character).
 *
 * - Escapes `<` as `\u003c`, so a value containing `</script>` (e.g. a
 *   future FAQ answer copied from HTML) can never prematurely close the
 *   surrounding script tag.
 * - Escapes the U+2028 (LINE SEPARATOR) / U+2029 (PARAGRAPH SEPARATOR)
 *   code points, legal inside a JSON string but invalid as raw source
 *   characters if this payload is ever parsed as JavaScript directly
 *   rather than as `application/ld+json`.
 *
 * Exported (not just used internally by {@link JsonLd}) so callers can
 * validate/export the exact bytes that will be embedded — e.g. a future
 * `seo:check` schema-validation pass — without duplicating the escaping
 * logic.
 *
 * @param data - Any JSON-serializable value (typically a `JsonLdGraph`
 * from `buildJsonLdForRoute`)
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export interface JsonLdProps {
  /** Typically a `JsonLdGraph` from `buildJsonLdForRoute`, but left
   * `unknown` so this component stays a generic, reusable primitive. */
  data: unknown;
}

/** Renders `data` as a single `application/ld+json` `<script>` tag via
 * {@link serializeJsonLd}. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
