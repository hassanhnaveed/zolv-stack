import { describe, expect, it, afterEach } from "vitest";
import { CloudError } from "@/lib/cloud/errors";
import {
  deriveAppIdFromClientId,
  getGoogleDrivePublicConfig,
} from "./config";

describe("deriveAppIdFromClientId", () => {
  it("extracts project number prefix", () => {
    expect(
      deriveAppIdFromClientId(
        "123456789012-abcdefg.apps.googleusercontent.com",
      ),
    ).toBe("123456789012");
  });

  it("returns empty string when no numeric prefix", () => {
    expect(deriveAppIdFromClientId("not-a-standard-client-id")).toBe("");
  });
});

describe("getGoogleDrivePublicConfig", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("derives appId from clientId when APP_ID env is missing", () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID =
      "987654321098-xyz.apps.googleusercontent.com";
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY = "test-api-key";
    delete process.env.NEXT_PUBLIC_GOOGLE_APP_ID;

    expect(getGoogleDrivePublicConfig()).toEqual({
      clientId: "987654321098-xyz.apps.googleusercontent.com",
      apiKey: "test-api-key",
      appId: "987654321098",
    });
  });

  it("prefers explicit APP_ID over derived value", () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID =
      "987654321098-xyz.apps.googleusercontent.com";
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY = "test-api-key";
    process.env.NEXT_PUBLIC_GOOGLE_APP_ID = "111222333444";

    expect(getGoogleDrivePublicConfig().appId).toBe("111222333444");
  });

  it("throws when client id or api key missing", () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY = "test-api-key";
    expect(() => getGoogleDrivePublicConfig()).toThrow(CloudError);
  });
});
