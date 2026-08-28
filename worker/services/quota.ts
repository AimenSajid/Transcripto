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

function buildStatus(usedMs: number): QuotaResponse {
  return {
    usedMs,
    limitMs: DAILY_QUOTA_MS,
    remainingMs: Math.max(DAILY_QUOTA_MS - usedMs, 0),
    resetsAt: nextResetAt(),
  };
}

export async function getQuotaStatus(
  db: D1Database,
  userId: number,
): Promise<QuotaResponse> {
  const usedMs = await queries.getUsageMsForDay(db, userId, todayUtc());
  return buildStatus(usedMs);
}

export async function recordUsage(
  db: D1Database,
  userId: number,
  audioMs: number,
): Promise<void> {
  await queries.addUsageForDay(db, userId, todayUtc(), audioMs);
}

/**
 * Anonymous requests have no user_id, so usage is tracked by client IP
 * instead, in a separate table — same daily cap and day-bucketing logic,
 * just a different identity to key on.
 */
export async function getQuotaStatusForIp(
  db: D1Database,
  ip: string,
): Promise<QuotaResponse> {
  const usedMs = await queries.getAnonUsageMsForDay(db, ip, todayUtc());
  return buildStatus(usedMs);
}

export async function recordUsageForIp(
  db: D1Database,
  ip: string,
  audioMs: number,
): Promise<void> {
  await queries.addAnonUsageForDay(db, ip, todayUtc(), audioMs);
}
