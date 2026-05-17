<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { deleteImage, downloadImage, formatBytes, getImageList, getPreviewUrl } from '../api'
import type { ImageInfo } from '../types'

const images = ref<ImageInfo[]>([])
const loading = ref(false)
const total = ref(0)
const limit = ref(50)
const offset = ref(0)
const previewImage = ref<{ id: string; type: 'original' | 'compressed' } | null>(null)

async function loadImages(): Promise<void> {
  loading.value = true
  try {
    const result = await getImageList(limit.value, offset.value)
    images.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载图片列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleDownload(id: string, type: 'original' | 'compressed'): void {
  downloadImage(id, type).catch(err => {
    console.error('下载失败:', err)
  })
}

async function handleDelete(id: string): Promise<void> {
  if (!confirm('确定要删除这张图片吗？')) return

  try {
    await deleteImage(id)
    images.value = images.value.filter(img => img.id !== id)
    total.value--
  } catch (error) {
    console.error('删除失败:', error)
  }
}

function openPreview(id: string, type: 'original' | 'compressed'): void {
  previewImage.value = { id, type }
}

function closePreview(): void {
  previewImage.value = null
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getSavedPercent(ratio: number): number {
  return Math.round(ratio * 100)
}

onMounted(() => {
  loadImages().catch(err => {
    console.error('Failed to load images:', err)
  })
})
</script>

<template>
  <div class="history-list">
    <div class="list-header">
      <div>
        <h2>已压缩图片</h2>
        <p class="list-subtitle">共 {{ total }} 张图片</p>
      </div>
      <button class="btn btn-secondary btn-sm" @click="loadImages" :disabled="loading">
        刷新
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="images.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#cbd5e1"/>
      </svg>
      <h3>暂无压缩记录</h3>
      <p>上传图片开始压缩吧</p>
    </div>

    <div v-else class="image-grid">
      <div v-for="image in images" :key="image.id" class="image-card card">
        <div class="image-preview" @click="openPreview(image.id, 'compressed')">
          <img :src="getPreviewUrl(image.id, 'compressed')" :alt="image.originalName" loading="lazy" />
          <div class="saved-badge" :class="{ negative: image.compressionRatio < 0 }">
            {{ image.compressionRatio >= 0 ? '-' : '+' }}{{ Math.abs(getSavedPercent(image.compressionRatio)) }}%
          </div>
        </div>

        <div class="image-info">
          <div class="image-name" :title="image.originalName">{{ image.originalName }}</div>
          <div class="image-meta">
            <span>{{ image.width }} × {{ image.height }}</span>
            <span>·</span>
            <span>{{ formatDate(image.createdAt) }}</span>
          </div>
          <div class="size-comparison">
            <span class="original-size">{{ formatBytes(image.originalSize) }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="compressed-size">{{ formatBytes(image.compressedSize) }}</span>
          </div>
        </div>

        <div class="image-actions">
          <button class="btn btn-secondary btn-sm" @click="openPreview(image.id, 'original')">
            原图
          </button>
          <button class="btn btn-secondary btn-sm" @click="handleDownload(image.id, 'original')">
            下载原图
          </button>
          <button class="btn btn-primary btn-sm" @click="handleDownload(image.id, 'compressed')">
            下载压缩
          </button>
          <button class="btn btn-danger btn-sm" @click="handleDelete(image.id)">
            删除
          </button>
        </div>
      </div>
    </div>

    <div v-if="previewImage" class="preview-modal" @click.self="closePreview">
      <div class="preview-content">
        <button class="close-btn" @click="closePreview">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
          </svg>
        </button>
        <img :src="getPreviewUrl(previewImage.id, previewImage.type)" alt="预览" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-header h2 {
  font-size: 20px;
  color: var(--text-primary);
}

.list-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  gap: 16px;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.loading-state p,
.empty-state h3 {
  color: var(--text-secondary);
}

.empty-state p {
  color: var(--text-tertiary);
  font-size: 14px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.image-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s ease;
}

.image-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.image-preview {
  position: relative;
  width: 100%;
  height: 180px;
  background: var(--bg-tertiary);
  overflow: hidden;
  cursor: pointer;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-preview:hover img {
  transform: scale(1.05);
}

.saved-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  background: var(--success-color);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.saved-badge.negative {
  background: var(--danger-color);
}

.image-info {
  padding: 16px;
  flex: 1;
}

.image-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.image-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 12px;
}

.size-comparison {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.original-size {
  color: var(--text-secondary);
  text-decoration: line-through;
}

.compressed-size {
  color: var(--success-color);
  font-weight: 500;
}

.image-actions {
  padding: 0 16px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.image-actions .btn {
  flex: 1;
  min-width: calc(50% - 4px);
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40px;
}

.preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.preview-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  opacity: 0.8;
}
</style>
