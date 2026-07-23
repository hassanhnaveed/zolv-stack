export const CONTACT_FIELD_LIMITS = {
  name: 120,
  email: 254,
  subject: 200,
  message: 5000,
  /** Optional form identifier for multi-form setups (e.g. "contact-page"). */
  source: 64,
} as const;

export type ContactFields = {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Which UI form submitted this message; omitted when unset. */
  source?: string;
};

export type ContactPayload = Partial<ContactFields> & {
  /**
   * Honeypot trap. Real users leave this empty; bots often fill it.
   * Future forms should include the same field name.
   */
  website?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidateContactResult =
  | { ok: true; fields: ContactFields; isHoneypot: false }
  | { ok: true; fields: null; isHoneypot: true }
  | { ok: false; error: string };

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Server-side validation for contact form payloads (source of truth).
 * Filled honeypot → silent success so the caller skips sending mail.
 */
export function validateContactPayload(
  body: ContactPayload,
): ValidateContactResult {
  if (asTrimmedString(body.website).length > 0) {
    return { ok: true, fields: null, isHoneypot: true };
  }

  const name = asTrimmedString(body.name);
  const email = asTrimmedString(body.email);
  const subject = asTrimmedString(body.subject);
  const message = asTrimmedString(body.message);
  const source = asTrimmedString(body.source);

  if (!name || !email || !subject || !message) {
    return { ok: false, error: "All fields are required." };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Invalid email address." };
  }

  if (
    name.length > CONTACT_FIELD_LIMITS.name ||
    email.length > CONTACT_FIELD_LIMITS.email ||
    subject.length > CONTACT_FIELD_LIMITS.subject ||
    message.length > CONTACT_FIELD_LIMITS.message ||
    source.length > CONTACT_FIELD_LIMITS.source
  ) {
    return {
      ok: false,
      error: "One or more fields exceed the allowed length.",
    };
  }

  const fields: ContactFields = { name, email, subject, message };
  if (source) fields.source = source;

  return { ok: true, isHoneypot: false, fields };
}
