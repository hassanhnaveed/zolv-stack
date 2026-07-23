import { describe, expect, it } from "vitest";
import { validateContactPayload } from "./validate";

describe("validateContactPayload", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    subject: "Hello",
    message: "I have a question.",
  };

  it("accepts a valid payload", () => {
    const result = validateContactPayload(valid);
    expect(result).toEqual({
      ok: true,
      isHoneypot: false,
      fields: valid,
    });
  });

  it("accepts an optional source label", () => {
    const result = validateContactPayload({
      ...valid,
      source: "contact-page",
    });
    expect(result).toEqual({
      ok: true,
      isHoneypot: false,
      fields: { ...valid, source: "contact-page" },
    });
  });

  it("rejects missing fields", () => {
    expect(validateContactPayload({ ...valid, name: "  " })).toEqual({
      ok: false,
      error: "All fields are required.",
    });
  });

  it("rejects invalid email", () => {
    expect(validateContactPayload({ ...valid, email: "not-an-email" })).toEqual(
      {
        ok: false,
        error: "Invalid email address.",
      },
    );
  });

  it("rejects oversized fields", () => {
    expect(
      validateContactPayload({ ...valid, subject: "x".repeat(201) }),
    ).toEqual({
      ok: false,
      error: "One or more fields exceed the allowed length.",
    });
  });

  it("rejects oversized source", () => {
    expect(
      validateContactPayload({ ...valid, source: "x".repeat(65) }),
    ).toEqual({
      ok: false,
      error: "One or more fields exceed the allowed length.",
    });
  });

  it("treats filled website honeypot as silent success", () => {
    expect(
      validateContactPayload({ ...valid, website: "http://spam.example" }),
    ).toEqual({
      ok: true,
      isHoneypot: true,
      fields: null,
    });
  });
});
