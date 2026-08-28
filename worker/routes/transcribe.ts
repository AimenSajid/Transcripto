import { Hono } from "hono";
import { transcribeChunkRequestSchema } from "../../shared/schemas";
import { getClientIp } from "../lib/clientIp";
import {
  getQuotaStatus,
  getQuotaStatusForIp,
  recordUsage,
  recordUsageForIp,
} from "../services/quota";
import { transcribeChunk } from "../services/speech";
import type { DbUser } from "../types";

const transcribe = new Hono<{ Bindings: Env; Variables: { user?: DbUser } }>();

transcribe.post("/chunk", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = transcribeChunkRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid request body", code: "invalid_body" }, 400);
  }

  const user = c.get("user");
  const { audio, offsetMs, durationMs, language } = parsed.data;

  const quota = user
    ? await getQuotaStatus(c.env.DB, user.id)
    : await getQuotaStatusForIp(c.env.DB, getClientIp(c));

  if (durationMs > quota.remainingMs) {
    return c.json(
      { error: "Daily transcription quota exceeded", code: "quota_exceeded" },
      429,
    );
  }

  const result = await transcribeChunk(c.env.AI, {
    audioBase64: audio,
    offsetMs,
    language,
  });

  if (user) {
    await recordUsage(c.env.DB, user.id, durationMs);
  } else {
    await recordUsageForIp(c.env.DB, getClientIp(c), durationMs);
  }

  return c.json(result);
});

export default transcribe;
