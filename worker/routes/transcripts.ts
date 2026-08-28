import { Hono } from "hono";
import {
  createTranscriptRequestSchema,
  updateTranscriptRequestSchema,
} from "../../shared/schemas";
import * as transcriptsService from "../services/transcripts";
import type { DbUser } from "../types";

const transcripts = new Hono<{ Bindings: Env; Variables: { user: DbUser } }>();

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) ? id : null;
}

transcripts.get("/", async (c) => {
  const user = c.get("user");
  const limitParam = c.req.query("limit");

  const result = await transcriptsService.listTranscripts(c.env.DB, user.id, {
    q: c.req.query("q") ?? undefined,
    limit: limitParam ? Number(limitParam) : undefined,
    cursor: c.req.query("cursor") ?? undefined,
  });

  return c.json(result);
});

transcripts.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => null);
  const parsed = createTranscriptRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid request body", code: "invalid_body" }, 400);
  }

  const transcript = await transcriptsService.createTranscript(
    c.env.DB,
    user.id,
    parsed.data,
  );

  return c.json({ transcript }, 201);
});

transcripts.get("/:id", async (c) => {
  const user = c.get("user");
  const id = parseId(c.req.param("id"));
  if (id === null) {
    return c.json({ error: "Invalid transcript id", code: "invalid_id" }, 400);
  }

  const transcript = await transcriptsService.getTranscript(c.env.DB, user.id, id);
  if (!transcript) {
    return c.json({ error: "Transcript not found", code: "not_found" }, 404);
  }

  return c.json({ transcript });
});

transcripts.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = parseId(c.req.param("id"));
  if (id === null) {
    return c.json({ error: "Invalid transcript id", code: "invalid_id" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = updateTranscriptRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid request body", code: "invalid_body" }, 400);
  }

  const transcript = await transcriptsService.renameTranscript(
    c.env.DB,
    user.id,
    id,
    parsed.data.title,
  );
  if (!transcript) {
    return c.json({ error: "Transcript not found", code: "not_found" }, 404);
  }

  return c.json({ transcript });
});

transcripts.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = parseId(c.req.param("id"));
  if (id === null) {
    return c.json({ error: "Invalid transcript id", code: "invalid_id" }, 400);
  }

  const deleted = await transcriptsService.deleteTranscript(c.env.DB, user.id, id);
  if (!deleted) {
    return c.json({ error: "Transcript not found", code: "not_found" }, 404);
  }

  return c.body(null, 204);
});

export default transcripts;
