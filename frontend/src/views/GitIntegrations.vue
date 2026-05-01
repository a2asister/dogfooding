<template>
  <div class="page-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">Git集成管理</h1>
      <button class="btn-primary" @click="handleAdd">
        <span class="i-carbon-add mr-2"></span>
        新建集成
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card" v-for="integration in integrations" :key="integration.id">
        <div class="flex items-start justify-between">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mr-4">
              <span :class="[getPlatformIcon(integration.platform), 'text-white text-2xl']"></span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ integration.name }}</h3>
              <p class="text-sm text-gray-500">{{ integration.platform }}</p>
            </div>
          </div>
          <span :class="['status-badge', getStatusClass(integration.status)]">
            {{ getStatusLabel(integration.status) }}
          </span>
        </div>
        
        <div class="mt-4 pt-4 border-t">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500">仓库数量</p>
              <p class="font-medium text-gray-900 mt-1">{{ integration.repoCount || 0 }}</p>
            </div>
            <div>
              <p class="text-gray-500">最后同步</p>
              <p class="font-medium text-gray-900 mt-1">{{ integration.lastSyncedAt || '-' }}</p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-4 pt-4 border-t space-x-2">
          <button class="btn-secondary text-sm" @click="handleSync(integration)">
            <span class="i-carbon-sync mr-1"></span>
            同步
          </button>
          <button class="text-blue-600 hover:text-blue-800 text-sm py-2 px-3">
            编辑
          </button>
        </div>
      </div>
      
      <div class="card" v-if="integrations.length === 0">
        <div class="text-center py-8 text-gray-500">
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gitIntegrationsApi } from '@/api'

const integrations = ref([])

const fetchData = async () => {
  try {
    const response = await gitIntegrationsApi.getAll()
    integrations.value = response.data || []
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const handleAdd = () => {
  console.log('添加Git集成')
}

const handleSync = (integration) => {
  console.log('同步集成:', integration)
}

const getPlatformIcon = (platform) => {
  const icons = {
    github: 'i-carbon-logo-github',
    gitlab: 'i-carbon-code',
    gitee: 'i-carbon-cloud',
    bitbucket: 'i-carbon-code'
  }
  return icons[platform] || 'i-carbon-code'
}

const getStatusClass = (status) => {
  const classes = {
    connected: 'status-success',
    disconnected: 'status-danger',
    syncing: 'status-info'
  }
  return classes[status] || 'status-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    connected: '已连接',
    disconnected: '已断开',
    syncing: '同步中'
  }
  return labels[status] || status
}

onMounted(() => {
  fetchData()
})
</script>
