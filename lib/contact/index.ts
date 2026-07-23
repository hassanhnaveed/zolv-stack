/**
 * Shared contact-form email helpers.
 *
 * Future forms should POST the same JSON shape to `/api/contact`:
 * `{ name, email, subject, message, website?: "", source?: "my-form-id" }`
 * and reuse `validateContactPayload` / `sendContactEmail` rather than
 * adding a second mail path.
 */
export { sanitizeBodyText, sanitizeHeaderValue } from "./sanitize";
export {
  CONTACT_FIELD_LIMITS,
  validateContactPayload,
  type ContactFields,
  type ContactPayload,
  type ValidateContactResult,
} from "./validate";
export {
  CONTACT_RATE_LIMIT,
  checkContactRateLimit,
} from "./rate-limit";
export {
  buildContactEmailContent,
  getSmtpConfig,
  sendContactEmail,
  type ContactEmailContent,
  type EnvLike,
  type SendContactEmailResult,
  type SmtpConfig,
} from "./send-contact-email";
