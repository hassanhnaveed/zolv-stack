import { describe, expect, it, vi } from "vitest";
import {
  buildContactEmailContent,
  getSmtpConfig,
  sendContactEmail,
} from "./send-contact-email";

describe("getSmtpConfig", () => {
  it("returns null when any required var is missing", () => {
    expect(
      getSmtpConfig({
        SMTP_HOST: "smtp.gmail.com",
        SMTP_PORT: "587",
        SMTP_USER: "a@example.com",
        SMTP_PASS: "",
        CONTACT_EMAIL: "b@example.com",
      }),
    ).toBeNull();
  });

  it("parses a valid config", () => {
    expect(
      getSmtpConfig({
        SMTP_HOST: "smtp.gmail.com",
        SMTP_PORT: "587",
        SMTP_USER: "a@example.com",
        SMTP_PASS: "secret",
        CONTACT_EMAIL: "inbox@example.com",
      }),
    ).toEqual({
      host: "smtp.gmail.com",
      port: 587,
      user: "a@example.com",
      pass: "secret",
      contactEmail: "inbox@example.com",
    });
  });
});

describe("buildContactEmailContent", () => {
  const receivedAt = new Date("2026-07-23T09:59:00.000Z");

  it("uses replyTo for submitter and sanitizes subject", () => {
    const content = buildContactEmailContent(
      {
        name: "Jane\r\nBcc: x@y.com",
        email: "jane@example.com",
        subject: "Help\nplease",
        message: "Hello\nworld",
      },
      receivedAt,
    );

    expect(content.replyTo).toBe("jane@example.com");
    expect(content.subject).toBe("[Contact] Help please");
    expect(content.text).toContain("Name:  Jane  Bcc: x@y.com");
    expect(content.text).toContain("Hello\nworld");
    expect(content.text).toContain(
      "Reply directly to this email to respond to the sender.",
    );
    expect(content.text).toContain("Received: 2026-07-23 09:59:00 UTC");
  });

  it("includes optional source in subject and body", () => {
    const content = buildContactEmailContent(
      {
        name: "Jane",
        email: "jane@example.com",
        subject: "Hi",
        message: "Hello",
        source: "contact-page",
      },
      receivedAt,
    );

    expect(content.subject).toBe("[Contact · contact-page] Hi");
    expect(content.text).toContain(
      "Sent via the website contact form (contact-page).",
    );
  });
});

describe("sendContactEmail", () => {
  const fields = {
    name: "Jane",
    email: "jane@example.com",
    subject: "Hi",
    message: "Hello",
  };

  const env = {
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: "587",
    SMTP_USER: "sender@example.com",
    SMTP_PASS: "app-pass",
    CONTACT_EMAIL: "inbox@example.com",
  };

  it("returns misconfigured when env is incomplete", async () => {
    const result = await sendContactEmail(fields, { env: {} });
    expect(result).toEqual({
      ok: false,
      reason: "misconfigured",
      detail: "SMTP environment variables are missing or invalid.",
    });
  });

  it("sends with from=SMTP user and replyTo=submitter", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "1" });
    const result = await sendContactEmail(fields, {
      env,
      createTransporter: () => ({ sendMail }),
    });

    expect(result).toEqual({ ok: true });
    expect(sendMail).toHaveBeenCalledWith({
      from: '"Website Contact" <sender@example.com>',
      to: "inbox@example.com",
      replyTo: "jane@example.com",
      subject: "[Contact] Hi",
      text: expect.stringContaining("Hello"),
    });
  });

  it("returns send_failed without exposing credentials on transport error", async () => {
    const result = await sendContactEmail(fields, {
      env,
      createTransporter: () => ({
        sendMail: async () => {
          throw new Error("Invalid login: app-pass leaked?");
        },
      }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("send_failed");
      // detail is for server logs only; route must not return it to clients
      expect(result.detail).toContain("Invalid login");
    }
  });
});
