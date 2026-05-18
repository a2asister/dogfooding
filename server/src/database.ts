import Database = require('better-sqlite3');
import path = require('path');
import type { ImageRecord } from './types';

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    originalName TEXT NOT NULL,
    originalPath TEXT NOT NULL,
    resultPath TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL
  )
`);

export function insertImage(record: Omit<ImageRecord, 'id'>): number {
  const stmt = db.prepare(`
    INSERT INTO images (filename, originalName, originalPath, resultPath, createdAt, width, height)
    VALUES (@filename, @originalName, @originalPath, @resultPath, @createdAt, @width, @height)
  `);
  const result = stmt.run(record);
  return Number(result.lastInsertRowid);
}

export function getAllImages(): ImageRecord[] {
  const stmt = db.prepare('SELECT * FROM images ORDER BY createdAt DESC');
  return stmt.all() as ImageRecord[];
}

export function deleteImage(id: number): boolean {
  const stmt = db.prepare('DELETE FROM images WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function getImageById(id: number): ImageRecord | null {
  const stmt = db.prepare('SELECT * FROM images WHERE id = ?');
  const result = stmt.get(id) as ImageRecord | undefined;
  return result ?? null;
}

export { db };
