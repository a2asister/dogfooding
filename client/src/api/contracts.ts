import { request } from './index'
import type { Contract, ContractStatus, ApiResponse } from '@/types'

export const contractApi = {
  getAll(params?: { status?: ContractStatus; search?: string }) {
    return request.get<ApiResponse<Contract[]>>('/contracts', { params })
  },

  getById(id: string) {
    return request.get<ApiResponse<Contract>>(`/contracts/${id}`)
  },

  getExpiring(days?: number) {
    return request.get<ApiResponse<Contract[]>>('/contracts/expiring', { params: { days } })
  },

  create(data: Partial<Contract>) {
    return request.post<ApiResponse<Contract>>('/contracts', data)
  },

  update(id: string, data: Partial<Contract>) {
    return request.put<ApiResponse<Contract>>(`/contracts/${id}`, data)
  },

  delete(id: string) {
    return request.delete<ApiResponse>(`/contracts/${id}`)
  },

  submitApproval(id: string, approver: string) {
    return request.post<ApiResponse<Contract>>(`/contracts/${id}/submit-approval`, { approver })
  },

  sign(id: string, data: { party: string; signerName: string; signatureImage?: string }) {
    return request.post<ApiResponse<Contract>>(`/contracts/${id}/sign`, data)
  },

  startPerformance(id: string) {
    return request.post<ApiResponse<Contract>>(`/contracts/${id}/start-performance`)
  },

  archive(id: string, data: { keywords: string[]; accessLevel: 'public' | 'internal' | 'confidential'; archiveBy: string }) {
    return request.post<ApiResponse<Contract>>(`/contracts/${id}/archive`, data)
  }
}

export default contractApi
