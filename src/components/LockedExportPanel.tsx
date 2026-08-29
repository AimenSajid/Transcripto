import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";

export function LockedExportPanel() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{ position: "relative" }}>
      <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
        Export
      </Button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            zIndex: 30,
            width: 300,
            background: "var(--surface-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-lg)",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                font: "var(--fw-semibold) var(--text-base)/1.3 var(--font-body)",
                color: "var(--text-strong)",
              }}
            >
              Exports need an account
            </div>
            <div
              style={{
                font: "var(--fw-regular) var(--text-sm)/1.5 var(--font-body)",
                color: "var(--text-muted)",
              }}
            >
              TXT, SRT, VTT and Markdown are available once you're signed in.
              This transcript will be saved too.
            </div>
          </div>
          <Button size="sm" fullWidth onClick={() => navigate("/login")}>
            Continue with Google
          </Button>
        </div>
      )}
    </div>
  );
}
