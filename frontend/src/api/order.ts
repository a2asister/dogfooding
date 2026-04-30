import api from './index'
import type { Order, ApiResponse, CreateOrderRequest } from '@/types'

export const orderApi = {
  getOrders: (params?: { status?: string; page?: number; pageSize?: number }) => {
    return api.get<ApiResponse<{ orders: Order[]; total: number }>>('/orders', { params })
  },
  
  getOrder: (id: number) => {
    return api.get<ApiResponse<Order>>(`/orders/${id}`)
  },
  
  createOrder: (data: CreateOrderRequest) => {
    return api.post<ApiResponse<Order>>('/orders', data)
  },
  
  updateOrderStatus: (id: number, status: string) => {
    return api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status })
  },
  
  cancelOrder: (id: number, reason?: string) => {
    return api.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason })
  },
  
  applyAfterSale: (id: number, data: { type: string; reason: string; images?: string[] }) => {
    return api.post<ApiResponse<void>>(`/orders/${id}/after-sale`, data)
  },
}
