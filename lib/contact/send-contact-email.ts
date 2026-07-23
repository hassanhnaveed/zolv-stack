import nodemailer from "nodemailer";
import { getErrorMessage } from "@/lib/utils";
import type { ContactFields } from "./validate";
import { sanitizeBodyText, sanitizeHeaderValue } from "./sanitize";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  contactEmail: string;
};

export type SendContactEmailResult =
  | { ok: true }
  | { ok: false; reason: "misconfigured" | "send_failed"; detail: string };

export type EnvLike = Record<string, string | undefined>;

export type ContactEmailContent = {
  subject: string;
  text: string;
  replyTo: string;
};

export function getSmtpConfig(env: EnvLike = process.env): SmtpConfig | null {
  const host = env.SMTP_HOST?.trim() ?? "";
  const portRaw = env.SMTP_PORT?.trim() ?? "";
  const user = env.SMTP_USER?.trim() ?? "";
  const pass = env.SMTP_PASS?.trim() ?? "";
  const contactEmail = env.CONTACT_EMAIL?.trim() ?? "";

  if (!host || !portRaw || !user || !pass || !contactEmail) {
    return null;
  }

  const port = Number(portRaw);
  if (!Number.isInteger(port) || port <= 0) {
    return null;
  }

  return { host, port, user, pass, contactEmail };
}

function formatReceivedAt(date: Date): string {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

/**
 * Build a plain-text contact notification. Safe for headers via sanitization.
 * Optional `source` labels which UI form sent the message.
 */
export function buildContactEmailContent(
  fields: ContactFields,
  receivedAt: Date = new Date(),
): ContactEmailContent {
  const name = sanitizeHeaderValue(fields.name);
  const email = sanitizeHeaderValue(fields.email);
  const subject = sanitizeHeaderValue(fields.subject);
  const message = sanitizeBodyText(fields.message);
  const source = fields.source
    ? sanitizeHeaderValue(fields.source)
    : undefined;

  const originLine = source
    ? `Sent via the website contact form (${source}).`
    : "Sent via the website contact form.";

  return {
    subject: source ? `[Contact · ${source}] ${subject}` : `[Contact] ${subject}`,
    replyTo: email,
    text: [
      "New contact form submission",
      "",
      "From",
      `  Name:  ${name}`,
      `  Email: ${email}`,
      "",
      "Subject",
      `  ${subject}`,
      "",
      "Message",
      "-------",
      message,
      "",
      "—",
      originLine,
      "Reply directly to this email to respond to the sender.",
      `Received: ${formatReceivedAt(receivedAt)}`,
    ].join("\n"),
  };
}

type TransporterFactory = (config: SmtpConfig) => {
  sendMail: (options: {
    from: string;
    to: string;
    replyTo: string;
    subject: string;
    text: string;
  }) => Promise<unknown>;
};

const defaultCreateTransporter: TransporterFactory = (config) =>
  nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

/**
 * Send a contact notification over SMTP.
 * `from` is always the authenticated mailbox; the submitter is `replyTo` only.
 */
export async function sendContactEmail(
  fields: ContactFields,
  options: {
    env?: EnvLike;
    createTransporter?: TransporterFactory;
  } = {},
): Promise<SendContactEmailResult> {
  const config = getSmtpConfig(options.env ?? process.env);
  if (!config) {
    return {
      ok: false,
      reason: "misconfigured",
      detail: "SMTP environment variables are missing or invalid.",
    };
  }

  const content = buildContactEmailContent(fields);
  const createTransporter =
    options.createTransporter ?? defaultCreateTransporter;

  try {
    const transporter = createTransporter(config);
    await transporter.sendMail({
      from: `"Website Contact" <${config.user}>`,
      to: config.contactEmail,
      replyTo: content.replyTo,
      subject: content.subject,
      text: content.text,
    });
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      reason: "send_failed",
      detail: getErrorMessage(err, "Failed to send contact email."),
    };
  }
}
