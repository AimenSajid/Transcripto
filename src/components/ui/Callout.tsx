import type { CSSProperties, HTMLAttributes } from "react";
import { Icon } from "./Icon";

type CalloutTone = "neutral" | "accent";

interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  icon?: string;
  tone?: CalloutTone;
}

const toneStyles: Record<CalloutTone, CSSProperties> = {
  neutral: {
    background: "var(--surface-sunken)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-body)",
  },
  accent: {
    background: "var(--accent-soft)",
    border: "1px solid var(--bronze-200)",
    color: "var(--bronze-600)",
  },
};

export function Callout({
  icon = "lightbulb",
  tone = "neutral",
  children,
  style,
  ...rest
}: CalloutProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 18px",
        borderRadius: "var(--radius-lg)",
        fontSize: "var(--text-sm)",
        lineHeight: "var(--lh-normal)",
        ...toneStyles[tone],
        ...style,
      }}
      {...rest}
    >
      <span style={{ marginTop: 1 }}>
        <Icon name={icon} size={17} />
      </span>
      <span style={{ textWrap: "pretty" }}>{children}</span>
    </div>
  );
}
