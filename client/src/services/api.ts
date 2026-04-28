import axios from 'axios';
import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  User,
  Order,
  Waybill,
  PaginatedResponse,
  CreateOrderRequest,
  DashboardStats,
  Branch,
  BranchStatus,
  BranchType,
  Vehicle,
  VehicleStatus,
  VehicleType,
  UserStatus,
  UserRole,
  ExceptionItem,
  ExceptionStatus,
  ExceptionType,
  ExceptionPriority,
  Return,
  ReturnStatus,
  ReturnType,
  Claim,
  ClaimStatus,
  ClaimType,
  Feedback,
  FeedbackStatus,
  FeedbackType,
  InventoryItem,
  InventoryStatus,
  InventoryType
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  }
};

export const orderApi = {
  create: async (data: CreateOrderRequest): Promise<ApiResponse> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  getList: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<Order>): Promise<ApiResponse<Order>> => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  cancel: async (id: number): Promise<ApiResponse> => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  }
};

export const waybillApi = {
  getList: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
    branchId?: number;
  }): Promise<ApiResponse<PaginatedResponse<Waybill>>> => {
    const response = await api.get('/waybills', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Waybill>> => {
    const response = await api.get(`/waybills/${id}`);
    return response.data;
  },

  getByNo: async (waybillNo: string): Promise<ApiResponse<Waybill>> => {
    const response = await api.get(`/waybills/no/${waybillNo}`);
    return response.data;
  },

  updateStatus: async (id: number, data: {
    status: string;
    branchId?: number;
    description?: string;
  }): Promise<ApiResponse<Waybill>> => {
    const response = await api.put(`/waybills/${id}/status`, data);
    return response.data;
  },

  assignCourier: async (id: number, data: {
    courierId: number;
    vehicleId?: number;
  }): Promise<ApiResponse<Waybill>> => {
    const response = await api.post(`/waybills/${id}/assign`, data);
    return response.data;
  }
};

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};

