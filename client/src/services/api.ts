import request from '../utils/request';
import { User, AuctionItem, Order, Message, Merchant } from '../types';

export const authApi = {
  register: (data: { phone: string; password: string; nickname: string; role: string }) =>
    request.post('/auth/register', data),
  login: (data: { phone: string; password: string }) =>
    request.post('/auth/login', data)
};

export const userApi = {
  getProfile: (): Promise<User> => request.get('/user/profile'),
  submitRealName: (data: { realName: string; idCard: string }) =>
    request.post('/user/realname', data),
  recharge: (amount: number) => request.post('/user/deposit/recharge', { amount }),
  withdraw: (amount: number) => request.post('/user/deposit/withdraw', { amount }),
  getDepositRecords: (params?: { page?: number; pageSize?: number }) =>
    request.get('/user/deposit/records', { params }),
  getFavorites: (params?: { page?: number; pageSize?: number }) =>
    request.get('/user/favorites', { params }),
  addFavorite: (auctionId: number) => request.post(`/user/favorite/${auctionId}`),
  removeFavorite: (auctionId: number) => request.delete(`/user/favorite/${auctionId}`)
};

export const auctionApi = {
  getList: (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    keyword?: string;
    status?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ items: AuctionItem[]; total: number }> =>
    request.get('/auction/list', { params }),
  getDetail: (id: number): Promise<AuctionItem> => request.get(`/auction/${id}`),
  getBids: (id: number, params?: { page?: number; pageSize?: number }) =>
    request.get(`/auction/${id}/bids`, { params }),
  placeBid: (id: number, amount: number) => request.post(`/auction/${id}/bid`, { amount })
};

export const merchantApi = {
  submitAuth: (data: {
    companyName: string;
    businessLicense: string;
    contactName: string;
    contactPhone: string;
  }) => request.post('/merchant/auth', data),
  getAuthStatus: (): Promise<Merchant> => request.get('/merchant/auth/status'),
  getAuctions: (params?: { page?: number; pageSize?: number; status?: string }) =>
    request.get('/merchant/auctions', { params }),
  createAuction: (data: {
    title: string;
    description: string;
    images: string;
    category: string;
    startPrice: number;
    minIncrement: number;
    reservePrice?: number;
    startTime: string;
    endTime: string;
  }) => request.post('/merchant/auction', data),
  updateAuction: (id: number, data: unknown) => request.put(`/merchant/auction/${id}`, data),
  deleteAuction: (id: number) => request.delete(`/merchant/auction/${id}`),
  getOrders: (params?: { page?: number; pageSize?: number }) =>
    request.get('/merchant/orders', { params })
};

export const adminApi = {
  getUsers: (params?: { page?: number; pageSize?: number; authStatus?: string; role?: string }) =>
    request.get('/admin/users', { params }),
  auditUser: (id: number, status: string, reason?: string) =>
    request.post(`/admin/user/${id}/auth`, { status, reason }),
  getMerchants: (params?: { page?: number; pageSize?: number; authStatus?: string }) =>
    request.get('/admin/merchants', { params }),
  auditMerchant: (id: number, status: string, reason?: string) =>
    request.post(`/admin/merchant/${id}/auth`, { status, reason }),
  getAuctions: (params?: { page?: number; pageSize?: number; auditStatus?: string; status?: string }) =>
    request.get('/admin/auctions', { params }),
  auditAuction: (id: number, status: string, reason?: string) =>
    request.post(`/admin/auction/${id}/audit`, { status, reason }),
  getOrders: (params?: { page?: number; pageSize?: number; status?: string }) =>
    request.get('/admin/orders', { params }),
  getConfigs: () => request.get('/admin/configs'),
  updateConfig: (data: { key: string; value: string; description?: string }) =>
    request.post('/admin/config', data),
  getStatistics: () => request.get('/admin/statistics')
};

export const orderApi = {
  getList: (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    role?: string;
  }): Promise<{ orders: Order[]; total: number }> =>
    request.get('/order/list', { params }),
  getDetail: (id: number): Promise<Order> => request.get(`/order/${id}`),
  pay: (id: number) => request.post(`/order/${id}/pay`),
  confirm: (id: number) => request.post(`/order/${id}/confirm`),
  cancel: (id: number) => request.post(`/order/${id}/cancel`)
};

export const messageApi = {
  getList: (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    isRead?: boolean;
  }): Promise<{ messages: Message[]; total: number; unreadCount: number }> =>
    request.get('/message/list', { params }),
  getUnread: (): Promise<{ unreadCount: number }> => request.get('/message/unread'),
  markRead: (id: number) => request.post(`/message/read/${id}`),
  markAllRead: () => request.post('/message/read-all')
};
