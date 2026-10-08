CREATE TABLE IF NOT EXISTS tickets (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(100) NOT NULL CHECK (char_length(title) >= 3),
  description VARCHAR(1000),
  priority    TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets (status);
CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON tickets (created_at DESC);
