import type { HTMLAttributes } from "react";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials?: string;
  src?: string;
  size?: number;
}

export function Avatar({
  initials = "A",
  src,
  size = 32,
  style,
  ...rest
}: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "var(--radius-avatar)",
        background: src ? `center/cover url(${src})` : "var(--action-primary)",
        color: "var(--action-primary-text)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: "var(--fw-bold)",
        fontSize: Math.round(size * 0.42),
        ...style,
      }}
      {...rest}
    >
      {src ? null : initials}
    </div>
  );
}
