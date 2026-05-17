import type { User, Dashboard, DashboardConfig } from '../types';

const API_BASE = '/api';

type ApiResponse<T = any> = T & {
  message?: string;
  error?: string;
};

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

export const authApi = {
  async register(username: string, email: string, password: string) {
    return request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  async login(username: string, password: string) {
    return request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async getMe() {
    return request<{ user: User }>('/auth/me');
  },
};

export const dashboardApi = {
  async getAll() {
    return request<{ dashboards: Dashboard[] }>('/dashboards');
  },

  async getById(id: number) {
    return request<{ dashboard: Dashboard }>(`/dashboards/${id}`);
  },

  async create(name: string, description?: string) {
    return request<{ dashboard: Dashboard }>('/dashboards', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  async update(id: number, data: { name?: string; description?: string | null; config?: DashboardConfig; thumbnail?: string | null }) {
    return request<{ dashboard: Dashboard }>(`/dashboards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number) {
    return request(`/dashboards/${id}`, {
      method: 'DELETE',
    });
  },
};
