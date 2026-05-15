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

db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS aliases (
    alias TEXT PRIMARY KEY,
    command TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS command_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const rootDir = db.prepare('SELECT * FROM nodes WHERE parent_id IS NULL AND name = \'/\' AND type = \'dir\'').get() as Record<string, unknown> | undefined;
if (rootDir === undefined) {
  db.prepare('INSERT INTO nodes (name, type, parent_id) VALUES (?, ?, NULL)').run('/', 'dir');
}

export function getConfig(key: string, defaultValue: string): string {
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? defaultValue;
}

export function setConfig(key: string, value: string): void {
  db.prepare('INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run(key, value);
}

export function getAllAliases(): Map<string, string> {
  const rows = db.prepare('SELECT alias, command FROM aliases').all() as { alias: string; command: string }[];
  return new Map(rows.map(row => [row.alias, row.command]));
}

export function setAlias(alias: string, command: string): void {
  db.prepare('INSERT OR REPLACE INTO aliases (alias, command) VALUES (?, ?)').run(alias, command);
}

export function deleteAlias(alias: string): boolean {
  const result = db.prepare('DELETE FROM aliases WHERE alias = ?').run(alias);
  return result.changes > 0;
}

export function addCommandHistory(command: string, path: string): void {
  db.prepare('INSERT INTO command_history (command, path) VALUES (?, ?)').run(command, path);
}

export function getCommandHistory(limit?: number): { id: number; command: string; path: string; created_at: string }[] {
  if (limit) {
    return db.prepare('SELECT id, command, path, created_at FROM command_history ORDER BY id DESC LIMIT ?').all(limit) as { id: number; command: string; path: string; created_at: string }[];
  }
  return db.prepare('SELECT id, command, path, created_at FROM command_history ORDER BY id DESC').all() as { id: number; command: string; path: string; created_at: string }[];
}

export function searchCommandHistory(pattern: string): { id: number; command: string; path: string; created_at: string }[] {
  return db.prepare('SELECT id, command, path, created_at FROM command_history WHERE command LIKE ? ORDER BY id DESC').all(`%${pattern}%`) as { id: number; command: string; path: string; created_at: string }[];
}

export function deleteCommandHistory(id: number): boolean {
  const result = db.prepare('DELETE FROM command_history WHERE id = ?').run(id);
  return result.changes > 0;
}

export function clearCommandHistory(): void {
  db.prepare('DELETE FROM command_history').run();
}

export default db;
