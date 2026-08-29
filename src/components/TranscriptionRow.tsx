import { useState } from "react";
import { Badge } from "./ui/Badge";
import { Icon } from "./ui/Icon";

type RowTone = "success" | "accent" | "neutral" | "warning" | "danger" | "info" | "ink";

interface TranscriptionRowProps {
  name: string;
  meta: string;
  status?: string;
  tone?: RowTone;
  onClick?: () => void;
}

export function TranscriptionRow({
  name,
  meta,
  status = "Completed",
  tone = "success",
  onClick,
}: TranscriptionRowProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        background: hover ? "var(--surface-hover)" : "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-card)",
        cursor: "pointer",
        transition: "var(--transition-control)",
        boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-xs)",
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: "var(--radius-sm)",
          background: "var(--surface-sunken)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-strong)",
        }}
      >
        <Icon name="file-text" size={18} />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--fw-bold)",
            fontSize: "var(--text-base)",
            color: "var(--text-strong)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </span>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-subtle)" }}>{meta}</span>
      </span>
      <Badge tone={tone}>{status}</Badge>
      <Icon name="chevron-right" size={18} color="var(--text-subtle)" />
    </div>
  );
}
