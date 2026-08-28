import { useEffect, useState } from "react";
import { arrayBufferToBase64 } from "./audio/wav";
import { useTranscription } from "./transcription/useTranscription";
import { ProgressBar } from "./components/ProgressBar";
import { GoogleSignIn } from "./components/GoogleSignIn";
import { useAuth } from "./context/AuthContext";
import type { TranscribeChunkResponse } from "../shared/types";

type HealthStatus = "checking" | "ok" | "error";
type TranscribeStatus = "idle" | "transcribing" | "done" | "error";

function App() {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [transcribeStatus, setTranscribeStatus] =
    useState<TranscribeStatus>("idle");
  const [result, setResult] = useState<TranscribeChunkResponse | null>(null);
  const pipeline = useTranscription();
  const auth = useAuth();

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

      {auth.status === "loading" && (
        <p className="text-sm text-neutral-400">Checking sign-in…</p>
      )}

      {auth.status === "signed-out" && <GoogleSignIn />}

      {auth.status === "signed-in" && auth.user && (
        <div className="flex items-center gap-2 text-sm text-neutral-300">
          <span>Signed in as {auth.user.name ?? auth.user.email}</span>
          <button
            onClick={() => void auth.signOut()}
            className="text-xs text-neutral-400 underline"
          >
            Sign out
          </button>
        </div>
      )}

      {auth.status === "signed-in" && (
        <>
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
            Transcribe an audio file
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void pipeline.run(file);
              }}
              className="text-xs"
            />
          </label>

          {pipeline.status === "segmenting" && (
            <p className="text-sm text-neutral-400">Splitting audio…</p>
          )}
          {pipeline.status === "transcribing" && (
            <ProgressBar
              done={pipeline.progress.done}
              total={pipeline.progress.total}
            />
          )}
          {pipeline.status === "error" && (
            <p className="text-sm text-red-400">{pipeline.error}</p>
          )}
          {pipeline.status === "done" && pipeline.transcript && (
            <p className="max-w-md text-center text-sm text-neutral-200">
              {pipeline.transcript.text}
            </p>
          )}
        </>
      )}
    </main>
  );
}

export default App;
