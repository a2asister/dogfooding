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
