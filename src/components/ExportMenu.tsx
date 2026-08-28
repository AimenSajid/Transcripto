import { useState } from "react";
import { exportTranscript, type ExportFormat } from "../api/transcripts";
import { downloadBlob } from "../lib/download";

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "txt", label: "TXT" },
  { value: "srt", label: "SRT" },
  { value: "vtt", label: "VTT" },
  { value: "md", label: "MD" },
];

export function ExportMenu({
  transcriptId,
  title,
}: {
  transcriptId: number;
  title: string;
}) {
  const [error, setError] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    try {
      const blob = await exportTranscript(transcriptId, format);
      downloadBlob(blob, `${title}.${format}`);
      setError(null);
    } catch {
      setError(format);
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs text-neutral-400">
      <span>Export:</span>
      {FORMATS.map((f) => (
        <button
          key={f.value}
          onClick={() => void handleExport(f.value)}
          className="underline"
        >
          {f.label}
        </button>
      ))}
      {error && <span className="text-red-400">Failed to export {error}</span>}
    </div>
  );
}
