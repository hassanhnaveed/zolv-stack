"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { isCloudError, type CloudErrorCode } from "@/lib/cloud/errors";
import { getCloudProvider } from "@/lib/cloud/providers";
import type { CloudPickOptions, CloudProviderId } from "@/lib/cloud/types";

const TOAST_BY_CODE: Partial<Record<CloudErrorCode, string>> = {
  permission_denied: "Google Drive access was denied.",
  token_expired: "Session expired. Please try again.",
  network: "Couldn't reach Google Drive. Check your connection.",
  scripts_failed: "Google Drive couldn't load. Please try again.",
  unsupported: "Coming soon",
  unknown: "Something went wrong with Google Drive.",
};

function toastForCloudError(error: unknown): void {
  if (!isCloudError(error)) {
    toast.error("Something went wrong with Google Drive.");
    return;
  }
  if (error.code === "cancelled") return;
  if (error.code === "invalid_selection") {
    toast.error(error.message || "Invalid file selection.");
    return;
  }
  // Prefer the concrete message for load/config failures so missing env isn't hidden.
  if (
    error.code === "scripts_failed" &&
    error.message &&
    error.message !== "scripts_failed"
  ) {
    toast.error(error.message);
    return;
  }
  toast.error(TOAST_BY_CODE[error.code] ?? error.message);
}

export function useCloudFilePicker() {
  const [isPicking, setIsPicking] = useState(false);
  const inflight = useRef(false);

  const pick = useCallback(
    async (
      providerId: CloudProviderId,
      options: CloudPickOptions,
    ): Promise<File[] | null> => {
      if (inflight.current) return null;
      inflight.current = true;
      setIsPicking(true);
      try {
        const provider = getCloudProvider(providerId);
        return await provider.pickFiles(options);
      } catch (error) {
        toastForCloudError(error);
        return null;
      } finally {
        inflight.current = false;
        setIsPicking(false);
      }
    },
    [],
  );

  return { pick, isPicking };
}
