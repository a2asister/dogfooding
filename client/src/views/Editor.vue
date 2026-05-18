<template>
  <div class="editor-page">
    <el-row :gutter="20">
      <el-col :span="4">
        <el-card class="tool-panel">
          <template #header>
            <span>🛠️ 工具栏</span>
          </template>
          <div class="tool-buttons">
            <el-button type="primary" @click="triggerUpload" :disabled="isProcessing">
              📁 上传图片
            </el-button>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
            />
            <el-button @click="clearMarks" :disabled="!marks.length || isProcessing">
              🗑️ 清除选区
            </el-button>
            <el-button
              type="success"
              @click="processImage"
              :disabled="!marks.length || !imageId || isProcessing"
              :loading="isProcessing"
            >
              ✨ 开始修复
            </el-button>
            <el-divider />
            <el-button @click="$router.push('/results')">
              📋 查看历史
            </el-button>
          </div>
          <el-divider />
          <div class="marks-list">
            <h4>已选区域 ({{ marks.length }})</h4>
            <div v-for="(mark, index) in marks" :key="mark.id" class="mark-item">
              <span>区域 {{ index + 1 }}</span>
              <el-button size="small" type="danger" text @click="removeMark(mark.id)">
                删除
              </el-button>
            </div>
            <el-empty v-if="!marks.length" description="请在图片上框选水印区域" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="20">
        <el-card class="canvas-card">
          <template #header>
            <div class="header-actions">
              <span>🖼️ 编辑区域</span>
              <span v-if="imageUrl" class="hint">拖动鼠标框选水印区域</span>
            </div>
          </template>
          <div class="canvas-container">
            <div
              v-if="!imageUrl"
              class="upload-placeholder"
              @click="triggerUpload"
            >
              <el-icon :size="64" color="#c0c4cc"><UploadFilled /></el-icon>
              <p>点击上传图片，或拖拽图片到此处</p>
              <p class="sub-hint">支持 JPG、PNG、WebP 等格式</p>
            </div>
            <div v-else class="image-wrapper" ref="imageWrapper">
              <img
                ref="imageRef"
                :src="imageUrl"
                class="main-image"
                @load="onImageLoad"
                @mousedown="startDrawing"
                draggable="false"
              />
              <svg class="overlay" :width="canvasWidth" :height="canvasHeight">
                <rect
                  v-for="mark in marks"
                  :key="mark.id"
                  :x="mark.rect.x"
                  :y="mark.rect.y"
                  :width="mark.rect.width"
                  :height="mark.rect.height"
                  class="mark-rect"
                />
                <rect
                  v-if="isDrawing && currentRect"
                  :x="currentRect.x"
                  :y="currentRect.y"
                  :width="currentRect.width"
                  :height="currentRect.height"
                  class="current-rect"
                />
              </svg>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="previewVisible" title="修复预览" width="800px">
      <div v-if="previewResult" class="preview-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <h4>原图</h4>
            <img :src="`/api${previewResult.originalPath}`" class="preview-img" />
          </el-col>
          <el-col :span="12">
            <h4>修复后</h4>
            <img :src="`/api${previewResult.processedPath}`" class="preview-img" />
          </el-col>
        </el-row>
        <div class="preview-actions">
          <el-button type="primary" @click="downloadResult">
            💾 下载高清图片
          </el-button>
          <el-button @click="previewVisible = false">
            继续编辑
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { api } from '../services/api'
import type { WatermarkMark, Rect, ProcessResult } from '../types'

const fileInput = ref<HTMLInputElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const imageWrapper = ref<HTMLDivElement | null>(null)

const imageId = ref<number | null>(null)
const imageUrl = ref('')
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const marks = ref<WatermarkMark[]>([])
const isDrawing = ref(false)
const startPoint = reactive({ x: 0, y: 0 })
const currentRect = ref<Rect | null>(null)
const isProcessing = ref(false)
const previewVisible = ref(false)
const previewResult = ref<ProcessResult | null>(null)

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }

  try {
    const res = await api.uploadImage(file)
    imageId.value = res.id
    imageUrl.value = res.url
    marks.value = []
    ElMessage.success('图片上传成功')
  } catch (err) {
    ElMessage.error('上传失败，请重试')
    console.error(err)
  }

  target.value = ''
}

const onImageLoad = () => {
  if (imageRef.value) {
    canvasWidth.value = imageRef.value.offsetWidth
    canvasHeight.value = imageRef.value.offsetHeight
  }
}

