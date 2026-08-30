import { useEffect, useState } from "react";
import { generateSummary, getSummary } from "../api/summaries";
import { downloadBlob } from "../lib/download";
import { Card } from "./ui/Card";
import type { Summary } from "../../shared/types";

type Status = "loading" | "generating" | "idle" | "missing" | "error";

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

const labelStyle = {
  font: "var(--fw-semibold) var(--text-xs)/1 var(--font-body)",
  letterSpacing: "var(--ls-caps)",
  textTransform: "uppercase" as const,
  color: "var(--text-subtle)",
};

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
    getSummary(transcriptId)
      .then((result) => {
        setSummary(result);
        setStatus(result ? "idle" : "missing");
      })
      .catch(() => setStatus("error"));
  }, [transcriptId]);

  async function handleGenerate(regenerate: boolean) {
    setStatus("generating");
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
    <Card padding="28px">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={labelStyle}>Overview</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {summary && (
              <button
                onClick={handleDownload}
                style={{
                  font: "var(--type-label)",
                  color: "var(--text-muted)",
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                }}
              >
                Download
              </button>
            )}
            <button
              onClick={() => void handleGenerate(summary !== null)}
              disabled={status === "loading" || status === "generating"}
              style={{
                font: "var(--type-label)",
                color: "var(--text-muted)",
                background: "none",
                border: 0,
                cursor: "pointer",
                opacity: status === "loading" || status === "generating" ? 0.5 : 1,
              }}
            >
              {status === "generating"
                ? "Generating…"
                : summary
                  ? "Regenerate"
                  : "Generate summary"}
            </button>
          </div>
        </div>

        {status === "missing" && (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
            No summary saved for this transcript yet.
          </p>
        )}

        {status === "error" && (
          <p style={{ color: "var(--red-500)", fontSize: "var(--text-sm)", margin: 0 }}>
            Failed to generate summary.
          </p>
        )}

        {summary && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p
              style={{
                font: "var(--fw-regular) var(--text-lg)/1.6 var(--font-body)",
                color: "var(--text-body)",
                margin: 0,
              }}
            >
              {summary.summary}
            </p>

            {summary.keyPoints.length > 0 && (
              <div>
                <h3 style={{ ...labelStyle, margin: "0 0 8px" }}>Key points</h3>
                <ul
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    margin: 0,
                    paddingLeft: 18,
                    color: "var(--text-body)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {summary.keyPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.actionItems.length > 0 && (
              <div>
                <h3 style={{ ...labelStyle, margin: "0 0 8px" }}>Action items</h3>
                <ul
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    margin: 0,
                    paddingLeft: 18,
                    color: "var(--text-body)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {summary.actionItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
