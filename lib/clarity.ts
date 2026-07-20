import Clarity from "@microsoft/clarity";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

let initialized = false;

function hasExistingClarity(): boolean {
  if (typeof document !== "undefined" && document.getElementById("clarity-script")) {
    return true;
  }
  if (typeof window !== "undefined" && typeof window.clarity === "function") {
    return true;
  }
  return false;
}

/**
 * Initialize Microsoft Clarity once on the client.
 * No-ops when NEXT_PUBLIC_CLARITY_PROJECT_ID is unset or Clarity is already loaded.
 */
export function initClarity(): void {
  if (initialized) return;

  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  if (!projectId) return;

  if (hasExistingClarity()) {
    initialized = true;
    return;
  }

  Clarity.init(projectId);
  initialized = true;
}
