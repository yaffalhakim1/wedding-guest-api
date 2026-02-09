const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");
require("dotenv").config();

const dbPath =
  process.env.DATABASE_PATH || path.join(__dirname, "../../database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
    process.exit(1);
  }
  db.run("PRAGMA journal_mode = WAL");
});

// Create tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Admins table
      db.run(
        `CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err)
            console.error("❌ Error creating admins table:", err.message);
        },
      );

      // Guests table
      db.run(
        `CREATE TABLE IF NOT EXISTS guests (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          is_vip BOOLEAN DEFAULT 0,
          checked_in BOOLEAN DEFAULT 0,
          checked_in_at DATETIME,
          guest_group TEXT,
          attendance_count INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err)
            console.error("❌ Error creating guests table:", err.message);
        },
      );

      // Event config table
      db.run(
        `CREATE TABLE IF NOT EXISTS event_config (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          bride TEXT NOT NULL,
          groom TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          venue TEXT NOT NULL,
          message TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err)
            console.error("❌ Error creating event_config table:", err.message);
        },
      );

      // Wishes table
      db.run(
        `CREATE TABLE IF NOT EXISTS wishes (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err)
            console.error("❌ Error creating wishes table:", err.message);
        },
      );
      resolve();
    });
  });
};

// Migrate database
const migrateDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all("PRAGMA table_info(guests)", (err, columns) => {
        if (err) return reject(err);
        const columnNames = columns.map((c) => c.name);

        if (!columnNames.includes("guest_group")) {
          db.run("ALTER TABLE guests ADD COLUMN guest_group TEXT");
        }
        if (!columnNames.includes("attendance_count")) {
          db.run(
            "ALTER TABLE guests ADD COLUMN attendance_count INTEGER DEFAULT 1",
          );
        }
        setTimeout(resolve, 100);
      });
    });
  });
};

// Seed default admin
const seedAdmin = async () => {
  const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@wedding.com";
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

  return new Promise(async (resolve, reject) => {
    db.get(
      "SELECT * FROM admins WHERE email = ?",
      [defaultEmail],
      async (err, row) => {
        if (err) return reject(err);
        if (row) return resolve();

        const passwordHash = await bcrypt.hash(defaultPassword, 10);
        db.run(
          "INSERT INTO admins (email, password_hash) VALUES (?, ?)",
          [defaultEmail, passwordHash],
          (err) => {
            if (err) reject(err);
            else resolve();
          },
        );
      },
    );
  });
};

// Seed default event config
const seedEventConfig = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM event_config WHERE id = 1", (err, row) => {
      if (err) return reject(err);
      if (row) return resolve();

      db.run(
        `INSERT INTO event_config (id, bride, groom, date, time, venue, message) 
         VALUES (1, 'Sarah', 'John', '2024-12-31', '18:00', 'Grand Ballroom Hotel', 'We joyfully invite you to celebrate our wedding')`,
        (err) => {
          if (err) reject(err);
          else resolve();
        },
      );
    });
  });
};

// Main initialization
const initDatabase = async () => {
  try {
    await createTables();
    await migrateDatabase();
    await seedAdmin();
    await seedEventConfig();
    console.log("✅ Database initialized");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    db.close();
    process.exit(1);
  } finally {
    setTimeout(() => {
      db.close();
      process.exit(0);
    }, 100);
  }
};

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase, db };
