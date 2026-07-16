export type CloudProviderId = "google-drive" | "dropbox" | "onedrive";

/** Same shape as react-dropzone `accept`. */
export type AcceptMap = Record<string, readonly string[]>;

export interface CloudPickOptions {
  accept: AcceptMap;
  maxFiles: number;
  maxSize: number;
  /** Optional; Google Drive may ignore in v1. */
  signal?: AbortSignal;
}

export interface CloudFileProvider {
  id: CloudProviderId;
  pickFiles(options: CloudPickOptions): Promise<File[]>;
}
