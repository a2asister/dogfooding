<template>
  <div class="content-container">
    <div class="tabs">
      <div
        :class="['tab-item', { active: activeTab === 'my-shares' }]"
        @click="activeTab = 'my-shares'"
      >
        我的分享
      </div>
      <div
        :class="['tab-item', { active: activeTab === 'shared-with-me' }]"
        @click="activeTab = 'shared-with-me'"
      >
        与我分享
      </div>
    </div>

    <div v-if="activeTab === 'my-shares'" class="content-card">
      <div class="card-body">
        <template v-if="myShares.length > 0">
          <div v-for="share in myShares" :key="share.id" class="list-item">
            <div class="list-item-content">
              <div class="list-item-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);">
                <el-icon :size="24" color="white"><Share /></el-icon>
              </div>
              <div class="list-item-info">
                <h4>{{ share.file?.name || share.fileId }}</h4>
                <p>
                  分享给: <span style="color: #6366f1; font-weight: 500;">{{ share.sharedWith?.username }}</span>
                  &nbsp;|&nbsp;
                  权限: <span :style="{ color: getPermissionColor(share.permission) }">{{ getPermissionText(share.permission) }}</span>
                  &nbsp;|&nbsp;
                  创建时间: {{ formatDate(share.createdAt) }}
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <el-tag v-if="share.isActive" type="success" size="small">有效</el-tag>
              <el-tag v-else type="info" size="small">已失效</el-tag>
              <el-button v-if="share.isActive" type="text" size="small" @click="revokeShare(share.id)">
                取消分享
              </el-button>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <el-icon class="empty-icon"><Share /></el-icon>
          <p class="empty-text">暂无分享的文件</p>
          <p class="empty-hint">在文件管理中选择文件进行分享</p>
        </div>
      </div>
    </div>

    <div v-else class="content-card">
      <div class="card-body">
        <template v-if="sharedWithMe.length > 0">
          <div v-for="item in sharedWithMe" :key="item.id" class="list-item">
            <div class="list-item-content">
              <div class="list-item-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                <el-icon :size="24" color="white"><FolderOpened /></el-icon>
              </div>
              <div class="list-item-info">
                <h4>{{ item.file?.name || '文件' }}</h4>
                <p>
                  来自: {{ item.owner?.username }}
                  &nbsp;|&nbsp;
                  权限: <span :style="{ color: getPermissionColor(item.permission) }">{{ getPermissionText(item.permission) }}</span>
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <el-button
                type="text"
                size="small"
                :disabled="!canWrite(item.permission)"
                @click="downloadSharedFile(item.file)"
              >
                下载
              </el-button>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <el-icon class="empty-icon"><FolderOpened /></el-icon>
          <p class="empty-text">暂无分享给我的文件</p>
          <p class="empty-hint">等待其他用户分享文件给你</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Share, FolderOpened } from '@element-plus/icons-vue'
import { api } from '@/utils/api'
import type { FileRecord } from '@/stores/files'

const activeTab = ref<'my-shares' | 'shared-with-me'>('my-shares')
const myShares = ref<any[]>([])
const sharedWithMe = ref<any[]>([])

const getPermissionText = (permission: string): string => {
  const map: Record<string, string> = {
    read: '只读',
    write: '可写',
    readwrite: '读写',
  }
  return map[permission] || permission
}

const getPermissionColor = (permission: string): string => {
  const map: Record<string, string> = {
    read: '#64748b',
    write: '#d97706',
    readwrite: '#16a34a',
  }
  return map[permission] || '#64748b'
}

const canWrite = (permission: string): boolean => {
  return permission === 'write' || permission === 'readwrite'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const loadMyShares = async () => {
  try {
    const response = await api.get('/share/my-shares')
    myShares.value = response.data.data
  } catch (error) {
    console.error('Failed to load my shares:', error)
  }
}

const loadSharedWithMe = async () => {
  try {
    const response = await api.get('/share/shared-with-me')
    sharedWithMe.value = response.data.data
  } catch (error) {
    console.error('Failed to load shared with me:', error)
  }
}

const revokeShare = async (shareId: string) => {
  try {
    await ElMessageBox.confirm('确定要取消该分享吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await api.delete(`/share/${shareId}`)
    ElMessage.success('已取消分享')
    loadMyShares()
  } catch (error) {
    // 用户取消
  }
}

const downloadSharedFile = (file: FileRecord | undefined) => {
  if (!file) return
  const link = document.createElement('a')
  link.href = `/api/files/download/${file.id}`
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  loadMyShares()
  loadSharedWithMe()
})
</script>
