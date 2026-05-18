import axios from 'axios';
import type { PhotoRecord, ModelParams, ApiResponse } from './types';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export async function uploadPhoto(file: File, params: ModelParams): Promise<PhotoRecord> {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('params', JSON.stringify(params));

  const response = await api.post<ApiResponse<PhotoRecord>>('/photos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.error ?? '上传失败');
  }

  return response.data.data as PhotoRecord;
}

export async function getPhotoList(): Promise<PhotoRecord[]> {
  const response = await api.get<ApiResponse<PhotoRecord[]>>('/photos');
  if (!response.data.success) {
    throw new Error(response.data.error ?? '获取列表失败');
  }
  return response.data.data as PhotoRecord[];
}

export async function getPhoto(id: string): Promise<PhotoRecord> {
  const response = await api.get<ApiResponse<PhotoRecord>>(`/photos/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error ?? '获取失败');
  }
  return response.data.data as PhotoRecord;
}

export async function deletePhoto(id: string): Promise<void> {
  const response = await api.delete<ApiResponse>(`/photos/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error ?? '删除失败');
  }
}

export function getImageUrl(path: string): string {
  return `/uploads/${path}`;
}
