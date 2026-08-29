import { formatCountdown } from "../lib/format";
import { Callout } from "./ui/Callout";
import { Card } from "./ui/Card";
import { Icon } from "./ui/Icon";

export function LimitReachedCard({
  limitMinutes,
  resetsAt,
}: {
  limitMinutes: number;
  resetsAt: number;
}) {
  return (
    <Card padding="40px" radius="var(--radius-panel)">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "var(--radius-circle)",
            background: "var(--amber-100)",
            color: "var(--amber-500)",
          }}
        >
          <Icon name="shield-check" size={28} />
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
            Daily limit reached
          </h2>
          <p
            style={{
              font: "var(--type-body)",
              color: "var(--text-muted)",
              margin: 0,
              maxWidth: "46ch",
            }}
          >
            You've used all {limitMinutes} minutes of transcription today. Your
            allowance resets at midnight, and anything already transcribed
            stays available.
          </p>
        </div>
        <Callout icon="lightbulb">
          Tip: Resets at midnight UTC — {formatCountdown(resetsAt)} from now.
        </Callout>
      </div>
    </Card>
  );
}
