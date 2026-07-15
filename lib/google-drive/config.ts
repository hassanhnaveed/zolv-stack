import { CloudError } from "@/lib/cloud/errors";

export interface GoogleDrivePublicConfig {
  clientId: string;
  apiKey: string;
  appId: string;
}

export function getGoogleDrivePublicConfig(): GoogleDrivePublicConfig {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY?.trim() ?? "";
  const appId = process.env.NEXT_PUBLIC_GOOGLE_APP_ID?.trim() ?? "";

  if (!clientId || !apiKey || !appId) {
    throw new CloudError(
      "scripts_failed",
      "Google Drive is not configured. Missing NEXT_PUBLIC_GOOGLE_* env vars.",
    );
  }

  return { clientId, apiKey, appId };
}
