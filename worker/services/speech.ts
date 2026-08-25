import type { Segment } from "../../shared/types";

interface TranscribeChunkOptions {
  audioBase64: string;
  offsetMs: number;
  language?: string;
}

interface TranscribeChunkResult {
  text: string;
  segments: Segment[];
}

export async function transcribeChunk(
  ai: Ai,
  { audioBase64, offsetMs, language }: TranscribeChunkOptions,
): Promise<TranscribeChunkResult> {
  const output = await ai.run("@cf/openai/whisper-large-v3-turbo", {
    audio: audioBase64,
    language,
  });

  const segments: Segment[] = (output.segments ?? []).map((segment) => ({
    startMs: offsetMs + Math.round((segment.start ?? 0) * 1000),
    endMs: offsetMs + Math.round((segment.end ?? 0) * 1000),
    text: (segment.text ?? "").trim(),
  }));

  return { text: output.text, segments };
}
