import axios from 'axios';
import type { FileItem, FileListResponse, UploadResponse } from '@/types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 300000
});

export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<FileItem> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadResponse>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    }
  });

  return response.data.file;
}

export async function getFileList(): Promise<FileItem[]> {
  const response = await api.get<FileListResponse>('/files/list');
  return response.data.files;
}

export async function downloadFile(fileId: string, fileName: string): Promise<void> {
  const response = await api.get(`/files/download/${fileId}`, {
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function previewFile(fileId: string): Promise<Blob> {
  const response = await api.get(`/files/preview/${fileId}`, {
    responseType: 'blob'
  });
  return response.data;
}

export async function deleteFile(fileId: string): Promise<void> {
  await api.delete(`/files/${fileId}`);
}

export async function getFileInfo(fileId: string): Promise<FileItem> {
  const response = await api.get(`/files/${fileId}`);
  return response.data;
}

export async function uploadFileWithChunks(
  file: File,
  onProgress?: (progress: number) => void
): Promise<FileItem> {
  const CHUNK_SIZE = 1024 * 1024;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('file', chunk, file.name);
    formData.append('chunkIndex', String(i));
    formData.append('totalChunks', String(totalChunks));
    formData.append('fileName', file.name);

    await api.post('/files/upload-chunk', formData);

    if (onProgress) {
      onProgress(Math.round(((i + 1) * 100) / totalChunks));
    }
  }

  const response = await api.post<UploadResponse>('/files/complete-upload', {
    fileName: file.name,
    totalChunks,
    mimeType: file.type,
    size: file.size
  });

  return response.data.file;
}

export default api;
