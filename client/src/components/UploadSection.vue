<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const emit = defineEmits<{
  upload: [file: File];
}>();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

function handleDragOver(e: DragEvent): void {
  e.preventDefault();
  isDragging.value = true;
}

function handleDragLeave(): void {
  isDragging.value = false;
}

function handleDrop(e: DragEvent): void {
  e.preventDefault();
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file) {
      validateAndUpload(file);
    }
  }
}

function handleClick(): void {
  fileInput.value?.click();
}

function handleFileChange(e: Event): void {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file) {
      validateAndUpload(file);
    }
  }
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function validateAndUpload(file: File): void {
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只支持 JPG、PNG、GIF、BMP、WebP 格式的图片');
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 20MB');
    return;
  }
  emit('upload', file);
}
</script>

<template>
  <div
    class="upload-area"
    :class="{ dragover: isDragging }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="handleClick"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />
    <div class="upload-icon">📷</div>
    <div class="upload-text">点击或拖拽图片到此处上传</div>
    <div class="upload-hint">支持 JPG、PNG、GIF、BMP、WebP 格式，最大 20MB</div>
  </div>
</template>
