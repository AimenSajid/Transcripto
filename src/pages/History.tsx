import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteTranscript, listTranscripts } from "../api/transcripts";
import { SummaryPanel } from "../components/SummaryPanel";
import type { TranscriptSummary } from "../../shared/types";

type LoadStatus = "loading" | "done" | "error";

export function History() {
  const [items, setItems] = useState<TranscriptSummary[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    listTranscripts()
      .then((res) => {
        setItems(res.items);
        setStatus("done");
      })
      .catch(() => setStatus("error"));
  }, []);

  async function handleDelete(id: number) {
    await deleteTranscript(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 bg-neutral-950 p-8 text-neutral-100">
      <h1 className="text-2xl font-semibold">History</h1>
      <Link to="/" className="text-sm text-neutral-400 underline">
        Back to home
      </Link>

      {status === "loading" && (
        <p className="text-sm text-neutral-400">Loading…</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-400">Failed to load transcripts.</p>
      )}
      {status === "done" && items.length === 0 && (
        <p className="text-sm text-neutral-400">No transcripts yet.</p>
      )}

      <ul className="flex w-full max-w-md flex-col gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded bg-neutral-900 px-4 py-2">
              <Link
                to={`/transcripts/${item.id}`}
                className="text-sm text-neutral-100 hover:underline"
              >
                {item.title}
              </Link>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setExpandedId((prev) => (prev === item.id ? null : item.id))
                  }
                  className="text-xs text-neutral-400 underline"
                >
                  {expandedId === item.id ? "Hide Summary" : "View Summary"}
                </button>
                <button
                  onClick={() => void handleDelete(item.id)}
                  className="text-xs text-red-400 underline"
                >
                  Delete
                </button>
              </div>
            </div>

            {expandedId === item.id && (
              <SummaryPanel transcriptId={item.id} title={item.title} />
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
