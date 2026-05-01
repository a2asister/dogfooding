import { request } from './index'
import type { Contract, ApprovalStep, ApiResponse } from '@/types'

export const approvalApi = {
  getAll() {
    return request.get<ApiResponse<any[]>>('/approvals')
  },

  getMy(approver: string) {
    return request.get<ApiResponse<Contract[]>>('/approvals/my', { params: { approver } })
  },

  approve(contractId: string, data: { approver: string; comment?: string; nextApprover?: string }) {
    return request.post<ApiResponse<Contract>>(`/approvals/${contractId}/approve`, data)
  },

  reject(contractId: string, data: { approver: string; comment?: string }) {
    return request.post<ApiResponse<Contract>>(`/approvals/${contractId}/reject`, data)
  },

  getHistory(contractId: string) {
    return request.get<ApiResponse<ApprovalStep[]>>(`/approvals/history/${contractId}`)
  }
}

export default approvalApi
