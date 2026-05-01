<template>
  <div class="page-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">资产台账</h1>
      <div class="flex space-x-3">
        <select class="input w-48" v-model="filter.type">
          <option value="">全部类型</option>
          <option value="code_repo">代码仓库</option>
          <option value="api_doc">接口文档</option>
          <option value="design_resource">设计资源</option>
          <option value="test_case">测试用例</option>
          <option value="deployment">部署记录</option>
        </select>
        <button class="btn-primary" @click="handleGenerateReport">
          <span class="i-carbon-document-export mr-2"></span>
          导出报表
        </button>
      </div>
    </div>
    
    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4 font-medium text-gray-600">资产名称</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">类型</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">所有者</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">保密级别</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">创建时间</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in filteredAssets" :key="asset.id" class="border-b hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div :class="['w-8 h-8 rounded-lg flex items-center justify-center mr-3', getTypeBgClass(asset.assetType)]">
                    <span :class="[getTypeIcon(asset.assetType), getTypeTextClass(asset.assetType)]"></span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ asset.assetName }}</p>
                    <p class="text-sm text-gray-500">{{ asset.assetType }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="text-sm text-gray-600">{{ getTypeLabel(asset.assetType) }}</span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ asset.owner }}</td>
              <td class="py-3 px-4">
                <span :class="['status-badge', getSecurityClass(asset.securityLevel)]">
                  {{ getSecurityLabel(asset.securityLevel) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span :class="['status-badge', getStatusClass(asset.status)]">
                  {{ getStatusLabel(asset.status) }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ asset.createdAt }}</td>
              <td class="py-3 px-4">
                <button class="text-blue-600 hover:text-blue-800 text-sm">详情</button>
              </td>
            </tr>
            <tr v-if="filteredAssets.length === 0">
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
import { ref, computed, onMounted } from 'vue'
import { assetLedgerApi } from '@/api'

const assets = ref([])
const filter = ref({
  type: ''
})

const filteredAssets = computed(() => {
  if (!filter.value.type) {
    return assets.value
  }
  return assets.value.filter(a => a.assetType === filter.value.type)
})

const fetchData = async () => {
  try {
    const response = await assetLedgerApi.getAll()
    assets.value = response.data || []
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const handleGenerateReport = () => {
  console.log('生成报表')
}

const getTypeIcon = (type) => {
  const icons = {
    code_repo: 'i-carbon-code',
    api_doc: 'i-carbon-documentation',
    design_resource: 'i-carbon-image-mountain',
    test_case: 'i-carbon-checklist',
    deployment: 'i-carbon-deployment-inventory'
  }
  return icons[type] || 'i-carbon-file'
}

const getTypeBgClass = (type) => {
  const classes = {
    code_repo: 'bg-blue-100',
    api_doc: 'bg-green-100',
    design_resource: 'bg-purple-100',
    test_case: 'bg-yellow-100',
    deployment: 'bg-red-100'
  }
  return classes[type] || 'bg-gray-100'
}

const getTypeTextClass = (type) => {
  const classes = {
    code_repo: 'text-blue-600',
    api_doc: 'text-green-600',
    design_resource: 'text-purple-600',
    test_case: 'text-yellow-600',
    deployment: 'text-red-600'
  }
  return classes[type] || 'text-gray-600'
}

const getTypeLabel = (type) => {
  const labels = {
    code_repo: '代码仓库',
    api_doc: '接口文档',
    design_resource: '设计资源',
    test_case: '测试用例',
    deployment: '部署记录'
  }
  return labels[type] || type
}

const getSecurityClass = (level) => {
  const classes = {
    public: 'status-secondary',
    internal: 'status-info',
    confidential: 'status-warning',
    secret: 'status-danger'
  }
  return classes[level] || 'status-secondary'
}

const getSecurityLabel = (level) => {
  const labels = {
    public: '公开',
    internal: '内部',
    confidential: '机密',
    secret: '绝密'
  }
  return labels[level] || level
}

const getStatusClass = (status) => {
  const classes = {
    active: 'status-success',
    inactive: 'status-secondary',
    archived: 'status-warning'
  }
  return classes[status] || 'status-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    active: '活跃',
    inactive: '未激活',
    archived: '已归档'
  }
  return labels[status] || status
}

onMounted(() => {
  fetchData()
})
</script>
