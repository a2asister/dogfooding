<template>
  <div
    class="upload-area"
    :class="{ 'drag-over': isDragOver, 'disabled': disabled }"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="handleClick"
  >
    <input
      ref="fileInput"
      type="file"
      multiple
      accept=".flac,.wav,.mp3,audio/*"
      class="hidden"
      @change="handleFileChange"
    />
    <div class="upload-content">
      <div class="upload-icon">📁</div>
      <h3 v-if="!disabled">拖拽音乐文件到这里</h3>
      <h3 v-else>上传中...</h3>
      <p>支持 FLAC、WAV、MP3 格式，单个文件最大 500MB</p>
      <button v-if="!disabled" class="browse-btn" type="button" @click.stop="handleClick">
        浏览文件
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  filesSelected: [files: File[]];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

function handleDragOver(): void {
  if (!props.disabled) {
    isDragOver.value = true;
  }
}

function handleDragLeave(): void {
  isDragOver.value = false;
}

function handleDrop(e: DragEvent): void {
  isDragOver.value = false;
  if (props.disabled) return;

  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const validFiles = Array.from(files).filter(isValidAudioFile);
    if (validFiles.length > 0) {
      emit('filesSelected', validFiles);
    }
  }
}

function handleClick(): void {
  if (!props.disabled) {
    fileInput.value?.click();
  }
}

function handleFileChange(e: Event): void {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    const validFiles = Array.from(files).filter(isValidAudioFile);
    if (validFiles.length > 0) {
      emit('filesSelected', validFiles);
    }
  }
  target.value = '';
}

function isValidAudioFile(file: File): boolean {
  const validExtensions = ['.flac', '.wav', '.mp3'];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  return validExtensions.includes(ext) || file.type.startsWith('audio/');
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed #4a5568;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.upload-area:hover:not(.disabled) {
  border-color: #667eea;
  background: linear-gradient(135deg, #1f1f3a 0%, #1a2744 100%);
}

.upload-area.drag-over {
  border-color: #48bb78;
  background: linear-gradient(135deg, #1a3a2e 0%, #163e2e 100%);
}

.upload-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.upload-content h3 {
  color: #e2e8f0;
  font-size: 20px;
  margin-bottom: 8px;
}

.upload-content p {
  color: #a0aec0;
  font-size: 14px;
  margin-bottom: 24px;
}

.browse-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.browse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.hidden {
  display: none;
}
</style>
