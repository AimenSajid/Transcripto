CREATE TABLE anon_usage_ledger (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ip         TEXT    NOT NULL,
  day        TEXT    NOT NULL,
  audio_ms   INTEGER NOT NULL DEFAULT 0,
  ai_calls   INTEGER NOT NULL DEFAULT 0,
  UNIQUE(ip, day)
);
