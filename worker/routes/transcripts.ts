import { Hono } from "hono";
import {
  createTranscriptRequestSchema,
  updateTranscriptRequestSchema,
} from "../../shared/schemas";
import * as queries from "../db/queries";
import { toMarkdown } from "../export/markdown";
import { toSrt } from "../export/srt";
import { toVtt } from "../export/vtt";
import { generateSummary, SUMMARY_MODEL } from "../services/summarizer";
import * as transcriptsService from "../services/transcripts";
import type { DbUser } from "../types";

const EXPORT_CONTENT_TYPES = {
  txt: "text/plain; charset=utf-8",
  srt: "application/x-subrip; charset=utf-8",
  vtt: "text/vtt; charset=utf-8",
  md: "text/markdown; charset=utf-8",
} as const;

type ExportFormat = keyof typeof EXPORT_CONTENT_TYPES;

function isExportFormat(format: string | undefined): format is ExportFormat {
  return !!format && format in EXPORT_CONTENT_TYPES;
}

function sanitizeFilename(title: string): string {
  const cleaned = title.replace(/[^A-Za-z0-9-_ ]/g, "").trim();
  return cleaned.length > 0 ? cleaned : "transcript";
}

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

  if (transcript.text.trim().length > 0) {
    try {
      const summary = await generateSummary(c.env.AI, transcript.text);
      await queries.upsertSummary(c.env.DB, transcript.id, SUMMARY_MODEL, summary);
    } catch {
      // Best-effort: a failed auto-summary must not fail the transcript save.
      // The user can still generate one manually from the transcript page.
    }
  }

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

transcripts.get("/:id/export", async (c) => {
  const user = c.get("user");
  const id = parseId(c.req.param("id"));
  if (id === null) {
    return c.json({ error: "Invalid transcript id", code: "invalid_id" }, 400);
  }

  const format = c.req.query("format");
  if (!isExportFormat(format)) {
    return c.json({ error: "Invalid export format", code: "invalid_format" }, 400);
  }

  const transcript = await transcriptsService.getTranscript(c.env.DB, user.id, id);
  if (!transcript) {
    return c.json({ error: "Transcript not found", code: "not_found" }, 404);
  }

  const body =
    format === "txt"
      ? transcript.text
      : format === "srt"
        ? toSrt(transcript.segments)
        : format === "vtt"
          ? toVtt(transcript.segments)
          : toMarkdown(transcript);

  const filename = `${sanitizeFilename(transcript.title)}.${format}`;

  return c.text(body, 200, {
    "Content-Type": EXPORT_CONTENT_TYPES[format],
    "Content-Disposition": `attachment; filename="${filename}"`,
  });
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
