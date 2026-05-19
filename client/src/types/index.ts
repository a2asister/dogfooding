export interface FileItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: number;
  chunkCount: number;
  chunkSize?: number;
}

export interface UploadResponse {
  success: boolean;
  file: FileItem;
}

export interface FileListResponse {
  files: FileItem[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error';
  message: string;
}
