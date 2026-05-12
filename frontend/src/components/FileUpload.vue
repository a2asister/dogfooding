<template>
  <div class="file-upload-container">
    <div
      class="drop-zone"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      :class="{ 'drag-over': isDragOver }"
    >
      <div class="icon-wrapper" :class="{ floating: files.length > 0 }">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <p class="drop-text">拖拽文件到此处或点击上传</p>
      <p class="drop-hint">支持大文件分块上传</p>
      <input
        ref="fileInput"
        type="file"
        multiple
        @change="handleFileSelect"
        style="display: none"
      />
    </div>

    <div class="files-list">
      <transition-group name="wave">
        <div
          v-for="(file, index) in files"
          :key="file.id"
          class="file-item"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="file-info">
            <div class="file-icon" :class="{ 'is-uploading': file.status === 'uploading' }">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="file-details">
              <span class="file-name">{{ file.originalName }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: `${file.progress}%` }">
                <div class="progress-shine"></div>
              </div>
            </div>
            <div class="progress-percentage">
              <span class="counter">{{ animatedCounters[file.id] ?? 0 }}</span>
              <span>%</span>
            </div>
          </div>

          <div class="file-status">
            <template v-if="file.status === 'completed'">
              <div class="status-icon success">
                <svg class="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </template>
            <template v-else-if="file.status === 'failed'">
              <div class="status-icon error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
            </template>
            <template v-else>
              <div class="status-loading">
                <div class="spinner"></div>
              </div>
            </template>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue';
import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client/core';

const httpLink = createHttpLink({ uri: 'http://localhost:8765/graphql' });
const apolloClient = new ApolloClient({ link: httpLink, cache: new InMemoryCache() });

const CHUNK_SIZE = 1024 * 1024;

interface UploadFile {
  id: string;
  tempId?: string;
  file: File;
  originalName: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  totalChunks: number;
  uploadedChunks: number;
}

const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);
const files = ref<UploadFile[]>([]);
const animatedCounters = reactive<Record<string, number>>({});

const CREATE_FILE = gql`
  mutation CreateFile($input: CreateFileInput!) {
    createFile(input: $input) {
      id
      filename
      originalName
      mimeType
      size
      totalChunks
      uploadedChunks
      status
    }
  }
`;

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function triggerFileInput(): void {
  fileInput.value?.click();
}

function handleDragOver(): void {
  isDragOver.value = true;
}

function handleDragLeave(): void {
  isDragOver.value = false;
}

function handleDrop(e: DragEvent): void {
  isDragOver.value = false;
  const droppedFiles = e.dataTransfer?.files;
  if (droppedFiles) {
    processFiles(Array.from(droppedFiles));
  }
}

function handleFileSelect(e: Event): void {
  const target = e.target as HTMLInputElement;
  const selectedFiles = target.files;
  if (selectedFiles) {
    processFiles(Array.from(selectedFiles));
  }
}

function animateCounter(fileId: string, targetValue: number): void {
  const startValue = animatedCounters[fileId] ?? 0;
  const duration = 300;
  const startTime = performance.now();

  function update(currentTime: number): void {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    animatedCounters[fileId] = Math.round(startValue + (targetValue - startValue) * easeOut);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

async function processFiles(fileList: File[]): Promise<void> {
  for (const file of fileList) {
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    const uploadFile: UploadFile = {
      id: tempId,
      tempId,
      file,
      originalName: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      totalChunks,
      uploadedChunks: 0,
    };

    files.value.push(uploadFile);
    animatedCounters[tempId] = 0;

    uploadFileWorker(uploadFile).catch(() => {
      uploadFile.status = 'failed';
    });
  }
}

async function uploadFileWorker(uploadFile: UploadFile): Promise<void> {
  const { file, totalChunks, tempId } = uploadFile;

  const result = await apolloClient.mutate({
    mutation: CREATE_FILE,
    variables: {
      input: {
        filename: file.name,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        totalChunks,
      },
    },
  });

  const serverFile = result.data.createFile;
  const newId = serverFile.id;

  if (tempId) {
    const currentProgress = animatedCounters[tempId] ?? 0;
    animatedCounters[newId] = currentProgress;
    delete animatedCounters[tempId];

    uploadFile.id = newId;
    uploadFile.tempId = undefined;
  }

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);

    await fetch(`http://localhost:8765/files/chunk/${newId}/${i}`, {
      method: 'POST',
      body: formData,
    });

    uploadFile.uploadedChunks++;
    const progress = Math.round((uploadFile.uploadedChunks / totalChunks) * 100);
    uploadFile.progress = progress;
    animateCounter(newId, progress);
  }

  uploadFile.status = 'completed';
}
</script>

<style lang="scss" scoped>
.file-upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.drop-zone {
  border: 3px dashed #e0e0e0;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);

  &:hover, &.drag-over {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    transform: scale(1.02);
  }

  &.drag-over {
    border-style: solid;
  }
}

.icon-wrapper {
  margin-bottom: 1rem;
  color: #667eea;
  transition: transform 0.3s ease;

  &.floating {
    animation: float 2s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.drop-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0.5rem 0;
}

.drop-hint {
  font-size: 0.9rem;
  color: #888;
  margin: 0;
}

.files-list {
  margin-top: 2rem;
}

.file-item {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: slideIn 0.5s ease forwards;
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wave-enter-active {
  transition: all 0.5s ease;
}

.wave-leave-active {
  transition: all 0.3s ease;
}

.wave-enter-from,
.wave-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 200px;
}

.file-icon {
  color: #667eea;
  transition: transform 0.3s ease;

  &.is-uploading {
    animation: bounce 1s ease-in-out infinite;
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.file-size {
  font-size: 0.85rem;
  color: #888;
}

.progress-section {
  flex: 2;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar-container {
  flex: 1;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  background-size: 200% 100%;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  animation: gradientMove 2s linear infinite;
  transition: width 0.3s ease;
}

@keyframes gradientMove {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shine 1.5s ease-in-out infinite;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.progress-percentage {
  min-width: 60px;
  text-align: right;
  font-weight: 700;
  color: #667eea;
  font-size: 1.1rem;
}

.counter {
  font-variant-numeric: tabular-nums;
}

.file-status {
  width: 40px;
  display: flex;
  justify-content: center;
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &.success {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    animation: pulseGreen 2s ease-in-out infinite;

    .checkmark {
      stroke-dasharray: 60;
      stroke-dashoffset: 60;
      animation: drawCheck 0.6s ease forwards;
    }
  }

  &.error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    animation: shake 0.5s ease-in-out;
  }
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}

@keyframes pulseGreen {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(34, 197, 94, 0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.status-loading {
  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #f0f0f0;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
