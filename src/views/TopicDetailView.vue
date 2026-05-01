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

    <div v-if="topic" class="card">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ topic.title }}</h1>
          <div class="flex items-center gap-4">
            <span class="px-3 py-1 text-sm rounded-full"
              :class="topic.status === 'open' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'">
              {{ topic.status === 'open' ? '进行中' : '已解决' }}
            </span>
            <span class="text-sm text-gray-500">创建于 {{ formatDate(topic.createdAt) }}</span>
          </div>
        </div>
        <button v-if="topic.status === 'open' && currentUser.permissions.canResolve" 
          @click="showResolveModal = true" 
          class="btn-primary">
          提交决议
        </button>
      </div>

      <div class="prose max-w-none mb-6">
        <p class="text-gray-700 whitespace-pre-wrap">{{ topic.description }}</p>
      </div>

      <div class="border-t pt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          时序讨论 ({{ topic.discussions?.length || 0 }})
        </h2>

        <div class="space-y-4 mb-6">
          <div v-for="discussion in topic.discussions" :key="discussion.id" 
            class="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white font-medium">{{ discussion.userId?.charAt(0) || 'U' }}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium text-gray-900">{{ discussion.userId }}</span>
                <span class="text-sm text-gray-500">{{ formatDate(discussion.createdAt) }}</span>
              </div>
              <p class="text-gray-700">{{ discussion.content }}</p>
            </div>
          </div>

          <div v-if="!topic.discussions?.length" class="text-center py-8 text-gray-500">
            暂无讨论，快来发起第一条讨论吧！
          </div>
        </div>

        <form @submit.prevent="addDiscussion" class="space-y-3">
          <textarea v-model="newDiscussion.content" rows="3" 
            class="input" placeholder="输入您的讨论内容..."></textarea>
          <div class="flex justify-end">
            <button type="submit" class="btn-primary" :disabled="!newDiscussion.content.trim()">
              发表讨论
            </button>
          </div>
        </form>
      </div>

      <div v-if="topic.resolutions?.length > 0" class="border-t mt-6 pt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          决议归档
        </h2>

        <div v-for="resolution in topic.resolutions" :key="resolution.id" 
          class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">已归档</span>
            <span class="text-sm text-gray-500">{{ formatDate(resolution.createdAt) }}</span>
          </div>
          <p class="text-gray-800">{{ resolution.content }}</p>
        </div>
      </div>
    </div>

    <div v-if="showResolveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showResolveModal = false">
      <div class="card w-full max-w-lg mx-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">提交决议</h2>
          <button @click="showResolveModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitResolution">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">决议内容</label>
            <textarea v-model="newResolution.content" rows="4" required class="input" placeholder="请详细描述决议内容..."></textarea>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="showResolveModal = false" class="btn-secondary">取消</button>
            <button type="submit" class="btn-primary bg-green-500 hover:bg-green-600">提交决议</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores'
import { storeToRefs } from 'pinia'

const route = useRoute()
const store = useAppStore()
const { currentUser } = storeToRefs(store)

const topic = ref(null)
const showResolveModal = ref(false)
const newDiscussion = ref({ content: '' })
const newResolution = ref({ content: '' })

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

async function fetchTopic() {
  try {
    const response = await fetch(`/api/topics/${route.params.id}`)
    topic.value = await response.json()
  } catch (error) {
    console.error('获取议题失败:', error)
  }
}

async function addDiscussion() {
  try {
    await fetch(`/api/topics/${route.params.id}/discussions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.value.id,
        content: newDiscussion.value.content
      })
    })
    newDiscussion.value.content = ''
    fetchTopic()
  } catch (error) {
    console.error('添加讨论失败:', error)
  }
}

async function submitResolution() {
  try {
    await fetch(`/api/topics/${route.params.id}/resolutions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.value.id,
        content: newResolution.value.content
      })
    })
    showResolveModal.value = false
    newResolution.value.content = ''
    fetchTopic()
  } catch (error) {
    console.error('提交决议失败:', error)
  }
}

onMounted(() => {
  fetchTopic()
})
</script>
