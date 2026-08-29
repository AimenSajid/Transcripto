import { Button } from "./Button";
import { Icon } from "./Icon";

interface RecordPanelProps {
  elapsed: string;
  status: string;
  recording: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function RecordPanel({
  elapsed,
  status,
  recording,
  onToggle,
  disabled,
}: RecordPanelProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "22px 26px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-panel)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          width: 74,
          height: 74,
          flex: "0 0 74px",
          borderRadius: "var(--radius-circle)",
          background: "var(--surface-sunken)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: recording ? "var(--red-500)" : "var(--text-strong)",
        }}
      >
        <Icon name="mic" size={28} stroke={1.6} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--fw-bold)",
            fontSize: "var(--text-h3)",
            color: "var(--text-strong)",
          }}
        >
          {elapsed}
        </span>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{status}</span>
        <Button
          size="sm"
          onClick={onToggle}
          disabled={disabled}
          style={{ marginTop: 8, alignSelf: "flex-start" }}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </Button>
      </div>
    </div>
  );
}
