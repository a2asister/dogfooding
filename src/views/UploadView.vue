<template>
  <div class="upload-view">
    <div class="container">
      <header class="header">
        <h1 class="title">大文件分片上传管理器</h1>
        <p class="subtitle">支持断点续传、并发控制、暂停恢复、校验合并</p>
      </header>

      <div class="upload-area" @click="handleUploadClick">
        <input
          ref="fileInput"
          type="file"
          class="file-input"
          @change="handleFileChange"
          multiple
        />
        <div class="upload-icon">
          <el-icon :size="64" color="#409eff">
            <UploadFilled />
          </el-icon>
        </div>
        <p class="upload-text">点击或拖拽文件到此处上传</p>
        <p class="upload-hint">支持任意大文件，自动分片上传</p>
      </div>

      <div class="upload-list" v-if="uploadTasks.length > 0">
        <div class="list-header">
          <span class="header-title">上传列表</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="startAllUploads" v-if="hasPendingTasks">
              <el-icon><VideoPlay /></el-icon> 全部开始
            </el-button>
            <el-button type="warning" size="small" @click="pauseAllUploads" v-if="hasRunningTasks">
              <el-icon><VideoPause /></el-icon> 全部暂停
            </el-button>
            <el-button type="danger" size="small" @click="clearCompletedTasks" v-if="hasCompletedTasks">
              <el-icon><Delete /></el-icon> 清除已完成
            </el-button>
          </div>
        </div>

        <div class="task-item" v-for="task in uploadTasks" :key="task.id">
          <div class="task-info">
            <div class="file-icon">
              <el-icon :size="24">
                <Document v-if="!isImage(task.name)" />
                <Picture v-else />
              </el-icon>
            </div>
            <div class="file-details">
              <div class="file-name">{{ task.name }}</div>
              <div class="file-meta">
                <span class="file-size">{{ formatFileSize(task.size) }}</span>
                <span class="file-status" :class="task.status">{{ getStatusText(task.status) }}</span>
              </div>
            </div>
          </div>

          <div class="task-progress">
            <el-progress
              :percentage="Math.round(task.progress)"
              :status="task.status === 'error' ? 'exception' : task.status === 'completed' ? 'success' : ''"
              :stroke-width="6"
              :show-text="false"
            />
            <div class="progress-info">
              <span class="progress-percent">{{ Math.round(task.progress) }}%</span>
              <span class="progress-speed" v-if="task.status === 'uploading'">
                {{ formatFileSize(task.speed) }}/s
              </span>
            </div>
          </div>

          <div class="task-actions">
            <el-tooltip content="开始上传" placement="top" v-if="task.status === 'pending' || task.status === 'paused'">
              <el-button
                type="primary"
                size="small"
                circle
                @click="startUpload(task.id)"
              >
                <el-icon><VideoPlay /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip content="暂停上传" placement="top" v-if="task.status === 'uploading'">
              <el-button
                type="warning"
                size="small"
                circle
                @click="pauseUpload(task.id)"
              >
                <el-icon><VideoPause /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip content="重新上传" placement="top" v-if="task.status === 'error'">
              <el-button
                type="primary"
                size="small"
                circle
                @click="retryUpload(task.id)"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip content="删除任务" placement="top">
              <el-button
                type="danger"
                size="small"
                circle
                @click="removeTask(task.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-header">
          <el-icon :size="20"><Setting /></el-icon>
          <span>上传设置</span>
        </div>
        <div class="settings-content">
          <div class="setting-item">
            <label>并发数</label>
            <el-slider
              v-model="settings.concurrency"
              :min="1"
              :max="10"
              :show-input="true"
              :show-input-controls="false"
            />
          </div>
          <div class="setting-item">
            <label>分片大小</label>
            <el-select v-model="settings.chunkSize" style="width: 200px">
              <el-option :label="formatChunkSize(1)" :value="1" />
              <el-option :label="formatChunkSize(2)" :value="2" />
              <el-option :label="formatChunkSize(4)" :value="4" />
              <el-option :label="formatChunkSize(8)" :value="8" />
              <el-option :label="formatChunkSize(16)" :value="16" />
            </el-select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UploadFilled,
  Document,
  Picture,
  VideoPlay,
  VideoPause,
  Delete,
  Refresh,
  Setting
} from '@element-plus/icons-vue'
import { useUploadStore } from '../stores/upload'

const uploadStore = useUploadStore()
const fileInput = ref(null)
const uploadTasks = computed(() => uploadStore.tasks)
const settings = computed({
  get: () => uploadStore.settings,
  set: (val) => uploadStore.updateSettings(val)
})

