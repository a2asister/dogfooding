import axios from 'axios';
import { PathData, PathVersion, HistoryRecord, Point, AnimationConfig } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pathApi = {
  getAll: async (): Promise<PathData[]> => {
    const response = await api.get('/paths');
    return response.data;
  },

  getById: async (id: string): Promise<PathData> => {
    const response = await api.get(`/paths/${id}`);
    return response.data;
  },

  create: async (data: Omit<PathData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PathData> => {
    const response = await api.post('/paths', data);
    return response.data;
  },

  update: async (id: string, data: Partial<PathData>): Promise<PathData> => {
    const response = await api.put(`/paths/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/paths/${id}`);
  },
};

export const versionApi = {
  getByPathId: async (pathId: string): Promise<PathVersion[]> => {
    const response = await api.get(`/versions/${pathId}`);
    return response.data;
  },

  create: async (data: { pathId: string; description: string }): Promise<PathVersion> => {
    const response = await api.post('/versions', data);
    return response.data;
  },

  restore: async (versionId: string): Promise<PathData> => {
    const response = await api.post(`/versions/${versionId}/restore`);
    return response.data;
  },
};

export const historyApi = {
  getByPathId: async (pathId: string): Promise<HistoryRecord[]> => {
    const response = await api.get(`/history/${pathId}`);
    return response.data;
  },
};

export const algorithmApi = {
  optimizePoints: async (points: Point[]): Promise<Point[]> => {
    const response = await api.post('/algorithm/optimize', { points });
    return response.data;
  },

  correctCoordinates: async (points: Point[]): Promise<Point[]> => {
    const response = await api.post('/algorithm/correct', { points });
    return response.data;
  },

  compareDiff: async (before: Point[], after: Point[]): Promise<{ added: Point[]; removed: Point[]; modified: Point[] }> => {
    const response = await api.post('/algorithm/diff', { before, after });
    return response.data;
  },
};

export const configApi = {
  validate: async (config: AnimationConfig): Promise<{ valid: boolean; errors: string[] }> => {
    const response = await api.post('/config/validate', config);
    return response.data;
  },
};

export const exportApi = {
  toJSON: async (pathId: string): Promise<string> => {
    const response = await api.get(`/export/${pathId}/json`);
    return response.data;
  },

  toSVG: async (pathId: string): Promise<string> => {
    const response = await api.get(`/export/${pathId}/svg`);
    return response.data;
  },
};