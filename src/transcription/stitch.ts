import type { TranscribeChunkResponse } from "../../shared/types";

/**
 * Merges per-chunk Whisper responses into one transcript. Segment timestamps
 * are already offset server-side (see the API contract for
 * POST /api/transcribe/chunk), so this only concatenates segments in chunk
 * order and normalizes whitespace at the text seams.
 */
export function stitchTranscripts(
  chunks: TranscribeChunkResponse[],
): TranscribeChunkResponse {
  const segments = chunks.flatMap((chunk) => chunk.segments);

  const text = chunks
    .map((chunk) => chunk.text.trim())
    .filter((text) => text.length > 0)
    .join(" ");

  return { segments, text };
}
