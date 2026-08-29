import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateAudioFile } from "../audio/validate";
import { createTranscript, listTranscripts } from "../api/transcripts";
import { fetchQuota } from "../api/quota";
import { useTranscription } from "../transcription/useTranscription";
import { Dropzone } from "../components/ui/Dropzone";
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
const GUEST_TABS = [
  { id: "transcript", label: "Transcript" },
  { id: "summary", label: "Summary (Locked)" },
];

type SaveStatus = "idle" | "saving" | "error";
type GuestTabId = "transcript" | "summary";

export function Home() {
  const pipeline = useTranscription();
  const auth = useAuth();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [fileError, setFileError] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaResponse | null>(null);
  const [recent, setRecent] = useState<TranscriptSummary[]>([]);
  const [pendingFileName, setPendingFileName] = useState("");
  const [guestTab, setGuestTab] = useState<GuestTabId>("transcript");
  const [guestActiveIdx, setGuestActiveIdx] = useState<number | null>(null);

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

        {showDropzone && <Dropzone onFileSelected={handleFile} />}

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
        {pipeline.status === "done" && pipeline.completed && isGuest && (
          <TranscriptDetailView
            title={pipeline.completed.fileName}
            metaLine={`Not saved · ${formatTimestamp(pipeline.completed.durationMs)}`}
            saved={false}
            canCopy={false}
            copyText={pipeline.completed.result.text}
            exportSlot={<LockedExportPanel />}
          >
            <Tabs
              tabs={GUEST_TABS}
              value={guestTab}
              onChange={(id) => setGuestTab(id as GuestTabId)}
            />

            {guestTab === "transcript" && (
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
                      active={guestActiveIdx === i}
                      onClick={() => setGuestActiveIdx(i)}
                    />
                  ))}
                </div>
              </Card>
            )}

            {guestTab === "summary" && <SummaryLockedPanel />}
          </TranscriptDetailView>
        )}
        {pipeline.status === "done" && pipeline.completed && !isGuest && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-sm" style={{ color: "var(--text-body)" }}>
              {pipeline.completed.result.text}
            </p>
            <button
              onClick={() => void saveTranscript()}
              disabled={saveStatus === "saving"}
              className="rounded bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-950 disabled:opacity-50"
            >
              {saveStatus === "saving" ? "Saving…" : "Save transcript"}
            </button>
            {saveStatus === "error" && (
              <p className="text-sm text-red-400">Failed to save transcript.</p>
            )}
          </div>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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
