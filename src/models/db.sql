-- admins (for authentication)
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- guests (wedding attendees)
CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY,              -- UUID
  name TEXT NOT NULL,
  is_vip BOOLEAN DEFAULT 0,
  checked_in BOOLEAN DEFAULT 0,
  guest_group TEXT DEFAULT NULL,
  attendance_count INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- event_config (wedding details)
CREATE TABLE IF NOT EXISTS event_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),  -- Single row table
  bride TEXT NOT NULL,
  groom TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  message TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- wishes (guest messages/wishes)
CREATE TABLE IF NOT EXISTS wishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC);
