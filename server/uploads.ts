import { storagePut } from "./storage";

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/mpeg",
]);

export function validateUpload(contentType: string, size: number) {
  if (!allowedMimeTypes.has(contentType.toLowerCase())) {
    throw new Error("Unsupported file type");
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_UPLOAD_BYTES) {
    throw new Error("File size must be between 1 byte and 50 MB");
  }
}

function safeFileName(value: string) {
  const normalized = value.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "");
  return normalized.slice(0, 90) || "transcription-file";
}

export async function uploadRequestFile({
  fileName,
  contentType,
  data,
}: {
  fileName: string;
  contentType: string;
  data: Buffer;
}) {
  validateUpload(contentType, data.byteLength);
  const key = `transcripta-requests/${Date.now()}-${safeFileName(fileName)}`;
  const stored = await storagePut(key, data, contentType);
  return {
    ...stored,
    fileName: safeFileName(fileName),
    size: data.byteLength,
    contentType,
  };
}
