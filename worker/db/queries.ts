import type { GoogleIdentity } from "../services/google";
import type { DbUser } from "../types";
import type { Segment, Transcript, TranscriptSummary } from "../../shared/types";

interface UserRow {
  id: number;
  google_sub: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

function toUser(row: UserRow): DbUser {
  return {
    id: row.id,
    googleSub: row.google_sub,
    email: row.email,
    name: row.name,
    picture: row.picture,
  };
}

export async function upsertUserByGoogleSub(
  db: D1Database,
  identity: GoogleIdentity,
): Promise<DbUser> {
  await db
    .prepare(
      `INSERT INTO users (google_sub, email, name, picture, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(google_sub) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         picture = excluded.picture`,
    )
    .bind(identity.sub, identity.email, identity.name, identity.picture, Date.now())
    .run();

  const row = await db
    .prepare(
      `SELECT id, google_sub, email, name, picture FROM users WHERE google_sub = ?`,
    )
    .bind(identity.sub)
    .first<UserRow>();

  if (!row) throw new Error("Failed to upsert user");

  return toUser(row);
}

export async function getUserById(
  db: D1Database,
  id: number,
): Promise<DbUser | null> {
  const row = await db
    .prepare(`SELECT id, google_sub, email, name, picture FROM users WHERE id = ?`)
    .bind(id)
    .first<UserRow>();

  return row ? toUser(row) : null;
}

interface TranscriptRow {
  id: number;
  title: string;
  source_filename: string | null;
  duration_ms: number;
  language: string | null;
  status: string;
  created_at: number;
  updated_at: number;
}

interface TranscriptRowWithBody extends TranscriptRow {
  text: string;
  segments: string;
}

const TRANSCRIPT_SUMMARY_COLUMNS =
  "id, title, source_filename, duration_ms, language, status, created_at, updated_at";
const TRANSCRIPT_FULL_COLUMNS = `${TRANSCRIPT_SUMMARY_COLUMNS}, text, segments`;

const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 50;

function toTranscriptSummary(row: TranscriptRow): TranscriptSummary {
  return {
    id: row.id,
    title: row.title,
    sourceFilename: row.source_filename,
    durationMs: row.duration_ms,
    language: row.language,
    status: row.status as TranscriptSummary["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toTranscript(row: TranscriptRowWithBody): Transcript {
  return {
    ...toTranscriptSummary(row),
    text: row.text,
    segments: JSON.parse(row.segments) as Segment[],
  };
}

export interface InsertTranscriptInput {
  title: string;
  sourceFilename: string | null;
  durationMs: number;
  language: string | null;
  text: string;
  segments: Segment[];
}

export async function insertTranscript(
  db: D1Database,
  userId: number,
  input: InsertTranscriptInput,
): Promise<Transcript> {
  const now = Date.now();
  const result = await db
    .prepare(
      `INSERT INTO transcripts
         (user_id, title, source_filename, duration_ms, language, status, text, segments, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'complete', ?, ?, ?, ?)`,
    )
    .bind(
      userId,
      input.title,
      input.sourceFilename,
      input.durationMs,
      input.language,
      input.text,
      JSON.stringify(input.segments),
      now,
      now,
    )
    .run();

  const row = await db
    .prepare(`SELECT ${TRANSCRIPT_FULL_COLUMNS} FROM transcripts WHERE id = ?`)
    .bind(result.meta.last_row_id)
    .first<TranscriptRowWithBody>();

  if (!row) throw new Error("Failed to insert transcript");

  return toTranscript(row);
}

export interface ListTranscriptsOptions {
  q?: string;
  limit?: number;
  cursor?: string;
}

export interface ListTranscriptsResult {
  items: TranscriptSummary[];
  nextCursor: string | null;
}

export async function listTranscriptsByUser(
  db: D1Database,
  userId: number,
  options: ListTranscriptsOptions,
): Promise<ListTranscriptsResult> {
  const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIST_LIMIT, 1), MAX_LIST_LIMIT);
  const cursorId = options.cursor ? Number(options.cursor) : null;

  const conditions = ["user_id = ?"];
  const params: (string | number)[] = [userId];

  if (cursorId !== null && Number.isInteger(cursorId)) {
    conditions.push("id < ?");
    params.push(cursorId);
  }

  if (options.q) {
    conditions.push("text LIKE ?");
    params.push(`%${options.q}%`);
  }

  const rows = await db
    .prepare(
      `SELECT ${TRANSCRIPT_SUMMARY_COLUMNS} FROM transcripts
       WHERE ${conditions.join(" AND ")}
       ORDER BY id DESC
       LIMIT ?`,
    )
    .bind(...params, limit + 1)
    .all<TranscriptRow>();

  const items = rows.results.slice(0, limit).map(toTranscriptSummary);
  const nextCursor =
    rows.results.length > limit ? String(items[items.length - 1].id) : null;

  return { items, nextCursor };
}

export async function getTranscriptForUser(
  db: D1Database,
  userId: number,
  id: number,
): Promise<Transcript | null> {
  const row = await db
    .prepare(`SELECT ${TRANSCRIPT_FULL_COLUMNS} FROM transcripts WHERE id = ? AND user_id = ?`)
    .bind(id, userId)
    .first<TranscriptRowWithBody>();

  return row ? toTranscript(row) : null;
}

export async function updateTranscriptTitle(
  db: D1Database,
  userId: number,
  id: number,
  title: string,
): Promise<Transcript | null> {
  await db
    .prepare(`UPDATE transcripts SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?`)
    .bind(title, Date.now(), id, userId)
    .run();

  return getTranscriptForUser(db, userId, id);
}

export async function deleteTranscriptForUser(
  db: D1Database,
  userId: number,
  id: number,
): Promise<boolean> {
  const result = await db
    .prepare(`DELETE FROM transcripts WHERE id = ? AND user_id = ?`)
    .bind(id, userId)
    .run();

  return (result.meta.changes ?? 0) > 0;
}

export async function getUsageMsForDay(
  db: D1Database,
  userId: number,
  day: string,
): Promise<number> {
  const row = await db
    .prepare(`SELECT audio_ms FROM usage_ledger WHERE user_id = ? AND day = ?`)
    .bind(userId, day)
    .first<{ audio_ms: number }>();

  return row?.audio_ms ?? 0;
}

export async function addUsageForDay(
  db: D1Database,
  userId: number,
  day: string,
  audioMs: number,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO usage_ledger (user_id, day, audio_ms, ai_calls)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(user_id, day) DO UPDATE SET
         audio_ms = audio_ms + excluded.audio_ms,
         ai_calls = ai_calls + 1`,
    )
    .bind(userId, day, audioMs)
    .run();
}
