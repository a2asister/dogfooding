import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'app.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    originalName TEXT NOT NULL,
    originalPath TEXT NOT NULL,
    uploadTime DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imageId INTEGER NOT NULL,
    originalName TEXT NOT NULL,
    originalPath TEXT NOT NULL,
    processedPath TEXT,
    thumbnailPath TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    marks TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (imageId) REFERENCES images(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_results_status ON results(status);
  CREATE INDEX IF NOT EXISTS idx_results_created ON results(createdAt DESC);
`)

export const dbInstance = db
