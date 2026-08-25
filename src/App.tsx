import { useEffect, useState } from "react";
import { arrayBufferToBase64 } from "./audio/wav";
import { segmentAudioFile } from "./audio";
import type { ChunkResult, TranscribeChunkResponse } from "../shared/types";

type HealthStatus = "checking" | "ok" | "error";
type TranscribeStatus = "idle" | "transcribing" | "done" | "error";
type SegmentStatus = "idle" | "segmenting" | "done" | "error";

function App() {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [transcribeStatus, setTranscribeStatus] =
    useState<TranscribeStatus>("idle");
  const [result, setResult] = useState<TranscribeChunkResponse | null>(null);
  const [segmentStatus, setSegmentStatus] = useState<SegmentStatus>("idle");
  const [chunks, setChunks] = useState<ChunkResult[] | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  async function transcribeSample() {
    setTranscribeStatus("transcribing");
    setResult(null);
    try {
      const audioBuffer = await fetch("/sample.wav").then((res) =>
        res.arrayBuffer(),
      );
      const res = await fetch("/api/transcribe/chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: arrayBufferToBase64(audioBuffer),
          offsetMs: 0,
          durationMs: 4000,
        }),
      });
      if (!res.ok) throw new Error(`transcribe failed: ${res.status}`);
      const data = (await res.json()) as TranscribeChunkResponse;
      setResult(data);
      setTranscribeStatus("done");
    } catch {
      setTranscribeStatus("error");
    }
  }

  async function segmentFile(file: File) {
    setSegmentStatus("segmenting");
    setChunks(null);
    try {
      const result = await segmentAudioFile(file);
      setChunks(result);
      setSegmentStatus("done");
    } catch {
      setSegmentStatus("error");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-100">
      <h1 className="text-3xl font-semibold">Transcripto</h1>
      <p className="text-sm text-neutral-400">
        API health:{" "}
        <span
          className={
            status === "ok"
              ? "text-green-400"
              : status === "error"
                ? "text-red-400"
                : "text-neutral-400"
          }
        >
          {status}
        </span>
      </p>

      <button
        onClick={transcribeSample}
        disabled={transcribeStatus === "transcribing"}
        className="rounded bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-950 disabled:opacity-50"
      >
        {transcribeStatus === "transcribing"
          ? "Transcribing…"
          : "Transcribe sample clip"}
      </button>

      {transcribeStatus === "error" && (
        <p className="text-sm text-red-400">Transcription failed.</p>
      )}

      {result && (
        <p className="max-w-md text-center text-sm text-neutral-200">
          {result.text}
        </p>
      )}

      <label className="flex flex-col items-center gap-2 text-sm text-neutral-400">
        Segment an audio file
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void segmentFile(file);
          }}
          className="text-xs"
        />
      </label>

      {segmentStatus === "segmenting" && (
        <p className="text-sm text-neutral-400">Segmenting…</p>
      )}
      {segmentStatus === "error" && (
        <p className="text-sm text-red-400">Segmenting failed.</p>
      )}
      {chunks && (
        <ul className="max-w-md text-center text-sm text-neutral-200">
          {chunks.map((chunk, i) => (
            <li key={i}>
              chunk {i}: offset {chunk.offsetMs}ms, duration {chunk.durationMs}
              ms
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
