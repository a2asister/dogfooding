import axios from 'axios';
import { Task, Statistics, CreateTaskInput, UpdateTaskInput } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8765/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getOne: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  getStatistics: async (): Promise<Statistics> => {
    const response = await api.get('/tasks/statistics');
    return response.data;
  },

  create: async (data: CreateTaskInput): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTaskInput): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

export const layoutApi = {
  get: async (name: string): Promise<any> => {
    const response = await api.get(`/layouts/${name}`);
    return response.data;
  },

  save: async (name: string, config: any): Promise<any> => {
    const response = await api.post(`/layouts/${name}`, config);
    return response.data;
  },
};
