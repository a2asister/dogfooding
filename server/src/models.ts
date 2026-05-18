import { dbInstance } from './db'
import type { ProcessResult, ImageRecord } from './types'

export const insertImage = (originalName: string, originalPath: string): number => {
  const stmt = dbInstance.prepare(
    'INSERT INTO images (originalName, originalPath) VALUES (?, ?)'
  )
  const result = stmt.run(originalName, originalPath)
  return Number(result.lastInsertRowid)
}

export const getImage = (id: number): ImageRecord | undefined => {
  const stmt = dbInstance.prepare('SELECT * FROM images WHERE id = ?')
  return stmt.get(id) as ImageRecord | undefined
}

export const getImageById = (id: number): { originalName: string; originalPath: string } | undefined => {
  const image = getImage(id)
  if (image) {
    return {
      originalName: image.originalName,
      originalPath: image.originalPath
    }
  }
  return undefined
}

export const insertResult = (
  imageId: number,
  originalName: string,
  originalPath: string,
  marks: string
): number => {
  const stmt = dbInstance.prepare(
    'INSERT INTO results (imageId, originalName, originalPath, marks, status) VALUES (?, ?, ?, ?, ?)'
  )
  const result = stmt.run(imageId, originalName, originalPath, marks, 'processing')
  return Number(result.lastInsertRowid)
}

export const updateResultStatus = (
  id: number,
  status: string,
  processedPath?: string,
  thumbnailPath?: string
): void => {
  if (processedPath && thumbnailPath) {
    const stmt = dbInstance.prepare(
      'UPDATE results SET status = ?, processedPath = ?, thumbnailPath = ? WHERE id = ?'
    )
    stmt.run(status, processedPath, thumbnailPath, id)
  } else {
    const stmt = dbInstance.prepare('UPDATE results SET status = ? WHERE id = ?')
    stmt.run(status, id)
  }
}

export const getResults = (page: number, pageSize: number): { list: ProcessResult[]; total: number } => {
  const offset = (page - 1) * pageSize
  
  const countStmt = dbInstance.prepare('SELECT COUNT(*) as total FROM results')
  const { total } = countStmt.get() as { total: number }
  
  const listStmt = dbInstance.prepare(
    'SELECT * FROM results ORDER BY createdAt DESC LIMIT ? OFFSET ?'
  )
  const list = listStmt.all(pageSize, offset) as ProcessResult[]
  
  return { list, total }
}

export const getResult = (id: number): ProcessResult | undefined => {
  const stmt = dbInstance.prepare('SELECT * FROM results WHERE id = ?')
  return stmt.get(id) as ProcessResult | undefined
}

export const deleteResult = (id: number): void => {
  const stmt = dbInstance.prepare('DELETE FROM results WHERE id = ?')
  stmt.run(id)
}
