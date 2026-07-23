import { describe, expect, it } from "vitest";
import { sanitizeBodyText, sanitizeHeaderValue } from "./sanitize";

describe("sanitizeHeaderValue", () => {
  it("strips CR/LF to prevent header injection", () => {
    expect(sanitizeHeaderValue("Hello\r\nBcc: evil@example.com")).toBe(
      "Hello  Bcc: evil@example.com",
    );
  });

  it("strips other control characters and trims", () => {
    expect(sanitizeHeaderValue("  hi\u0000there\t ")).toBe("hi there");
  });
});

describe("sanitizeBodyText", () => {
  it("removes null bytes but keeps newlines", () => {
    expect(sanitizeBodyText("line1\nline2\u0000")).toBe("line1\nline2");
  });
});
