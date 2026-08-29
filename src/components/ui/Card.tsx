import type { CSSProperties, HTMLAttributes } from "react";

type CardTone = "raised" | "flat" | "sunken" | "float";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: string | number;
  tone?: CardTone;
  radius?: string;
}

const toneStyles: Record<CardTone, CSSProperties> = {
  raised: {
    background: "var(--surface-card)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-sm)",
  },
  flat: {
    background: "var(--surface-card)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "none",
  },
  sunken: {
    background: "var(--surface-sunken)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "none",
  },
  float: {
    background: "var(--surface-card)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-lg)",
  },
};

export function Card({
  padding = "var(--pad-card)",
  tone = "raised",
  radius = "var(--radius-card)",
  children,
  style,
  ...rest
}: CardProps) {
  return (
    <div
      style={{
        borderRadius: radius,
        padding,
        ...toneStyles[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
