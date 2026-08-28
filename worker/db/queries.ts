import type { GoogleIdentity } from "../services/google";
import type { DbUser } from "../types";

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
