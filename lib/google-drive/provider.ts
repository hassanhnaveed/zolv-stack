import { CloudError } from "@/lib/cloud/errors";
import type { CloudFileProvider, CloudPickOptions } from "@/lib/cloud/types";
import { requestDriveAccessToken, revokeDriveAccessToken } from "./auth";
import { downloadDriveFile } from "./download";
import { assertValidPickerSelection } from "./early-validate";
import { loadGoogleDriveScripts } from "./load-scripts";
import { openGooglePicker } from "./picker";

async function downloadAll(
  picked: Awaited<ReturnType<typeof openGooglePicker>>,
  token: string,
  signal?: AbortSignal,
): Promise<File[]> {
  const files: File[] = [];
  for (const item of picked) {
    files.push(await downloadDriveFile(item, token, signal));
  }
  return files;
}

export const googleDriveProvider: CloudFileProvider = {
  id: "google-drive",

  async pickFiles(options: CloudPickOptions): Promise<File[]> {
    await loadGoogleDriveScripts();

    let token = await requestDriveAccessToken();
    try {
      const picked = await openGooglePicker({
        accessToken: token,
        accept: options.accept,
        maxFiles: options.maxFiles,
      });
      assertValidPickerSelection(
        picked,
        options.maxFiles,
        options.accept,
        options.maxSize,
      );

      try {
        return await downloadAll(picked, token, options.signal);
      } catch (error) {
        if (error instanceof CloudError && error.code === "token_expired") {
          revokeDriveAccessToken(token);
          token = await requestDriveAccessToken();
          return await downloadAll(picked, token, options.signal);
        }
        throw error;
      }
    } finally {
      revokeDriveAccessToken(token);
    }
  },
};
