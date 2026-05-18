<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { usePhotoStore } from '@/stores/photo';
import { getProgress } from '@/websocket';
import type { ProcessProgress } from '@/types';
import UploadSection from '@/components/UploadSection.vue';
import ParamsPanel from '@/components/ParamsPanel.vue';
import ProgressPanel from '@/components/ProgressPanel.vue';
import PhotoGallery from '@/components/PhotoGallery.vue';
import CompareView from '@/components/CompareView.vue';
import FramePreview from '@/components/FramePreview.vue';
import { getImageUrl } from '@/api';

const store = usePhotoStore();
const selectedPhotoId = ref<string | null>(null);
const showCompare = ref(false);
const currentFrame = ref<ProcessProgress | null>(null);

onMounted(async (): Promise<void> => {
  await store.loadPhotos();
  startProgressPolling();
});

function startProgressPolling(): void {
  setInterval((): void => {
    for (const photo of store.processingPhotos) {
      const progress = getProgress(photo.id);
      if (progress) {
        store.updateProgress(progress);
        if (progress.frameData && selectedPhotoId.value === photo.id) {
          currentFrame.value = progress;
        }
        if (progress.progress >= 100) {
          void store.loadPhotos();
        }
      }
    }
  }, 500);
}

async function handleUpload(file: File): Promise<void> {
  try {
    const record = await store.upload(file, store.modelParams);
    selectedPhotoId.value = record.id;
    ElMessage.success('照片上传成功，开始处理...');
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败';
    ElMessage.error(message);
  }
}

function handleSelectPhoto(id: string): void {
  selectedPhotoId.value = id;
  showCompare.value = true;
  currentFrame.value = null;
}

function handleCloseCompare(): void {
  showCompare.value = false;
  currentFrame.value = null;
}

function handleDelete(id: string): void {
  if (selectedPhotoId.value === id) {
    handleCloseCompare();
  }
}

watch(selectedPhotoId, (newId): void => {
  if (newId) {
    const progress = getProgress(newId);
    if (progress?.frameData) {
      currentFrame.value = progress;
    }
  } else {
    currentFrame.value = null;
  }
});

const selectedPhoto = ref(store.photos.find((p) => p.id === selectedPhotoId.value) ?? null);

watch(
  () => store.photos,
  (): void => {
    if (selectedPhotoId.value) {
      const photo = store.photos.find((p) => p.id === selectedPhotoId.value);
      if (photo) {
        selectedPhoto.value = photo;
      }
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="app">
    <div class="header">
      <h1>🎨 老照片修复上色工具</h1>
      <p>基于 WASM 的智能图像去噪、纹理修复、色彩还原</p>
    </div>

    <div class="container">
      <div class="card">
        <h2 class="section-title">上传照片</h2>
        <UploadSection @upload="handleUpload" />
      </div>

      <div class="card">
        <h2 class="section-title">模型参数</h2>
        <ParamsPanel />
      </div>

      <ProgressPanel v-if="store.processingPhotos.length > 0" />

      <div class="card">
        <h2 class="section-title">历史记录</h2>
        <PhotoGallery @select="handleSelectPhoto" @delete="handleDelete" />
      </div>
    </div>

    <CompareView
      v-if="showCompare && selectedPhoto"
      :photo="selectedPhoto"
      :original-url="getImageUrl(selectedPhoto.originalPath)"
      :processed-url="
        selectedPhoto.processedPath ? getImageUrl(selectedPhoto.processedPath) : null
      "
      @close="handleCloseCompare"
    />

    <FramePreview
      v-if="currentFrame && currentFrame.frameData"
      :frame-data="currentFrame.frameData"
      :stage="currentFrame.stage"
      :progress="currentFrame.progress"
    />
  </div>
</template>
