import axios from 'axios';
import { Clothing, Outfit, Preference } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const clothingApi = {
  getAll: () => api.get<Clothing[]>('/clothing'),
  get: (id: string) => api.get<Clothing>(`/clothing/${id}`),
  create: (data: FormData) => api.post<Clothing>('/clothing', data),
  update: (id: string, data: Partial<Clothing>) => api.put<Clothing>(`/clothing/${id}`, data),
  delete: (id: string) => api.delete(`/clothing/${id}`),
};

export const outfitApi = {
  getAll: () => api.get<Outfit[]>('/outfits'),
  get: (id: string) => api.get<Outfit>(`/outfits/${id}`),
  create: (data: Partial<Outfit> & { clothingIds?: string[] }) => api.post<Outfit>('/outfits', data),
  update: (id: string, data: Partial<Outfit> & { clothingIds?: string[] }) => api.put<Outfit>(`/outfits/${id}`, data),
  delete: (id: string) => api.delete(`/outfits/${id}`),
};

export const preferenceApi = {
  get: () => api.get<Preference>('/preferences'),
  update: (id: string, data: Partial<Preference>) => api.put<Preference>(`/preferences/${id}`, data),
};
