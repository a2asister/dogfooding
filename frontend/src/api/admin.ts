import api from './index'
import type { ApiResponse, OperationLog, Statistics } from '@/types'

export const logApi = {
  getLogs: (params?: { userId?: number; action?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number }) => {
    return api.get<ApiResponse<{ logs: OperationLog[]; total: number }>>('/admin/logs', { params })
  },
}

export const statisticsApi = {
  getDashboard: () => {
    return api.get<ApiResponse<Statistics>>('/admin/statistics/dashboard')
  },
  
  getSales: (params?: { startDate?: string; endDate?: string; type?: 'day' | 'week' | 'month' }) => {
    return api.get<ApiResponse<any[]>>('/admin/statistics/sales', { params })
  },
}
