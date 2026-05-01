<template>
  <div class="page-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">接口文档管理</h1>
      <button class="btn-primary" @click="handleAdd">
        <span class="i-carbon-add mr-2"></span>
        新建文档
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="card" v-for="doc in apiDocs" :key="doc.id">
        <div class="flex items-start justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <span class="i-carbon-documentation text-green-600"></span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ doc.name }}</h3>
              <p class="text-sm text-gray-500">{{ doc.type }}</p>
            </div>
          </div>
          <span :class="['status-badge', getStatusClass(doc.status)]">
            {{ getStatusLabel(doc.status) }}
          </span>
        </div>
        
        <p class="text-sm text-gray-600 mt-3">{{ doc.description }}</p>
        
        <div class="flex items-center justify-between mt-4 pt-4 border-t">
          <div class="text-sm text-gray-500">
            <span>版本: {{ doc.version }}</span>
            <span class="mx-2">|</span>
            <span>{{ doc.updatedAt }}</span>
          </div>
          <div class="flex space-x-2">
            <button class="text-blue-600 hover:text-blue-800 text-sm">查看</button>
            <button class="text-gray-600 hover:text-gray-800 text-sm">编辑</button>
          </div>
        </div>
      </div>
      
      <div class="card" v-if="apiDocs.length === 0">
        <div class="text-center py-8 text-gray-500">
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiDocsApi } from '@/api'

const apiDocs = ref([])

const fetchData = async () => {
  try {
    const response = await apiDocsApi.getAll()
    apiDocs.value = response.data || []
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const handleAdd = () => {
  console.log('添加文档')
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'status-warning',
    review: 'status-info',
    published: 'status-success',
    deprecated: 'status-secondary'
  }
  return classes[status] || 'status-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    draft: '草稿',
    review: '评审中',
    published: '已发布',
    deprecated: '已废弃'
  }
  return labels[status] || status
}

onMounted(() => {
  fetchData()
})
</script>
