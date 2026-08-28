import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteTranscript, getTranscript, renameTranscript } from "../api/transcripts";
import { formatTimestamp } from "../lib/format";
import type { Transcript as TranscriptType } from "../../shared/types";

type LoadStatus = "loading" | "done" | "error";

export function Transcript() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState<TranscriptType | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [titleDraft, setTitleDraft] = useState("");

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
    <main className="flex min-h-screen flex-col items-center gap-4 bg-neutral-950 p-8 text-neutral-100">
      <Link to="/history" className="text-sm text-neutral-400 underline">
        Back to history
      </Link>

      {status === "loading" && (
        <p className="text-sm text-neutral-400">Loading…</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-400">Transcript not found.</p>
      )}

      {transcript && (
        <div className="flex w-full max-w-2xl flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="flex-1 rounded bg-neutral-900 px-3 py-1 text-lg font-semibold text-neutral-100"
            />
            <button
              onClick={() => void handleRename()}
              className="text-xs text-neutral-400 underline"
            >
              Rename
            </button>
            <button
              onClick={() => void handleDelete()}
              className="text-xs text-red-400 underline"
            >
              Delete
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {transcript.segments.map((segment, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 text-neutral-500">
                  {formatTimestamp(segment.startMs)}
                </span>
                <span className="text-neutral-200">{segment.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
