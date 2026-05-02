<template>
  <div class="app-container">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="32" color="#fff"><Picture /></el-icon>
          <h1>在线批量图片处理工具</h1>
        </div>
        <div class="header-actions">
          <el-tag type="success">本地JSON存储</el-tag>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <el-card class="tool-card">
        <template #header>
          <div class="card-header">
            <span>图片处理中心</span>
          </div>
        </template>
        
        <el-tabs v-model="activeTab" class="main-tabs">
          <el-tab-pane label="图片上传" name="upload">
            <ImageUpload @upload-success="handleUploadSuccess" :uploaded-images="uploadedImages" />
          </el-tab-pane>
          
          <el-tab-pane label="图片处理" name="process">
            <ImageProcess 
              :selected-images="selectedImages" 
              @process-success="handleProcessSuccess"
              :disabled="selectedImages.length === 0"
            />
          </el-tab-pane>
          
          <el-tab-pane label="处理历史" name="history">
            <HistoryList />
          </el-tab-pane>
        </el-tabs>
      </el-card>
      
      <el-card class="image-list-card" v-if="uploadedImages.length > 0">
        <template #header>
          <div class="card-header">
            <span>已上传图片 ({{ uploadedImages.length }})</span>
            <div class="header-actions">
              <el-button type="primary" size="small" @click="selectAll" v-if="selectedImages.length < uploadedImages.length">
                全选
              </el-button>
              <el-button type="danger" size="small" @click="clearAll" v-if="uploadedImages.length > 0">
                清空
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="image-grid">
          <div 
            v-for="image in uploadedImages" 
            :key="image.id"
            class="image-item"
            :class="{ selected: selectedImages.includes(image.id) }"
            @click="toggleImageSelection(image.id)"
          >
            <div class="image-preview">
              <img :src="image.url" :alt="image.originalName" />
              <div class="image-overlay">
                <el-checkbox :model-value="selectedImages.includes(image.id)" @click.stop>
                </el-checkbox>
              </div>
            </div>
            <div class="image-info">
              <div class="image-name" :title="image.originalName">{{ image.originalName }}</div>
              <div class="image-size">{{ formatFileSize(image.size) }}</div>
            </div>
          </div>
        </div>
        
        <div class="selection-info" v-if="selectedImages.length > 0">
          <el-text type="primary">
            已选择 {{ selectedImages.length }} 张图片
          </el-text>
          <el-button type="primary" size="small" @click="activeTab = 'process'">
            前往处理
          </el-button>
        </div>
      </el-card>
    </main>
    
    <footer class="footer">
      <p>© 2026 在线批量图片处理工具 | Vue + Express + 本地JSON存储</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ImageUpload from './components/ImageUpload.vue'
import ImageProcess from './components/ImageProcess.vue'
import HistoryList from './components/HistoryList.vue'

const activeTab = ref('upload')
const uploadedImages = ref([])
const selectedImages = ref([])

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleUploadSuccess = (files) => {
  uploadedImages.value = [...uploadedImages.value, ...files]
  ElMessage.success(`成功上传 ${files.length} 张图片`)
  activeTab.value = 'process'
}

const toggleImageSelection = (id) => {
  const index = selectedImages.value.indexOf(id)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(id)
  }
}

const selectAll = () => {
  selectedImages.value = uploadedImages.value.map(img => img.id)
}

const clearAll = () => {
  uploadedImages.value = []
  selectedImages.value = []
  ElMessage.info('已清空所有图片')
}

const handleProcessSuccess = (results) => {
  ElMessage.success(`成功处理 ${results.length} 张图片`)
  activeTab.value = 'history'
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 24px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo h1 {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.main-content {
  flex: 1;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tool-card, .image-list-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.main-tabs {
  .el-tabs__header {
    margin-bottom: 20px;
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.image-item {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.image-item:hover {
  border-color: #c0c4cc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-item.selected {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.image-preview {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f5f7fa;
}

.image-preview img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-overlay,
.image-item.selected .image-overlay {
  opacity: 1;
}

.image-info {
  padding: 8px 12px;
  background: #fff;
}

.image-name {
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.image-size {
  font-size: 12px;
  color: #909399;
}

.selection-info {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f0f5ff;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 24px;
  text-align: center;
}

.footer p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 14px;
}
</style>
