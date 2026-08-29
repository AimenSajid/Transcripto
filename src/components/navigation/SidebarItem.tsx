import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icon } from "../ui/Icon";

interface SidebarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string | ReactNode;
  label: string;
  active?: boolean;
}

export function SidebarItem({ icon, label, active, style, ...rest }: SidebarItemProps) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid transparent",
        cursor: "pointer",
        background: active
          ? "var(--surface-active)"
          : hover
            ? "var(--surface-hover)"
            : "transparent",
        color: active ? "var(--text-strong)" : "var(--text-body)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-base)",
        fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)",
        transition: "var(--transition-control)",
        ...style,
      }}
      {...rest}
    >
      {typeof icon === "string" ? <Icon name={icon} size={18} /> : icon}
      <span>{label}</span>
    </button>
  );
}
