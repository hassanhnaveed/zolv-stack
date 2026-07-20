import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadDriveFile } from "./download";
import { CloudError } from "@/lib/cloud/errors";
import type { GooglePickedFile } from "./picker";

const pickedFile: GooglePickedFile = {
  id: "file-1",
  name: "a.pdf",
  mimeType: "application/pdf",
  sizeBytes: 10,
};

function mockFetchResponse(status: number, ok: boolean): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      status,
      ok,
      blob: async () => new Blob(["data"]),
    }),
  );
}

describe("downloadDriveFile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps HTTP 401 to token_expired", async () => {
    mockFetchResponse(401, false);
    let error: unknown;
    try {
      await downloadDriveFile(pickedFile, "token");
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(CloudError);
    expect((error as CloudError).code).toBe("token_expired");
  });

  it("maps HTTP 403 to permission_denied, not token_expired", async () => {
    mockFetchResponse(403, false);
    let error: unknown;
    try {
      await downloadDriveFile(pickedFile, "token");
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(CloudError);
    expect((error as CloudError).code).toBe("permission_denied");
  });

  it("maps other non-ok statuses to network", async () => {
    mockFetchResponse(500, false);
    let error: unknown;
    try {
      await downloadDriveFile(pickedFile, "token");
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(CloudError);
    expect((error as CloudError).code).toBe("network");
  });

  it("returns a File on success", async () => {
    mockFetchResponse(200, true);
    const file = await downloadDriveFile(pickedFile, "token");
    expect(file.name).toBe("a.pdf");
    expect(file.type).toBe("application/pdf");
  });
});
