import { request } from './index'
import type { PerformanceRecord, ApiResponse } from '@/types'

export const performanceApi = {
  getAll(contractId?: string) {
    return request.get<ApiResponse<PerformanceRecord[]>>('/performance', { 
      params: contractId ? { contractId } : {} 
    })
  },

  getById(id: string) {
    return request.get<ApiResponse<PerformanceRecord>>(`/performance/${id}`)
  },

  getByContractId(contractId: string) {
    return request.get<ApiResponse<PerformanceRecord[]>>(`/performance/contract/${contractId}`)
  },

  getOverdue() {
    return request.get<ApiResponse<PerformanceRecord[]>>('/performance/overdue')
  },

  create(data: Partial<PerformanceRecord>) {
    return request.post<ApiResponse<PerformanceRecord>>('/performance', data)
  },

  complete(id: string, notes?: string) {
    return request.put<ApiResponse<PerformanceRecord>>(`/performance/${id}/complete`, { notes })
  },

  cancel(id: string, notes?: string) {
    return request.put<ApiResponse<PerformanceRecord>>(`/performance/${id}/cancel`, { notes })
  }
}

export default performanceApi
