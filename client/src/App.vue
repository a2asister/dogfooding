<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import {
  uploadImage,
  saveResult,
  getImages,
  deleteImage,
  type ImageRecord
} from './api';
import { mattingEngine, type MattingConfig, type MattingProgress } from './matting/wasm-matting';

const hiddenCanvasRef = ref<HTMLCanvasElement | null>(null);
const resultCanvasRef = ref<HTMLCanvasElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const currentFile = ref<File | null>(null);
const originalImageSrc = ref<string>('');
const originalImageEl = ref<HTMLImageElement | null>(null);
const isProcessing = ref(false);
const isDragging = ref(false);
const uploadProgress = ref(0);
const processingStage = ref<string>('');
const processingProgress = ref(0);
const currentRecord = ref<ImageRecord | null>(null);
const historyList = ref<ImageRecord[]>([]);
const activeRecordId = ref<number | null>(null);
const errorMessage = ref<string>('');
const hasResult = ref(false);

const mattingConfig = ref<MattingConfig>({
  threshold: 0.55,
  edgeSmoothing: 1.2,
  edgeFeather: 8
});

const hasOriginalImage = computed(() => originalImageSrc.value !== '');

const stageNames: Record<string, string> = {
  decoding: '解码图片',
  segmentation: '语义分割',
  alpha: '计算 Alpha 通道',
  antialiasing: '边缘抗锯齿',
  encoding: '编码导出'
};

async function loadHistory(): Promise<void> {
  try {
    historyList.value = await getImages();
  } catch (err) {
    console.error('加载历史记录失败:', err);
  }
}

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
    if (file.type.startsWith('image/')) {
      void processFile(file);
    } else {
      showError('请上传图片文件');
    }
  }
}

function handleFileSelect(e: Event): void {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    void processFile(files[0]);
  }
}

function triggerFileInput(): void {
  fileInputRef.value?.click();
}

async function processFile(file: File): Promise<void> {
  errorMessage.value = '';
  currentFile.value = file;
  hasResult.value = false;

  const url = URL.createObjectURL(file);
  originalImageSrc.value = url;

  await nextTick();

  const img = new Image();
  img.onload = async (): Promise<void> => {
    originalImageEl.value = img;

    try {
      uploadProgress.value = 0;
      const record = await uploadImage(file, img.width, img.height, (percent) => {
        uploadProgress.value = percent;
      });
      currentRecord.value = record;
      activeRecordId.value = record.id;
      await loadHistory();
    } catch (err) {
      showError('上传失败，请重试');
      console.error(err);
    }
  };

  img.onerror = (): void => {
    URL.revokeObjectURL(url);
    originalImageSrc.value = '';
    showError('图片加载失败');
  };

  img.src = url;
}

async function processMatting(): Promise<void> {
  if (!originalImageEl.value) {
    showError('请先上传图片');
    return;
  }

  isProcessing.value = true;
  errorMessage.value = '';
  hasResult.value = false;

  try {
    const img = originalImageEl.value;
    const hiddenCanvas = hiddenCanvasRef.value;
    if (!hiddenCanvas) {
      throw new Error('Canvas 未初始化');
    }

    hiddenCanvas.width = img.width;
    hiddenCanvas.height = img.height;
    const srcCtx = hiddenCanvas.getContext('2d');
    if (!srcCtx) {
      throw new Error('无法获取 Canvas 上下文');
    }

    srcCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    srcCtx.drawImage(img, 0, 0);

    const imageData = srcCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);

    const result = await mattingEngine.processImage(
      imageData,
      mattingConfig.value,
      (progress: MattingProgress) => {
        processingStage.value = stageNames[progress.stage] || progress.stage;
        processingProgress.value = progress.percent;
      }
    );

    const resultCanvas = resultCanvasRef.value;
    if (!resultCanvas) {
      throw new Error('结果 Canvas 未初始化');
    }

    resultCanvas.width = result.width;
    resultCanvas.height = result.height;
    const resultCtx = resultCanvas.getContext('2d');
    if (!resultCtx) {
      throw new Error('无法获取结果 Canvas 上下文');
    }

    resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    resultCtx.putImageData(result, 0, 0);

    hasResult.value = true;

    if (currentRecord.value) {
      const dataUrl = resultCanvas.toDataURL('image/png');
      await saveResult(currentRecord.value.id, dataUrl);
      await loadHistory();
    }
  } catch (err) {
    showError('处理失败，请重试');
    console.error(err);
  } finally {
    isProcessing.value = false;
    processingStage.value = '';
    processingProgress.value = 0;
  }
}

