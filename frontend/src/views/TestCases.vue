<template>
  <div class="page-container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">测试用例管理</h1>
      <button class="btn-primary" @click="handleAdd">
        <span class="i-carbon-add mr-2"></span>
        新建用例
      </button>
    </div>
    
    <div class="card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-3 px-4 font-medium text-gray-600">用例名称</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">模块</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">优先级</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">执行结果</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="testCase in testCases" :key="testCase.id" class="border-b hover:bg-gray-50">
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <span class="i-carbon-checklist text-yellow-600"></span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ testCase.name }}</p>
                    <p class="text-sm text-gray-500">{{ testCase.testType }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ testCase.module }}</td>
              <td class="py-3 px-4">
                <span :class="['status-badge', getPriorityClass(testCase.priority)]">
                  {{ getPriorityLabel(testCase.priority) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span :class="['status-badge', getStatusClass(testCase.status)]">
                  {{ getStatusLabel(testCase.status) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span v-if="testCase.lastResult" :class="['status-badge', getResultClass(testCase.lastResult)]">
                  {{ getResultLabel(testCase.lastResult) }}
                </span>
                <span v-else class="text-sm text-gray-500">-</span>
              </td>
              <td class="py-3 px-4">
                <div class="flex space-x-2">
                  <button class="text-blue-600 hover:text-blue-800 text-sm">执行</button>
                  <button class="text-gray-600 hover:text-gray-800 text-sm">编辑</button>
                </div>
              </td>
            </tr>
            <tr v-if="testCases.length === 0">
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
import { testCasesApi } from '@/api'

const testCases = ref([])

const fetchData = async () => {
  try {
    const response = await testCasesApi.getAll()
    testCases.value = response.data || []
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const handleAdd = () => {
  console.log('添加测试用例')
}

const getPriorityClass = (priority) => {
  const classes = {
    critical: 'status-danger',
    high: 'status-warning',
    medium: 'status-info',
    low: 'status-secondary'
  }
  return classes[priority] || 'status-secondary'
}

const getPriorityLabel = (priority) => {
  const labels = {
    critical: '致命',
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

const getStatusClass = (status) => {
  const classes = {
    draft: 'status-secondary',
    ready: 'status-info',
    running: 'status-warning',
    completed: 'status-success'
  }
  return classes[status] || 'status-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    draft: '草稿',
    ready: '就绪',
    running: '运行中',
    completed: '已完成'
  }
  return labels[status] || status
}

const getResultClass = (result) => {
  const classes = {
    pass: 'status-success',
    fail: 'status-danger',
    skip: 'status-warning',
    blocked: 'status-info'
  }
  return classes[result] || 'status-secondary'
}

const getResultLabel = (result) => {
  const labels = {
    pass: '通过',
    fail: '失败',
    skip: '跳过',
    blocked: '阻塞'
  }
  return labels[result] || result
}

onMounted(() => {
  fetchData()
})
</script>
