import { CloudError } from "@/lib/cloud/errors";
import type { AcceptMap } from "@/lib/cloud/types";
import { getGoogleDrivePublicConfig } from "./config";
import { mimeTypesFromAccept } from "./mime";

export interface GooglePickedFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
}

export function openGooglePicker(args: {
  accessToken: string;
  accept: AcceptMap;
  maxFiles: number;
}): Promise<GooglePickedFile[]> {
  const { apiKey, appId } = getGoogleDrivePublicConfig();
  const mimeTypes = mimeTypesFromAccept(args.accept);

  return new Promise((resolve, reject) => {
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS);
    view.setIncludeFolders(false);
    view.setSelectFolderEnabled(false);
    if (mimeTypes.length > 0) {
      view.setMimeTypes(mimeTypes.join(","));
    }

    const builder = new google.picker.PickerBuilder()
      .setAppId(appId)
      .setOAuthToken(args.accessToken)
      .setDeveloperKey(apiKey)
      .addView(view)
      .setCallback((data: google.picker.ResponseObject) => {
        const action = data[google.picker.Response.ACTION];
        if (action === google.picker.Action.CANCEL) {
          reject(new CloudError("cancelled"));
          return;
        }
        if (action !== google.picker.Action.PICKED) return;

        const docs = data[google.picker.Response.DOCUMENTS] ?? [];
        const picked: GooglePickedFile[] = docs.map((doc) => ({
          id: doc.id,
          name: doc.name ?? "",
          mimeType: doc.mimeType ?? "",
          sizeBytes: doc.sizeBytes,
        }));
        resolve(picked);
      });

    if (args.maxFiles > 1) {
      builder.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);
    }

    const picker = builder.build();
    picker.setVisible(true);
  });
}
