/**
 * Shared JSON-LD node/graph types for `lib/seo/schema/*` (SEO
 * Architecture v1.0, Task 5).
 *
 * Deliberately loose (`Record<string, unknown>`) rather than a fully
 * modeled schema.org type system — every builder in this folder returns
 * a plain object with at least `@type`, and `graph.ts` is the single
 * place that assembles/prunes them into the final `{ "@context",
 * "@graph" }` shape consumed by `components/seo/JsonLd.tsx`.
 */

/** A single schema.org node before pruning (may still contain
 * `undefined` values that {@link import("./prune").prune} removes). */
export type JsonLdNode = Record<string, unknown>;

/** An `{ "@id": ... }` reference to a node defined elsewhere in the same
 * (or another page's) graph — never a re-declared/rebuilt node. */
export interface JsonLdRef {
  "@id": string;
}

/** The single `@graph` document emitted per route (spec: "exactly one
 * `{ "@context": "https://schema.org", "@graph": [...] }` object per
 * route/page"). */
export interface JsonLdGraph {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
}
