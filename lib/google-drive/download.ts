import { CloudError } from "@/lib/cloud/errors";
import type { GooglePickedFile } from "./picker";

/**
 * Downloads a picked Drive file directly from the browser using the
 * short-lived OAuth token. The token is used only for the Authorization
 * header here — never persisted.
 */
export async function downloadDriveFile(
  file: GooglePickedFile,
  accessToken: string,
  signal?: AbortSignal,
): Promise<File> {
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    });
  } catch {
    throw new CloudError(
      "network",
      "Couldn’t reach Google Drive. Check your connection.",
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new CloudError("token_expired");
  }
  if (!response.ok) {
    throw new CloudError(
      "network",
      "Couldn’t download the selected Google Drive file.",
    );
  }

  const blob = await response.blob();
  const type = file.mimeType || blob.type || "application/octet-stream";
  return new File([blob], file.name, { type, lastModified: Date.now() });
}
