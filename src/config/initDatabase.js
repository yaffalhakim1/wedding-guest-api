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
  console.log("✅ Connected to SQLite database");
  db.run("PRAGMA journal_mode = WAL");
});

// Create tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Admins table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) {
            console.error("❌ Error creating admins table:", err.message);
            reject(err);
          } else {
            console.log("✅ Admins table created");
          }
        },
      );

      // Guests table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS guests (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          is_vip BOOLEAN DEFAULT 0,
          checked_in BOOLEAN DEFAULT 0,
          checked_in_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) {
            console.error("❌ Error creating guests table:", err.message);
            reject(err);
          } else {
            console.log("✅ Guests table created");
          }
        },
      );

      // Event config table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS event_config (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          bride TEXT NOT NULL,
          groom TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          venue TEXT NOT NULL,
          message TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) {
            console.error("❌ Error creating event_config table:", err.message);
            reject(err);
          } else {
            console.log("✅ Event config table created");
            resolve();
          }
        },
      );
    });
  });
};

// Seed default admin user
const seedAdmin = async () => {
  const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@wedding.com";
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

  return new Promise(async (resolve, reject) => {
    // Check if admin already exists
    db.get(
      "SELECT * FROM admins WHERE email = ?",
      [defaultEmail],
      async (err, row) => {
        if (err) {
          console.error("❌ Error checking admin existence:", err.message);
          reject(err);
          return;
        }

        if (row) {
          console.log("⚠️  Default admin already exists");
          resolve();
          return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        // Insert admin
        db.run(
          "INSERT INTO admins (email, password_hash) VALUES (?, ?)",
          [defaultEmail, passwordHash],
          (err) => {
            if (err) {
              console.error("❌ Error seeding admin:", err.message);
              reject(err);
            } else {
              console.log("✅ Default admin created");
              console.log(`   Email: ${defaultEmail}`);
              console.log(`   Password: ${defaultPassword}`);
              resolve();
            }
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
      if (err) {
        console.error("❌ Error checking event config:", err.message);
        reject(err);
        return;
      }

      if (row) {
        console.log("⚠️  Event config already exists");
        resolve();
        return;
      }

      // Insert default config
      db.run(
        `INSERT INTO event_config (id, bride, groom, date, time, venue, message) 
         VALUES (1, ?, ?, ?, ?, ?, ?)`,
        [
          "Sarah",
          "John",
          "2024-12-31",
          "18:00",
          "Grand Ballroom Hotel",
          "We joyfully invite you to celebrate our wedding",
        ],
        (err) => {
          if (err) {
            console.error("❌ Error seeding event config:", err.message);
            reject(err);
          } else {
            console.log("✅ Default event config created");
            resolve();
          }
        },
      );
    });
  });
};

// Main initialization
const initDatabase = async () => {
  try {
    console.log("\n🚀 Initializing database...\n");

    await createTables();
    await seedAdmin();
    await seedEventConfig();

    console.log("\n✅ Database initialization complete!\n");

    db.close((err) => {
      if (err) {
        console.error("❌ Error closing database:", err.message);
      }
      process.exit(0);
    });
  } catch (error) {
    console.error("\n❌ Database initialization failed:", error.message);
    db.close();
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase, db };
