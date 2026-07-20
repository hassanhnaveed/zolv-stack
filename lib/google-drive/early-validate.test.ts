import { describe, expect, it } from "vitest";
import { assertValidPickerSelection } from "./early-validate";
import { CloudError } from "@/lib/cloud/errors";
import type { AcceptMap } from "@/lib/cloud/types";
import type { GooglePickedFile } from "./picker";

const DEFAULT_ACCEPT: AcceptMap = { "application/pdf": [".pdf"] };
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024;

const file = (
  partial: Partial<GooglePickedFile> & Pick<GooglePickedFile, "id" | "name">,
): GooglePickedFile => ({
  mimeType: "application/pdf",
  sizeBytes: 10,
  ...partial,
});

const assertSelection = (
  files: GooglePickedFile[],
  maxFiles: number,
  accept: AcceptMap = DEFAULT_ACCEPT,
  maxSize: number = DEFAULT_MAX_SIZE,
) => assertValidPickerSelection(files, maxFiles, accept, maxSize);

describe("assertValidPickerSelection", () => {
  it("throws when over maxFiles", () => {
    expect(() =>
      assertSelection(
        [file({ id: "1", name: "a.pdf" }), file({ id: "2", name: "b.pdf" })],
        1,
      ),
    ).toThrow(CloudError);
  });

  it("throws on duplicate ids", () => {
    expect(() =>
      assertSelection(
        [file({ id: "1", name: "a.pdf" }), file({ id: "1", name: "b.pdf" })],
        5,
      ),
    ).toThrow(CloudError);
  });

  it("throws on missing name or zero size", () => {
    expect(() =>
      assertSelection([file({ id: "1", name: "" })], 5),
    ).toThrow(CloudError);
    expect(() =>
      assertSelection([file({ id: "1", name: "a.pdf", sizeBytes: 0 })], 5),
    ).toThrow(CloudError);
  });

  it("throws with invalid_selection when a file exceeds maxSize", () => {
    let error: unknown;
    try {
      assertSelection(
        [file({ id: "1", name: "big.pdf", sizeBytes: 60 * 1024 * 1024 })],
        5,
        DEFAULT_ACCEPT,
        50 * 1024 * 1024,
      );
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(CloudError);
    expect((error as CloudError).code).toBe("invalid_selection");
    expect((error as CloudError).message).toMatch(/too large/i);
  });

  it("allows a file exactly at maxSize", () => {
    expect(() =>
      assertSelection(
        [file({ id: "1", name: "a.pdf", sizeBytes: 50 * 1024 * 1024 })],
        5,
        DEFAULT_ACCEPT,
        50 * 1024 * 1024,
      ),
    ).not.toThrow();
  });

  it("throws with invalid_selection when mimeType is not in accept", () => {
    let error: unknown;
    try {
      assertSelection(
        [
          file({
            id: "1",
            name: "photo.png",
            mimeType: "image/png",
          }),
        ],
        5,
        { "application/pdf": [".pdf"] },
        DEFAULT_MAX_SIZE,
      );
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(CloudError);
    expect((error as CloudError).code).toBe("invalid_selection");
    expect((error as CloudError).message).toMatch(/supported file type/i);
  });

  it("allows a mimeType present in accept", () => {
    expect(() =>
      assertSelection(
        [file({ id: "1", name: "photo.png", mimeType: "image/png" })],
        5,
        { "image/png": [".png"], "application/pdf": [".pdf"] },
        DEFAULT_MAX_SIZE,
      ),
    ).not.toThrow();
  });

  it("skips the MIME check when accept is empty", () => {
    expect(() =>
      assertSelection(
        [file({ id: "1", name: "photo.png", mimeType: "image/png" })],
        5,
        {},
        DEFAULT_MAX_SIZE,
      ),
    ).not.toThrow();
  });

  it("allows valid selection", () => {
    expect(() =>
      assertSelection([file({ id: "1", name: "a.pdf" })], 5),
    ).not.toThrow();
  });
});
