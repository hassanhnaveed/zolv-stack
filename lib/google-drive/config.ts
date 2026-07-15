import { CloudError } from "@/lib/cloud/errors";

export interface GoogleDrivePublicConfig {
  clientId: string;
  apiKey: string;
  appId: string;
}

/**
 * Google Picker `setAppId` needs the Cloud project number.
 * Web OAuth Client IDs are typically `{projectNumber}-{suffix}.apps.googleusercontent.com`.
 */
export function deriveAppIdFromClientId(clientId: string): string {
  const match = /^(\d+)-/.exec(clientId.trim());
  return match?.[1] ?? "";
}

export function getGoogleDrivePublicConfig(): GoogleDrivePublicConfig {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY?.trim() ?? "";
  const appIdExplicit = process.env.NEXT_PUBLIC_GOOGLE_APP_ID?.trim() ?? "";
  const appId = appIdExplicit || deriveAppIdFromClientId(clientId);

  if (!clientId || !apiKey) {
    throw new CloudError(
      "scripts_failed",
      "Google Drive is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_API_KEY.",
    );
  }

  if (!appId) {
    throw new CloudError(
      "scripts_failed",
      "Google Drive is not configured. Set NEXT_PUBLIC_GOOGLE_APP_ID to your Google Cloud project number.",
    );
  }

  return { clientId, apiKey, appId };
}
