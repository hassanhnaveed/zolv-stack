import { CloudError } from "@/lib/cloud/errors";
import type { CloudFileProvider, CloudProviderId } from "@/lib/cloud/types";
import { googleDriveProvider } from "@/lib/google-drive/provider";

export const CLOUD_PROVIDERS: Partial<
  Record<CloudProviderId, CloudFileProvider>
> = {
  "google-drive": googleDriveProvider,
};

export function getCloudProvider(id: CloudProviderId): CloudFileProvider {
  const provider = CLOUD_PROVIDERS[id];
  if (!provider) {
    throw new CloudError("unsupported");
  }
  return provider;
}
