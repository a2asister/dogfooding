<template>
  <div 
    class="upload-zone"
    :class="{ 'is-dragging': isDragging, 'has-files': files.length > 0 }"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <div class="flow-border" :class="{ active: isDragging }"></div>
    
    <input 
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      class="file-input"
      @change="handleFileSelect"
    />
    
    <div class="upload-content">
      <div class="upload-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      
      <div class="upload-text">
        <h3 class="upload-title">
          <span v-if="files.length === 0">拖拽图片到此处</span>
          <span v-else>已上传 {{ files.length }} 张图片</span>
        </h3>
        <p class="upload-desc">
          <span v-if="files.length === 0">或点击选择图片，支持 JPG、PNG、WebP 等格式</span>
          <span v-else>点击继续添加更多图片</span>
        </p>
      </div>
      
      <div class="upload-hint">
        <span class="hint-item">批量处理</span>
        <span class="hint-item">无损压缩</span>
        <span class="hint-item">一键导出</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['upload', 'remove'])

const fileInput = ref(null)
const isDragging = ref(false)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleDragOver() {
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(e) {
  isDragging.value = false
  const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
    file.type.startsWith('image/')
  )
  if (droppedFiles.length > 0) {
    emit('upload', droppedFiles)
  }
}

function handleFileSelect(e) {
  const selectedFiles = Array.from(e.target.files)
  if (selectedFiles.length > 0) {
    emit('upload', selectedFiles)
  }
  e.target.value = ''
}
</script>

<style scoped>
.upload-zone {
  position: relative;
  padding: 48px 32px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-med);
  box-shadow: var(--shadow-sm);
}

.upload-zone:hover {
  box-shadow: var(--shadow-md);
}

.flow-border {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  padding: 2px;
  background: transparent;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.5;
  transition: opacity var(--transition-fast);
}

.flow-border.active {
  background: linear-gradient(90deg, var(--accent-start), var(--accent-end), var(--accent-start), var(--accent-end));
  background-size: 300% 300%;
  animation: flowBorder 4s ease infinite;
  opacity: 1;
}

.upload-zone.is-dragging {
  transform: scale(1.01);
}

.upload-zone.has-files {
  padding: 32px;
}

.upload-zone.has-files .flow-border {
  opacity: 0.3;
  background: linear-gradient(90deg, var(--accent-start), var(--accent-end), var(--accent-start), var(--accent-end));
  background-size: 300% 300%;
  animation: flowBorder 8s ease infinite;
}

.file-input {
  display: none;
}

.upload-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.upload-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-start);
  transition: all var(--transition-med);
}

.upload-zone:hover .upload-icon {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

.upload-icon svg {
  width: 32px;
  height: 32px;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.upload-desc {
  font-size: 14px;
  color: var(--text-muted);
}

.upload-hint {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.hint-item {
  padding: 6px 14px;
  background: rgba(99, 102, 241, 0.08);
  color: var(--accent-start);
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
}

@keyframes flowBorder {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
