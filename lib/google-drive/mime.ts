import type { AcceptMap } from "@/lib/cloud/types";

export const WORKSPACE_MIME_PREFIX = "application/vnd.google-apps.";

/**
 * Build Google Picker MIME filter from tool accept config.
 * Picker filtering is UX only — onDrop remains the validation source of truth.
 */
export function mimeTypesFromAccept(accept: AcceptMap): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const mime of Object.keys(accept)) {
    if (!mime || mime.startsWith(WORKSPACE_MIME_PREFIX)) continue;
    if (seen.has(mime)) continue;
    seen.add(mime);
    result.push(mime);
  }

  return result;
}
