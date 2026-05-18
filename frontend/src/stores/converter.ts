import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AudioFile, AudioFormat, QualityPreset, ConversionTask, BatchProgress, BatchInfo } from '../types';
import { uploadFiles, startConversion, getBatchStatus } from '../services/api';

export const useConverterStore = defineStore('converter', () => {
  const uploadedFiles = ref<AudioFile[]>([]);
  const selectedFileIds = ref<Set<string>>(new Set());
  const targetFormat = ref<AudioFormat>('flac');
  const quality = ref<QualityPreset>('lossless');
  const batches = ref<Map<string, BatchInfo>>(new Map());
  const isUploading = ref(false);
  const isConverting = ref(false);
  const uploadError = ref<string | null>(null);
  const convertError = ref<string | null>(null);

  const selectedFiles = computed(() => {
    return uploadedFiles.value.filter((f) => selectedFileIds.value.has(f.id));
  });

  const hasSelection = computed(() => selectedFileIds.value.size > 0);

  const activeBatches = computed(() => {
    return Array.from(batches.value.values()).filter(
      (b) => b.status === 'processing' || b.status === 'pending'
    );
  });

  const completedBatches = computed(() => {
    return Array.from(batches.value.values()).filter(
      (b) => b.status === 'completed' || b.status === 'failed'
    );
  });

  function toggleFileSelection(fileId: string): void {
    if (selectedFileIds.value.has(fileId)) {
      selectedFileIds.value.delete(fileId);
    } else {
      selectedFileIds.value.add(fileId);
    }
  }

  function selectAllFiles(): void {
    uploadedFiles.value.forEach((f) => selectedFileIds.value.add(f.id));
  }

  function clearSelection(): void {
    selectedFileIds.value.clear();
  }

  function removeFile(fileId: string): void {
    uploadedFiles.value = uploadedFiles.value.filter((f) => f.id !== fileId);
    selectedFileIds.value.delete(fileId);
  }

  function clearAllFiles(): void {
    uploadedFiles.value = [];
    selectedFileIds.value.clear();
  }

  async function handleUpload(files: File[]): Promise<void> {
    isUploading.value = true;
    uploadError.value = null;

    try {
      const uploaded = await uploadFiles(files);
      uploadedFiles.value = [...uploadedFiles.value, ...uploaded];
      uploaded.forEach((f) => selectedFileIds.value.add(f.id));
    } catch (error) {
      uploadError.value = error instanceof Error ? error.message : '上传失败';
      throw error;
    } finally {
      isUploading.value = false;
    }
  }

  async function startConvert(): Promise<string> {
    if (selectedFileIds.value.size === 0) {
      throw new Error('请选择要转换的文件');
    }

    isConverting.value = true;
    convertError.value = null;

    try {
      const fileIds = Array.from(selectedFileIds.value);
      const { batchId } = await startConversion(fileIds, targetFormat.value, quality.value);

      batches.value.set(batchId, {
        id: batchId,
        taskIds: [],
        status: 'processing',
        progress: { total: fileIds.length, completed: 0, failed: 0, processing: 0, pending: fileIds.length },
        tasks: [],
        createdAt: Date.now()
      });

      void pollBatchStatus(batchId);

      return batchId;
    } catch (error) {
      convertError.value = error instanceof Error ? error.message : '转换启动失败';
      throw error;
    } finally {
      isConverting.value = false;
    }
  }

  async function pollBatchStatus(batchId: string): Promise<void> {
    const maxAttempts = 3600;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await getBatchStatus(batchId);
        const batch = batches.value.get(batchId);

        if (batch) {
          batch.status = response.batch.status;
          batch.progress = response.progress;
          batch.tasks = response.tasks;
          batch.taskIds = response.batch.taskIds;

          if (batch.status === 'completed' || batch.status === 'failed') {
            break;
          }
        }
      } catch {
        // Ignore polling errors
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  return {
    uploadedFiles,
    selectedFileIds,
    targetFormat,
    quality,
    batches,
    isUploading,
    isConverting,
    uploadError,
    convertError,
    selectedFiles,
    hasSelection,
    activeBatches,
    completedBatches,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    removeFile,
    clearAllFiles,
    handleUpload,
    startConvert,
    pollBatchStatus,
    formatFileSize
  };
});
