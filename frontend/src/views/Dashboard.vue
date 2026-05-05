<template>
  <div class="content-container">
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon :size="28"><FolderOpened /></el-icon>
        </div>
        <div class="stat-info">
          <h3>{{ filesStore.stats?.fileCount || 0 }}</h3>
          <p>文件总数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <el-icon :size="28"><Promotion /></el-icon>
        </div>
        <div class="stat-info">
          <h3>{{ usedStoragePercent }}%</h3>
          <p>存储空间使用率</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">
          <el-icon :size="28"><Lock /></el-icon>
        </div>
        <div class="stat-info">
          <h3>{{ sensitiveFilesCount }}</h3>
          <p>敏感文件</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon :size="28"><Share /></el-icon>
        </div>
        <div class="stat-info">
          <h3>{{ sharedFilesCount }}</h3>
          <p>已分享文件</p>
        </div>
      </div>
    </div>

    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">快速操作</h3>
      </div>
      <div class="card-body" style="display: flex; gap: 16px; flex-wrap: wrap;">
        <el-button type="primary" size="large" @click="goToFiles">
          <el-icon><Upload /></el-icon>
          上传文件
        </el-button>
        <el-button size="large" @click="goToShare">
          <el-icon><Share /></el-icon>
          管理分享
        </el-button>
        <el-button size="large" @click="goToSync">
          <el-icon><Refresh /></el-icon>
          查看同步
        </el-button>
      </div>
    </div>

    <div class="content-card" style="margin-top: 24px;">
      <div class="card-header">
        <h3 class="card-title">存储空间使用情况</h3>
      </div>
      <div class="card-body">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span style="font-size: 14px; color: #64748b;">
            已使用 <strong style="color: #1e293b;">{{ formatFileSize(filesStore.stats?.used || 0) }}</strong> / {{ formatFileSize(filesStore.stats?.total || 10 * 1024 * 1024 * 1024) }}
          </span>
          <span style="font-size: 14px; color: #64748b;">
            剩余 <strong style="color: #22c55e;">{{ formatFileSize(filesStore.stats?.free || 0) }}</strong>
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: usedStoragePercent + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FolderOpened,
  Promotion,
  Lock,
  Share,
  Upload,
  Refresh,
} from '@element-plus/icons-vue'
import { useFilesStore } from '@/stores/files'

const router = useRouter()
const filesStore = useFilesStore()

const usedStoragePercent = computed(() => {
  const used = filesStore.stats?.used || 0
  const total = filesStore.stats?.total || 10 * 1024 * 1024 * 1024
  return Math.min(Math.round((used / total) * 100), 100)
})

const sensitiveFilesCount = computed(() => {
  return filesStore.files.filter((f) => f.isSensitive && !f.deleted).length
})

const sharedFilesCount = computed(() => {
  return 0
})

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const goToFiles = () => {
  router.push('/files')
}

const goToShare = () => {
  router.push('/share')
}

const goToSync = () => {
  router.push('/sync')
}

onMounted(() => {
  filesStore.loadStats()
  filesStore.loadFiles()
})
</script>
