import { CloudError } from "@/lib/cloud/errors";
import { getGoogleDrivePublicConfig } from "./config";

export const DRIVE_FILE_SCOPE =
  "https://www.googleapis.com/auth/drive.file";

/**
 * Request a short-lived access token via GIS.
 * Token is returned to the caller only — never persisted.
 */
export function requestDriveAccessToken(): Promise<string> {
  const { clientId } = getGoogleDrivePublicConfig();

  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: DRIVE_FILE_SCOPE,
        callback: (response) => {
          if (response.error) {
            if (
              response.error === "access_denied" ||
              response.error === "popup_closed_by_user"
            ) {
              reject(
                new CloudError(
                  response.error === "access_denied"
                    ? "permission_denied"
                    : "cancelled",
                ),
              );
              return;
            }
            reject(new CloudError("unknown", response.error));
            return;
          }
          if (!response.access_token) {
            reject(new CloudError("unknown", "No access token returned."));
            return;
          }
          resolve(response.access_token);
        },
        error_callback: (err) => {
          const type = err?.type;
          if (type === "popup_closed") {
            reject(new CloudError("cancelled"));
            return;
          }
          if (type === "popup_failed_to_open") {
            reject(
              new CloudError(
                "permission_denied",
                "Google sign-in popup was blocked.",
              ),
            );
            return;
          }
          reject(new CloudError("unknown", "Google sign-in failed."));
        },
      });
      client.requestAccessToken({ prompt: "" });
    } catch {
      reject(new CloudError("scripts_failed", "Could not start Google sign-in."));
    }
  });
}

/** Best-effort revoke; ignore failures. Never store the token. */
export function revokeDriveAccessToken(token: string): void {
  try {
    window.google.accounts.oauth2.revoke(token, () => undefined);
  } catch {
    // ignore
  }
}
