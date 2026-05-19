import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../data/files.db');

let db: Database.Database;

export interface FileRecord {
  id: string;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  encrypted_path: string;
  iv: string;
  tag: string;
  encryption_key: string;
  chunk_count: number;
  chunk_size: number;
  created_at: number;
  updated_at: number;
}

export function initDatabase(): void {
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      encrypted_path TEXT NOT NULL,
      iv TEXT NOT NULL,
      tag TEXT NOT NULL,
      encryption_key TEXT NOT NULL,
      chunk_count INTEGER NOT NULL,
      chunk_size INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_files_name ON files(name);
  `);
}

export function insertFile(file: FileRecord): void {
  const stmt = db.prepare(`
    INSERT INTO files (
      id, name, original_name, mime_type, size, encrypted_path,
      iv, tag, encryption_key, chunk_count, chunk_size, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    file.id,
    file.name,
    file.original_name,
    file.mime_type,
    file.size,
    file.encrypted_path,
    file.iv,
    file.tag,
    file.encryption_key,
    file.chunk_count,
    file.chunk_size,
    file.created_at,
    file.updated_at
  );
}

export function getAllFiles(): FileRecord[] {
  const stmt = db.prepare('SELECT * FROM files ORDER BY created_at DESC');
  return stmt.all() as FileRecord[];
}

export function getFileById(id: string): FileRecord | undefined {
  const stmt = db.prepare('SELECT * FROM files WHERE id = ?');
  return stmt.get(id) as FileRecord | undefined;
}

export function deleteFile(id: string): void {
  const stmt = db.prepare('DELETE FROM files WHERE id = ?');
  stmt.run(id);
}
