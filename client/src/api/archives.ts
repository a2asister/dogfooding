import { request } from './index'
import type { Archive, ApiResponse } from '@/types'

export const archiveApi = {
  getAll(keyword?: string) {
    return request.get<ApiResponse<Archive[]>>('/archives', { 
      params: keyword ? { keyword } : {} 
    })
  },

  getById(id: string) {
    return request.get<ApiResponse<{ archive: Archive; contract: any }>>(`/archives/${id}`)
  },

  search(keyword: string) {
    return request.get<ApiResponse<{ archive: Archive; contract: any }[]>>('/archives/search', { 
      params: { keyword } 
    })
  }
}

export default archiveApi
