<template>
  <div class="history-container">
    <el-alert
      v-if="loading"
      title="正在加载历史记录..."
      type="info"
      show-icon
      :closable="false"
      style="margin-bottom: 24px;"
    />
    <el-alert
      v-else-if="historyList.length === 0"
      title="暂无处理历史记录"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 24px;"
    >
      <template #default>
        上传图片并进行处理后，记录将显示在这里
      </template>
    </el-alert>
    
    <div v-else class="history-list">
      <div
        v-for="item in historyList"
        :key="item.id"
        class="history-item"
      >
        <div class="item-preview">
          <img :src="item.url" :alt="item.originalName" />
        </div>
        
        <div class="item-info">
          <div class="info-row">
            <el-tag :type="getProcessTypeTag(item.processType)" size="small">
              {{ getProcessTypeName(item.processType) }}
            </el-tag>
            <span class="file-name" :title="item.originalName">{{ item.originalName }}</span>
          </div>
          
          <div class="info-details">
            <div class="detail-item">
              <span>原大小: {{ formatFileSize(item.originalSize || item.size) }}</span>
            </div>
            <div class="detail-item">
              <span>处理后: {{ formatFileSize(item.size) }}</span>
            </div>
            <div class="detail-item" v-if="item.compressionRate">
              <span>压缩率: {{ item.compressionRate }}</span>
            </div>
            <div class="detail-item" v-if="item.format">
              <span>格式: {{ item.format.toUpperCase() }}</span>
            </div>
            <div class="detail-item" v-if="item.dimensions">
              <span>尺寸: {{ item.dimensions.width }} x {{ item.dimensions.height }}</span>
            </div>
            <div class="detail-item" v-if="item.watermarkText">
              <span>水印: "{{ item.watermarkText }}"</span>
            </div>
            <div class="detail-item">
              <span>{{ formatTime(item.processTime) }}</span>
            </div>
          </div>
        </div>
        
        <div class="item-actions">
          <el-button type="primary" size="small" @click="downloadImage(item)">
            下载
          </el-button>
          <el-button type="default" size="small" @click="previewImage(item)">
            预览
          </el-button>
        </div>
      </div>
    </div>
    
    <el-dialog
      v-model="previewVisible"
      title="图片预览"
      width="80%"
      :center="true"
    >
      <div class="preview-content" v-if="currentPreview">
        <img :src="currentPreview.url" :alt="currentPreview.originalName" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const historyList = ref([])
const previewVisible = ref(false)
const currentPreview = ref(null)

const formatFileSize = (bytes) => {
  if (!bytes) return '未知'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (time) => {
  if (!time) return '未知'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getProcessTypeTag = (type) => {
  const map = {
    'compress': 'primary',
    'crop': 'warning',
    'convert': 'success',
    'watermark': 'info'
  }
  return map[type] || 'info'
}

const getProcessTypeName = (type) => {
  const map = {
    'compress': '图片压缩',
    'crop': '图片裁剪',
    'convert': '格式转换',
    'watermark': '添加水印'
  }
  return map[type] || '图片处理'
}

const loadHistory = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/images/history')
    if (response.data && response.data.success) {
      historyList.value = response.data.history || []
    }
  } catch (error) {
    console.error('Load history error:', error)
    ElMessage.error('加载历史记录失败')
  } finally {
    loading.value = false
  }
}

const downloadImage = (item) => {
  try {
    const link = document.createElement('a')
    link.href = item.url
    const ext = item.format ? '.' + item.format : ''
    link.download = item.originalName.replace(/\.[^.]+$/, '') + '_processed' + ext
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('开始下载')
  } catch (error) {
    console.error('Download error:', error)
    ElMessage.error('下载失败，请右键保存')
  }
}

const previewImage = (item) => {
  currentPreview.value = item
  previewVisible.value = true
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.history-container {
  width: 100%;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.history-item:hover {
  background: #f5f7fa;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.item-preview {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #e4e7ed;
}

.item-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.file-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  flex-shrink: 0;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 70vh;
  overflow: hidden;
}

.preview-content img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}
</style>
