<template>
  <div class="page-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">设计资源管理</h1>
      <button class="btn-primary" @click="handleAdd">
        <span class="i-carbon-add mr-2"></span>
        上传资源
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="card" v-for="resource in resources" :key="resource.id">
        <div class="h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <span :class="[getIcon(resource.type), 'text-4xl text-gray-400']"></span>
        </div>
        
        <h3 class="font-semibold text-gray-900">{{ resource.name }}</h3>
        <p class="text-sm text-gray-500 mt-1">{{ resource.project }}</p>
        
        <div class="flex items-center justify-between mt-4 pt-4 border-t">
          <div class="flex items-center text-sm text-gray-500">
            <span class="i-carbon-calendar mr-1"></span>
            {{ resource.lastUpdatedAt }}
          </div>
          <div class="flex space-x-2">
            <button class="text-blue-600 hover:text-blue-800 text-sm">预览</button>
            <button class="text-gray-600 hover:text-gray-800 text-sm">编辑</button>
          </div>
        </div>
      </div>
      
      <div class="card" v-if="resources.length === 0">
        <div class="text-center py-8 text-gray-500">
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { designResourcesApi } from '@/api'

const resources = ref([])

const fetchData = async () => {
  try {
    const response = await designResourcesApi.getAll()
    resources.value = response.data || []
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const handleAdd = () => {
  console.log('添加资源')
}

const getIcon = (type) => {
  const icons = {
    figma: 'i-carbon-figma',
    sketch: 'i-carbon-image-mountain',
    image: 'i-carbon-image',
    vector: 'i-carbon-graphic-studio',
    other: 'i-carbon-file'
  }
  return icons[type] || 'i-carbon-file'
}

onMounted(() => {
  fetchData()
})
</script>