const getMousePos = (e: MouseEvent): { x: number; y: number } => {
  if (!imageRef.value) return { x: 0, y: 0 }
  const rect = imageRef.value.getBoundingClientRect()
  return {
    x: Math.max(0, Math.min(e.clientX - rect.left, rect.width)),
    y: Math.max(0, Math.min(e.clientY - rect.top, rect.height))
  }
}

const startDrawing = (e: MouseEvent) => {
  if (isProcessing.value) return
  e.preventDefault()
  isDrawing.value = true
  const pos = getMousePos(e)
  startPoint.x = pos.x
  startPoint.y = pos.y
  currentRect.value = { x: pos.x, y: pos.y, width: 0, height: 0 }
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !currentRect.value) return
  const pos = getMousePos(e)
  currentRect.value = {
    x: Math.min(startPoint.x, pos.x),
    y: Math.min(startPoint.y, pos.y),
    width: Math.abs(pos.x - startPoint.x),
    height: Math.abs(pos.y - startPoint.y)
  }
}

const stopDrawing = (e: MouseEvent) => {
  if (!isDrawing.value) return
  
  if (currentRect.value && currentRect.value.width > 5 && currentRect.value.height > 5) {
    marks.value.push({
      id: Date.now().toString(),
      rect: { ...currentRect.value }
    })
  }
  
  isDrawing.value = false
  currentRect.value = null
}

const handleWindowMouseMove = (e: MouseEvent) => {
  if (isDrawing.value) {
    draw(e)
  }
}

const handleWindowMouseUp = (e: MouseEvent) => {
  if (isDrawing.value) {
    stopDrawing(e)
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleWindowMouseMove)
  window.addEventListener('mouseup', handleWindowMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleWindowMouseMove)
  window.removeEventListener('mouseup', handleWindowMouseUp)
})

const removeMark = (id: string) => {
  marks.value = marks.value.filter(m => m.id !== id)
}

const clearMarks = () => {
  marks.value = []
}

const processImage = async () => {
  if (!imageId.value || !marks.value.length) return
  
  isProcessing.value = true
  try {
    const scaledMarks = marks.value.map(m => {
      const img = imageRef.value
      if (!img) return m.rect
      const scaleX = img.naturalWidth / img.offsetWidth
      const scaleY = img.naturalHeight / img.offsetHeight
      return {
        x: Math.round(m.rect.x * scaleX),
        y: Math.round(m.rect.y * scaleY),
        width: Math.round(m.rect.width * scaleX),
        height: Math.round(m.rect.height * scaleY)
      }
    })

    const result = await api.processImage(imageId.value, scaledMarks)
    previewResult.value = result
    previewVisible.value = true
    ElMessage.success('修复完成！')
  } catch (err) {
    ElMessage.error('修复失败，请重试')
    console.error(err)
  } finally {
    isProcessing.value = false
  }
}

const downloadResult = () => {
  if (previewResult.value) {
    api.downloadImage(previewResult.value.processedPath)
  }
}
</script>

<style scoped>
.editor-page {
  padding: 20px;
}

.tool-panel {
  position: sticky;
  top: 20px;
}

.tool-buttons .el-button {
  width: 100%;
  margin-bottom: 10px;
}

.marks-list {
  max-height: 300px;
  overflow-y: auto;
}

.mark-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 6px;
}

.canvas-card {
  min-height: 600px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint {
  color: #909399;
  font-size: 13px;
}

.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  background: #fafafa;
  border-radius: 8px;
}

.upload-placeholder {
  text-align: center;
  padding: 60px;
  cursor: pointer;
  color: #909399;
}

.upload-placeholder p {
  margin: 16px 0 8px 0;
  font-size: 16px;
}

.upload-placeholder .sub-hint {
  font-size: 13px;
  color: #c0c4cc;
}

.image-wrapper {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.main-image {
  max-width: 100%;
  max-height: 70vh;
  display: block;
  cursor: crosshair;
  user-select: none;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.mark-rect {
  fill: rgba(255, 103, 0, 0.25);
  stroke: #ff6700;
  stroke-width: 2;
  stroke-dasharray: 5, 3;
}

.current-rect {
  fill: rgba(64, 158, 255, 0.3);
  stroke: #409eff;
  stroke-width: 2;
}

.preview-container {
  text-align: center;
}

.preview-img {
  max-width: 100%;
  max-height: 400px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.preview-actions {
  margin-top: 20px;
  text-align: center;
}

h4 {
  margin-bottom: 12px;
  color: #606266;
}
</style>
