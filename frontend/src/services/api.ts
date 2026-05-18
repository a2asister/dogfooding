import axios from 'axios';
import type {
  AudioFile,
  AudioFormat,
  QualityPreset,
  BatchStatusResponse,
  UploadResponse,
  ConvertResponse,
  BatchJob
} from '../types';

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 600000
});

export async function uploadFiles(files: File[]): Promise<AudioFile[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.files;
}

export async function startConversion(
  fileIds: string[],
  targetFormat: AudioFormat,
  quality: QualityPreset
): Promise<{ batchId: string; taskIds: string[] }> {
  const response = await apiClient.post<ConvertResponse>('/convert', {
    fileIds,
    targetFormat,
    quality
  });

  return {
    batchId: response.data.batchId,
    taskIds: response.data.taskIds
  };
}

export async function getBatchStatus(batchId: string): Promise<BatchStatusResponse> {
  const response = await apiClient.get<BatchStatusResponse>(`/batch/${batchId}`);
  return response.data;
}

export async function downloadTask(taskId: string): Promise<void> {
  const response = await apiClient.get(`/download/${taskId}`, {
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const contentDisposition = response.headers['content-disposition'];
  const fileName = contentDisposition
    ? decodeURIComponent(contentDisposition.split('filename=')[1]?.replace(/"/g, '') || `audio_${taskId}`)
    : `audio_${taskId}`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function downloadBatch(batchId: string): Promise<void> {
  const response = await apiClient.get(`/download/batch/${batchId}`, {
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `converted_${batchId}.zip`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function getFileTasks(fileId: string): Promise<BatchJob[]> {
  const response = await apiClient.get<{ success: boolean; tasks: BatchJob[] }>(`/file/${fileId}/tasks`);
  return response.data.tasks;
}
