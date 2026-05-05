<template>
  <div class="content-container">
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">同步状态</h3>
      </div>
      <div class="card-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div>
            <div style="margin-bottom: 16px;">
              <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">局域网同步</p>
              <div style="display: flex; align-items: center; gap: 12px;">
                <el-tag :type="lanSyncStatus === 'active' ? 'success' : 'info'">
                  {{ lanSyncStatus === 'active' ? '已连接' : '未连接' }}
                </el-tag>
                <el-button type="primary" size="small" @click="startLanSync">
                  <el-icon><Connection /></el-icon>
                  启动局域网同步
                </el-button>
              </div>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">云端同步</p>
              <div style="display: flex; align-items: center; gap: 12px;">
                <el-tag :type="cloudSyncStatus === 'active' ? 'success' : 'info'">
                  {{ cloudSyncStatus === 'active' ? '已连接' : '未连接' }}
                </el-tag>
                <el-button type="primary" size="small" @click="startCloudSync">
                  <el-icon><Cloudy /></el-icon>
                  启动云端同步
                </el-button>
              </div>
            </div>
          </div>
          <div>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">当前同步进度</p>
            <div v-if="syncing" style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 14px; color: #1e293b;">同步中...</span>
                <span style="font-size: 14px; color: #667eea; font-weight: 600;">{{ syncProgress }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: syncProgress + '%' }"></div>
              </div>
              <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
                已同步 {{ filesSynced }} 个文件
              </p>
            </div>
            <div v-else style="text-align: center; padding: 40px 20px;">
              <el-icon :size="48" color="#cbd5e1"><CircleCheck /></el-icon>
              <p style="margin-top: 12px; color: #64748b;">所有文件已同步</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-card" style="margin-top: 24px;">
      <div class="card-header">
        <h3 class="card-title">同步历史</h3>
      </div>
      <div class="card-body">
        <template v-if="syncHistory.length > 0">
          <div v-for="item in syncHistory" :key="item.id" class="list-item">
            <div class="list-item-content">
              <div
                class="list-item-icon"
                :style="{ background: item.type === 'lan' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }"
              >
                <el-icon :size="24" color="white">
                  <component :is="item.type === 'lan' ? Connection : Cloudy" />
                </el-icon>
              </div>
              <div class="list-item-info">
                <h4>{{ item.type === 'lan' ? '局域网同步' : '云端同步' }}</h4>
                <p>
                  同步 {{ item.filesSynced }} 个文件
                  &nbsp;|&nbsp;
                  {{ formatDate(item.startTime) }}
                </p>
              </div>
            </div>
            <el-tag :type="item.status === 'completed' ? 'success' : item.status === 'active' ? 'warning' : 'danger'">
              {{ item.status === 'completed' ? '已完成' : item.status === 'active' ? '进行中' : '失败' }}
            </el-tag>
          </div>
        </template>
        <div v-else class="empty-state">
          <el-icon class="empty-icon"><Refresh /></el-icon>
          <p class="empty-text">暂无同步历史</p>
          <p class="empty-hint">启动同步后会显示同步记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Connection, Cloudy, CircleCheck, Refresh } from '@element-plus/icons-vue'
import { api } from '@/utils/api'

const lanSyncStatus = ref<'active' | 'inactive'>('inactive')
const cloudSyncStatus = ref<'active' | 'inactive'>('inactive')
const syncing = ref(false)
const syncProgress = ref(0)
const filesSynced = ref(0)
const syncHistory = ref<any[]>([])

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const startLanSync = () => {
  lanSyncStatus.value = 'active'
  startSync()
}

const startCloudSync = () => {
  cloudSyncStatus.value = 'active'
  startSync()
}

const startSync = () => {
  syncing.value = true
  syncProgress.value = 0
  filesSynced.value = 0

  const interval = setInterval(() => {
    syncProgress.value += Math.random() * 15
    filesSynced.value += Math.floor(Math.random() * 3)

    if (syncProgress.value >= 100) {
      syncProgress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        syncing.value = false
        syncHistory.value.unshift({
          id: Date.now().toString(),
          type: lanSyncStatus.value === 'active' ? 'lan' : 'cloud',
          status: 'completed',
          progress: 100,
          filesSynced: filesSynced.value,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
        })
      }, 500)
    }
  }, 500)
}

const loadSyncHistory = async () => {
  try {
    const response = await api.get('/sync/history')
    syncHistory.value = response.data.data
  } catch (error) {
    console.error('Failed to load sync history:', error)
  }
}

onMounted(() => {
  loadSyncHistory()
})
</script>
