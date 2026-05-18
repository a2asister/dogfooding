import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { PhotoRecord, ModelParams } from './types';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'photos.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    originalName TEXT NOT NULL,
    originalPath TEXT NOT NULL,
    processedPath TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    progress INTEGER NOT NULL DEFAULT 0,
    modelParams TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    completedAt INTEGER,
    errorMessage TEXT
  )
`);

const insertStmt = db.prepare(`
  INSERT INTO photos (id, originalName, originalPath, modelParams, createdAt)
  VALUES (?, ?, ?, ?, ?)
`);

const updateStatusStmt = db.prepare(`
  UPDATE photos SET status = ?, progress = ? WHERE id = ?
`);

const updateCompletedStmt = db.prepare(`
  UPDATE photos SET status = 'completed', processedPath = ?, progress = 100, completedAt = ? WHERE id = ?
`);

const updateFailedStmt = db.prepare(`
  UPDATE photos SET status = 'failed', errorMessage = ?, completedAt = ? WHERE id = ?
`);

const getByIdStmt = db.prepare(`
  SELECT * FROM photos WHERE id = ?
`);

const getAllStmt = db.prepare(`
  SELECT * FROM photos ORDER BY createdAt DESC LIMIT ?
`);

const deleteByIdStmt = db.prepare(`
  DELETE FROM photos WHERE id = ?
`);

function parseRecord(row: { modelParams: string } & Omit<PhotoRecord, 'modelParams'>): PhotoRecord {
  return {
    ...row,
    modelParams: JSON.parse(row.modelParams) as ModelParams,
  };
}

export function createPhotoRecord(
  id: string,
  originalName: string,
  originalPath: string,
  modelParams: ModelParams,
): PhotoRecord {
  const createdAt = Date.now();
  insertStmt.run(id, originalName, originalPath, JSON.stringify(modelParams), createdAt);
  return {
    id,
    originalName,
    originalPath,
    processedPath: null,
    status: 'pending',
    progress: 0,
    modelParams,
    createdAt,
    completedAt: null,
    errorMessage: null,
  };
}

export function updateProgress(id: string, status: PhotoRecord['status'], progress: number): void {
  updateStatusStmt.run(status, progress, id);
}

export function markCompleted(id: string, processedPath: string): void {
  updateCompletedStmt.run(processedPath, Date.now(), id);
}

export function markFailed(id: string, errorMessage: string): void {
  updateFailedStmt.run(errorMessage, Date.now(), id);
}

export function getPhotoById(id: string): PhotoRecord | null {
  const row = getByIdStmt.get(id) as ({ modelParams: string } & Omit<PhotoRecord, 'modelParams'>) | undefined;
  return row ? parseRecord(row) : null;
}

export function getAllPhotos(limit = 50): PhotoRecord[] {
  const rows = getAllStmt.all(limit) as Array<{ modelParams: string } & Omit<PhotoRecord, 'modelParams'>>;
  return rows.map(parseRecord);
}

export function deletePhoto(id: string): boolean {
  const result = deleteByIdStmt.run(id);
  return result.changes > 0;
}

export type { Database };
