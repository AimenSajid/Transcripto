import type { CSSProperties, HTMLAttributes } from "react";

type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "ink";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, CSSProperties> = {
  neutral: {
    background: "var(--surface-sunken)",
    color: "var(--text-muted)",
    border: "1px solid var(--border-subtle)",
  },
  accent: {
    background: "var(--accent-soft)",
    color: "var(--bronze-600)",
    border: "1px solid var(--bronze-200)",
  },
  success: {
    background: "var(--green-100)",
    color: "var(--green-500)",
    border: "1px solid transparent",
  },
  warning: {
    background: "var(--amber-100)",
    color: "var(--amber-500)",
    border: "1px solid transparent",
  },
  danger: {
    background: "var(--red-100)",
    color: "var(--red-500)",
    border: "1px solid transparent",
  },
  info: {
    background: "var(--blue-100)",
    color: "var(--blue-500)",
    border: "1px solid transparent",
  },
  ink: {
    background: "var(--action-primary)",
    color: "var(--action-primary-text)",
    border: "1px solid transparent",
  },
};

export function Badge({ tone = "neutral", children, style, ...rest }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: "var(--radius-chip)",
        padding: "4px 10px",
        font: "var(--type-label)",
        fontSize: "var(--text-xs)",
        ...toneStyles[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
