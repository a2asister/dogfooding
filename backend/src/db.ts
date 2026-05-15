import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'filesystem.db');
const db = new Database(dbPath, { timeout: 5000 });

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('temp_store = MEMORY');
db.pragma('mmap_size = 30000000000');

db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('file', 'dir')),
    parent_id INTEGER,
    content TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES nodes(id)
  );
`);

const rootDir = db.prepare('SELECT * FROM nodes WHERE parent_id IS NULL AND name = \'/\' AND type = \'dir\'').get() as Record<string, unknown> | undefined;
if (rootDir === undefined) {
  db.prepare('INSERT INTO nodes (name, type, parent_id) VALUES (?, ?, NULL)').run('/', 'dir');
}

export default db;
