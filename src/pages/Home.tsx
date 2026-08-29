import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateAudioFile } from "../audio/validate";
import { createTranscript } from "../api/transcripts";
import { useTranscription } from "../transcription/useTranscription";
import { ProgressBar } from "../components/ProgressBar";
import { Dropzone } from "../components/ui/Dropzone";
import { useAuth } from "../context/AuthContext";

type SaveStatus = "idle" | "saving" | "error";

export function Home() {
  const pipeline = useTranscription();
  const auth = useAuth();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [fileError, setFileError] = useState<string | null>(null);

  function handleFile(file: File) {
    const error = validateAudioFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError(null);
    setSaveStatus("idle");
    void pipeline.run(file);
  }

  async function saveTranscript() {
    if (!pipeline.completed) return;
    setSaveStatus("saving");
    try {
      const transcript = await createTranscript({
        title: pipeline.completed.fileName,
        sourceFilename: pipeline.completed.fileName,
        durationMs: pipeline.completed.durationMs,
        segments: pipeline.completed.result.segments,
      });
      navigate(`/transcripts/${transcript.id}`);
    } catch {
      setSaveStatus("error");
    }
  }

  if (auth.status === "loading") {
    return <main className="flex flex-1 flex-col items-center p-8" />;
  }

  const isGuest = auth.status !== "signed-in";
  const showDropzone = pipeline.status === "idle" || pipeline.status === "error";

  return (
    <main className="flex flex-1 flex-col items-center p-8">
      <div style={{ width: "100%", maxWidth: 880, display: "flex", flexDirection: "column", gap: 24 }}>
        {isGuest ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 4 }}>
            <h1
              style={{
                font: "var(--fw-extrabold) 40px/1.1 var(--font-display)",
                letterSpacing: "var(--ls-display)",
                color: "var(--text-strong)",
                margin: 0,
                maxWidth: "15ch",
              }}
            >
              Convert Audio to Text Instantly
            </h1>
            <p
              style={{
                font: "var(--fw-regular) var(--text-lg)/1.6 var(--font-body)",
                color: "var(--text-muted)",
                margin: 0,
                maxWidth: "54ch",
              }}
            >
              Upload an audio file and get accurate, AI-powered transcription
              in seconds. No account needed.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h1
              style={{
                font: "var(--fw-extrabold) var(--text-h1)/1.15 var(--font-display)",
                letterSpacing: "var(--ls-heading)",
                color: "var(--text-strong)",
                margin: 0,
              }}
            >
              New Transcription
            </h1>
            <p style={{ font: "var(--type-body)", color: "var(--text-muted)", margin: 0 }}>
              Saved to your history, summarised, and exportable when it's done.
            </p>
          </div>
        )}

        {showDropzone && <Dropzone onFileSelected={handleFile} />}

        {fileError && <p className="text-sm text-red-400">{fileError}</p>}

        {pipeline.status === "segmenting" && (
          <p className="text-sm text-neutral-400">Splitting audio…</p>
        )}
        {pipeline.status === "transcribing" && (
          <ProgressBar done={pipeline.progress.done} total={pipeline.progress.total} />
        )}
        {pipeline.status === "error" && (
          <p className="text-sm text-red-400">{pipeline.error}</p>
        )}
        {pipeline.status === "done" && pipeline.completed && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-sm" style={{ color: "var(--text-body)" }}>
              {pipeline.completed.result.text}
            </p>
            {auth.status === "signed-in" ? (
              <button
                onClick={() => void saveTranscript()}
                disabled={saveStatus === "saving"}
                className="rounded bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-950 disabled:opacity-50"
              >
                {saveStatus === "saving" ? "Saving…" : "Save transcript"}
              </button>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Sign in to save this transcript and get an AI summary.
              </p>
            )}
            {saveStatus === "error" && (
              <p className="text-sm text-red-400">Failed to save transcript.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
