import { CloudError } from "@/lib/cloud/errors";
import type { GooglePickedFile } from "./picker";

export function assertValidPickerSelection(
  files: GooglePickedFile[],
  maxFiles: number,
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
  }
}
