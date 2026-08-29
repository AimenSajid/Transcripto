import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Icon } from "./ui/Icon";

const TEASERS = ["One-paragraph overview", "Key points", "Action items"];

export function SummaryLockedPanel() {
  const navigate = useNavigate();

  return (
    <Card padding="44px" radius="var(--radius-panel)">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 60,
            height: 60,
            borderRadius: "var(--radius-circle)",
            background: "var(--accent-soft)",
            color: "var(--bronze-600)",
          }}
        >
          <Icon name="shield-check" size={26} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          <h2
            style={{
              font: "var(--type-h2)",
              letterSpacing: "var(--ls-heading)",
              color: "var(--text-strong)",
              margin: 0,
            }}
          >
            Summaries are for signed-in users
          </h2>
          <p
            style={{
              font: "var(--type-body)",
              color: "var(--text-muted)",
              margin: 0,
              maxWidth: "48ch",
            }}
          >
            Sign in and we'll generate a summary with key points and action
            items for this recording — usually in under a minute.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          {TEASERS.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                font: "var(--fw-regular) var(--text-sm)/1.4 var(--font-body)",
                color: "var(--text-muted)",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  flex: "0 0 5px",
                }}
              />
              {t}
            </div>
          ))}
        </div>
        <Button onClick={() => navigate("/login")}>Continue with Google</Button>
      </div>
    </Card>
  );
}
