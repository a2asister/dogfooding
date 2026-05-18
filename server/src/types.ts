export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface ProcessResult {
  id: number
  originalName: string
  originalPath: string
  processedPath: string
  thumbnailPath: string
  createdAt: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  marks: string
}

export interface ImageRecord {
  id: number
  originalName: string
  originalPath: string
  uploadTime: string
}
