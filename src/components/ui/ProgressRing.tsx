import type { HTMLAttributes } from "react";

interface ProgressRingProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  size?: number;
  thickness?: number;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  value = 0,
  size = 180,
  thickness = 14,
  label,
  sublabel,
  style,
  ...rest
}: ProgressRingProps) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div style={{ position: "relative", width: size, height: size, ...style }} {...rest}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--track)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
          style={{ transition: "stroke-dashoffset var(--dur-slower) var(--ease-standard)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--fw-extrabold)",
            fontSize: Math.round(size * 0.19),
            color: "var(--text-strong)",
            letterSpacing: "var(--ls-heading)",
          }}
        >
          {label ?? `${Math.round(clamped)}%`}
        </span>
        {sublabel && (
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
