<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElDialog, ElButton } from 'element-plus';
import type { PhotoRecord } from '@/types';

const props = defineProps<{
  photo: PhotoRecord;
  originalUrl: string;
  processedUrl: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const sliderPosition = ref(50);
const isDragging = ref(false);
const containerRef = ref<HTMLDivElement | null>(null);

function handleMouseDown(): void {
  isDragging.value = true;
}

function handleMouseUp(): void {
  isDragging.value = false;
}

function handleMouseMove(e: MouseEvent): void {
  if (!isDragging.value || !containerRef.value) {
    return;
  }
  const rect = containerRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
  sliderPosition.value = percentage;
}

function handleTouchMove(e: TouchEvent): void {
  if (!containerRef.value || !e.touches[0]) {
    return;
  }
  const rect = containerRef.value.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
  sliderPosition.value = percentage;
}

function downloadImage(): void {
  if (!props.processedUrl) {
    return;
  }
  const link = document.createElement('a');
  link.href = props.processedUrl;
  link.download = `restored_${props.photo.originalName}`;
  link.click();
}

onMounted((): void => {
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('mousemove', handleMouseMove);
});

onUnmounted((): void => {
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('mousemove', handleMouseMove);
});
</script>

<template>
  <ElDialog
    :model-value="true"
    :title="photo.originalName"
    width="90%"
    :close-on-click-modal="false"
    @close="emit('close')"
  >
    <div v-if="processedUrl" class="compare-container">
      <div
        ref="containerRef"
        class="compare-slider"
        @mousedown="handleMouseDown"
        @touchmove="handleTouchMove"
        @touchstart="handleMouseDown"
        @touchend="handleMouseUp"
      >
        <img :src="processedUrl" alt="修复后" />
        <div
          class="compare-overlay"
          :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }"
        >
          <img :src="originalUrl" alt="原图" />
        </div>
        <div
          class="compare-handle"
          :style="{ left: `${sliderPosition}%` }"
        />
        <div class="compare-label left">修复后</div>
        <div class="compare-label right">原图</div>
      </div>

      <div class="image-preview" style="margin-top: 20px">
        <div class="preview-box">
          <img :src="originalUrl" alt="原图" />
        </div>
        <div class="preview-box">
          <img :src="processedUrl" alt="修复后" />
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center">
        <ElButton type="primary" @click="downloadImage">下载修复后的照片</ElButton>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-state-icon">⏳</div>
      <div class="empty-state-text">照片正在处理中，请稍候...</div>
    </div>
  </ElDialog>
</template>

<style scoped>
.compare-container {
  user-select: none;
}

.compare-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.compare-overlay img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.compare-label {
  position: absolute;
  bottom: 20px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
}

.compare-label.left {
  left: 20px;
}

.compare-label.right {
  right: 20px;
}
</style>
