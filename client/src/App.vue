<template>
  <div class="app-container">
    <div class="bg-decor bg-decor-1"></div>
    <div class="bg-decor bg-decor-2"></div>
    
    <header class="app-header">
      <div class="logo-section">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <div>
          <h1 class="app-title">轻量图片压缩工具</h1>
          <p class="app-subtitle">专业 · 高效 · 无广告</p>
        </div>
      </div>
      
      <nav class="tab-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-text">{{ tab.label }}</span>
        </button>
      </nav>
    </header>

    <main class="app-main">
      <div class="main-content">
        <div class="left-panel">
          <UploadZone 
            :files="uploadedFiles" 
            @upload="handleUpload"
            @remove="handleRemove"
          />
          
          <div v-if="uploadedFiles.length > 0" class="files-grid">
            <div 
              v-for="(file, index) in uploadedFiles" 
              :key="file.id"
              class="file-card"
              :class="{ selected: selectedFiles.includes(file.id) }"
              @click="toggleFileSelection(file.id)"
            >
              <div class="file-preview">
                <img :src="file.url" :alt="file.originalName" />
                <div v-if="results[file.id]" class="compression-badge">
                  -{{ results[file.id].compressionRatio || 0 }}%
                </div>
              </div>
              <div class="file-info">
                <p class="file-name">{{ file.originalName }}</p>
                <p class="file-size">{{ formatSize(file.size) }}</p>
                <div v-if="results[file.id]" class="result-info">
                  <span class="new-size">{{ formatSize(results[file.id].newSize) }}</span>
                </div>
              </div>
              <button class="remove-btn" @click.stop="handleRemove(index)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <aside class="right-panel glass-panel">
          <ControlPanel 
            :activeTab="activeTab"
            :params="params"
            @update="updateParams"
            @process="handleProcess"
            :processing="processing"
            :hasFiles="uploadedFiles.length > 0"
            :hasResults="Object.keys(results).length > 0"
          />

          <ProgressIndicator 
            v-if="processing || processingProgress > 0"
            :progress="processingProgress"
            :status="processingStatus"
          />

          <div v-if="Object.keys(results).length > 0" class="stats-section">
            <h3 class="section-title">处理统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">已处理</span>
                <span class="stat-value" :class="{ 'animate-number': animateStats }">{{ Object.keys(results).length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">总体积</span>
                <span class="stat-value" :class="{ 'animate-number': animateStats }">{{ formatSize(totalOriginalSize) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">压缩后</span>
                <span class="stat-value success" :class="{ 'animate-number': animateStats }">{{ formatSize(totalNewSize) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">节省</span>
                <span class="stat-value accent" :class="{ 'animate-number': animateStats }">{{ averageCompression }}%</span>
              </div>
            </div>
            
            <button class="download-btn" @click="handleDownloadBatch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              批量打包下载
            </button>
          </div>

          <ComparisonView 
            v-if="selectedCompareFile"
            :original="selectedCompareFile.url"
            :compressed="results[selectedCompareFile.id]?.outputUrl"
            :originalSize="selectedCompareFile.size"
            :newSize="results[selectedCompareFile.id]?.newSize"
          />
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { compressImage, convertImage, cropImage } from './utils/imageProcessor.js'
import UploadZone from './components/UploadZone.vue'
import ControlPanel from './components/ControlPanel.vue'
import ProgressIndicator from './components/ProgressIndicator.vue'
import ComparisonView from './components/ComparisonView.vue'

const activeTab = ref('compress')
const uploadedFiles = ref([])
const selectedFiles = ref([])
const results = ref({})
const processing = ref(false)
const processingProgress = ref(0)
const processingStatus = ref('')
const animateStats = ref(false)

const tabs = [
  { id: 'compress', label: '图片压缩', icon: '🗜️' },
  { id: 'convert', label: '格式转换', icon: '🔄' },
  { id: 'crop', label: '分辨率裁剪', icon: '✂️' }
]

const params = ref({
  quality: 80,
  format: 'jpeg',
  targetFormat: 'png',
  width: '',
  height: ''
})

const selectedCompareFile = computed(() => {
  if (selectedFiles.value.length === 1 && results.value[selectedFiles.value[0]]) {
    return uploadedFiles.value.find(f => f.id === selectedFiles.value[0])
  }
  return null
})

const totalOriginalSize = computed(() => {
  return uploadedFiles.value.reduce((sum, f) => sum + (results.value[f.id] ? f.size : 0), 0)
})

const totalNewSize = computed(() => {
  return Object.values(results.value).reduce((sum, r) => sum + (r.newSize || 0), 0)
})

const averageCompression = computed(() => {
  const values = Object.values(results.value)
  if (values.length === 0) return 0
  const total = values.reduce((sum, r) => sum + parseFloat(r.compressionRatio || 0), 0)
  return (total / values.length).toFixed(1)
})

watch(results, () => {
  animateStats.value = true
  setTimeout(() => animateStats.value = false, 300)
})

watch(activeTab, () => {
  results.value = {}
  selectedFiles.value = []
})

function formatSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function toggleFileSelection(fileId) {
  const index = selectedFiles.value.indexOf(fileId)
  if (index > -1) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value.push(fileId)
  }
}

async function handleUpload(newFiles) {
  const formData = new FormData()
  newFiles.forEach(file => formData.append('images', file))
  
  try {
    const res = await axios.post('http://localhost:3001/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    uploadedFiles.value = [...uploadedFiles.value, ...res.data.files]
  } catch (error) {
    console.error('Upload error:', error)
  }
}

function handleRemove(index) {
  const file = uploadedFiles.value[index]
  if (file) {
    const idx = selectedFiles.value.indexOf(file.id)
    if (idx > -1) selectedFiles.value.splice(idx, 1)
    if (results.value[file.id]) delete results.value[file.id]
  }
  uploadedFiles.value.splice(index, 1)
}

function updateParams(newParams) {
  params.value = { ...params.value, ...newParams }
}

async function handleProcess() {
  if (uploadedFiles.value.length === 0) return
  
  processing.value = true
  processingProgress.value = 0
  processingStatus.value = '准备处理...'
  
  const filesToProcess = selectedFiles.value.length > 0 
    ? uploadedFiles.value.filter(f => selectedFiles.value.includes(f.id))
    : uploadedFiles.value

  try {
    const processedItems = []
    const totalFiles = filesToProcess.length

    for (let i = 0; i < totalFiles; i++) {
      const img = filesToProcess[i]
      const progress = Math.round((i / totalFiles) * 60) + 10
      processingProgress.value = progress
      processingStatus.value = `处理中 ${i + 1}/${totalFiles}...`

      let processed
      let operation
      let format

      switch (activeTab.value) {
        case 'compress':
          processed = await compressImage(img.url, {
            quality: params.value.quality,
            format: params.value.format,
            width: params.value.width,
            height: params.value.height,
            originalSize: img.size
          })
          operation = 'compressed'
          format = params.value.format
          break
        case 'convert':
          processed = await convertImage(img.url, params.value.targetFormat)
          operation = 'converted'
          format = params.value.targetFormat
          break
        case 'crop':
          processed = await cropImage(img.url, {
            width: params.value.width,
            height: params.value.height
          })
          operation = 'cropped'
          format = processed.format
          break
      }

      processedItems.push({
        id: img.id,
        originalName: img.originalName,
        base64: processed.base64,
        originalSize: img.size,
        newSize: processed.size,
        operation,
        format
      })
    }

    processingProgress.value = 70
    processingStatus.value = '保存处理结果...'

    const res = await axios.post('http://localhost:3001/api/save-processed', {
      items: processedItems
    })

    processingProgress.value = 90
    processingStatus.value = '完成处理...'

    if (res.data.success) {
      res.data.results.forEach(r => {
        results.value[r.id] = r
      })
    }

    processingProgress.value = 100
    processingStatus.value = '处理完成'

    setTimeout(() => {
      processing.value = false
    }, 500)
  } catch (error) {
    console.error('Process error:', error)
    processingStatus.value = '处理失败'
    setTimeout(() => {
      processing.value = false
    }, 1000)
  }
}

async function handleDownloadBatch() {
  const resultFiles = Object.values(results.value)
  if (resultFiles.length === 0) return

  try {
    processing.value = true
    processingStatus.value = '打包中...'
    processingProgress.value = 30

    const res = await axios.post('http://localhost:3001/api/download-batch', {
      files: resultFiles,
      batchName: 'processed_images'
    })

    processingProgress.value = 100
    processingStatus.value = '打包完成'

    if (res.data.success) {
      const link = document.createElement('a')
      link.href = res.data.downloadUrl
      link.download = 'processed_images.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    setTimeout(() => {
      processing.value = false
      processingProgress.value = 0
    }, 500)
  } catch (error) {
    console.error('Download error:', error)
    processingStatus.value = '打包失败'
    setTimeout(() => {
      processing.value = false
    }, 1000)
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
  padding: 24px;
}

.bg-decor {
  position: fixed;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.bg-decor-1 {
  width: 400px;
  height: 400px;
  background: var(--accent-start);
  top: -100px;
  left: -100px;
}

.bg-decor-2 {
  width: 500px;
  height: 500px;
  background: var(--accent-end);
  bottom: -150px;
  right: -150px;
}

.app-header {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-md);
}

.logo-icon svg {
  width: 24px;
  height: 24px;
}

.app-title {
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 400;
}

.tab-nav {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: calc(var(--radius-lg) - 4px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-med);
}

.tab-btn:hover {
  background: rgba(99, 102, 241, 0.08);
  color: var(--accent-start);
}

.tab-btn.active {
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  color: white;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.tab-icon {
  font-size: 18px;
}

.app-main {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: flex-start;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.file-card {
  position: relative;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-med);
  box-shadow: var(--shadow-sm);
}

.file-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.file-card.selected {
  border-color: var(--accent-start);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.file-preview {
  position: relative;
  aspect-ratio: 1;
  background: #f1f5f9;
  overflow: hidden;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.compression-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  background: var(--success);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
}

.file-info {
  padding: 12px;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.result-info {
  margin-top: 8px;
}

.new-size {
  font-size: 12px;
  color: var(--success);
  font-weight: 500;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all var(--transition-fast);
}

.file-card:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: var(--error);
  transform: scale(1.1);
}

.remove-btn svg {
  width: 14px;
  height: 14px;
}

.right-panel {
  position: sticky;
  top: 24px;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-lg);
}

.stats-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.success {
  color: var(--success);
}

.stat-value.accent {
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.download-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-med);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.download-btn:active {
  transform: translateY(0);
}

.download-btn svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .right-panel {
    position: relative;
    top: 0;
  }
  
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tab-nav {
    overflow-x: auto;
  }
}

@media (max-width: 640px) {
  .app-container {
    padding: 16px;
  }
  
  .files-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
