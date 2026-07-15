import { describe, expect, it } from "vitest";
import { assertValidPickerSelection } from "./early-validate";
import { CloudError } from "@/lib/cloud/errors";
import type { GooglePickedFile } from "./picker";

const file = (
  partial: Partial<GooglePickedFile> & Pick<GooglePickedFile, "id" | "name">,
): GooglePickedFile => ({
  mimeType: "application/pdf",
  sizeBytes: 10,
  ...partial,
});

describe("assertValidPickerSelection", () => {
  it("throws when over maxFiles", () => {
    expect(() =>
      assertValidPickerSelection(
        [file({ id: "1", name: "a.pdf" }), file({ id: "2", name: "b.pdf" })],
        1,
      ),
    ).toThrow(CloudError);
  });

  it("throws on duplicate ids", () => {
    expect(() =>
      assertValidPickerSelection(
        [file({ id: "1", name: "a.pdf" }), file({ id: "1", name: "b.pdf" })],
        5,
      ),
    ).toThrow(CloudError);
  });

  it("throws on missing name or zero size", () => {
    expect(() =>
      assertValidPickerSelection([file({ id: "1", name: "" })], 5),
    ).toThrow(CloudError);
    expect(() =>
      assertValidPickerSelection(
        [file({ id: "1", name: "a.pdf", sizeBytes: 0 })],
        5,
      ),
    ).toThrow(CloudError);
  });

  it("allows valid selection", () => {
    expect(() =>
      assertValidPickerSelection([file({ id: "1", name: "a.pdf" })], 5),
    ).not.toThrow();
  });
});
