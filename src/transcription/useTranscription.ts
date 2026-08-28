import { useCallback, useState } from "react";
import { segmentAudioFile } from "../audio";
import { transcribeChunks } from "./pipeline";
import { stitchTranscripts } from "./stitch";
import type { TranscribeChunkResponse } from "../../shared/types";

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

export interface UseTranscriptionResult {
  status: TranscriptionStatus;
  progress: TranscriptionProgress;
  transcript: TranscribeChunkResponse | null;
  error: string | null;
  run: (file: File) => Promise<void>;
}

export function useTranscription(): UseTranscriptionResult {
  const [status, setStatus] = useState<TranscriptionStatus>("idle");
  const [progress, setProgress] = useState<TranscriptionProgress>({
    done: 0,
    total: 0,
  });
  const [transcript, setTranscript] = useState<TranscribeChunkResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (file: File) => {
    setStatus("segmenting");
    setTranscript(null);
    setError(null);
    setProgress({ done: 0, total: 0 });

    try {
      const chunks = await segmentAudioFile(file);
      setStatus("transcribing");
      setProgress({ done: 0, total: chunks.length });

      const responses = await transcribeChunks(chunks, {
        onProgress: (statuses) => {
          const done = statuses.filter((s) => s === "done").length;
          setProgress({ done, total: statuses.length });
        },
      });

      setTranscript(stitchTranscripts(responses));
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
      setStatus("error");
    }
  }, []);

  return { status, progress, transcript, error, run };
}
