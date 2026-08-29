import { useState, type HTMLAttributes } from "react";

interface TranscriptLineProps extends HTMLAttributes<HTMLDivElement> {
  time: string;
  text: string;
  active?: boolean;
}

export function TranscriptLine({ time, text, active, style, ...rest }: TranscriptLineProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "78px 1fr",
        gap: 18,
        padding: "9px 14px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        background: active ? "var(--accent-soft)" : hover ? "var(--surface-hover)" : "transparent",
        transition: "var(--transition-control)",
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          font: "var(--type-timecode)",
          color: active ? "var(--bronze-600)" : "var(--text-subtle)",
        }}
      >
        {time}
      </span>
      <span
        style={{
          fontSize: "var(--text-base)",
          lineHeight: "var(--lh-relaxed)",
          color: "var(--text-body)",
        }}
      >
        {text}
      </span>
    </div>
  );
}