export const branchApi = {
  getList: async (params?: {
    page?: number;
    pageSize?: number;
    status?: BranchStatus;
    type?: BranchType;
    keyword?: string;
  }): Promise<ApiResponse<PaginatedResponse<Branch>>> => {
    const response = await api.get('/branches', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Branch>> => {
    const response = await api.get(`/branches/${id}`);
    return response.data;
  },

  create: async (data: Partial<Branch>): Promise<ApiResponse<Branch>> => {
    const response = await api.post('/branches', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Branch>): Promise<ApiResponse<Branch>> => {
    const response = await api.put(`/branches/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, status: BranchStatus): Promise<ApiResponse<Branch>> => {
    const response = await api.put(`/branches/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  }
};

export const vehicleApi = {
  getList: async (params?: {
    page?: number;
    pageSize?: number;
    status?: VehicleStatus;
    type?: VehicleType;
    keyword?: string;
    branchId?: number;
  }): Promise<ApiResponse<PaginatedResponse<Vehicle>>> => {
    const response = await api.get('/vehicles', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Vehicle>> => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  create: async (data: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, status: VehicleStatus): Promise<ApiResponse<Vehicle>> => {
    const response = await api.put(`/vehicles/${id}/status`, { status });
    return response.data;
  },

  assignDriver: async (id: number, driverId?: number): Promise<ApiResponse<Vehicle>> => {
    const response = await api.put(`/vehicles/${id}/assign`, { driverId });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  }
};

export const userApi = {
  getList: async (params?: {
    page?: number;
    pageSize?: number;
    status?: UserStatus;
    role?: UserRole;
    keyword?: string;
    branchId?: number;
  }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<User> & { password: string }): Promise<ApiResponse<User>> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, status: UserStatus): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${id}/status`, { status });
    return response.data;
  },

  resetPassword: async (id: number, newPassword: string): Promise<ApiResponse> => {
    const response = await api.put(`/users/${id}/reset-password`, { newPassword });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export const exceptionApi = {
  getList: async (params?: {
    page?: number;
    pageSize?: number;
    status?: ExceptionStatus;
    type?: ExceptionType;
    priority?: ExceptionPriority;
    keyword?: string;
  }): Promise<ApiResponse<PaginatedResponse<ExceptionItem>>> => {
    const response = await api.get('/exceptions', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<ExceptionItem>> => {
    const response = await api.get(`/exceptions/${id}`);
    return response.data;
  },

  create: async (data: Partial<ExceptionItem>): Promise<ApiResponse<ExceptionItem>> => {
    const response = await api.post('/exceptions', data);
    return response.data;
  },

  update: async (id: number, data: Partial<ExceptionItem>): Promise<ApiResponse<ExceptionItem>> => {
    const response = await api.put(`/exceptions/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, data: {
    status: ExceptionStatus;
    resolutionSteps?: string;
    resolutionCost?: number;
  }): Promise<ApiResponse<ExceptionItem>> => {
    const response = await api.put(`/exceptions/${id}/status`, data);
    return response.data;
  },

  assign: async (id: number, data: {
    responsiblePersonId?: number;
    responsiblePersonName?: string;
  }): Promise<ApiResponse<ExceptionItem>> => {
    const response = await api.put(`/exceptions/${id}/assign`, data);
    return response.data;
  }
};

export const returnApi = {
  getReturns: async (params?: {
    page?: number;
    pageSize?: number;
    status?: ReturnStatus;
    type?: ReturnType;
    keyword?: string;
  }): Promise<ApiResponse<PaginatedResponse<Return>>> => {
    const response = await api.get('/returns/returns', { params });
    return response.data;
  },

  getReturnById: async (id: number): Promise<ApiResponse<Return>> => {
    const response = await api.get(`/returns/returns/${id}`);
    return response.data;
  },

  createReturn: async (data: Partial<Return>): Promise<ApiResponse<Return>> => {
    const response = await api.post('/returns/returns', data);
    return response.data;
  },

  approveReturn: async (id: number, data?: {
    approvalComment?: string;
    refundAmount?: number;
  }): Promise<ApiResponse<Return>> => {
    const response = await api.put(`/returns/returns/${id}/approve`, data);
    return response.data;
  },

  rejectReturn: async (id: number, data?: {
    approvalComment?: string;
  }): Promise<ApiResponse<Return>> => {
    const response = await api.put(`/returns/returns/${id}/reject`, data);
    return response.data;
  },

  updateReturnStatus: async (id: number, status: ReturnStatus): Promise<ApiResponse<Return>> => {
    const response = await api.put(`/returns/returns/${id}/status`, { status });
    return response.data;
  },

  getClaims: async (params?: {
    page?: number;
    pageSize?: number;
    status?: ClaimStatus;
    type?: ClaimType;
    keyword?: string;
  }): Promise<ApiResponse<PaginatedResponse<Claim>>> => {
    const response = await api.get('/returns/claims', { params });
    return response.data;
  },

  getClaimById: async (id: number): Promise<ApiResponse<Claim>> => {
    const response = await api.get(`/returns/claims/${id}`);
    return response.data;
  },

  createClaim: async (data: Partial<Claim>): Promise<ApiResponse<Claim>> => {
    const response = await api.post('/returns/claims', data);
    return response.data;
  },

  updateClaim: async (id: number, data: Partial<Claim>): Promise<ApiResponse<Claim>> => {
    const response = await api.put(`/returns/claims/${id}`, data);
    return response.data;
  }
};

export const feedbackApi = {
  getList: async (params?: {
    page?: number;
    pageSize?: number;
    status?: FeedbackStatus;
    type?: FeedbackType;
    keyword?: string;
  }): Promise<ApiResponse<PaginatedResponse<Feedback>>> => {
    const response = await api.get('/feedbacks', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Feedback>> => {
    const response = await api.get(`/feedbacks/${id}`);
    return response.data;
  },

  create: async (data: Partial<Feedback>): Promise<ApiResponse<Feedback>> => {
    const response = await api.post('/feedbacks', data);
    return response.data;
  },

  assign: async (id: number, assignedTo?: number): Promise<ApiResponse<Feedback>> => {
    const response = await api.put(`/feedbacks/${id}/assign`, { assignedTo });
    return response.data;
  },

  respond: async (id: number, data: {
    responseContent: string;
    satisfaction?: number;
  }): Promise<ApiResponse<Feedback>> => {
    const response = await api.put(`/feedbacks/${id}/respond`, data);
    return response.data;
  },

  close: async (id: number): Promise<ApiResponse<Feedback>> => {
    const response = await api.put(`/feedbacks/${id}/close`);
    return response.data;
  }
};

export const inventoryApi = {
  getList: async (params?: {
    page?: number;
    pageSize?: number;
    status?: InventoryStatus;
    type?: InventoryType;
    keyword?: string;
    branchId?: number;
  }): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<InventoryItem>> => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  create: async (data: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> => {
    const response = await api.post('/inventory', data);
    return response.data;
  },

  update: async (id: number, data: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },

  updateStock: async (id: number, data: {
    quantity: number;
    type: 'in' | 'out';
    remark?: string;
  }): Promise<ApiResponse<InventoryItem>> => {
    const response = await api.put(`/inventory/${id}/stock`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  }
};

export default api;
