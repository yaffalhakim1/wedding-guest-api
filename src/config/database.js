const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

const dbPath = path.resolve(
  __dirname,
  "../../",
  process.env.DATABASE_PATH || "database.db",
);

/**
 * Database connection module
 * WAL mode and foreign keys are enabled for concurrency and integrity
 */
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
  }
});

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");
  db.run("PRAGMA journal_mode = WAL");
});

module.exports = db;
