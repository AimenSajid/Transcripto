import { GUEST_DAILY_QUOTA_MS, USER_DAILY_QUOTA_MS } from "../../shared/constants";
import type { QuotaResponse } from "../../shared/types";
import * as queries from "../db/queries";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextResetAt(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
}

function buildStatus(usedMs: number, limitMs: number): QuotaResponse {
  return {
    usedMs,
    limitMs,
    remainingMs: Math.max(limitMs - usedMs, 0),
    resetsAt: nextResetAt(),
  };
}

export async function getQuotaStatus(
  db: D1Database,
  userId: number,
): Promise<QuotaResponse> {
  const usedMs = await queries.getUsageMsForDay(db, userId, todayUtc());
  return buildStatus(usedMs, USER_DAILY_QUOTA_MS);
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
 * instead, in a separate table and against a smaller daily cap.
 */
export async function getQuotaStatusForIp(
  db: D1Database,
  ip: string,
): Promise<QuotaResponse> {
  const usedMs = await queries.getAnonUsageMsForDay(db, ip, todayUtc());
  return buildStatus(usedMs, GUEST_DAILY_QUOTA_MS);
}

export async function recordUsageForIp(
  db: D1Database,
  ip: string,
  audioMs: number,
): Promise<void> {
  await queries.addAnonUsageForDay(db, ip, todayUtc(), audioMs);
}

/**
 * Folds today's guest usage on this IP into the user's own quota at sign-in,
 * so the 30-minute signed-in cap counts from where the guest session left
 * off rather than resetting to a fresh 30. The anon ledger row is cleared
 * afterward so a second sign-in later the same day doesn't transfer the same
 * usage twice.
 */
export async function transferGuestUsageToUser(
  db: D1Database,
  userId: number,
  ip: string,
): Promise<void> {
  const day = todayUtc();
  const guestUsedMs = await queries.getAnonUsageMsForDay(db, ip, day);
  if (guestUsedMs <= 0) return;

  await queries.addUsageForDay(db, userId, day, guestUsedMs);
  await queries.clearAnonUsageForDay(db, ip, day);
}
