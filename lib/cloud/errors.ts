export type CloudErrorCode =
  | "cancelled"
  | "permission_denied"
  | "token_expired"
  | "network"
  | "scripts_failed"
  | "unsupported"
  | "invalid_selection"
  | "unknown";

export class CloudError extends Error {
  readonly code: CloudErrorCode;

  constructor(code: CloudErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CloudError";
    this.code = code;
  }
}

export function isCloudError(error: unknown): error is CloudError {
  return error instanceof CloudError;
}
