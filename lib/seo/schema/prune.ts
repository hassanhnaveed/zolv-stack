/**
 * Recursive JSON-LD data hygiene (SEO Architecture v1.0, Task 5).
 *
 * Strips `undefined`, `null`, empty strings, empty arrays, and empty
 * objects at every depth so no builder needs its own ad-hoc
 * conditional-spread cleanup — but always preserves meaningful falsy
 * values (`0`, `false`), which are never "empty" (spec: "recursive prune
 * removes undefined/null/empty strings/empty arrays/empty objects while
 * preserving `0`/`false`").
 *
 * `graph.ts` is the only caller in normal operation — it prunes the
 * fully composed node list once, right before wrapping it in
 * `{ "@context", "@graph" }`. Individual builders may still return
 * `undefined` fields freely (e.g. an optional `description`); pruning is
 * always applied afterward, not scattered across every builder.
 */

/** Whether `value` counts as "empty" for pruning purposes. `0` and
 * `false` are never empty. */
function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Recursively prunes `value`, removing empty properties/entries at every
 * depth while preserving `0` and `false`. Arrays are pruned element-wise
 * (each element recursively pruned, then any element that becomes empty
 * is dropped); plain objects are pruned key-wise the same way. Primitives
 * pass through unchanged.
 *
 * @param value - Any JSON-LD-shaped value (node, array, or primitive)
 * @returns A new, deeply pruned value of the same shape as `value`
 */
export function prune<T>(value: T): T {
  if (Array.isArray(value)) {
    const prunedItems = value
      .map((item) => prune(item))
      .filter((item) => !isEmpty(item));
    return prunedItems as unknown as T;
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const prunedEntry = prune(entryValue);
      if (!isEmpty(prunedEntry)) {
        result[key] = prunedEntry;
      }
    }
    return result as unknown as T;
  }

  return value;
}
