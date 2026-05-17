export interface ImageRecord {
  id: string
  originalName: string
  originalSize: number
  compressedSize: number
  originalHash: string
  compressedHash: string
  mimeType: string
  width: number
  height: number
  quality: number
  compressionRatio: number
  createdAt: string
  updatedAt: string
  originalData: Buffer
  compressedData: Buffer
}

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

export interface UploadResponse {
  success: boolean
  message: string
  data?: ImageInfo
}

export interface CompressionOptions {
  quality: number
  colorSampling: boolean
  iterations: number
  lossless: boolean
}

export type CompressionStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface CompressionTask {
  id: string
  file: Express.Multer.File
  options: CompressionOptions
  status: CompressionStatus
  progress: number
  result?: ImageInfo
  error?: string
}