const hasPendingTasks = computed(() => uploadTasks.value.some(t => t.status === 'pending' || t.status === 'paused'))
const hasRunningTasks = computed(() => uploadTasks.value.some(t => t.status === 'uploading'))
const hasCompletedTasks = computed(() => uploadTasks.value.some(t => t.status === 'completed'))

const handleUploadClick = () => {
  fileInput.value?.click()
}

const handleFileChange = (e) => {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  files.forEach(file => {
    uploadStore.addTask(file)
  })

  // 重置 input
  e.target.value = ''
}

const startUpload = (taskId) => {
  uploadStore.startTask(taskId)
}

const pauseUpload = (taskId) => {
  uploadStore.pauseTask(taskId)
}

const retryUpload = (taskId) => {
  uploadStore.retryTask(taskId)
}

const removeTask = (taskId) => {
  uploadStore.removeTask(taskId)
  ElMessage.success('任务已删除')
}

const startAllUploads = () => {
  uploadStore.startAllTasks()
}

const pauseAllUploads = () => {
  uploadStore.pauseAllTasks()
}

const clearCompletedTasks = () => {
  uploadStore.clearCompletedTasks()
  ElMessage.success('已清除完成的任务')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatChunkSize = (mb) => {
  return `${mb} MB`
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '等待上传',
    uploading: '上传中',
    paused: '已暂停',
    completed: '已完成',
    error: '上传失败',
    merging: '合并中'
  }
  return statusMap[status] || '未知'
}

const isImage = (fileName) => {
  const ext = fileName.toLowerCase().split('.').pop()
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)
}

// 拖拽功能
const uploadArea = ref(null)

const handleDragOver = (e) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDrop = (e) => {
  e.preventDefault()
  e.stopPropagation()
  
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length === 0) return

  files.forEach(file => {
    uploadStore.addTask(file)
  })
}

onMounted(() => {
  const area = document.querySelector('.upload-area')
  if (area) {
    area.addEventListener('dragover', handleDragOver)
    area.addEventListener('drop', handleDrop)
  }
})

onUnmounted(() => {
  const area = document.querySelector('.upload-area')
  if (area) {
    area.removeEventListener('dragover', handleDragOver)
    area.removeEventListener('drop', handleDrop)
  }
})
</script>

<style lang="scss" scoped>
.upload-view {
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;

  .title {
    font-size: 32px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 14px;
    color: #909399;
  }
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;

  &:hover {
    border-color: #409eff;
    background-color: #ecf5ff;
  }

  &.dragover {
    border-color: #409eff;
    background-color: #ecf5ff;
    transform: scale(1.01);
  }

  .file-input {
    display: none;
  }

  .upload-text {
    font-size: 18px;
    color: #606266;
    margin-bottom: 8px;
  }

  .upload-hint {
    font-size: 14px;
    color: #909399;
  }
}

.upload-list {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  overflow: hidden;

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    background: linear-gradient(135deg, #f5f7fa 0%, #fafafa 100%);

    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .task-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #fafafa;
    }

    .task-info {
      display: flex;
      align-items: center;
      flex: 0 0 200px;
      margin-right: 20px;

      .file-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        color: #fff;
        margin-right: 12px;
      }

      .file-details {
        flex: 1;
        overflow: hidden;

        .file-name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-meta {
          display: flex;
          gap: 12px;
          margin-top: 4px;

          .file-size {
            font-size: 12px;
            color: #909399;
          }

          .file-status {
            font-size: 12px;
            font-weight: 500;

            &.pending { color: #909399; }
            &.uploading { color: #409eff; }
            &.paused { color: #e6a23c; }
            &.completed { color: #67c23a; }
            &.error { color: #f56c6c; }
            &.merging { color: #409eff; }
          }
        }
      }
    }

    .task-progress {
      flex: 1;
      margin-right: 20px;

      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-top: 4px;

        .progress-percent {
          font-size: 12px;
          color: #606266;
        }

        .progress-speed {
          font-size: 12px;
          color: #409eff;
        }
      }
    }

    .task-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.settings-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  .settings-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    background: linear-gradient(135deg, #f5f7fa 0%, #fafafa 100%);
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .settings-content {
    padding: 20px;

    .setting-item {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        width: 80px;
        font-size: 14px;
        color: #606266;
        flex-shrink: 0;
      }

      .el-slider {
        flex: 1;
        max-width: 400px;
      }
    }
  }
}
</style>
