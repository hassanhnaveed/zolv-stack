type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const hits = new Map<string, RateLimitEntry>();

/** Soft cap so expired IPs cannot grow the map without bound. */
const MAX_TRACKED_KEYS = 2_000;

export const CONTACT_RATE_LIMIT = {
  max: 5,
  windowMs: 15 * 60 * 1000,
} as const;

function pruneExpired(now: number): void {
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key);
  }
}

/**
 * In-memory per-IP rate limiter (single process / Lightsail instance).
 * Spoofable via `X-Forwarded-For` unless a reverse proxy overwrites that header.
 */
export function checkContactRateLimit(
  key: string,
  now = Date.now(),
  options: { max?: number; windowMs?: number } = {},
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
  const max = options.max ?? CONTACT_RATE_LIMIT.max;
  const windowMs = options.windowMs ?? CONTACT_RATE_LIMIT.windowMs;
  const normalized = key.trim() || "unknown";

  if (hits.size > MAX_TRACKED_KEYS) {
    pruneExpired(now);
    if (hits.size > MAX_TRACKED_KEYS) hits.clear();
  }

  const existing = hits.get(normalized);
  if (!existing || existing.resetAt <= now) {
    hits.set(normalized, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      ),
    };
  }

  existing.count += 1;
  return { allowed: true };
}

/** Clears the store — for unit tests only. */
export function resetContactRateLimitStore(): void {
  hits.clear();
}
