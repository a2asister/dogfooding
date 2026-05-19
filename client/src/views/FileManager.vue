<template>
  <div class="container">
    <header class="header">
      <h1>🔐 文件加密仓库</h1>
      <p>安全的本地文件加密存储系统，采用 AES-256-GCM 加密算法</p>
    </header>

    <section class="upload-section">
      <div
        class="upload-area"
        :class="{ dragging: isDragging }"
        @click="triggerFileInput"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div class="upload-icon">📁</div>
        <h3>点击或拖拽文件到此处上传</h3>
        <p>支持图片、文档、视频等各种类型文件</p>
        <input
          ref="fileInput"
          type="file"
          multiple
          style="display: none"
          @change="handleFileSelect"
        />
      </div>

      <div v-if="uploadProgress > 0" class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
    </section>

    <section class="files-section">
      <div class="files-header">
        <h2>📂 我的文件</h2>
        <span class="file-count">{{ files.length }} 个文件</span>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="files.length === 0" class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>暂无文件</h3>
        <p>上传文件后将显示在这里</p>
      </div>

      <div v-else class="file-list">
        <div v-for="file in files" :key="file.id" class="file-card">
          <div class="file-icon">{{ getFileIcon(file.mimeType) }}</div>
          <div class="file-name">{{ file.name }}</div>
          <div class="file-info">{{ formatFileSize(file.size) }}</div>
          <div class="file-info">{{ formatDate(file.createdAt) }}</div>
          <div class="file-info">分片: {{ file.chunkCount }}</div>
          <div class="file-actions">
            <button class="btn btn-primary" @click="previewFile(file)">预览</button>
            <button class="btn btn-secondary" @click="downloadFile(file)">下载</button>
            <button class="btn btn-danger" @click="deleteFile(file)">删除</button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="previewFileData" class="preview-modal" @click.self="closePreview">
      <div class="preview-content">
        <button class="preview-close" @click="closePreview">×</button>
        <img
          v-if="previewFileData.type.startsWith('image/')"
          :src="previewUrl"
          class="preview-image"
          alt="Preview"
        />
        <pre v-else-if="previewFileData.type.startsWith('text/')" class="preview-text">
          {{ previewText }}
        </pre>
        <div v-else style="text-align: center; padding: 40px">
          <div style="font-size: 4rem; margin-bottom: 20px">📄</div>
          <p>此文件类型不支持预览，请下载后查看</p>
        </div>
      </div>
    </div>

    <TransitionGroup name="fade" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="notification.type"
      >
        {{ notification.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { FileItem, Notification } from '@/types';
import { getFileList, uploadFile, downloadFile as apiDownloadFile, previewFile as apiPreviewFile, deleteFile as apiDeleteFile } from '@/services/api';

const fileInput = ref<HTMLInputElement | null>(null);
const files = ref<FileItem[]>([]);
const isDragging = ref(false);
const uploadProgress = ref(0);
const loading = ref(true);
const previewFileData = ref<Blob | null>(null);
const previewUrl = ref<string | undefined>(undefined);
const previewText = ref<string>('');
const notifications = ref<Notification[]>([]);

function showNotification(type: 'success' | 'error', message: string): void {
  const id = Date.now().toString();
  notifications.value.push({ id, type, message });
  setTimeout(() => {
    const index = notifications.value.findIndex((n: Notification) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }, 3000);
}

async function loadFiles(): Promise<void> {
  try {
    loading.value = true;
    files.value = await getFileList();
  } catch (error) {
    console.error('Failed to load files:', error);
    showNotification('error', '加载文件列表失败');
  } finally {
    loading.value = false;
  }
}

function triggerFileInput(): void {
  fileInput.value?.click();
}

function handleDrop(event: DragEvent): void {
  isDragging.value = false;
  const droppedFiles = event.dataTransfer?.files;
  if (droppedFiles && droppedFiles.length > 0) {
    handleFiles(Array.from(droppedFiles));
  }
}

function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement;
  const selectedFiles = target.files;
  if (selectedFiles && selectedFiles.length > 0) {
    handleFiles(Array.from(selectedFiles));
  }
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function handleFiles(fileList: File[]): Promise<void> {
  for (const file of fileList) {
    try {
      uploadProgress.value = 0;
      const uploadedFile = await uploadFile(file, (progress: number) => {
        uploadProgress.value = progress;
      });
      files.value.unshift(uploadedFile);
      showNotification('success', `${file.name} 上传成功`);
    } catch (error) {
      console.error('Upload failed:', error);
      showNotification('error', `${file.name} 上传失败`);
    } finally {
      uploadProgress.value = 0;
    }
  }
}

async function previewFile(file: FileItem): Promise<void> {
  try {
    const blob = await apiPreviewFile(file.id);
    previewFileData.value = blob;

    if (blob.type.startsWith('image/')) {
      previewUrl.value = URL.createObjectURL(blob);
    } else if (blob.type.startsWith('text/')) {
      previewText.value = await blob.text();
    }
  } catch (error) {
    console.error('Preview failed:', error);
    showNotification('error', '预览失败');
  }
}

function closePreview(): void {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewFileData.value = null;
  previewUrl.value = undefined;
  previewText.value = '';
}

async function downloadFile(file: FileItem): Promise<void> {
  try {
    await apiDownloadFile(file.id, file.name);
    showNotification('success', `${file.name} 下载成功`);
  } catch (error) {
    console.error('Download failed:', error);
    showNotification('error', '下载失败');
  }
}

async function deleteFile(file: FileItem): Promise<void> {
  if (!confirm(`确定要删除 ${file.name} 吗？`)) {
    return;
  }

  try {
    await apiDeleteFile(file.id);
    const index = files.value.findIndex((f: FileItem) => f.id === file.id);
    if (index !== -1) {
      files.value.splice(index, 1);
    }
    showNotification('success', `${file.name} 已删除`);
  } catch (error) {
    console.error('Delete failed:', error);
    showNotification('error', '删除失败');
  }
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📄';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
  if (mimeType.startsWith('text/')) return '📝';
  return '📁';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted((): void => {
  loadFiles().catch((error) => {
    console.error('Failed to load files on mount:', error);
  });
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
