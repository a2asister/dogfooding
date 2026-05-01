<template>
  <div class="page-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">部署记录</h1>
      <button class="btn-primary" @click="handleNewDeployment">
        <span class="i-carbon-deployment-inventory mr-2"></span>
        新建部署
      </button>
    </div>
    
    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4 font-medium text-gray-600">应用</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">版本</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">环境</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">部署人</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">部署时间</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="deployment in deployments" :key="deployment.id" class="border-b hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span class="i-carbon-deployment-inventory text-purple-600"></span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ deployment.application }}</p>
                    <p class="text-sm text-gray-500">{{ deployment.commitHash }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ deployment.version }}</td>
              <td class="py-3 px-4">
                <span :class="['status-badge', getEnvironmentClass(deployment.environment)]">
                  {{ deployment.environment }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span :class="['status-badge', getStatusClass(deployment.status)]">
                  {{ getStatusLabel(deployment.status) }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ deployment.deployedBy }}</td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ deployment.deployedAt }}</td>
              <td class="py-3 px-4">
                <div class="flex space-x-2">
                  <button class="text-blue-600 hover:text-blue-800 text-sm">详情</button>
                  <button class="text-green-600 hover:text-green-800 text-sm">回滚</button>
                </div>
              </td>
            </tr>
            <tr v-if="deployments.length === 0">
              <td colspan="7" class="py-8 text-center text-gray-500">
                暂无数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { deploymentsApi } from '@/api'

const deployments = ref([])

const fetchData = async () => {
  try {
    const response = await deploymentsApi.getAll()
    deployments.value = response.data || []
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const handleNewDeployment = () => {
  console.log('新建部署')
}

const getEnvironmentClass = (env) => {
  const classes = {
    production: 'status-danger',
    staging: 'status-warning',
    development: 'status-info'
  }
  return classes[env] || 'status-secondary'
}

const getStatusClass = (status) => {
  const classes = {
    success: 'status-success',
    failed: 'status-danger',
    running: 'status-info',
    pending: 'status-warning',
    rolledback: 'status-secondary'
  }
  return classes[status] || 'status-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    success: '成功',
    failed: '失败',
    running: '进行中',
    pending: '待部署',
    rolledback: '已回滚'
  }
  return labels[status] || status
}

onMounted(() => {
  fetchData()
})
</script>
