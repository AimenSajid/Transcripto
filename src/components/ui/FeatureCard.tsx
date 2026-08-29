import type { HTMLAttributes } from "react";
import { Icon } from "./Icon";

interface FeatureCardProps extends HTMLAttributes<HTMLDivElement> {
  icon?: string;
  title: string;
  body: string;
}

export function FeatureCard({ icon = "zap", title, body, style, ...rest }: FeatureCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 10,
        padding: "26px 22px",
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={22} stroke={1.7} color="var(--text-strong)" />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--fw-bold)",
          fontSize: "var(--text-base)",
          color: "var(--text-strong)",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: "var(--text-sm)",
          lineHeight: "var(--lh-normal)",
          color: "var(--text-muted)",
          maxWidth: 200,
        }}
      >
        {body}
      </span>
    </div>
  );
}
