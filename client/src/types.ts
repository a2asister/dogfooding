export interface ImageInfo {
  id: string
  originalName: string
  originalSize: number
  compressedSize: number
  mimeType: string
  width: number
  height: number
  quality: number
  compressionRatio: number
  createdAt: string
}

export interface CompressionOptions {
  quality: number
  colorSampling: boolean
  iterations: number
  lossless: boolean
}

export interface UploadResponse {
  success: boolean
  message: string
  data?: ImageInfo | ImageInfo[]
}

export interface ListResponse {
  success: boolean
  data?: {
    list: ImageInfo[]
    total: number
    limit: number
    offset: number
  }
  message?: string
}

export interface QueueItem {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  result?: ImageInfo
  error?: string
}

export type TabType = 'upload' | 'history'
