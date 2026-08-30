import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateAudioFile } from "../audio/validate";
import { createTranscript, listTranscripts } from "../api/transcripts";
import { fetchQuota } from "../api/quota";
import { useTranscription } from "../transcription/useTranscription";
import { Dropzone } from "../components/ui/Dropzone";
import { RecordPanel } from "../components/ui/RecordPanel";
import { useAudioRecorder } from "../audio/useAudioRecorder";
import { ProcessingView } from "../components/ProcessingView";
import { LimitReachedCard } from "../components/LimitReachedCard";
import { FileErrorCard } from "../components/FileErrorCard";
import { FeatureCard } from "../components/ui/FeatureCard";
import { TranscriptionRow } from "../components/TranscriptionRow";
import { TranscriptDetailView } from "../components/TranscriptDetailView";
import { LockedExportPanel } from "../components/LockedExportPanel";
import { SummaryLockedPanel } from "../components/SummaryLockedPanel";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Tabs } from "../components/ui/Tabs";
import { TranscriptLine } from "../components/ui/TranscriptLine";
import { formatRowMeta, formatTimestamp } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import type { QuotaResponse, TranscriptSummary } from "../../shared/types";

const RECENT_LIMIT = 3;
const DONE_TABS = [
  { id: "transcript", label: "Transcript" },
  { id: "summary", label: "Summary (Locked)" },
];

type SaveStatus = "idle" | "saving" | "error";
type DoneTabId = "transcript" | "summary";
type InputMode = "upload" | "record";

