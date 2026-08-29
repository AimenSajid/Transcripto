import type { HTMLAttributes } from "react";

interface WordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
  color?: string;
  name?: string;
}

const BAR_HEIGHTS = [0.45, 0.8, 1, 0.62, 0.9, 0.35];

/* The brand source supplied no logo file, so the wordmark is set in plain
   type with a level-meter glyph. Replace with a real logo asset if one
   ever exists. */
export function Wordmark({
  size = 20,
  color = "var(--text-strong)",
  name = "Transcripto",
  style,
  ...rest
}: WordmarkProps) {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 9, color, ...style }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: size }}
      >
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            style={{
              width: 2,
              borderRadius: 2,
              height: `${h * 100}%`,
              background: "currentColor",
              opacity: 0.9,
            }}
          />
        ))}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--fw-extrabold)",
          fontSize: size,
          letterSpacing: "var(--ls-heading)",
        }}
      >
        {name}
      </span>
    </span>
  );
}
