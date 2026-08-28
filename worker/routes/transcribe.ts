import { Hono } from "hono";
import { transcribeChunkRequestSchema } from "../../shared/schemas";
import { getQuotaStatus, recordUsage } from "../services/quota";
import { transcribeChunk } from "../services/speech";
import type { DbUser } from "../types";

const transcribe = new Hono<{ Bindings: Env; Variables: { user: DbUser } }>();

transcribe.post("/chunk", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = transcribeChunkRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid request body", code: "invalid_body" }, 400);
  }

  const user = c.get("user");
  const { audio, offsetMs, durationMs, language } = parsed.data;

  const quota = await getQuotaStatus(c.env.DB, user.id);
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

  await recordUsage(c.env.DB, user.id, durationMs);

  return c.json(result);
});

export default transcribe;
