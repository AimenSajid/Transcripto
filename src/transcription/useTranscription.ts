import { useCallback, useState } from "react";
import { fetchQuota } from "../api/quota";
import { segmentAudioFile } from "../audio";
import { transcribeChunks } from "./pipeline";
import { stitchTranscripts } from "./stitch";
import type { TranscribeChunkResponse } from "../../shared/types";

// Ceil for "how much this file needs" (a conservative at-least estimate),
// floor for "how much quota is left" (so it never overstates what's left
// and then rejects the file anyway — see QuotaBadge for the matching floor).
function formatNeededMinutes(ms: number): string {
  return `${Math.ceil(ms / 60000)} min`;
}

function formatRemainingMinutes(ms: number): string {
  return `${Math.floor(ms / 60000)} min`;
}

export type TranscriptionStatus =
  | "idle"
  | "segmenting"
  | "transcribing"
  | "done"
  | "error";

export interface TranscriptionProgress {
  done: number;
  total: number;
}

export interface CompletedTranscription {
  result: TranscribeChunkResponse;
  fileName: string;
  durationMs: number;
}

export interface UseTranscriptionResult {
  status: TranscriptionStatus;
  progress: TranscriptionProgress;
  completed: CompletedTranscription | null;
  error: string | null;
  run: (file: File) => Promise<void>;
}

export function useTranscription(): UseTranscriptionResult {
  const [status, setStatus] = useState<TranscriptionStatus>("idle");
  const [progress, setProgress] = useState<TranscriptionProgress>({
    done: 0,
    total: 0,
  });
  const [completed, setCompleted] = useState<CompletedTranscription | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (file: File) => {
    setStatus("segmenting");
    setCompleted(null);
    setError(null);
    setProgress({ done: 0, total: 0 });

    try {
      const chunks = await segmentAudioFile(file);
      const durationMs = chunks.reduce((sum, chunk) => sum + chunk.durationMs, 0);

      const quota = await fetchQuota();
      if (durationMs > quota.remainingMs) {
        setError(
          `This file is ${formatNeededMinutes(durationMs)}, but you only have ${formatRemainingMinutes(quota.remainingMs)} left today.`,
        );
        setStatus("error");
        return;
      }

      setStatus("transcribing");
      setProgress({ done: 0, total: chunks.length });

      const responses = await transcribeChunks(chunks, {
        onProgress: (statuses) => {
          const done = statuses.filter((s) => s === "done").length;
          setProgress({ done, total: statuses.length });
        },
      });

      setCompleted({
        result: stitchTranscripts(responses),
        fileName: file.name,
        durationMs,
      });
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
      setStatus("error");
    }
  }, []);

  return { status, progress, completed, error, run };
}
