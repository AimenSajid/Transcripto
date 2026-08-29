import type { ChunkResult, TranscribeChunkResponse } from "../../shared/types";

export type ChunkStatus = "pending" | "in-flight" | "done" | "failed";

export interface TranscribePipelineOptions {
  concurrency?: number;
  maxRetries?: number;
  language?: string;
  onProgress?: (statuses: ChunkStatus[]) => void;
  isCancelled?: () => boolean;
}

const DEFAULT_CONCURRENCY = 2;
const DEFAULT_MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 500;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function transcribeChunkWithRetry(
  chunk: ChunkResult,
  language: string | undefined,
  maxRetries: number,
): Promise<TranscribeChunkResponse> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch("/api/transcribe/chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: chunk.audioBase64,
          offsetMs: chunk.offsetMs,
          durationMs: chunk.durationMs,
          language,
        }),
      });
      if (!res.ok) throw new Error(`chunk at ${chunk.offsetMs}ms failed: ${res.status}`);
      return (await res.json()) as TranscribeChunkResponse;
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      await delay(RETRY_BASE_DELAY_MS * 2 ** attempt);
    }
  }
}

/**
 * Drives the chunk loop: transcribes every chunk with bounded concurrency,
 * retrying failures with backoff. Results are returned in the same order as
 * `chunks`, ready for stitching.
 */
export async function transcribeChunks(
  chunks: ChunkResult[],
  options: TranscribePipelineOptions = {},
): Promise<TranscribeChunkResponse[]> {
  const {
    concurrency = DEFAULT_CONCURRENCY,
    maxRetries = DEFAULT_MAX_RETRIES,
    language,
    onProgress,
    isCancelled,
  } = options;

  const results: TranscribeChunkResponse[] = new Array(chunks.length);
  const statuses: ChunkStatus[] = chunks.map(() => "pending");
  let nextIndex = 0;

  function reportProgress() {
    onProgress?.([...statuses]);
  }

  reportProgress();

  async function worker() {
    while (nextIndex < chunks.length) {
      if (isCancelled?.()) return;
      const index = nextIndex++;
      statuses[index] = "in-flight";
      reportProgress();
      try {
        results[index] = await transcribeChunkWithRetry(chunks[index], language, maxRetries);
        statuses[index] = "done";
      } catch (err) {
        statuses[index] = "failed";
        reportProgress();
        throw err;
      }
      reportProgress();
    }
  }

  const workerCount = Math.min(concurrency, chunks.length);
  await Promise.all(Array.from({ length: workerCount }, worker));

  return results;
}
