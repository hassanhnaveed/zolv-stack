import { CloudError } from "@/lib/cloud/errors";
import type { AcceptMap } from "@/lib/cloud/types";
import type { GooglePickedFile } from "./picker";

export function assertValidPickerSelection(
  files: GooglePickedFile[],
  maxFiles: number,
  accept: AcceptMap,
  maxSize: number,
): void {
  if (files.length === 0) {
    throw new CloudError("cancelled");
  }
  if (files.length > maxFiles) {
    throw new CloudError(
      "invalid_selection",
      `You can select at most ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`,
    );
  }

  const acceptedMimes = Object.keys(accept);
  const seen = new Set<string>();
  for (const file of files) {
    if (!file.id || seen.has(file.id)) {
      throw new CloudError(
        "invalid_selection",
        "Duplicate or invalid Google Drive selection.",
      );
    }
    seen.add(file.id);

    if (!file.name.trim()) {
      throw new CloudError(
        "invalid_selection",
        "A selected file is missing a name.",
      );
    }
    if (file.sizeBytes !== undefined && file.sizeBytes <= 0) {
      throw new CloudError(
        "invalid_selection",
        "A selected file is empty.",
      );
    }
    if (file.sizeBytes !== undefined && file.sizeBytes > maxSize) {
      throw new CloudError(
        "invalid_selection",
        `"${file.name}" is too large. Max size is ${formatMaxSize(maxSize)}.`,
      );
    }
    if (acceptedMimes.length > 0 && !acceptedMimes.includes(file.mimeType)) {
      throw new CloudError(
        "invalid_selection",
        `"${file.name}" isn’t a supported file type.`,
      );
    }
  }
}

function formatMaxSize(maxSize: number): string {
  const mb = maxSize / (1024 * 1024);
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)}MB`;
}
