import { afterEach, describe, expect, it, vi } from "vitest";

import { absoluteUrl, getSiteOrigin } from "./url";

describe("getSiteOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("parses NEXT_PUBLIC_APP_URL and strips trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com/");
    expect(getSiteOrigin().origin).toBe("https://example.com");
  });

  it("rejects hard-coded fallbacks by requiring env in production mode", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(() => getSiteOrigin()).toThrow(/NEXT_PUBLIC_APP_URL/);
  });
});

describe("absoluteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("joins origin and path without trailing slash (except root)", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    expect(absoluteUrl("/")).toBe("https://example.com/");
    expect(absoluteUrl("/fileora")).toBe("https://example.com/fileora");
  });
});
