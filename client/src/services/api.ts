import axios from 'axios'
import type { UploadResponse, ProcessResult, Rect } from '../types'

const API_BASE = '/api'

export const api = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('image', file)
    const { data } = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  processImage: async (imageId: number, marks: Rect[]): Promise<ProcessResult> => {
    const { data } = await axios.post(`${API_BASE}/process`, { imageId, marks })
    return data
  },

  getResults: async (page = 1, pageSize = 20): Promise<{ list: ProcessResult[]; total: number }> => {
    const { data } = await axios.get(`${API_BASE}/results`, { params: { page, pageSize } })
    return data
  },

  getResult: async (id: number): Promise<ProcessResult> => {
    const { data } = await axios.get(`${API_BASE}/results/${id}`)
    return data
  },

  deleteResult: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/results/${id}`)
  },

  downloadImage: async (path: string): Promise<void> => {
    window.open(`${API_BASE}/download?path=${encodeURIComponent(path)}`, '_blank')
  }
}
