export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface WatermarkMark {
  id: string
  rect: Rect
}

export interface ProcessResult {
  id: number
  originalName: string
  originalPath: string
  processedPath: string
  thumbnailPath: string
  createdAt: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  marks: WatermarkMark[]
}

export interface UploadResponse {
  id: number
  path: string
  url: string
}
