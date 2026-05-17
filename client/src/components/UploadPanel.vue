<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { uploadCompressedImages, type CompressedImageData } from '../api'
import { compressImageFile, preloadWasm } from '../wasmCompressor'
import type { CompressionOptions, QueueItem } from '../types'
import QueueItemComp from './QueueItem.vue'
import CompressionSettings from './CompressionSettings.vue'

const fileInput = ref<HTMLInputElement | null>(null)
const queue = ref<QueueItem[]>([])
const isDragging = ref(false)
const isProcessing = ref(false)
const processedCount = ref(0)
const totalCount = ref(0)
const concurrentCount = ref(3)
const wasmReady = ref(false)

const options = ref<CompressionOptions>({
  quality: 80,
  colorSampling: true,
  iterations: 3,
  lossless: false
})

const pendingItems = computed(() => queue.value.filter(item => item.status === 'pending'))
const processingItems = computed(() => queue.value.filter(item => item.status === 'processing'))
const completedItems = computed(() => queue.value.filter(item => item.status === 'completed'))

const overallProgress = computed(() => {
  if (totalCount.value === 0) return 0
  const completedWeight = completedItems.value.length * 100
  const processingWeight = processingItems.value.reduce((sum, item) => sum + item.progress, 0)
  return Math.round((completedWeight + processingWeight) / totalCount.value)
})

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function handleFiles(files: FileList | File[]): void {
  const fileArray = Array.isArray(files) ? files : Array.from(files)
  const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))

  for (const file of imageFiles) {
    const previewUrl = URL.createObjectURL(file)
    const existingIndex = queue.value.findIndex(
      item => item.file.name === file.name && item.file.size === file.size
    )

    if (existingIndex === -1) {
      queue.value.push({
        id: generateId(),
        file,
        previewUrl,
        status: 'pending',
        progress: 0
      })
    }
  }
}

function handleDrop(event: DragEvent): void {
  event.preventDefault()
  isDragging.value = false
  if (event.dataTransfer?.files) {
    handleFiles(event.dataTransfer.files)
  }
}

function handleDragOver(event: DragEvent): void {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(): void {
  isDragging.value = false
}

function openFileSelector(): void {
  fileInput.value?.click()
}

function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFiles(target.files)
    target.value = ''
  }
}

function removeFromQueue(id: string): void {
  const index = queue.value.findIndex(item => item.id === id)
  if (index !== -1) {
    const item = queue.value[index]
    if (item) {
      URL.revokeObjectURL(item.previewUrl)
    }
    queue.value.splice(index, 1)
  }
}

function clearQueue(): void {
  queue.value.forEach(item => URL.revokeObjectURL(item.previewUrl))
  queue.value = []
  processedCount.value = 0
  totalCount.value = 0
}

async function processSingleItem(item: QueueItem): Promise<CompressedImageData | null> {
  try {
    item.status = 'processing'
    item.progress = 5

    const result = await compressImageFile(item.file, options.value, (progress) => {
      item.progress = progress
    })

    item.progress = 95

    return {
      originalName: item.file.name,
      originalSize: item.file.size,
      compressedData: result.compressedData,
      compressedSize: result.compressedSize,
      width: result.width,
      height: result.height,
      compressionRatio: result.compressionRatio,
      quality: options.value.quality,
      outputFormat: result.outputFormat
    }
  } catch (error) {
    item.status = 'failed'
    item.error = error instanceof Error ? error.message : '压缩失败'
    return null
  }
}

async function processQueue(): Promise<void> {
  if (pendingItems.value.length === 0) return

  isProcessing.value = true
  totalCount.value = queue.value.length

  try {
    const pendingQueue = [...pendingItems.value]
    const compressedResults: CompressedImageData[] = []

    async function worker(): Promise<void> {
      while (pendingQueue.length > 0) {
        const item = pendingQueue.shift()
        if (!item) continue

        const result = await processSingleItem(item)
        if (result) {
          compressedResults.push(result)
          item.status = 'completed'
          item.progress = 100
          processedCount.value++
        }
      }
    }

    const workers: Promise<void>[] = []
    const actualConcurrent = Math.min(concurrentCount.value, pendingQueue.length)
    for (let i = 0; i < actualConcurrent; i++) {
      workers.push(worker())
    }

    await Promise.all(workers)

    if (compressedResults.length > 0) {
      const uploadedResults = await uploadCompressedImages(compressedResults)

      for (const result of uploadedResults) {
        const queueItem = queue.value.find(
          item =>
            item.file.name === result.originalName && item.file.size === result.originalSize
        )
        if (queueItem) {
          queueItem.result = result
        }
      }
    }
  } catch (error) {
    for (const item of queue.value) {
      if (item.status === 'processing' || item.status === 'pending') {
        item.status = 'failed'
        item.error = error instanceof Error ? error.message : '压缩失败'
      }
    }
  } finally {
    isProcessing.value = false
  }
}

watch(
  () => options.value.lossless,
  (newVal) => {
    if (newVal) {
      options.value.quality = 100
    }
  }
)

onMounted(() => {
  preloadWasm()
    .then(() => {
      wasmReady.value = true
      console.info('WASM 模块加载完成')
    })
    .catch((err) => {
      console.warn('WASM 加载失败，将使用 Canvas 降级方案:', err)
    })
})
</script>

<template>
  <div class="upload-panel">
    <div class="panel-grid">
      <div class="main-area">
        <div
          :class="['drop-zone', isDragging && 'dragging']"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @click="openFileSelector"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          />
          <div class="drop-content">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#6366f1"/>
            </svg>
            <h3>拖拽图片到此处，或点击选择文件</h3>
            <p>支持 PNG、JPG、WebP 格式，单张最大 50MB</p>
            <p v-if="wasmReady" class="wasm-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              WASM 加速已就绪
            </p>
          </div>
        </div>

        <div v-if="queue.length > 0" class="queue-section">
          <div class="queue-header">
            <h3>压缩队列 ({{ queue.length }})</h3>
            <div class="queue-actions">
              <span v-if="isProcessing" class="progress-text">
                进度: {{ overallProgress }}% ({{ processedCount }}/{{ totalCount }})
              </span>
              <button
                class="btn btn-primary btn-sm"
                :disabled="isProcessing || pendingItems.length === 0"
                @click="processQueue"
              >
                {{ isProcessing ? '压缩中...' : '开始压缩' }}
              </button>
              <button
                class="btn btn-secondary btn-sm"
                :disabled="isProcessing"
                @click="clearQueue"
              >
                清空队列
              </button>
            </div>
          </div>
          <div class="queue-grid">
            <QueueItemComp
              v-for="item in queue"
              :key="item.id"
              :item="item"
              :disabled="isProcessing"
              @remove="removeFromQueue"
            />
          </div>
        </div>
      </div>

      <div class="settings-area">
        <CompressionSettings v-model="options" :disabled="isProcessing" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

@media (max-width: 900px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}

.main-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.drop-zone.dragging {
  transform: scale(1.01);
}

.drop-content h3 {
  margin: 16px 0 8px;
  font-size: 18px;
  color: var(--text-primary);
}

.drop-content p {
  color: var(--text-tertiary);
  font-size: 14px;
}

.wasm-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 4px 12px;
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.queue-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.queue-header h3 {
  font-size: 16px;
  color: var(--text-primary);
}

.queue-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.queue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.settings-area {
  position: sticky;
  top: 88px;
  align-self: start;
}
</style>
