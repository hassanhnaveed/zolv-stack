import { describe, expect, it } from "vitest";
import { CloudError, isCloudError } from "./errors";

describe("CloudError", () => {
  it("sets code and isCloudError returns true", () => {
    const err = new CloudError("permission_denied", "denied");
    expect(err.code).toBe("permission_denied");
    expect(err.message).toBe("denied");
    expect(isCloudError(err)).toBe(true);
  });

  it("isCloudError returns false for normal errors", () => {
    expect(isCloudError(new Error("x"))).toBe(false);
  });
});
