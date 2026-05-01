<template>
  <div class="page-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">代码仓库管理</h1>
      <button class="btn-primary" @click="handleAdd">
        <span class="i-carbon-add mr-2"></span>
        新建仓库
      </button>
    </div>
    
    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4 font-medium text-gray-600">仓库名称</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">URL</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">类型</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">最后同步</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="repo in repositories" :key="repo.id" class="border-b hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span class="i-carbon-code text-blue-600"></span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ repo.name }}</p>
                    <p class="text-sm text-gray-500">{{ repo.owner }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ repo.url }}</td>
              <td class="py-3 px-4">
                <span class="text-sm text-gray-600">{{ repo.type }}</span>
              </td>
              <td class="py-3 px-4">
                <span :class="['status-badge', getStatusClass(repo.status)]">
                  {{ getStatusLabel(repo.status) }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ repo.lastSyncedAt || '-' }}</td>
              <td class="py-3 px-4">
                <div class="flex space-x-2">
                  <button class="text-blue-600 hover:text-blue-800 text-sm" @click="handleEdit(repo)">
                    编辑
                  </button>
                  <button class="text-red-600 hover:text-red-800 text-sm" @click="handleDelete(repo)">
                    删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="repositories.length === 0">
              <td colspan="6" class="py-8 text-center text-gray-500">
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
import { codeReposApi } from '@/api'

const repositories = ref([])

const fetchData = async () => {
  try {
    const response = await codeReposApi.getAll()
    repositories.value = response.data || []
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const handleAdd = () => {
  console.log('添加仓库')
}

const handleEdit = (repo) => {
  console.log('编辑仓库:', repo)
}

const handleDelete = (repo) => {
  if (confirm(`确定要删除仓库 "${repo.name}" 吗？`)) {
    console.log('删除仓库:', repo)
  }
}

const getStatusClass = (status) => {
  const classes = {
    active: 'status-success',
    inactive: 'status-secondary',
    syncing: 'status-info',
    error: 'status-danger'
  }
  return classes[status] || 'status-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    active: '活跃',
    inactive: '未激活',
    syncing: '同步中',
    error: '错误'
  }
  return labels[status] || status
}

onMounted(() => {
  fetchData()
})
</script>