function downloadResult(): void {
  const resultCanvas = resultCanvasRef.value;
  if (!resultCanvas) {
    showError('没有可下载的结果');
    return;
  }

  const link = document.createElement('a');
  link.download = `portrait-matting-${Date.now()}.png`;
  link.href = resultCanvas.toDataURL('image/png');
  link.click();
}

function resetWorkspace(): void {
  if (originalImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(originalImageSrc.value);
  }

  currentFile.value = null;
  originalImageSrc.value = '';
  originalImageEl.value = null;
  currentRecord.value = null;
  activeRecordId.value = null;
  errorMessage.value = '';
  hasResult.value = false;

  if (resultCanvasRef.value) {
    const ctx = resultCanvasRef.value.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, resultCanvasRef.value.width, resultCanvasRef.value.height);
    }
  }

  if (hiddenCanvasRef.value) {
    const ctx = hiddenCanvasRef.value.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, hiddenCanvasRef.value.width, hiddenCanvasRef.value.height);
    }
  }

  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

function loadHistoryRecord(record: ImageRecord): void {
  activeRecordId.value = record.id;
  currentRecord.value = record;
  hasResult.value = false;

  if (originalImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(originalImageSrc.value);
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = (): void => {
    originalImageEl.value = img;
    originalImageSrc.value = `/${record.originalPath}`;
  };
  img.onerror = (): void => {
    showError('图片加载失败');
  };
  img.src = `/${record.originalPath}`;

  fetch(`/${record.resultPath}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error('结果图不存在');
      }
      return res.blob();
    })
    .then((blob) => {
      const resultImg = new Image();
      resultImg.crossOrigin = 'anonymous';
      resultImg.onload = async (): Promise<void> => {
        await nextTick();
        const resultCanvas = resultCanvasRef.value;
        if (!resultCanvas) return;

        resultCanvas.width = resultImg.width;
        resultCanvas.height = resultImg.height;
        const resultCtx = resultCanvas.getContext('2d');
        if (!resultCtx) return;

        resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
        resultCtx.drawImage(resultImg, 0, 0);
        hasResult.value = true;
      };
      resultImg.src = URL.createObjectURL(blob);
    })
    .catch(() => {
      hasResult.value = false;
      if (resultCanvasRef.value) {
        const ctx = resultCanvasRef.value.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, resultCanvasRef.value.width, resultCanvasRef.value.height);
        }
      }
    });
}

async function handleDelete(record: ImageRecord, e: Event): Promise<void> {
  e.stopPropagation();
  if (!confirm(`确定要删除 "${record.originalName}" 吗？`)) {
    return;
  }

  try {
    await deleteImage(record.id);
    if (activeRecordId.value === record.id) {
      resetWorkspace();
    }
    await loadHistory();
  } catch (err) {
    showError('删除失败');
    console.error(err);
  }
}

function showError(msg: string): void {
  errorMessage.value = msg;
  setTimeout(() => {
    errorMessage.value = '';
  }, 3000);
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted((): void => {
  void loadHistory();
});
</script>

<template>
  <div class="container">
    <canvas ref="hiddenCanvasRef" class="hidden-canvas"></canvas>

    <header class="header">
      <h1>🎨 AI 人像抠图工具</h1>
      <p>浏览器端高精度人像分割 · 透明背景导出 · 支持历史记录</p>
    </header>

    <div class="main-content">
      <div class="workspace">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="!hasOriginalImage" class="upload-area">
          <div
            class="upload-section"
            :class="{ dragover: isDragging }"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden-input"
              @change="handleFileSelect"
            />
            <div class="upload-icon">📸</div>
            <div class="upload-text">点击或拖拽图片到此处上传</div>
            <div class="upload-hint">支持 JPG、PNG、WEBP、BMP 格式</div>
          </div>
        </div>

        <div v-else>
          <div class="comparison-container">
            <div class="image-panel">
              <h4>原图</h4>
              <div class="image-wrapper">
                <img :src="originalImageSrc" alt="原图" />
              </div>
            </div>

            <div class="image-panel">
              <h4>抠图结果</h4>
              <div class="image-wrapper">
                <canvas ref="resultCanvasRef"></canvas>
                <div v-if="isProcessing" class="processing-overlay">
                  <div class="processing-spinner"></div>
                  <div class="processing-text">{{ processingStage }}...</div>
                </div>
                <div v-if="!hasResult && !isProcessing" class="empty-result">
                  <div class="empty-result-icon">✨</div>
                  <div class="empty-result-text">点击"开始抠图"生成结果</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isProcessing" class="progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${processingProgress}%` }"></div>
            </div>
            <div class="progress-text">{{ processingProgress }}%</div>
          </div>

          <div class="controls">
            <button
              v-if="!hasResult && !isProcessing"
              class="btn btn-primary"
              @click="processMatting"
            >
              ✨ 开始抠图
            </button>
            <button
              v-if="hasResult && !isProcessing"
              class="btn btn-primary"
              @click="processMatting"
            >
              🔄 重新处理
            </button>
            <button
              v-if="hasResult"
              class="btn btn-success"
              @click="downloadResult"
            >
              💾 下载 PNG
            </button>
            <button
              class="btn btn-secondary"
              @click="resetWorkspace"
              :disabled="isProcessing"
            >
              🆕 上传新图
            </button>
          </div>

          <div class="params-panel">
            <h4>抠图参数调整</h4>
            <div class="params-grid">
              <div class="slider-control">
                <label>分割阈值: {{ mattingConfig.threshold.toFixed(2) }}</label>
                <input
                  type="range"
                  v-model.number="mattingConfig.threshold"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  :disabled="isProcessing"
                />
              </div>
              <div class="slider-control">
                <label>边缘平滑: {{ mattingConfig.edgeSmoothing.toFixed(1) }}</label>
                <input
                  type="range"
                  v-model.number="mattingConfig.edgeSmoothing"
                  min="0"
                  max="2"
                  step="0.1"
                  :disabled="isProcessing"
                />
              </div>
              <div class="slider-control">
                <label>边缘羽化: {{ mattingConfig.edgeFeather }}</label>
                <input
                  type="range"
                  v-model.number="mattingConfig.edgeFeather"
                  min="0"
                  max="15"
                  step="1"
                  :disabled="isProcessing"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside class="sidebar">
        <h3>📋 历史记录</h3>
        <div v-if="historyList.length === 0" class="empty-state">
          <div class="empty-icon">🖼️</div>
          <div>暂无记录</div>
          <div class="upload-hint">上传图片后将显示在这里</div>
        </div>
        <div v-else class="history-list">
          <div
            v-for="record in historyList"
            :key="record.id"
            class="history-item"
            :class="{ active: activeRecordId === record.id }"
            @click="loadHistoryRecord(record)"
          >
            <img :src="`/${record.originalPath}`" class="history-thumb" :alt="record.originalName" />
            <div class="history-info">
              <div class="history-name">{{ record.originalName }}</div>
              <div class="history-time">{{ formatTime(record.createdAt) }}</div>
            </div>
            <div class="history-actions">
              <button class="btn btn-danger" @click="(e) => handleDelete(record, e)">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.hidden-canvas {
  display: none;
  position: absolute;
  visibility: hidden;
  width: 0;
  height: 0;
}

.hidden-input {
  display: none;
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 10;
}

.processing-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.processing-text {
  margin-top: 12px;
  color: #4a5568;
  font-weight: 500;
}

.empty-result {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
  background: #f7fafc;
}

.empty-result-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-result-text {
  font-size: 0.95rem;
}

.progress-text {
  margin-top: 8px;
  color: #718096;
  font-size: 0.9rem;
}

.params-panel {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.params-panel h4 {
  color: #4a5568;
  margin-bottom: 16px;
  font-size: 1rem;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.image-wrapper img {
  display: block;
  max-width: 100%;
  max-height: 400px;
  width: auto;
  height: auto;
}
</style>
