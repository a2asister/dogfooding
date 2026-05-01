<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">议题管理</h1>
      <button @click="showCreateModal = true" class="btn-primary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        发起新议题
      </button>
    </div>

    <div class="flex gap-4 flex-wrap">
      <button v-for="filter in filters" :key="filter.value" @click="currentFilter = filter.value"
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="currentFilter === filter.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
        {{ filter.label }}
      </button>
    </div>

    <div class="space-y-4">
      <div v-for="topic in filteredTopics" :key="topic.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="$router.push(`/topics/${topic.id}`)">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">{{ topic.title }}</h3>
              <span class="px-2 py-1 text-xs rounded-full"
                :class="topic.status === 'open' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'">
                {{ topic.status === 'open' ? '进行中' : '已解决' }}
              </span>
            </div>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ topic.description }}</p>
            <div class="flex items-center gap-6 text-sm text-gray-500">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {{ topic.discussions?.length || 0 }} 条讨论
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ topic.resolutions?.length || 0 }} 个决议
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatDate(topic.createdAt) }}
              </span>
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <div v-if="filteredTopics.length === 0" class="card text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <p class="text-gray-500">暂无议题</p>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="card w-full max-w-lg mx-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">发起新议题</h2>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createTopic">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">议题标题</label>
              <input v-model="newTopic.title" type="text" required class="input" placeholder="请输入议题标题">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">议题描述</label>
              <textarea v-model="newTopic.description" rows="4" required class="input" placeholder="请详细描述议题内容..."></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">取消</button>
            <button type="submit" class="btn-primary">发起议题</button>
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
const { topics } = storeToRefs(store)

const showCreateModal = ref(false)
const currentFilter = ref('all')
const newTopic = ref({
  title: '',
  description: ''
})

const filters = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'open' },
  { label: '已解决', value: 'resolved' }
]

const filteredTopics = computed(() => {
  if (currentFilter.value === 'all') {
    return topics.value
  }
  return topics.value.filter(t => t.status === currentFilter.value)
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

async function createTopic() {
  await store.createTopic(newTopic.value)
  showCreateModal.value = false
  newTopic.value = { title: '', description: '' }
}

onMounted(() => {
  store.fetchTopics()
})
</script>
