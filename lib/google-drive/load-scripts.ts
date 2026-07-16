import { CloudError } from "@/lib/cloud/errors";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const GAPI_SRC = "https://apis.google.com/js/api.js";

let scriptsPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new CloudError("scripts_failed")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () =>
      reject(new CloudError("scripts_failed", "Failed to load Google scripts."));
    document.head.appendChild(script);
  });
}

function loadPickerApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      reject(new CloudError("scripts_failed", "gapi missing after script load."));
      return;
    }
    window.gapi.load("picker", {
      callback: () => resolve(),
      onerror: () =>
        reject(new CloudError("scripts_failed", "Failed to load Google Picker.")),
    });
  });
}

/** Load GIS + gapi picker once per page session. */
export function loadGoogleDriveScripts(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new CloudError("scripts_failed", "Google Drive is browser-only."),
    );
  }
  if (!scriptsPromise) {
    scriptsPromise = (async () => {
      await Promise.all([loadScript(GIS_SRC), loadScript(GAPI_SRC)]);
      await loadPickerApi();
      if (!window.google?.accounts?.oauth2 || !window.google?.picker) {
        throw new CloudError(
          "scripts_failed",
          "Google APIs unavailable after load.",
        );
      }
    })().catch((error: unknown) => {
      scriptsPromise = null;
      if (error instanceof CloudError) throw error;
      throw new CloudError("scripts_failed", "Google Drive couldn’t load.");
    });
  }
  return scriptsPromise;
}
