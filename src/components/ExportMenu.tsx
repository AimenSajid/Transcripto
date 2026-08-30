import { useState } from "react";
import { exportTranscript, type ExportFormat } from "../api/transcripts";
import { downloadBlob } from "../lib/download";
import { Button } from "./ui/Button";

const FORMATS: { value: ExportFormat; ext: string; desc: string }[] = [
  { value: "txt", ext: "TXT", desc: "Plain text, no timecodes" },
  { value: "srt", ext: "SRT", desc: "Subtitles for video editors" },
  { value: "vtt", ext: "VTT", desc: "Web captions, chapter markers included" },
  { value: "md", ext: "MD", desc: "Markdown with the summary on top" },
];

export function ExportMenu({
  transcriptId,
  title,
}: {
  transcriptId: number;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    try {
      const blob = await exportTranscript(transcriptId, format);
      downloadBlob(blob, `${title}.${format}`);
      setError(null);
      setOpen(false);
    } catch {
      setError(format);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <Button onClick={() => setOpen((v) => !v)}>Export</Button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            zIndex: 30,
            width: "min(290px, calc(100vw - 24px))",
            background: "var(--surface-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-lg)",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => void handleExport(f.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                textAlign: "left",
                background: "none",
                border: 0,
                padding: "10px 12px",
                borderRadius: "var(--radius-xs)",
                cursor: "pointer",
                transition: "var(--transition-control)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                style={{
                  font: "var(--fw-semibold) var(--text-xs)/1 var(--font-mono)",
                  letterSpacing: "var(--ls-caps)",
                  color: "var(--text-strong)",
                  width: 62,
                  flex: "0 0 62px",
                }}
              >
                {f.ext}
              </span>
              <span
                style={{
                  font: "var(--fw-regular) var(--text-sm)/1.4 var(--font-body)",
                  color: "var(--text-muted)",
                  minWidth: 0,
                }}
              >
                {f.desc}
              </span>
            </button>
          ))}
          {error && (
            <p
              style={{
                color: "var(--red-500)",
                fontSize: "var(--text-xs)",
                padding: "6px 12px 2px",
                margin: 0,
              }}
            >
              Failed to export {error}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
