import { useMemo, type HTMLAttributes } from "react";

interface WaveformProps extends HTMLAttributes<HTMLDivElement> {
  count?: number;
  height?: number;
  seed?: number;
  color?: string;
  barWidth?: number;
  gap?: number;
  progress?: number;
}

/* Deterministic pseudo-waveform bars — the brand's recurring audio motif. */
function generateBars(n: number, seed: number): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    out.push(0.18 + Math.pow(Math.sin(i / 2.6) * 0.5 + 0.5, 1.4) * 0.55 + r * 0.27);
  }
  return out;
}

export function Waveform({
  count = 56,
  height = 54,
  seed = 7,
  color = "var(--waveform)",
  barWidth = 3,
  gap = 3,
  progress,
  style,
  ...rest
}: WaveformProps) {
  const data = useMemo(() => generateBars(count, seed), [count, seed]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap, height, ...style }} {...rest}>
      {data.map((h, i) => (
        <span
          key={i}
          style={{
            width: barWidth,
            borderRadius: "var(--radius-pill)",
            height: `${Math.round(h * 100)}%`,
            background: color,
            opacity: progress == null || i / data.length <= progress ? 1 : 0.28,
          }}
        />
      ))}
    </div>
  );
}
