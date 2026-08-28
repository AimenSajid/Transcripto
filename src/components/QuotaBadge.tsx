import { useEffect, useState } from "react";
import { fetchQuota } from "../api/quota";

function toMinutes(ms: number): number {
  return Math.round(ms / 60000);
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

  return (
    <p className="text-xs text-neutral-500">
      {toMinutes(remainingMs)} / {toMinutes(limitMs)} min left today
    </p>
  );
}
