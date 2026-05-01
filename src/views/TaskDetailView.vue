<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <button @click="$router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>
    </div>

    <div v-if="task" class="card">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ task.title }}</h1>
          <div class="flex items-center gap-4">
            <span class="px-3 py-1 text-sm rounded-full"
              :class="statusClass(task.status)">
              {{ statusLabel(task.status) }}
            </span>
            <span class="text-sm text-gray-500">创建于 {{ formatDate(task.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="prose max-w-none mb-6">
        <p class="text-gray-700 whitespace-pre-wrap">{{ task.description || '暂无描述' }}</p>
      </div>

      <div class="border-t pt-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            子任务列表
          </h2>
          <select v-model="task.status" @change="updateTaskStatus" class="input w-auto">
            <option value="pending">待处理</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>

        <div v-if="task.subtasks?.length > 0" class="space-y-3">
          <div v-for="subtask in task.subtasks" :key="subtask.id"
            class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <input type="checkbox" 
              :checked="subtask.status === 'completed'"
              @change="toggleSubtask(subtask)"
              class="w-5 h-5 text-blue-600 rounded cursor-pointer">
            <div class="flex-1">
              <span :class="{ 'line-through text-gray-400': subtask.status === 'completed', 'text-gray-900': subtask.status !== 'completed' }">
                {{ subtask.title }}
              </span>
            </div>
            <span class="text-xs text-gray-500">{{ formatDate(subtask.createdAt) }}</span>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          暂无子任务，创建任务时启用自动拆分功能可智能生成子任务
        </div>

        <div v-if="task.subtasks?.length > 0" class="mt-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">完成进度</span>
            <span class="text-sm font-medium text-gray-900">
              {{ completedSubtasks }}/{{ task.subtasks.length }} ({{ progressPercent }}%)
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-blue-500 h-3 rounded-full transition-all duration-300"
              :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const task = ref(null)

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

function statusLabel(status) {
  const labels = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成'
  }
  return labels[status] || status
}

function statusClass(status) {
  const classes = {
    'pending': 'bg-gray-100 text-gray-700',
    'in_progress': 'bg-blue-100 text-blue-700',
    'completed': 'bg-green-100 text-green-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const completedSubtasks = computed(() => {
  if (!task.value?.subtasks) return 0
  return task.value.subtasks.filter(s => s.status === 'completed').length
})

const progressPercent = computed(() => {
  if (!task.value?.subtasks?.length) return 0
  return Math.round((completedSubtasks.value / task.value.subtasks.length) * 100)
})

async function fetchTask() {
  try {
    const response = await fetch(`/api/tasks/${route.params.id}`)
    task.value = await response.json()
  } catch (error) {
    console.error('获取任务失败:', error)
  }
}

async function updateTaskStatus() {
  try {
    await fetch(`/api/tasks/${route.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: task.value.status })
    })
  } catch (error) {
    console.error('更新任务状态失败:', error)
  }
}

async function toggleSubtask(subtask) {
  const newStatus = subtask.status === 'completed' ? 'pending' : 'completed'
  try {
    await fetch(`/api/tasks/${route.params.id}/subtasks/${subtask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    subtask.status = newStatus
  } catch (error) {
    console.error('更新子任务状态失败:', error)
  }
}

onMounted(() => {
  fetchTask()
})
</script>
