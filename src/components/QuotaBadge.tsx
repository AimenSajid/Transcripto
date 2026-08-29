import { useEffect, useState } from "react";
import { fetchQuota } from "../api/quota";

// Floor, not round: overstating remaining quota (e.g. showing "1 min" for 25
// seconds left) lets a file through the badge's promise and then get
// rejected by the pre-flight check, which is the confusing part.
function toMinutes(ms: number): number {
  return Math.floor(ms / 60000);
}

export function QuotaBadge({ refreshKey }: { refreshKey?: unknown }) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [limitMs, setLimitMs] = useState<number | null>(null);

  useEffect(() => {
    fetchQuota()
      .then((quota) => {
        setRemainingMs(quota.remainingMs);
        setLimitMs(quota.limitMs);
      })
      .catch(() => {
        setRemainingMs(null);
        setLimitMs(null);
      });
  }, [refreshKey]);

  if (remainingMs === null || limitMs === null) return null;

  const left = toMinutes(remainingMs);
  const limit = toMinutes(limitMs);
  const pct = limit === 0 ? 0 : Math.max(0, Math.min(100, (left / limit) * 100));
  const fill = left <= 5 ? "var(--amber-500)" : "var(--action-primary)";
  const label = left <= 0 ? "Daily limit reached" : `${left} of ${limit} min left today`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 14px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-pill)",
      }}
    >
      <div
        style={{
          width: 54,
          height: 5,
          borderRadius: "var(--radius-pill)",
          background: "var(--track)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "var(--radius-pill)",
            transition: "width 520ms cubic-bezier(.2,.8,.2,1)",
            width: `${pct}%`,
            background: fill,
          }}
        />
      </div>
      <span
        style={{ font: "var(--type-label)", color: "var(--text-muted)", whiteSpace: "nowrap" }}
      >
        {label}
      </span>
    </div>
  );
}
