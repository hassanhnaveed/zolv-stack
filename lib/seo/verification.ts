/**
 * Shared verification-token helpers for the `lib/seo/*` module (SEO
 * Architecture v1.0, Task 9).
 *
 * Both `validate.ts` (`seo:check` / audit, error-reporting) and
 * `metadata.ts` (`buildRootMetadata`, defensive/non-fatal) need to
 * recognize placeholder/example verification tokens. This module is the
 * single home for that detection so neither consumer duplicates the
 * placeholder regex list (spec: "reuse existing placeholder validation
 * logic; do not create parallel regexes"). `validate.ts` re-exports
 * {@link isPlaceholderVerificationToken} unchanged so existing imports
 * keep working.
 */

const PLACEHOLDER_TOKEN_PATTERNS: readonly RegExp[] = [
  /your[-_ ]?token/i,
  /replace[-_ ]?me/i,
  /example/i,
  /change[-_ ]?me/i,
  /placeholder/i,
  /insert[-_ ]?token/i,
  /sample[-_ ]?token/i,
  /dummy[-_ ]?token/i,
  /^x{4,}$/i,
  /^todo$/i,
];

/** Whether `token` looks like an unfilled placeholder value (e.g.
 * `"your-token-here"`, `"REPLACE_ME"`) rather than a real verification
 * token (spec: "Reject placeholder/example tokens"). */
export function isPlaceholderVerificationToken(token: string): boolean {
  return PLACEHOLDER_TOKEN_PATTERNS.some((pattern) => pattern.test(token));
}
