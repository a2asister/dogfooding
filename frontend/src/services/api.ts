import axios from 'axios';
import { MeasurementRecord, ScaleParams, SizeTemplate } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const measurementApi = {
  getAll: (): Promise<MeasurementRecord[]> => 
    api.get('/measurements').then(res => res.data),
  create: (data: Omit<MeasurementRecord, 'id' | 'createdAt'>): Promise<MeasurementRecord> => 
    api.post('/measurements', data).then(res => res.data),
  delete: (id: number): Promise<void> => 
    api.delete(`/measurements/${id}`).then(res => res.data),
};

export const scaleParamsApi = {
  getAll: (): Promise<ScaleParams[]> => 
    api.get('/scale-params').then(res => res.data),
  create: (data: Omit<ScaleParams, 'id'>): Promise<ScaleParams> => 
    api.post('/scale-params', data).then(res => res.data),
  update: (id: number, data: Partial<ScaleParams>): Promise<ScaleParams> => 
    api.patch(`/scale-params/${id}`, data).then(res => res.data),
  delete: (id: number): Promise<void> => 
    api.delete(`/scale-params/${id}`).then(res => res.data),
};

export const sizeTemplateApi = {
  getAll: (): Promise<SizeTemplate[]> => 
    api.get('/size-templates').then(res => res.data),
  create: (data: Omit<SizeTemplate, 'id'>): Promise<SizeTemplate> => 
    api.post('/size-templates', data).then(res => res.data),
  delete: (id: number): Promise<void> => 
    api.delete(`/size-templates/${id}`).then(res => res.data),
};
