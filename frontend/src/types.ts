export type AudioFormat = 'flac' | 'wav' | 'mp3';

export type QualityPreset = 'low' | 'medium' | 'high' | 'lossless';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AudioFile {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  originalFormat: AudioFormat;
  createdAt: number;
}

export interface ConversionOptions {
  targetFormat: AudioFormat;
  quality: QualityPreset;
  sampleRate?: number;
  bitDepth?: number;
  bitRate?: number;
}

export interface ConversionTask {
  id: string;
  fileId: string;
  options: ConversionOptions;
  status: TaskStatus;
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
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  archivePath?: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  pending: number;
}

export interface BatchStatusResponse {
  success: boolean;
  batch: BatchJob;
  tasks: ConversionTask[];
  progress: BatchProgress;
}

export interface UploadResponse {
  success: boolean;
  files: AudioFile[];
}

export interface ConvertResponse {
  success: boolean;
  batchId: string;
  taskIds: string[];
}

export interface QualityOption {
  value: QualityPreset;
  label: string;
  description: string;
}

export const qualityOptions: QualityOption[] = [
  { value: 'low', label: '低音质', description: 'MP3 128kbps / 44.1kHz' },
  { value: 'medium', label: '中音质', description: 'MP3 256kbps / 48kHz' },
  { value: 'high', label: '高音质', description: 'MP3 320kbps / FLAC 24bit/96kHz' },
  { value: 'lossless', label: '无损', description: 'FLAC/WAV 24bit/192kHz 无损采样' }
];

export const formatOptions: { value: AudioFormat; label: string; icon: string }[] = [
  { value: 'flac', label: 'FLAC', icon: '🎵' },
  { value: 'wav', label: 'WAV', icon: '🎶' },
  { value: 'mp3', label: 'MP3', icon: '🎧' }
];

export interface BatchInfo {
  id: string;
  taskIds: string[];
  status: TaskStatus;
  progress: BatchProgress;
  tasks: ConversionTask[];
  createdAt: number;
}
