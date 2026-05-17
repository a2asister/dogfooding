import axios from 'axios'
import type { ImageInfo, ListResponse, UploadResponse } from './types'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000
})

export interface CompressedImageData {
  originalName: string
  originalSize: number
  compressedData: ArrayBuffer
  compressedSize: number
  width: number
  height: number
  compressionRatio: number
  quality: number
  outputFormat: string
}

export async function uploadCompressedImages(
  compressedImages: CompressedImageData[]
): Promise<ImageInfo[]> {
  const formData = new FormData()

  compressedImages.forEach((img, index) => {
    const ext = img.outputFormat === 'image/jpeg' ? '.jpg' : '.png'
    const blob = new Blob([img.compressedData], { type: img.outputFormat })
    const file = new File([blob], img.originalName.replace(/\.[^.]+$/, '') + ext, {
      type: img.outputFormat
    })
    formData.append(`images`, file)
    formData.append(`originalName_${index}`, img.originalName)
    formData.append(`originalSize_${index}`, String(img.originalSize))
    formData.append(`compressedSize_${index}`, String(img.compressedSize))
    formData.append(`width_${index}`, String(img.width))
    formData.append(`height_${index}`, String(img.height))
    formData.append(`compressionRatio_${index}`, String(img.compressionRatio))
    formData.append(`quality_${index}`, String(img.quality))
    formData.append(`mimeType_${index}`, img.outputFormat)
  })

  formData.append('count', String(compressedImages.length))

  const response = await api.post<UploadResponse>('/upload/compressed', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  if (!response.data.success) {
    throw new Error(response.data.message)
  }

  const data = response.data.data
  return Array.isArray(data) ? data : data ? [data] : []
}

export async function getImageList(limit = 100, offset = 0): Promise<{ list: ImageInfo[]; total: number }> {
  const response = await api.get<ListResponse>('/images', {
    params: { limit, offset }
  })

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || '获取列表失败')
  }

  return response.data.data
}

export async function downloadImage(id: string, type: 'original' | 'compressed'): Promise<void> {
  const response = await api.get(`/images/${id}/download`, {
    params: { type },
    responseType: 'blob'
  })

  const blob = new Blob([response.data as BlobPart])
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${id}_${type}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function deleteImage(id: string): Promise<void> {
  const response = await api.delete(`/images/${id}`)
  if (!response.data.success) {
    throw new Error(response.data.message || '删除失败')
  }
}

export function getPreviewUrl(id: string, type: 'original' | 'compressed' = 'compressed'): string {
  return `/api/images/${id}/preview?type=${type}`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i] as string}`
}

export default api
