import { describe, expect, it } from "vitest";
import { mimeTypesFromAccept } from "./mime";

describe("mimeTypesFromAccept", () => {
  it("returns MIME keys from accept map", () => {
    expect(
      mimeTypesFromAccept({
        "image/png": [".png"],
        "application/pdf": [".pdf"],
      }),
    ).toEqual(["image/png", "application/pdf"]);
  });

  it("excludes Google Workspace MIME types", () => {
    expect(
      mimeTypesFromAccept({
        "application/pdf": [".pdf"],
        "application/vnd.google-apps.document": [],
        "application/vnd.google-apps.spreadsheet": [],
      }),
    ).toEqual(["application/pdf"]);
  });

  it("skips empty MIME keys", () => {
    expect(
      mimeTypesFromAccept({
        "": [".x"],
        "image/jpeg": [".jpg", ".jpeg"],
      }),
    ).toEqual(["image/jpeg"]);
  });
});
