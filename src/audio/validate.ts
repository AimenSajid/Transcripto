const ALLOWED_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"];

/**
 * decodeAudioData handles container formats inconsistently across browsers,
 * so v1 restricts uploads to audio-only formats rather than letting a file
 * fail deep inside the pipeline with an opaque decode error.
 */
export function validateAudioFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));

  if (!hasAllowedExtension) {
    return `Unsupported file type. Accepted formats: ${ALLOWED_EXTENSIONS.join(", ")}`;
  }

  return null;
}
