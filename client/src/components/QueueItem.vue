<script setup lang="ts">
import { computed } from 'vue'
import type { QueueItem } from '../types'
import { downloadImage, formatBytes } from '../api'

const props = defineProps<{
  item: QueueItem
  disabled: boolean
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const statusLabel = computed(() => {
  switch (props.item.status) {
    case 'pending': return '等待中'
    case 'processing': return '处理中'
    case 'completed': return '已完成'
    case 'failed': return '失败'
    default: return '等待中'
  }
})

const statusClass = computed(() => {
  switch (props.item.status) {
    case 'pending': return 'status-pending'
    case 'processing': return 'status-processing'
    case 'completed': return 'status-completed'
    case 'failed': return 'status-failed'
    default: return 'status-pending'
  }
})

const savedPercent = computed(() => {
  if (!props.item.result) return 0
  const ratio = props.item.result.compressionRatio
  return Math.round(ratio * 100)
})

function handleDownload(): void {
  if (props.item.result) {
    downloadImage(props.item.result.id, 'compressed').catch(err => {
      console.error('下载失败:', err)
    })
  }
}

function handleRemove(): void {
  emit('remove', props.item.id)
}
</script>

<template>
  <div :class="['queue-item', statusClass]">
    <div class="preview-container">
      <img :src="item.previewUrl" :alt="item.file.name" class="preview-image" />
      <div v-if="item.status === 'completed' && item.result" class="success-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
        </svg>
      </div>
      <div v-if="item.status === 'failed'" class="error-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
        </svg>
      </div>
    </div>

    <div class="item-info">
      <div class="file-name" :title="item.file.name">{{ item.file.name }}</div>
      <div class="file-size">{{ formatBytes(item.file.size) }}</div>

      <div v-if="item.status === 'processing'" class="progress-bar">
        <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
      </div>

      <div v-if="item.status === 'completed' && item.result" class="compression-info">
        <span class="saved">-{{ savedPercent }}%</span>
        <span class="new-size">{{ formatBytes(item.result.compressedSize) }}</span>
      </div>

      <div v-if="item.status === 'failed'" class="error-text">{{ item.error }}</div>

      <div class="status-text" :class="statusClass">{{ statusLabel }}</div>
    </div>

    <div class="item-actions">
      <button
        v-if="item.status === 'completed'"
        class="btn btn-primary btn-sm"
        @click.stop="handleDownload"
      >
        下载
      </button>
      <button
        class="btn btn-secondary btn-sm"
        :disabled="disabled"
        @click.stop="handleRemove"
      >
        删除
      </button>
    </div>
  </div>
</template>

<style scoped>
.queue-item {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.2s ease;
}

.queue-item:hover {
  box-shadow: var(--shadow-md);
}

.preview-container {
  position: relative;
  width: 100%;
  height: 140px;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.success-badge,
.error-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.success-badge {
  background: var(--success-color);
}

.error-badge {
  background: var(--danger-color);
}

.item-info {
  padding: 12px;
  flex: 1;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.progress-bar {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.compression-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.saved {
  font-size: 12px;
  font-weight: 600;
  color: var(--success-color);
}

.new-size {
  font-size: 12px;
  color: var(--text-secondary);
}

.error-text {
  font-size: 12px;
  color: var(--danger-color);
  margin-bottom: 8px;
}

.status-text {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.status-pending {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.status-processing {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.status-completed {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-failed {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.item-actions {
  padding: 0 12px 12px;
  display: flex;
  gap: 8px;
}

.item-actions .btn {
  flex: 1;
}
</style>
