import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PhotoRecord, ModelParams, ProcessProgress } from '@/types';
import { defaultModelParams } from '@/types';
import { uploadPhoto, getPhotoList, deletePhoto as apiDeletePhoto } from '@/api';
import { clearProgress } from '@/websocket';

export const usePhotoStore = defineStore('photo', () => {
  const photos = ref<PhotoRecord[]>([]);
  const currentPhoto = ref<PhotoRecord | null>(null);
  const modelParams = ref<ModelParams>({ ...defaultModelParams });
  const loading = ref(false);
  const progressMap = ref<Map<string, ProcessProgress>>(new Map());

  const processingPhotos = computed((): PhotoRecord[] => {
    return photos.value.filter((p) => p.status === 'processing' || p.status === 'pending');
  });

  const completedPhotos = computed((): PhotoRecord[] => {
    return photos.value.filter((p) => p.status === 'completed');
  });

  async function loadPhotos(): Promise<void> {
    loading.value = true;
    try {
      photos.value = await getPhotoList();
    } finally {
      loading.value = false;
    }
  }

  async function upload(file: File, params: ModelParams): Promise<PhotoRecord> {
    const record = await uploadPhoto(file, params);
    photos.value.unshift(record);
    currentPhoto.value = record;
    return record;
  }

  function updateProgress(progress: ProcessProgress): void {
    progressMap.value.set(progress.taskId, progress);
    const photo = photos.value.find((p) => p.id === progress.taskId);
    if (photo) {
      photo.progress = progress.progress;
      if (progress.progress >= 100) {
        photo.status = 'completed';
        photo.completedAt = Date.now();
      }
    }
  }

  function updatePhoto(id: string, updates: Partial<PhotoRecord>): void {
    const photo = photos.value.find((p) => p.id === id);
    if (photo) {
      Object.assign(photo, updates);
      if (currentPhoto.value?.id === id) {
        Object.assign(currentPhoto.value, updates);
      }
    }
  }

  async function deletePhoto(id: string): Promise<void> {
    await apiDeletePhoto(id);
    photos.value = photos.value.filter((p) => p.id !== id);
    clearProgress(id);
    progressMap.value.delete(id);
    if (currentPhoto.value?.id === id) {
      currentPhoto.value = null;
    }
  }

  function setCurrentPhoto(photo: PhotoRecord | null): void {
    currentPhoto.value = photo;
  }

  function setModelParams(params: Partial<ModelParams>): void {
    modelParams.value = { ...modelParams.value, ...params };
  }

  function resetModelParams(): void {
    modelParams.value = { ...defaultModelParams };
  }

  return {
    photos,
    currentPhoto,
    modelParams,
    loading,
    progressMap,
    processingPhotos,
    completedPhotos,
    loadPhotos,
    upload,
    updateProgress,
    updatePhoto,
    deletePhoto,
    setCurrentPhoto,
    setModelParams,
    resetModelParams,
  };
});
