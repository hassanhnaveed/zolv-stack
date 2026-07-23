/**
 * Strip CR/LF and other control characters that enable email header injection.
 */
export function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n\u0000-\u001F\u007F]/g, " ").trim();
}

/** Strip null bytes from body text while preserving intentional newlines. */
export function sanitizeBodyText(value: string): string {
  return value.replace(/\u0000/g, "").trim();
}
