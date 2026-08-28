import { describe, expect, it } from "vitest";
import {
  signSessionToken,
  verifySessionToken,
} from "../../worker/services/session";

describe("session tokens", () => {
  it("round-trips the userId through sign and verify", async () => {
    const token = await signSessionToken({ userId: 42 }, "test-secret");
    const payload = await verifySessionToken(token, "test-secret");
    expect(payload.userId).toBe(42);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken({ userId: 42 }, "test-secret");
    await expect(verifySessionToken(token, "wrong-secret")).rejects.toThrow();
  });
});
