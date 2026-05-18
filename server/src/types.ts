export interface PhotoRecord {
  id: string;
  originalName: string;
  originalPath: string;
  processedPath: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  modelParams: ModelParams;
  createdAt: number;
  completedAt: number | null;
  errorMessage: string | null;
}

export interface ModelParams {
  denoiseStrength: number;
  textureEnhance: number;
  colorIntensity: number;
  sharpenLevel: number;
  brightness: number;
  contrast: number;
}

export interface ProcessProgress {
  taskId: string;
  stage: 'preprocess' | 'denoise' | 'texture' | 'colorize' | 'postprocess';
  progress: number;
  message: string;
  frameData?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export const defaultModelParams: ModelParams = {
  denoiseStrength: 0.3,
  textureEnhance: 0.7,
  colorIntensity: 0.85,
  sharpenLevel: 0.5,
  brightness: 0.1,
  contrast: 0.2,
};
