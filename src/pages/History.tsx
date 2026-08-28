import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteTranscript, listTranscripts } from "../api/transcripts";
import type { TranscriptSummary } from "../../shared/types";

type LoadStatus = "loading" | "done" | "error";

export function History() {
  const [items, setItems] = useState<TranscriptSummary[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

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
          <li
            key={item.id}
            className="flex items-center justify-between rounded bg-neutral-900 px-4 py-2"
          >
            <Link
              to={`/transcripts/${item.id}`}
              className="text-sm text-neutral-100 hover:underline"
            >
              {item.title}
            </Link>
            <button
              onClick={() => void handleDelete(item.id)}
              className="text-xs text-red-400 underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
