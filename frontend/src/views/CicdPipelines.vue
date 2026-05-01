<template>
  <div class="page-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">CI/CD流水线</h1>
      <button class="btn-primary" @click="handleAdd">
        <span class="i-carbon-add mr-2"></span>
        新建流水线
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card" v-for="pipeline in pipelines" :key="pipeline.id">
        <div class="flex items-start justify-between">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span class="i-carbon-flow text-green-600 text-2xl"></span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ pipeline.name }}</h3>
              <p class="text-sm text-gray-500">{{ pipeline.project }}</p>
            </div>
          </div>
          <span :class="['status-badge', getStatusClass(pipeline.lastStatus)]">
            {{ getStatusLabel(pipeline.lastStatus) }}
          </span>
        </div>
        
        <div class="mt-4 pt-4 border-t">
          <div class="flex items-center justify-between text-sm">
            <div>
              <p class="text-gray-500">最后运行</p>
              <p class="font-medium text-gray-900 mt-1">{{ pipeline.lastRunAt || '-' }}</p>
            </div>
            <div class="text-right">
              <p class="text-gray-500">触发方式</p>
              <p class="font-medium text-gray-900 mt-1">{{ getTriggerLabel(pipeline.triggerType) }}</p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-4 pt-4 border-t space-x-2">
          <button class="btn-secondary text-sm" @click="handleRun(pipeline)">
            <span class="i-carbon-play mr-1"></span>
            运行
          </button>
          <button class="text-blue-600 hover:text-blue-800 text-sm py-2 px-3">
            查看
          </button>
        </div>
      </div>
      
      <div class="card" v-if="pipelines.length === 0">
        <div class="text-center py-8 text-gray-500">
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { cicdPipelinesApi } from '@/api'

const pipelines = ref([])

const fetchData = async () => {
  try {
    const response = await cicdPipelinesApi.getAll()
    pipelines.value = response.data || []
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const handleAdd = () => {
  console.log('添加流水线')
}

const handleRun = (pipeline) => {
  console.log('运行流水线:', pipeline)
}

const getStatusClass = (status) => {
  const classes = {
    success: 'status-success',
    failed: 'status-danger',
    running: 'status-info',
    pending: 'status-warning'
  }
  return classes[status] || 'status-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    success: '成功',
    failed: '失败',
    running: '运行中',
    pending: '等待中'
  }
  return labels[status] || status
}

const getTriggerLabel = (trigger) => {
  const labels = {
    manual: '手动触发',
    push: '代码推送',
    scheduled: '定时触发',
    webhook: 'Webhook'
  }
  return labels[trigger] || trigger
}

onMounted(() => {
  fetchData()
})
</script>
