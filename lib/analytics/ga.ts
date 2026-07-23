export type GaEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID_RE = /^G-[A-Z0-9]+$/i;

let lastPagePath: string | null = null;

/** Trimmed GA4 measurement ID, or undefined when unset/blank/invalid. */
export function getMeasurementId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!id || !MEASUREMENT_ID_RE.test(id)) return undefined;
  return id;
}

export function isGaEnabled(): boolean {
  return Boolean(getMeasurementId());
}

function canSend(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    Boolean(getMeasurementId())
  );
}

/**
 * Canonical GA4 SPA page navigation: update config with the new page_path.
 * Dedupes consecutive identical paths (React Strict Mode double-effects).
 */
export function pageView(pagePath: string): void {
  const measurementId = getMeasurementId();
  if (!measurementId || !canSend()) return;
  if (lastPagePath === pagePath) return;

  lastPagePath = pagePath;
  window.gtag!("config", measurementId, { page_path: pagePath });
}

/** Low-level custom event helper. Prefer named helpers when available. */
export function trackEvent(name: string, params?: GaEventParams): void {
  if (!canSend()) return;
  window.gtag!("event", name, params);
}

export function trackContactSubmit(params?: GaEventParams): void {
  trackEvent("contact_submit", params);
}

export function trackConverterSelected(params?: GaEventParams): void {
  trackEvent("converter_selected", params);
}

export function trackUploadStarted(params?: GaEventParams): void {
  trackEvent("upload_started", params);
}

export function trackUploadCompleted(params?: GaEventParams): void {
  trackEvent("upload_completed", params);
}

export function trackDownloadCompleted(params?: GaEventParams): void {
  trackEvent("download_completed", params);
}

export function trackGoogleDriveConnected(params?: GaEventParams): void {
  trackEvent("google_drive_connected", params);
}

export function trackGoogleDriveFileSelected(params?: GaEventParams): void {
  trackEvent("google_drive_file_selected", params);
}

export function trackConversionStarted(params?: GaEventParams): void {
  trackEvent("conversion_started", params);
}

export function trackConversionCompleted(params?: GaEventParams): void {
  trackEvent("conversion_completed", params);
}

export function trackConversionFailed(params?: GaEventParams): void {
  trackEvent("conversion_failed", params);
}

/** Alias for upload_completed — matches the recommended helper surface. */
export function trackUpload(params?: GaEventParams): void {
  trackUploadCompleted(params);
}

/** Alias for conversion_completed — matches the recommended helper surface. */
export function trackConversion(params?: GaEventParams): void {
  trackConversionCompleted(params);
}

/** Alias for download_completed — matches the recommended helper surface. */
export function trackDownload(params?: GaEventParams): void {
  trackDownloadCompleted(params);
}
