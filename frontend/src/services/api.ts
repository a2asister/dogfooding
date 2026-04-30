import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', error);
    const message = error.response?.data?.message || '网络请求失败，请稍后重试';
    return Promise.reject(new Error(message));
  }
);

export interface MonitoringPoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: 'normal' | 'warning' | 'danger';
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface WaterQualityData {
  id: number;
  monitoring_point_id: number;
  ph?: number;
  temperature?: number;
  turbidity?: number;
  dissolved_oxygen?: number;
  conductivity?: number;
  ammonia_nitrogen?: number;
  total_phosphorus?: number;
  collected_at: string;
  created_at: string;
  monitoringPoint?: MonitoringPoint;
}

export interface PollutionEvent {
  id: number;
  monitoring_point_id: number;
  event_type: 'floating_trash' | 'chemical_pollution' | 'suspended_matter' | 'algae_bloom' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  detected_at: string;
  resolved_at?: string;
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: number;
  monitoring_point_id: number;
  pollution_event_id?: number;
  alert_type: 'info' | 'warning' | 'danger';
  message: string;
  level: 'low' | 'medium' | 'high';
  is_read: boolean;
  is_handled: boolean;
  triggered_at: string;
  handled_at?: string;
  created_at: string;
  monitoringPoint?: MonitoringPoint;
  pollutionEvent?: PollutionEvent;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const monitoringPointApi = {
  getAll: (params?: PaginationParams & { status?: string }) => 
    api.get<{ success: boolean; data: PaginatedResponse<MonitoringPoint> }>('/monitoring-points', { params }),
  
  getById: (id: number) => 
    api.get<{ success: boolean; data: MonitoringPoint }>(`/monitoring-points/${id}`),
  
  getStatistics: () => 
    api.get<{ success: boolean; data: { total: number; normal: number; warning: number; danger: number } }>('/monitoring-points/statistics'),
  
  create: (data: Omit<MonitoringPoint, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<{ success: boolean; data: MonitoringPoint; message: string }>('/monitoring-points', data),
  
  update: (id: number, data: Partial<MonitoringPoint>) => 
    api.put<{ success: boolean; data: MonitoringPoint; message: string }>(`/monitoring-points/${id}`, data),
  
  delete: (id: number) => 
    api.delete<{ success: boolean; message: string }>(`/monitoring-points/${id}`),
};

export const waterQualityApi = {
  getAll: (params?: PaginationParams & { monitoringPointId?: number; startDate?: string; endDate?: string }) => 
    api.get<{ success: boolean; data: PaginatedResponse<WaterQualityData> }>('/water-quality', { params }),
  
  getLatest: (monitoringPointId?: number) => 
    api.get<{ success: boolean; data: WaterQualityData }>('/water-quality/latest', { params: { monitoringPointId } }),
  
  getStatistics: (params?: { monitoringPointId?: number; startDate?: string; endDate?: string }) => 
    api.get<{ success: boolean; data: any }>('/water-quality/statistics', { params }),
  
  getTrend: (params?: { monitoringPointId?: number; startDate?: string; endDate?: string; interval?: 'hour' | 'day' }) => 
    api.get<{ success: boolean; data: any[] }>('/water-quality/trend', { params }),
  
  create: (data: Omit<WaterQualityData, 'id' | 'created_at'>) => 
    api.post<{ success: boolean; data: WaterQualityData; message: string }>('/water-quality', data),
};

export const alertApi = {
  getAll: (params?: PaginationParams & { alertType?: string; isHandled?: boolean; isRead?: boolean; level?: string }) => 
    api.get<{ success: boolean; data: PaginatedResponse<Alert> }>('/alerts', { params }),
  
  getById: (id: number) => 
    api.get<{ success: boolean; data: Alert }>(`/alerts/${id}`),
  
  getStatistics: () => 
    api.get<{ success: boolean; data: { total: number; info: number; warning: number; danger: number; unhandled: number; unread: number } }>('/alerts/statistics'),
  
  create: (data: Omit<Alert, 'id' | 'is_read' | 'is_handled' | 'triggered_at' | 'handled_at' | 'created_at'>) => 
    api.post<{ success: boolean; data: Alert; message: string }>('/alerts', data),
  
  update: (id: number, data: Partial<Alert>) => 
    api.put<{ success: boolean; data: Alert; message: string }>(`/alerts/${id}`, data),
  
  markAsRead: (id: number) => 
    api.put<{ success: boolean; message: string }>(`/alerts/${id}/read`),
  
  handle: (id: number) => 
    api.put<{ success: boolean; message: string }>(`/alerts/${id}/handle`),
};

export const healthApi = {
  check: () => api.get<{ success: boolean; message: string; timestamp: string }>('/health'),
};

export default api;
