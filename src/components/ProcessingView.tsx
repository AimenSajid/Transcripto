import { Button } from "./ui/Button";
import { Callout } from "./ui/Callout";
import { Card } from "./ui/Card";
import { ProgressRing } from "./ui/ProgressRing";
import { Waveform } from "./ui/Waveform";
import type {
  TranscriptionProgress,
  TranscriptionStatus,
} from "../transcription/useTranscription";

interface ProcessingViewProps {
  status: TranscriptionStatus;
  progress: TranscriptionProgress;
  fileName: string;
  isGuest: boolean;
  onCancel: () => void;
}

export function ProcessingView({
  status,
  progress,
  fileName,
  isGuest,
  onCancel,
}: ProcessingViewProps) {
  const pct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0;
  const stage = status === "segmenting" ? "Splitting audio" : "Transcribing speech";
  const tip = isGuest
    ? "Tip: Keep this tab open — guest transcripts aren't saved, so closing it loses the result."
    : "Tip: You'll find it in your history when it's done.";

  return (
    <Card padding="48px" radius="var(--radius-panel)" style={{ width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <ProgressRing value={pct} size={176} sublabel={stage} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div
            style={{
              font: "var(--fw-bold) var(--text-h3)/1.3 var(--font-display)",
              letterSpacing: "var(--ls-heading)",
              color: "var(--text-strong)",
            }}
          >
            Transcribing…
          </div>
          <div style={{ font: "var(--type-body)", color: "var(--text-muted)" }}>{fileName}</div>
          {progress.total > 0 && (
            <div style={{ font: "var(--type-timecode)", color: "var(--text-subtle)" }}>
              {progress.done} of {progress.total} chunks
            </div>
          )}
        </div>
        <Waveform count={64} height={44} progress={pct / 100} style={{ width: "100%", maxWidth: 520 }} />
        <p
          style={{
            font: "var(--type-body)",
            color: "var(--text-muted)",
            margin: 0,
            textAlign: "center",
            maxWidth: "46ch",
          }}
        >
          Please wait while we convert your audio to text.
        </p>
        <Callout icon="lightbulb" style={{ width: "100%", maxWidth: 560 }}>
          {tip}
        </Callout>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}
