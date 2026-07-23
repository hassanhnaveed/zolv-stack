import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("lib/analytics/ga", () => {
  const gtag = vi.fn();

  beforeEach(() => {
    gtag.mockClear();
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    vi.stubGlobal("window", {
      gtag,
      dataLayer: [],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  });

  it("getMeasurementId returns undefined when unset", async () => {
    const { getMeasurementId } = await import("./ga");
    expect(getMeasurementId()).toBeUndefined();
  });

  it("getMeasurementId returns undefined when whitespace", async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "   ";
    const { getMeasurementId } = await import("./ga");
    expect(getMeasurementId()).toBeUndefined();
  });

  it("getMeasurementId returns undefined for invalid measurement IDs", async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "not-a-ga-id";
    const { getMeasurementId } = await import("./ga");
    expect(getMeasurementId()).toBeUndefined();
  });

  it("getMeasurementId returns trimmed measurement ID", async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "  G-TEST123  ";
    const { getMeasurementId } = await import("./ga");
    expect(getMeasurementId()).toBe("G-TEST123");
  });

  it("isGaEnabled is false without a measurement ID", async () => {
    const { isGaEnabled } = await import("./ga");
    expect(isGaEnabled()).toBe(false);
  });

  it("isGaEnabled is true when measurement ID is set", async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
    const { isGaEnabled } = await import("./ga");
    expect(isGaEnabled()).toBe(true);
  });

  it("pageView no-ops without measurement ID", async () => {
    const { pageView } = await import("./ga");
    pageView("/fileora");
    expect(gtag).not.toHaveBeenCalled();
  });

  it("pageView no-ops when gtag is missing", async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
    vi.stubGlobal("window", { dataLayer: [] });
    const { pageView } = await import("./ga");
    pageView("/fileora");
    expect(gtag).not.toHaveBeenCalled();
  });

  it("pageView calls gtag config with page_path", async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
    const { pageView } = await import("./ga");
    pageView("/fileora?x=1");
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("config", "G-TEST123", {
      page_path: "/fileora?x=1",
    });
  });

  it("pageView skips duplicate consecutive paths (Strict Mode safe)", async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
    const { pageView } = await import("./ga");
    pageView("/fileora");
    pageView("/fileora");
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it("pageView fires again after the path changes", async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
    const { pageView } = await import("./ga");
    pageView("/fileora");
    pageView("/about");
    expect(gtag).toHaveBeenCalledTimes(2);
    expect(gtag).toHaveBeenLastCalledWith("config", "G-TEST123", {
      page_path: "/about",
    });
  });

  it("trackEvent no-ops without measurement ID", async () => {
    const { trackEvent } = await import("./ga");
    trackEvent("contact_submit");
    expect(gtag).not.toHaveBeenCalled();
  });

  it("trackEvent sends a named event with params", async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
    const { trackEvent } = await import("./ga");
    trackEvent("converter_selected", { tool: "pdf-merge" });
    expect(gtag).toHaveBeenCalledWith("event", "converter_selected", {
      tool: "pdf-merge",
    });
  });

  it("named helpers map to the expected event names", async () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
    const ga = await import("./ga");

    ga.trackContactSubmit({ method: "form" });
    ga.trackConverterSelected({ tool: "pdf-merge" });
    ga.trackUploadStarted({ source: "local" });
    ga.trackUploadCompleted({ source: "google_drive" });
    ga.trackDownloadCompleted({ tool: "pdf-merge" });
    ga.trackGoogleDriveConnected();
    ga.trackGoogleDriveFileSelected({ count: 2 });
    ga.trackConversionStarted({ tool: "pdf-merge" });
    ga.trackConversionCompleted({ tool: "pdf-merge" });
    ga.trackConversionFailed({ tool: "pdf-merge", reason: "timeout" });

    expect(gtag).toHaveBeenCalledWith("event", "contact_submit", { method: "form" });
    expect(gtag).toHaveBeenCalledWith("event", "converter_selected", {
      tool: "pdf-merge",
    });
    expect(gtag).toHaveBeenCalledWith("event", "upload_started", { source: "local" });
    expect(gtag).toHaveBeenCalledWith("event", "upload_completed", {
      source: "google_drive",
    });
    expect(gtag).toHaveBeenCalledWith("event", "download_completed", {
      tool: "pdf-merge",
    });
    expect(gtag).toHaveBeenCalledWith("event", "google_drive_connected", undefined);
    expect(gtag).toHaveBeenCalledWith("event", "google_drive_file_selected", {
      count: 2,
    });
    expect(gtag).toHaveBeenCalledWith("event", "conversion_started", {
      tool: "pdf-merge",
    });
    expect(gtag).toHaveBeenCalledWith("event", "conversion_completed", {
      tool: "pdf-merge",
    });
    expect(gtag).toHaveBeenCalledWith("event", "conversion_failed", {
      tool: "pdf-merge",
      reason: "timeout",
    });
  });
});
