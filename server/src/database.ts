import Database from 'better-sqlite3'
import type { Database as DatabaseType } from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import type { ImageInfo, ImageRecord } from './types'

const DB_DIR = path.resolve('./data')
const DB_PATH = path.join(DB_DIR, 'images.db')

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

const db: DatabaseType = new Database(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    originalName TEXT NOT NULL,
    originalSize INTEGER NOT NULL,
    compressedSize INTEGER NOT NULL,
    originalHash TEXT NOT NULL UNIQUE,
    compressedHash TEXT NOT NULL,
    mimeType TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    quality INTEGER NOT NULL,
    compressionRatio REAL NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    originalData BLOB NOT NULL,
    compressedData BLOB NOT NULL
  )
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_images_originalHash ON images(originalHash)
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_images_createdAt ON images(createdAt)
`)

export function findImageByHash(hash: string): ImageRecord | null {
  const stmt = db.prepare('SELECT * FROM images WHERE originalHash = ?')
  const result = stmt.get(hash) as ImageRecord | undefined
  return result ?? null
}

export function insertImage(record: ImageRecord): void {
  const stmt = db.prepare(`
    INSERT INTO images (
      id, originalName, originalSize, compressedSize, originalHash,
      compressedHash, mimeType, width, height, quality,
      compressionRatio, createdAt, updatedAt, originalData, compressedData
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  stmt.run(
    record.id,
    record.originalName,
    record.originalSize,
    record.compressedSize,
    record.originalHash,
    record.compressedHash,
    record.mimeType,
    record.width,
    record.height,
    record.quality,
    record.compressionRatio,
    record.createdAt,
    record.updatedAt,
    record.originalData,
    record.compressedData
  )
}

export function getImageList(limit = 100, offset = 0): ImageInfo[] {
  const stmt = db.prepare(`
    SELECT
      id, originalName, originalSize, compressedSize,
      mimeType, width, height, quality, compressionRatio, createdAt
    FROM images
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `)
  return stmt.all(limit, offset) as ImageInfo[]
}

export function getImageById(id: string): ImageRecord | null {
  const stmt = db.prepare('SELECT * FROM images WHERE id = ?')
  const result = stmt.get(id) as ImageRecord | undefined
  return result ?? null
}

export function deleteImage(id: string): boolean {
  const stmt = db.prepare('DELETE FROM images WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export function getTotalCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM images')
  const result = stmt.get() as { count: number }
  return result.count
}

export default db
