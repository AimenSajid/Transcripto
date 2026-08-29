import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "subtle";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const baseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontFamily: "var(--font-body)",
  fontWeight: "var(--fw-semibold)",
  letterSpacing: "var(--ls-body)",
  borderRadius: "var(--radius-button)",
  border: "1px solid transparent",
  cursor: "pointer",
  transition: "var(--transition-control)",
  whiteSpace: "nowrap",
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: { fontSize: "var(--text-sm)", padding: "8px 14px" },
  md: { fontSize: "var(--text-base)", padding: "11px 20px" },
  lg: { fontSize: "var(--text-lg)", padding: "15px 26px" },
};

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "var(--action-primary)",
    color: "var(--action-primary-text)",
    borderColor: "var(--action-primary)",
    boxShadow: "var(--shadow-sm)",
  },
  secondary: {
    background: "var(--action-secondary-bg)",
    color: "var(--action-secondary-text)",
    borderColor: "var(--action-secondary-border)",
    boxShadow: "var(--shadow-xs)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-body)",
    borderColor: "transparent",
  },
  subtle: {
    background: "var(--surface-sunken)",
    color: "var(--text-strong)",
    borderColor: "var(--border-subtle)",
  },
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  fullWidth,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        width: fullWidth ? "100%" : undefined,
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
        ...style,
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(.98)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "none";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
      }}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
