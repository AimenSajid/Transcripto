import { DAILY_QUOTA_MS } from "../../shared/constants";
import type { QuotaResponse } from "../../shared/types";
import * as queries from "../db/queries";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextResetAt(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
}

export async function getQuotaStatus(
  db: D1Database,
  userId: number,
): Promise<QuotaResponse> {
  const usedMs = await queries.getUsageMsForDay(db, userId, todayUtc());
  return {
    usedMs,
    limitMs: DAILY_QUOTA_MS,
    remainingMs: Math.max(DAILY_QUOTA_MS - usedMs, 0),
    resetsAt: nextResetAt(),
  };
}

export async function recordUsage(
  db: D1Database,
  userId: number,
  audioMs: number,
): Promise<void> {
  await queries.addUsageForDay(db, userId, todayUtc(), audioMs);
}
