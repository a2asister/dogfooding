<template>
  <div class="page-container">
    <h1 class="page-title">仪表盘</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card" v-for="stat in stats" :key="stat.title">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ stat.title }}</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
            <p class="text-xs text-green-600 mt-1" v-if="stat.trend">
              <span class="i-carbon-arrow-up mr-1"></span>
              {{ stat.trend }}
            </p>
          </div>
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', stat.bgColor]">
            <span :class="[stat.icon, 'text-2xl', stat.iconColor]"></span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">最近部署</h3>
        <div class="space-y-3">
          <div v-for="deployment in recentDeployments" :key="deployment.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span class="i-carbon-deployment-inventory text-blue-600"></span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ deployment.application }}</p>
                <p class="text-sm text-gray-500">{{ deployment.version }}</p>
              </div>
            </div>
            <div class="text-right">
              <span :class="['status-badge', getStatusClass(deployment.status)]">
                {{ getStatusLabel(deployment.status) }}
              </span>
              <p class="text-xs text-gray-500 mt-1">{{ deployment.deployedAt }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">系统概览</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <span class="i-carbon-server mr-3 text-blue-600"></span>
              <span class="text-gray-700">Git集成</span>
            </div>
            <span class="text-sm font-medium text-gray-900">4 个已配置</span>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <span class="i-carbon-flow mr-3 text-green-600"></span>
              <span class="text-gray-700">CI/CD流水线</span>
            </div>
            <span class="text-sm font-medium text-gray-900">4 个已配置</span>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <span class="i-carbon-cloud-app mr-3 text-purple-600"></span>
              <span class="text-gray-700">云服务</span>
            </div>
            <span class="text-sm font-medium text-gray-900">4 个已配置</span>
          </div>
          
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <span class="i-carbon-ledger mr-3 text-orange-600"></span>
              <span class="text-gray-700">资产台账</span>
            </div>
            <span class="text-sm font-medium text-gray-900">14 条记录</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">资产分类统计</h3>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <span class="i-carbon-code text-3xl text-blue-600"></span>
          <p class="mt-2 text-2xl font-bold text-gray-900">4</p>
          <p class="text-sm text-gray-600">代码仓库</p>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <span class="i-carbon-documentation text-3xl text-green-600"></span>
          <p class="mt-2 text-2xl font-bold text-gray-900">3</p>
          <p class="text-sm text-gray-600">接口文档</p>
        </div>
        <div class="text-center p-4 bg-purple-50 rounded-lg">
          <span class="i-carbon-image-mountain text-3xl text-purple-600"></span>
          <p class="mt-2 text-2xl font-bold text-gray-900">3</p>
          <p class="text-sm text-gray-600">设计资源</p>
        </div>
        <div class="text-center p-4 bg-yellow-50 rounded-lg">
          <span class="i-carbon-checklist text-3xl text-yellow-600"></span>
          <p class="mt-2 text-2xl font-bold text-gray-900">4</p>
          <p class="text-sm text-gray-600">测试用例</p>
        </div>
        <div class="text-center p-4 bg-red-50 rounded-lg">
          <span class="i-carbon-deployment-inventory text-3xl text-red-600"></span>
          <p class="mt-2 text-2xl font-bold text-gray-900">4</p>
          <p class="text-sm text-gray-600">部署记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  { title: '代码仓库', value: '4', trend: '+1 本月', icon: 'i-carbon-code', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
  { title: '接口文档', value: '3', trend: '无变化', icon: 'i-carbon-documentation', bgColor: 'bg-green-100', iconColor: 'text-green-600' },
  { title: '测试用例', value: '4', trend: '+2 本月', icon: 'i-carbon-checklist', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  { title: '部署次数', value: '4', trend: '+3 本月', icon: 'i-carbon-deployment-inventory', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' }
])

const recentDeployments = ref([
  { id: 1, application: '用户服务', version: 'v2.1.0', status: 'success', deployedAt: '2024-01-15 14:30' },
  { id: 2, application: '订单服务', version: 'v1.8.0', status: 'running', deployedAt: '2024-01-15 14:25' },
  { id: 3, application: '支付服务', version: 'v3.2.0', status: 'success', deployedAt: '2024-01-15 12:15' },
  { id: 4, application: '商品服务', version: 'v1.5.0', status: 'failed', deployedAt: '2024-01-14 18:45' }
])

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
    running: '进行中',
    pending: '待部署'
  }
  return labels[status] || status
}
</script>
