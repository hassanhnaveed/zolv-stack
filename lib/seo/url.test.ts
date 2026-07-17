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

  it("rejects malformed URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "not a url");
    expect(() => getSiteOrigin()).toThrow(/valid absolute URL/);
  });

  it("rejects URLs containing credentials", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://user:pass@example.com");
    expect(() => getSiteOrigin()).toThrow(/credentials/);
  });

  it("rejects URLs with query strings", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com?utm=1");
    expect(() => getSiteOrigin()).toThrow(/query/);
  });

  it("rejects URLs with fragments", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com#section");
    expect(() => getSiteOrigin()).toThrow(/fragment/);
  });

  it("rejects origins containing pathnames", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com/app");
    expect(() => getSiteOrigin()).toThrow(/pathname/);
  });

  it("rejects non-https protocols in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://example.com");
    expect(() => getSiteOrigin()).toThrow(/https/i);
  });

  it("allows http on localhost outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    expect(getSiteOrigin().origin).toBe("http://localhost:3000");
  });

  it("rejects invalid protocols outside http/https", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "ftp://example.com");
    expect(() => getSiteOrigin()).toThrow(/http or https/);
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
