import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES, validateUpload } from "./uploads";

describe("request file validation", () => {
  it("accepts supported audio and video files under the limit", () => {
    expect(() => validateUpload("audio/mpeg", 1024)).not.toThrow();
    expect(() => validateUpload("video/mp4", MAX_UPLOAD_BYTES)).not.toThrow();
  });

  it("rejects unsupported media types", () => {
    expect(() => validateUpload("application/pdf", 1024)).toThrow("Unsupported file type");
  });

  it("rejects empty and oversized files", () => {
    expect(() => validateUpload("audio/mpeg", 0)).toThrow("File size");
    expect(() => validateUpload("audio/mpeg", MAX_UPLOAD_BYTES + 1)).toThrow("File size");
  });
});
