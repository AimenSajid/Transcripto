CREATE TABLE users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  google_sub  TEXT    NOT NULL UNIQUE,   -- identity key — NOT email
  email       TEXT,
  name        TEXT,
  picture     TEXT,
  created_at  INTEGER NOT NULL           -- unix ms
);

CREATE TABLE transcripts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            TEXT    NOT NULL,
  source_filename  TEXT,
  duration_ms      INTEGER NOT NULL,
  language         TEXT,
  status           TEXT    NOT NULL,     -- 'processing' | 'complete' | 'failed'
  text             TEXT    NOT NULL,     -- full plaintext, for search
  segments         TEXT    NOT NULL,     -- JSON: Segment[]
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX idx_transcripts_user_created
  ON transcripts(user_id, created_at DESC);   -- serves the history page directly

CREATE TABLE summaries (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  transcript_id  INTEGER NOT NULL UNIQUE
                 REFERENCES transcripts(id) ON DELETE CASCADE,
  model          TEXT    NOT NULL,       -- provenance: which model wrote this
  summary        TEXT    NOT NULL,
  key_points     TEXT    NOT NULL,       -- JSON: string[]
  action_items   TEXT    NOT NULL,       -- JSON: string[]
  created_at     INTEGER NOT NULL
);

CREATE TABLE usage_ledger (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day        TEXT    NOT NULL,           -- 'YYYY-MM-DD' UTC
  audio_ms   INTEGER NOT NULL DEFAULT 0,
  ai_calls   INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, day)
);