export function Home() {
  const pipeline = useTranscription();
  const auth = useAuth();
  const navigate = useNavigate();
  const recorder = useAudioRecorder();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [fileError, setFileError] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaResponse | null>(null);
  const [recent, setRecent] = useState<TranscriptSummary[]>([]);
  const [pendingFileName, setPendingFileName] = useState("");
  const [doneTab, setDoneTab] = useState<DoneTabId>("transcript");
  const [doneActiveIdx, setDoneActiveIdx] = useState<number | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("upload");

  useEffect(() => {
    fetchQuota()
      .then(setQuota)
      .catch(() => setQuota(null));
  }, [pipeline.status]);

  useEffect(() => {
    if (auth.status !== "signed-in") return;
    listTranscripts({ limit: RECENT_LIMIT })
      .then((res) => setRecent(res.items))
      .catch(() => setRecent([]));
  }, [auth.status, pipeline.status]);

  function handleFile(file: File) {
    const error = validateAudioFile(file);
    if (error) {
      setFileError(error);
      return;
    }
    setFileError(null);
    setSaveStatus("idle");
    setPendingFileName(file.name);
    void pipeline.run(file);
  }

  async function handleRecordToggle() {
    if (recorder.status === "recording") {
      const file = await recorder.stop();
      if (file) handleFile(file);
    } else {
      await recorder.start();
    }
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
  const quotaExhausted = quota !== null && quota.remainingMs <= 0;
  const idle = pipeline.status === "idle";
  const showLimitCard = idle && quotaExhausted;
  const showFileErrorCard = idle && !quotaExhausted && fileError !== null;
  const showDropzone = idle && !quotaExhausted && fileError === null;

  return (
    <main className="flex flex-1 flex-col items-center p-8">
      <div
        style={{
          width: "100%",
          maxWidth: 880,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
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

        {showDropzone && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {(["upload", "record"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setInputMode(mode)}
                  style={{
                    font: "var(--type-label)",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border-subtle)",
                    background:
                      inputMode === mode ? "var(--surface-active)" : "transparent",
                    color: inputMode === mode ? "var(--text-strong)" : "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  {mode === "upload" ? "Upload File" : "Record Audio"}
                </button>
              ))}
            </div>

            {inputMode === "upload" ? (
              <Dropzone onFileSelected={handleFile} />
            ) : (
              <RecordPanel
                elapsed={formatTimestamp(recorder.elapsedMs)}
                status={
                  recorder.status === "requesting"
                    ? "Requesting microphone…"
                    : recorder.status === "recording"
                      ? "Recording…"
                      : recorder.status === "error"
                        ? (recorder.error ?? "Something went wrong.")
                        : "Ready to record"
                }
                recording={recorder.status === "recording"}
                disabled={recorder.status === "requesting"}
                onToggle={() => void handleRecordToggle()}
              />
            )}
          </div>
        )}

        {showLimitCard && quota && (
          <LimitReachedCard
            limitMinutes={Math.floor(quota.limitMs / 60000)}
            resetsAt={quota.resetsAt}
          />
        )}

        {showFileErrorCard && fileError && (
          <FileErrorCard message={fileError} onChooseAnother={() => setFileError(null)} />
        )}

        {(pipeline.status === "segmenting" || pipeline.status === "transcribing") && (
          <ProcessingView
            status={pipeline.status}
            progress={pipeline.progress}
            fileName={pendingFileName}
            isGuest={isGuest}
            onCancel={pipeline.cancel}
          />
        )}
        {pipeline.status === "error" && (
          <p className="text-sm text-red-400">{pipeline.error}</p>
        )}
        {pipeline.status === "done" && pipeline.completed && (
          <TranscriptDetailView
            title={pipeline.completed.fileName}
            metaLine={`Not saved · ${formatTimestamp(pipeline.completed.durationMs)}`}
            saved={false}
            canCopy
            copyText={pipeline.completed.result.text}
            notSavedMessage={
              isGuest
                ? "This transcript isn't saved. Signing in keeps it in your history with a summary and export options."
                : "This transcript isn't saved yet. Save it to keep it in your history with a summary and export options."
            }
            exportSlot={
              isGuest ? (
                <LockedExportPanel />
              ) : (
                <Button onClick={() => void saveTranscript()} disabled={saveStatus === "saving"}>
                  {saveStatus === "saving" ? "Saving…" : "Save transcript"}
                </Button>
              )
            }
            actionsExtra={
              <Button variant="ghost" onClick={() => navigate("/")}>
                New Transcription
              </Button>
            }
          >
            <Tabs
              tabs={DONE_TABS}
              value={doneTab}
              onChange={(id) => setDoneTab(id as DoneTabId)}
            />

            {doneTab === "transcript" && (
              <Card tone="sunken" padding="8px">
                <div
                  style={{
                    maxHeight: 520,
                    overflowY: "auto",
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {pipeline.completed.result.segments.map((segment, i) => (
                    <TranscriptLine
                      key={i}
                      time={formatTimestamp(segment.startMs)}
                      text={segment.text}
                      active={doneActiveIdx === i}
                      onClick={() => setDoneActiveIdx(i)}
                    />
                  ))}
                </div>
              </Card>
            )}

            {doneTab === "summary" &&
              (isGuest ? (
                <SummaryLockedPanel />
              ) : (
                <SummaryLockedPanel
                  heading="Save this transcript to see a summary"
                  body="Once it's saved, we'll generate an overview, key points, and action items — usually in under a minute."
                  ctaLabel={saveStatus === "saving" ? "Saving…" : "Save transcript"}
                  onCta={() => void saveTranscript()}
                />
              ))}
          </TranscriptDetailView>
        )}
        {pipeline.status === "done" && !isGuest && saveStatus === "error" && (
          <p className="text-sm text-red-400">Failed to save transcript.</p>
        )}

        {idle && isGuest && (
          <Card padding="26px">
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    font: "var(--fw-semibold) var(--text-xs)/1 var(--font-body)",
                    letterSpacing: "var(--ls-caps)",
                    textTransform: "uppercase",
                    color: "var(--text-subtle)",
                  }}
                >
                  With a free account
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 20,
                }}
              >
                <FeatureCard
                  icon="file-text"
                  title="Saved history"
                  body="Every transcript kept in your account"
                />
                <FeatureCard
                  icon="lightbulb"
                  title="AI summaries"
                  body="Overview, key points, and action items"
                />
                <FeatureCard
                  icon="cloud-download"
                  title="Export anywhere"
                  body="TXT, SRT, VTT and Markdown"
                />
              </div>
              <div
                className="guest-cta-row"
                style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
              >
                <Button onClick={() => navigate("/login")}>Get Started Free</Button>
                <span
                  style={{
                    font: "var(--fw-regular) var(--text-sm)/1.4 var(--font-body)",
                    color: "var(--text-subtle)",
                  }}
                >
                  30 minutes of transcription a day. No card needed.
                </span>
              </div>
            </div>
          </Card>
        )}

        {idle && !isGuest && recent.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <h2
                style={{
                  font: "var(--fw-bold) var(--text-h3)/1.3 var(--font-display)",
                  letterSpacing: "var(--ls-heading)",
                  color: "var(--text-strong)",
                  margin: 0,
                }}
              >
                Recent
              </h2>
              <Link
                to="/history"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "var(--type-label)",
                  color: "var(--text-muted)",
                  textDecoration: "none",
                }}
              >
                View all
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recent.map((t) => (
                <TranscriptionRow
                  key={t.id}
                  name={t.title}
                  meta={formatRowMeta(t)}
                  onClick={() => navigate(`/transcripts/${t.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
