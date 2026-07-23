import { afterEach, describe, expect, it } from "vitest";
import {
  checkContactRateLimit,
  resetContactRateLimitStore,
} from "./rate-limit";

describe("checkContactRateLimit", () => {
  afterEach(() => {
    resetContactRateLimitStore();
  });

  it("allows requests under the limit", () => {
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) {
      expect(checkContactRateLimit("1.2.3.4", now, { max: 5, windowMs: 60_000 }))
        .toEqual({ allowed: true });
    }
  });

  it("blocks after the limit and returns retry-after", () => {
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) {
      checkContactRateLimit("9.9.9.9", now, { max: 5, windowMs: 60_000 });
    }
    expect(checkContactRateLimit("9.9.9.9", now + 1_000, { max: 5, windowMs: 60_000 }))
      .toEqual({
        allowed: false,
        retryAfterSeconds: 59,
      });
  });

  it("resets after the window", () => {
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) {
      checkContactRateLimit("8.8.8.8", now, { max: 5, windowMs: 60_000 });
    }
    expect(
      checkContactRateLimit("8.8.8.8", now + 60_000, {
        max: 5,
        windowMs: 60_000,
      }),
    ).toEqual({ allowed: true });
  });
});
