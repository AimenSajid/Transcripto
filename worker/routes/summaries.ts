import { Hono } from "hono";
import * as queries from "../db/queries";
import { generateSummary, SUMMARY_MODEL } from "../services/summarizer";
import type { DbUser } from "../types";

const summaries = new Hono<{ Bindings: Env; Variables: { user: DbUser } }>();

summaries.get("/:id/summary", async (c) => {
  const user = c.get("user");
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ error: "Invalid transcript id", code: "invalid_id" }, 400);
  }

  const transcript = await queries.getTranscriptForUser(c.env.DB, user.id, id);
  if (!transcript) {
    return c.json({ error: "Transcript not found", code: "not_found" }, 404);
  }

  const existing = await queries.getSummaryForTranscript(c.env.DB, id);
  if (!existing) {
    return c.json({ error: "No summary saved for this transcript", code: "not_found" }, 404);
  }

  return c.json(existing);
});

summaries.post("/:id/summary", async (c) => {
  const user = c.get("user");
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ error: "Invalid transcript id", code: "invalid_id" }, 400);
  }

  const transcript = await queries.getTranscriptForUser(c.env.DB, user.id, id);
  if (!transcript) {
    return c.json({ error: "Transcript not found", code: "not_found" }, 404);
  }

  const regenerate = c.req.query("regenerate") === "1";

  if (!regenerate) {
    const existing = await queries.getSummaryForTranscript(c.env.DB, id);
    if (existing) return c.json(existing);
  }

  const summary = await generateSummary(c.env.AI, transcript.text);
  await queries.upsertSummary(c.env.DB, id, SUMMARY_MODEL, summary);

  return c.json(summary);
});

export default summaries;
