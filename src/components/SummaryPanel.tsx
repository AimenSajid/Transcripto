import { useEffect, useState } from "react";
import { generateSummary } from "../api/summaries";
import { downloadBlob } from "../lib/download";
import type { Summary } from "../../shared/types";

type Status = "loading" | "idle" | "error";

function formatSummaryForDownload(summary: Summary): string {
  const lines = [summary.summary, ""];

  if (summary.keyPoints.length > 0) {
    lines.push("Key Points:", ...summary.keyPoints.map((p) => `- ${p}`), "");
  }
  if (summary.actionItems.length > 0) {
    lines.push("Action Items:", ...summary.actionItems.map((a) => `- ${a}`));
  }

  return `${lines.join("\n").trim()}\n`;
}

export function SummaryPanel({
  transcriptId,
  title = "summary",
}: {
  transcriptId: number;
  title?: string;
}) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    setStatus("loading");
    setSummary(null);
    generateSummary(transcriptId, false)
      .then((result) => {
        setSummary(result);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [transcriptId]);

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

  function handleDownload() {
    if (!summary) return;
    const blob = new Blob([formatSummaryForDownload(summary)], {
      type: "text/plain",
    });
    downloadBlob(blob, `${title}-summary.txt`);
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded bg-neutral-900 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">Summary</h2>
        <div className="flex items-center gap-3">
          {summary && (
            <button
              onClick={handleDownload}
              className="text-xs text-neutral-400 underline"
            >
              Download
            </button>
          )}
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
