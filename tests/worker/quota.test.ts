import { describe, expect, it, vi } from "vitest";
import { GUEST_DAILY_QUOTA_MS, USER_DAILY_QUOTA_MS } from "../../shared/constants";
import {
  getQuotaStatus,
  getQuotaStatusForIp,
  transferGuestUsageToUser,
} from "../../worker/services/quota";

function fakeDb(usedMs: number | null) {
  const first = vi.fn().mockResolvedValue(usedMs === null ? null : { audio_ms: usedMs });
  const bind = vi.fn().mockReturnValue({ first });
  const prepare = vi.fn().mockReturnValue({ bind });
  return { prepare } as unknown as D1Database;
}

describe("getQuotaStatus", () => {
  it("reports the full quota remaining when nothing has been used", async () => {
    const status = await getQuotaStatus(fakeDb(null), 1);
    expect(status.usedMs).toBe(0);
    expect(status.limitMs).toBe(USER_DAILY_QUOTA_MS);
    expect(status.remainingMs).toBe(USER_DAILY_QUOTA_MS);
  });

  it("subtracts usage from the limit", async () => {
    const usedMs = 5 * 60 * 1000;
    const status = await getQuotaStatus(fakeDb(usedMs), 1);
    expect(status.usedMs).toBe(usedMs);
    expect(status.remainingMs).toBe(USER_DAILY_QUOTA_MS - usedMs);
  });

  it("clamps remaining at zero once usage exceeds the limit", async () => {
    const status = await getQuotaStatus(fakeDb(USER_DAILY_QUOTA_MS + 1000), 1);
    expect(status.remainingMs).toBe(0);
  });

  it("sets resetsAt to the next UTC midnight", async () => {
    const status = await getQuotaStatus(fakeDb(0), 1);
    const resets = new Date(status.resetsAt);
    expect(resets.getUTCHours()).toBe(0);
    expect(resets.getUTCMinutes()).toBe(0);
    expect(resets.getTime()).toBeGreaterThan(Date.now());
  });
});

describe("getQuotaStatusForIp", () => {
  it("uses the smaller guest daily cap", async () => {
    const status = await getQuotaStatusForIp(fakeDb(null), "203.0.113.1");
    expect(status.limitMs).toBe(GUEST_DAILY_QUOTA_MS);
    expect(status.remainingMs).toBe(GUEST_DAILY_QUOTA_MS);
  });

  it("subtracts IP-tracked usage from the limit", async () => {
    const usedMs = 4 * 60 * 1000;
    const status = await getQuotaStatusForIp(fakeDb(usedMs), "203.0.113.1");
    expect(status.usedMs).toBe(usedMs);
    expect(status.remainingMs).toBe(GUEST_DAILY_QUOTA_MS - usedMs);
  });
});

function fakeDbForTransfer(guestUsedMs: number) {
  const first = vi
    .fn()
    .mockResolvedValue(guestUsedMs > 0 ? { audio_ms: guestUsedMs } : null);
  const run = vi.fn().mockResolvedValue({ meta: { changes: 1 } });
  const bind = vi.fn().mockReturnValue({ first, run });
  const prepare = vi.fn().mockReturnValue({ bind });
  return { db: { prepare } as unknown as D1Database, run, prepare };
}

describe("transferGuestUsageToUser", () => {
  it("folds guest usage into the user's ledger and clears the anon row", async () => {
    const { db, run, prepare } = fakeDbForTransfer(5 * 60 * 1000);

    await transferGuestUsageToUser(db, 1, "203.0.113.1");

    // SELECT (getAnonUsageMsForDay), INSERT (addUsageForDay), DELETE (clearAnonUsageForDay)
    expect(prepare).toHaveBeenCalledTimes(3);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("does nothing when there is no guest usage to transfer", async () => {
    const { db, run, prepare } = fakeDbForTransfer(0);

    await transferGuestUsageToUser(db, 1, "203.0.113.1");

    expect(prepare).toHaveBeenCalledTimes(1);
    expect(run).not.toHaveBeenCalled();
  });
});
