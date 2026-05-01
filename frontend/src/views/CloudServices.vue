<template>
  <div class="page-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">云服务管理</h1>
      <button class="btn-primary" @click="handleAdd">
        <span class="i-carbon-add mr-2"></span>
        添加服务
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="card" v-for="service in cloudServices" :key="service.id">
        <div class="flex items-start justify-between">
          <div class="flex items-center">
            <div :class="['w-12 h-12 rounded-lg flex items-center justify-center mr-4', getProviderBgClass(service.provider)]">
              <span :class="[getProviderIcon(service.provider), 'text-2xl', getProviderTextClass(service.provider)]"></span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ service.name }}</h3>
              <p class="text-sm text-gray-500">{{ getProviderLabel(service.provider) }}</p>
            </div>
          </div>
          <span :class="['status-badge', getStatusClass(service.status)]">
            {{ getStatusLabel(service.status) }}
          </span>
        </div>
        
        <div class="mt-4 pt-4 border-t">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">服务类型</span>
              <span class="font-medium text-gray-900">{{ service.serviceType }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">区域</span>
              <span class="font-medium text-gray-900">{{ service.region }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">实例数</span>
              <span class="font-medium text-gray-900">{{ service.instanceCount || 0 }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-4 pt-4 border-t space-x-2">
          <button class="text-blue-600 hover:text-blue-800 text-sm">详情</button>
          <button class="text-gray-600 hover:text-gray-800 text-sm">编辑</button>
        </div>
      </div>
      
      <div class="card" v-if="cloudServices.length === 0">
        <div class="text-center py-8 text-gray-500">
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { cloudServicesApi } from '@/api'

const cloudServices = ref([])

const fetchData = async () => {
  try {
    const response = await cloudServicesApi.getAll()
    cloudServices.value = response.data || []
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const handleAdd = () => {
  console.log('添加云服务')
}

const getProviderIcon = (provider) => {
  const icons = {
    aws: 'i-carbon-cloud',
    aliyun: 'i-carbon-cloud-service',
    tencent: 'i-carbon-cloud-app',
    azure: 'i-carbon-cloud-service-management'
  }
  return icons[provider] || 'i-carbon-cloud'
}

const getProviderBgClass = (provider) => {
  const classes = {
    aws: 'bg-orange-100',
    aliyun: 'bg-blue-100',
    tencent: 'bg-green-100',
    azure: 'bg-purple-100'
  }
  return classes[provider] || 'bg-gray-100'
}

const getProviderTextClass = (provider) => {
  const classes = {
    aws: 'text-orange-600',
    aliyun: 'text-blue-600',
    tencent: 'text-green-600',
    azure: 'text-purple-600'
  }
  return classes[provider] || 'text-gray-600'
}

const getProviderLabel = (provider) => {
  const labels = {
    aws: 'AWS',
    aliyun: '阿里云',
    tencent: '腾讯云',
    azure: 'Azure'
  }
  return labels[provider] || provider
}

const getStatusClass = (status) => {
  const classes = {
    running: 'status-success',
    stopped: 'status-secondary',
    error: 'status-danger'
  }
  return classes[status] || 'status-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    running: '运行中',
    stopped: '已停止',
    error: '错误'
  }
  return labels[status] || status
}

onMounted(() => {
  fetchData()
})
</script>
