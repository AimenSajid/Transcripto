import { useState, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  icon?: ReactNode;
  size?: "sm" | "md";
  invalid?: boolean;
}

export function Input({
  label,
  hint,
  icon,
  size = "md",
  invalid,
  style,
  ...rest
}: InputProps) {
  const [focus, setFocus] = useState(false);
  const pad = size === "sm" ? "8px 12px" : "12px 14px";

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label && (
        <span style={{ font: "var(--type-label)", color: "var(--text-body)" }}>{label}</span>
      )}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--surface-card)",
          border: `1px solid ${invalid ? "var(--red-500)" : focus ? "var(--focus-ring)" : "var(--border-subtle)"}`,
          borderRadius: "var(--radius-input)",
          padding: pad,
          boxShadow: focus ? "var(--ring-focus)" : "var(--shadow-xs)",
          transition: "var(--transition-control)",
          ...style,
        }}
      >
        {icon}
        <input
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            font: "var(--type-body)",
            fontSize: size === "sm" ? "var(--text-sm)" : "var(--text-base)",
            color: "var(--text-strong)",
            width: "100%",
          }}
          {...rest}
        />
      </span>
      {hint && (
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: invalid ? "var(--red-500)" : "var(--text-subtle)",
          }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}
