import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import type { AudioFile, ConversionTask, BatchJob } from './types.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'converter.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS audio_files (
    id TEXT PRIMARY KEY,
    original_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    original_format TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS conversion_tasks (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    target_format TEXT NOT NULL,
    quality TEXT NOT NULL,
    sample_rate INTEGER,
    bit_depth INTEGER,
    bit_rate INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    progress INTEGER NOT NULL DEFAULT 0,
    output_path TEXT,
    output_size INTEGER,
    error TEXT,
    created_at INTEGER NOT NULL,
    completed_at INTEGER,
    FOREIGN KEY (file_id) REFERENCES audio_files(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS batch_jobs (
    id TEXT PRIMARY KEY,
    task_ids TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL,
    completed_at INTEGER,
    archive_path TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_status ON conversion_tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_file_id ON conversion_tasks(file_id);
`);

export const insertAudioFile = db.prepare(`
  INSERT INTO audio_files (id, original_name, file_name, file_path, file_size, original_format, created_at)
  VALUES (@id, @originalName, @fileName, @filePath, @fileSize, @originalFormat, @createdAt)
`);

export const getAudioFile = db.prepare(`
  SELECT * FROM audio_files WHERE id = ?
`);

export const insertConversionTask = db.prepare(`
  INSERT INTO conversion_tasks (
    id, file_id, target_format, quality, sample_rate, bit_depth, bit_rate,
    status, progress, created_at
  ) VALUES (
    @id, @fileId, @targetFormat, @quality, @sampleRate, @bitDepth, @bitRate,
    @status, @progress, @createdAt
  )
`);

export const updateTaskStatus = db.prepare(`
  UPDATE conversion_tasks
  SET status = @status, progress = @progress, output_path = @outputPath,
      output_size = @outputSize, error = @error, completed_at = @completedAt
  WHERE id = @id
`);

export const getTask = db.prepare(`
  SELECT * FROM conversion_tasks WHERE id = ?
`);

export const getTasksByFileId = db.prepare(`
  SELECT * FROM conversion_tasks WHERE file_id = ? ORDER BY created_at DESC
`);

export const insertBatchJob = db.prepare(`
  INSERT INTO batch_jobs (id, task_ids, status, created_at)
  VALUES (@id, @taskIds, @status, @createdAt)
`);

export const updateBatchJob = db.prepare(`
  UPDATE batch_jobs
  SET status = @status, completed_at = @completedAt, archive_path = @archivePath
  WHERE id = @id
`);

export const getBatchJob = db.prepare(`
  SELECT * FROM batch_jobs WHERE id = ?
`);

export function rowToAudioFile(row: unknown): AudioFile | null {
  const r = row as Record<string, unknown> | undefined;
  if (!r) return null;
  return {
    id: r.id as string,
    originalName: r.original_name as string,
    fileName: r.file_name as string,
    filePath: r.file_path as string,
    fileSize: r.file_size as number,
    originalFormat: r.original_format as AudioFile['originalFormat'],
    createdAt: r.created_at as number
  };
}

export function rowToConversionTask(row: unknown): ConversionTask | null {
  const r = row as Record<string, unknown> | undefined;
  if (!r) return null;
  return {
    id: r.id as string,
    fileId: r.file_id as string,
    options: {
      targetFormat: r.target_format as ConversionTask['options']['targetFormat'],
      quality: r.quality as ConversionTask['options']['quality'],
      sampleRate: r.sample_rate as number | undefined,
      bitDepth: r.bit_depth as number | undefined,
      bitRate: r.bit_rate as number | undefined
    },
    status: r.status as ConversionTask['status'],
    progress: r.progress as number,
    outputPath: r.output_path as string | undefined,
    outputSize: r.output_size as number | undefined,
    error: r.error as string | undefined,
    createdAt: r.created_at as number,
    completedAt: r.completed_at as number | undefined
  };
}

export function rowToBatchJob(row: unknown): BatchJob | null {
  const r = row as Record<string, unknown> | undefined;
  if (!r) return null;
  return {
    id: r.id as string,
    taskIds: JSON.parse(r.task_ids as string) as string[],
    status: r.status as BatchJob['status'],
    createdAt: r.created_at as number,
    completedAt: r.completed_at as number | undefined,
    archivePath: r.archive_path as string | undefined
  };
}
