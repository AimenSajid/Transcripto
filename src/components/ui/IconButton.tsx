import type { ButtonHTMLAttributes, CSSProperties } from "react";

type IconButtonVariant = "ghost" | "outline" | "solid";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: number;
  variant?: IconButtonVariant;
}

const variantStyles: Record<IconButtonVariant, CSSProperties> = {
  ghost: {
    background: "transparent",
    border: "1px solid transparent",
    color: "var(--text-muted)",
  },
  outline: {
    background: "var(--surface-card)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-body)",
  },
  solid: {
    background: "var(--action-primary)",
    border: "1px solid var(--action-primary)",
    color: "var(--action-primary-text)",
  },
};

export function IconButton({
  children,
  label,
  size = 36,
  variant = "ghost",
  style,
  ...rest
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        transition: "var(--transition-control)",
        ...variantStyles[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (variant !== "solid") e.currentTarget.style.background = "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        if (variant !== "solid") {
          e.currentTarget.style.background =
            variant === "outline" ? "var(--surface-card)" : "transparent";
        }
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
