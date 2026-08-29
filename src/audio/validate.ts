const ALLOWED_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"];
const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024;

/**
 * decodeAudioData handles container formats inconsistently across browsers,
 * so v1 restricts uploads to audio-only formats rather than letting a file
 * fail deep inside the pipeline with an opaque decode error.
 *
 * The size cap exists because decodeAudioData holds the entire decoded audio
 * in memory on the main thread before segmentation ever runs — a very large
 * file could strain a low-memory device well before the daily quota check
 * (which only runs after segmentation) would ever reject it.
 */
export function validateAudioFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));

  if (!hasAllowedExtension) {
    return `Unsupported file type. Accepted formats: ${ALLOWED_EXTENSIONS.join(", ")}`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large. Maximum size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`;
  }

  return null;
}
