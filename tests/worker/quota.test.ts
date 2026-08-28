import { describe, expect, it, vi } from "vitest";
import { DAILY_QUOTA_MS } from "../../shared/constants";
import { getQuotaStatus } from "../../worker/services/quota";

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
    expect(status.limitMs).toBe(DAILY_QUOTA_MS);
    expect(status.remainingMs).toBe(DAILY_QUOTA_MS);
  });

  it("subtracts usage from the limit", async () => {
    const usedMs = 5 * 60 * 1000;
    const status = await getQuotaStatus(fakeDb(usedMs), 1);
    expect(status.usedMs).toBe(usedMs);
    expect(status.remainingMs).toBe(DAILY_QUOTA_MS - usedMs);
  });

  it("clamps remaining at zero once usage exceeds the limit", async () => {
    const status = await getQuotaStatus(fakeDb(DAILY_QUOTA_MS + 1000), 1);
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
