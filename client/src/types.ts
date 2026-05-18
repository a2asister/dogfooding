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

export const stageNames: Record<ProcessProgress['stage'], string> = {
  preprocess: '图片预处理',
  denoise: '图像去噪',
  texture: '纹理修复',
  colorize: '智能上色',
  postprocess: '后期处理',
};
