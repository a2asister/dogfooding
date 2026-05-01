<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">任务管理</h1>
      <button @click="showCreateModal = true" class="btn-primary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        创建新任务
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">待处理</h3>
          <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
            {{ pendingTasks.length }}
          </span>
        </div>
        <div class="space-y-3">
          <div v-for="task in pendingTasks" :key="task.id"
            class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            @click="$router.push(`/tasks/${task.id}`)">
            <h4 class="font-medium text-gray-900 mb-1">{{ task.title }}</h4>
            <p class="text-sm text-gray-500 line-clamp-1">{{ task.description }}</p>
            <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <span>{{ task.subtasks?.length || 0 }} 个子任务</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">进行中</h3>
          <span class="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
            {{ inProgressTasks.length }}
          </span>
        </div>
        <div class="space-y-3">
          <div v-for="task in inProgressTasks" :key="task.id"
            class="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            @click="$router.push(`/tasks/${task.id}`)">
            <h4 class="font-medium text-gray-900 mb-1">{{ task.title }}</h4>
            <p class="text-sm text-gray-500 line-clamp-1">{{ task.description }}</p>
            <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <span>{{ completedSubtasksCount(task) }}/{{ task.subtasks?.length || 0 }} 子任务</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">已完成</h3>
          <span class="px-2 py-1 bg-green-100 text-green-600 text-sm rounded-full">
            {{ completedTasks.length }}
          </span>
        </div>
        <div class="space-y-3">
          <div v-for="task in completedTasks" :key="task.id"
            class="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
            @click="$router.push(`/tasks/${task.id}`)">
            <h4 class="font-medium text-gray-900 mb-1 line-through">{{ task.title }}</h4>
            <p class="text-sm text-gray-500 line-clamp-1">{{ task.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="card w-full max-w-lg mx-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">创建新任务</h2>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createTask">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
              <input v-model="newTask.title" type="text" required class="input" placeholder="请输入任务标题">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
              <textarea v-model="newTask.description" rows="3" class="input" placeholder="请详细描述任务内容..."></textarea>
            </div>
            <div class="flex items-center gap-3">
              <input type="checkbox" v-model="newTask.autoSplit" id="autoSplit" class="w-4 h-4 text-blue-600 rounded">
              <label for="autoSplit" class="text-sm text-gray-700">
                启用智能自动拆分子任务（基于关键词）
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">取消</button>
            <button type="submit" class="btn-primary">创建任务</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores'
import { storeToRefs } from 'pinia'

const store = useAppStore()
const { tasks } = storeToRefs(store)

const showCreateModal = ref(false)
const newTask = ref({
  title: '',
  description: '',
  autoSplit: true
})

const pendingTasks = computed(() => 
  tasks.value.filter(t => t.status === 'pending')
)

const inProgressTasks = computed(() => 
  tasks.value.filter(t => t.status === 'in_progress')
)

const completedTasks = computed(() => 
  tasks.value.filter(t => t.status === 'completed')
)

function completedSubtasksCount(task) {
  if (!task.subtasks) return 0
  return task.subtasks.filter(s => s.status === 'completed').length
}

async function createTask() {
  await store.createTask({
    title: newTask.value.title,
    description: newTask.value.description,
    assigneeId: store.currentUser.id,
    autoSplit: newTask.value.autoSplit
  })
  showCreateModal.value = false
  newTask.value = { title: '', description: '', autoSplit: true }
}

onMounted(() => {
  store.fetchTasks()
})
</script>
