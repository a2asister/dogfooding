export type AudioFormat = 'flac' | 'wav' | 'mp3';

export type QualityPreset = 'low' | 'medium' | 'high' | 'lossless';

export interface ConversionOptions {
  targetFormat: AudioFormat;
  quality: QualityPreset;
  sampleRate?: number;
  bitDepth?: number;
  bitRate?: number;
}

export interface AudioFile {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  originalFormat: AudioFormat;
  createdAt: number;
}

export interface ConversionTask {
  id: string;
  fileId: string;
  options: ConversionOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputPath?: string;
  outputSize?: number;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

export interface BatchJob {
  id: string;
  taskIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  archivePath?: string;
}

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ConversionWorkerData {
  inputPath: string;
  outputPath: string;
  options: ConversionOptions;
}

export interface ConversionWorkerResult {
  success: boolean;
  outputPath?: string;
  outputSize?: number;
  error?: string;
}
