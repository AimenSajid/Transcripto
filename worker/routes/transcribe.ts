import { Hono } from "hono";
import { transcribeChunkRequestSchema } from "../../shared/schemas";
import { transcribeChunk } from "../services/speech";

const transcribe = new Hono<{ Bindings: Env }>();

transcribe.post("/chunk", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = transcribeChunkRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid request body", code: "invalid_body" }, 400);
  }

  const { audio, offsetMs, language } = parsed.data;

  const result = await transcribeChunk(c.env.AI, {
    audioBase64: audio,
    offsetMs,
    language,
  });

  return c.json(result);
});

export default transcribe;
