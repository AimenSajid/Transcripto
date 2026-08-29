import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { QuotaBadge } from "../QuotaBadge";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { IconButton } from "../ui/IconButton";
import { Wordmark } from "../ui/Wordmark";

function initialsFor(name: string | null, email: string | null): string {
  const source = name ?? email ?? "?";
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function TopBar({ left }: { left?: ReactNode }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const dark = false; // wired for real in the dark-mode increment

  return (
    <header
      style={{
        height: "var(--topbar-h)",
        flex: "0 0 var(--topbar-h)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "0 28px",
        background: "var(--bg-page-alt)",
        borderBottom: "1px solid var(--border-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
        {left ?? (auth.status !== "signed-in" && <Wordmark size={17} />)}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <QuotaBadge />

        <IconButton label={dark ? "Light mode" : "Dark mode"} onClick={() => {}}>
          <Icon name={dark ? "sun" : "moon"} size={18} />
        </IconButton>

        {auth.status === "signed-in" && auth.user && (
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              marginLeft: 6,
            }}
          >
            <button
              type="button"
              aria-label="Account menu"
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                cursor: "pointer",
                display: "flex",
                borderRadius: "var(--radius-avatar)",
              }}
            >
              <Avatar initials={initialsFor(auth.user.name, auth.user.email)} size={32} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 44,
                  right: 0,
                  zIndex: 40,
                  width: 244,
                  background: "var(--surface-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-lg)",
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    padding: "8px 12px 12px",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <span
                    style={{
                      font: "var(--fw-semibold) var(--text-base)/1.3 var(--font-body)",
                      color: "var(--text-strong)",
                    }}
                  >
                    {auth.user.name ?? "Signed in"}
                  </span>
                  {auth.user.email && (
                    <span
                      style={{
                        font: "var(--fw-regular) var(--text-sm)/1.4 var(--font-body)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {auth.user.email}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void auth.signOut();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: 0,
                    padding: "10px 12px",
                    marginTop: 4,
                    borderRadius: "var(--radius-xs)",
                    cursor: "pointer",
                    font: "var(--fw-medium) var(--text-base)/1.3 var(--font-body)",
                    color: "var(--text-body)",
                    transition: "var(--transition-control)",
                  }}
                >
                  <Icon name="log-out" size={16} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}

        {auth.status === "signed-out" && (
          <Button variant="secondary" size="sm" onClick={() => navigate("/login")}>
            Log In
          </Button>
        )}
      </div>
    </header>
  );
}
