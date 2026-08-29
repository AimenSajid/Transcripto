import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteTranscript, getTranscript, renameTranscript } from "../api/transcripts";
import { formatRowMeta, formatTimestamp } from "../lib/format";
import { SummaryPanel } from "../components/SummaryPanel";
import { ExportMenu } from "../components/ExportMenu";
import { TranscriptDetailView } from "../components/TranscriptDetailView";
import { Card } from "../components/ui/Card";
import { TranscriptLine } from "../components/ui/TranscriptLine";
import { Tabs } from "../components/ui/Tabs";
import type { Transcript as TranscriptType } from "../../shared/types";

type LoadStatus = "loading" | "done" | "error";
type TabId = "transcript" | "summary";

const TABS = [
  { id: "transcript", label: "Transcript" },
  { id: "summary", label: "Summary" },
];

export function Transcript() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState<TranscriptType | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [titleDraft, setTitleDraft] = useState("");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [tab, setTab] = useState<TabId>("transcript");

  useEffect(() => {
    if (!id) return;
    getTranscript(Number(id))
      .then((loaded) => {
        setTranscript(loaded);
        setTitleDraft(loaded.title);
        setStatus("done");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  async function handleRename() {
    if (!transcript || titleDraft.trim().length === 0) return;
    const updated = await renameTranscript(transcript.id, titleDraft.trim());
    setTranscript(updated);
  }

  async function handleDelete() {
    if (!transcript) return;
    await deleteTranscript(transcript.id);
    navigate("/history");
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-4 p-8">
      <Link
        to="/history"
        style={{ font: "var(--type-label)", color: "var(--text-muted)", textDecoration: "none" }}
      >
        ← Back to history
      </Link>

      {status === "loading" && <p style={{ color: "var(--text-muted)" }}>Loading…</p>}
      {status === "error" && <p style={{ color: "var(--red-500)" }}>Transcript not found.</p>}

      {transcript && (
        <TranscriptDetailView
          title={transcript.title}
          metaLine={`Saved · ${formatRowMeta(transcript)}`}
          saved
          canCopy
          copyText={transcript.text}
          exportSlot={<ExportMenu transcriptId={transcript.id} title={transcript.title} />}
          titleSlot={
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              style={{
                width: "100%",
                font: "var(--fw-extrabold) var(--text-h1)/1.15 var(--font-display)",
                letterSpacing: "var(--ls-heading)",
                color: "var(--text-strong)",
                background: "none",
                border: "none",
                padding: 0,
              }}
            />
          }
          actionsExtra={
            <>
              <button
                onClick={() => void handleRename()}
                style={{
                  font: "var(--type-label)",
                  color: "var(--text-muted)",
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                }}
              >
                Rename
              </button>
              <button
                onClick={() => void handleDelete()}
                style={{
                  font: "var(--type-label)",
                  color: "var(--red-500)",
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </>
          }
        >
          <Tabs
            tabs={TABS}
            value={tab}
            onChange={(id) => setTab(id as TabId)}
          />

          {tab === "transcript" && (
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
                {transcript.segments.map((segment, i) => (
                  <TranscriptLine
                    key={i}
                    time={formatTimestamp(segment.startMs)}
                    text={segment.text}
                    active={activeIdx === i}
                    onClick={() => setActiveIdx(i)}
                  />
                ))}
              </div>
            </Card>
          )}

          {tab === "summary" && (
            <SummaryPanel transcriptId={transcript.id} title={transcript.title} />
          )}
        </TranscriptDetailView>
      )}
    </main>
  );
}
