import request from './request';
import type { Order } from '@/types';

export const createOrder = (data: {
  items: Array<{
    itemType: 'product' | 'membership' | 'promotion' | 'tip';
    itemId: string;
    quantity: number;
  }>;
}) => {
  return request.post<{ order: Order }>('/orders', data);
};

export const getOrderList = (params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) => {
  return request.get<{ list: Order[]; total: number; page: number; pageSize: number }>('/orders', { params });
};

export const getOrderDetail = (id: string) => {
  return request.get<{ order: Order }>(`/orders/${id}`);
};

export const payOrder = (id: string, data: { paymentMethod: string }) => {
  return request.post<{ order: Order; payUrl?: string }>(`/orders/${id}/pay`, data);
};

export const cancelOrder = (id: string) => {
  return request.post<{ order: Order }>(`/orders/${id}/cancel`);
};

export const confirmOrder = (id: string) => {
  return request.post<{ order: Order }>(`/orders/${id}/confirm`);
};

export const applyRefund = (id: string, data: { reason: string }) => {
  return request.post<{ order: Order }>(`/orders/${id}/refund`, data);
};
