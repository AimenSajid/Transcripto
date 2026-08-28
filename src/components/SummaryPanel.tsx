import { useState } from "react";
import { generateSummary } from "../api/summaries";
import type { Summary } from "../../shared/types";

type Status = "idle" | "loading" | "error";

export function SummaryPanel({ transcriptId }: { transcriptId: number }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function handleGenerate(regenerate: boolean) {
    setStatus("loading");
    try {
      const result = await generateSummary(transcriptId, regenerate);
      setSummary(result);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded bg-neutral-900 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">Summary</h2>
        <button
          onClick={() => void handleGenerate(summary !== null)}
          disabled={status === "loading"}
          className="text-xs text-neutral-400 underline disabled:opacity-50"
        >
          {status === "loading"
            ? "Generating…"
            : summary
              ? "Regenerate"
              : "Generate summary"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">Failed to generate summary.</p>
      )}

      {summary && (
        <div className="flex flex-col gap-3 text-sm text-neutral-200">
          <p>{summary.summary}</p>

          {summary.keyPoints.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-neutral-400">
                Key points
              </h3>
              <ul className="list-disc pl-4">
                {summary.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.actionItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-neutral-400">
                Action items
              </h3>
              <ul className="list-disc pl-4">
                {summary.actionItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
