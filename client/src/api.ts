import axios from 'axios';

export interface ImageRecord {
  id: number;
  filename: string;
  originalName: string;
  originalPath: string;
  resultPath: string;
  createdAt: number;
  width: number;
  height: number;
}

export interface UploadResponse {
  success: boolean;
  data: ImageRecord;
}

export interface ListResponse {
  success: boolean;
  data: ImageRecord[];
  total: number;
}

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
});

export async function uploadImage(
  file: File,
  width: number,
  height: number,
  onProgress?: (percent: number) => void
): Promise<ImageRecord> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('width', String(width));
  formData.append('height', String(height));

  const response = await api.post<UploadResponse>('/upload', formData, {
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onProgress(percent);
      }
    }
  });

  if (!response.data.success) {
    throw new Error('上传失败');
  }

  return response.data.data;
}

export async function saveResult(id: number, resultData: string): Promise<string> {
  const response = await api.post<{ success: boolean; resultPath: string }>(`/save-result/${id}`, {
    resultData
  });

  if (!response.data.success) {
    throw new Error('保存失败');
  }

  return response.data.resultPath;
}

export async function getImages(): Promise<ImageRecord[]> {
  const response = await api.get<ListResponse>('/images');
  if (!response.data.success) {
    throw new Error('获取列表失败');
  }
  return response.data.data;
}

export async function deleteImage(id: number): Promise<boolean> {
  const response = await api.delete<{ success: boolean }>(`/images/${id}`);
  return response.data.success;
}
