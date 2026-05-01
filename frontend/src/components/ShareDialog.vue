<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          🔗 分享思维导图
        </h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 text-2xl">
          ✕
        </button>
      </div>
      
      <div class="space-y-6">
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div class="font-medium text-gray-800">公开分享</div>
            <div class="text-sm text-gray-500">开启后任何人都可以通过链接访问</div>
          </div>
          <button 
            @click="toggleShare"
            class="relative w-14 h-7 rounded-full transition-colors"
            :class="isPublic ? 'bg-blue-500' : 'bg-gray-300'"
          >
            <div 
              class="absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow"
              :class="isPublic ? 'translate-x-8' : 'translate-x-1'"
            ></div>
          </button>
        </div>
        
        <div v-if="isPublic && shareToken">
          <label class="block text-sm font-medium text-gray-700 mb-2">分享链接</label>
          <div class="flex gap-2">
            <input 
              :value="shareLink" 
              readonly
              class="flex-1 input bg-gray-50"
            />
            <button 
              @click="copyLink"
              class="btn btn-primary"
            >
              复制
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            将此链接发送给其他人，他们可以查看此思维导图
          </p>
        </div>
        
        <div v-if="loading" class="text-center text-gray-500">
          处理中...
        </div>
        
        <div class="pt-4 flex justify-end">
          <button @click="$emit('close')" class="btn btn-secondary">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  mindmapId: { type: String, required: true }
})

const emit = defineEmits(['close'])

const isPublic = ref(false)
const shareToken = ref(null)
const loading = ref(false)

const shareLink = computed(() => {
  if (!shareToken.value) return ''
  return `${window.location.origin}/share/${shareToken.value}`
})

const fetchShareStatus = async () => {
  try {
    loading.value = true
    const response = await axios.get(`/api/mindmaps/${props.mindmapId}`)
    isPublic.value = response.data.isPublic || false
    shareToken.value = response.data.shareToken || null
  } catch (error) {
    console.error('Failed to fetch share status:', error)
  } finally {
    loading.value = false
  }
}

const toggleShare = async () => {
  try {
    loading.value = true
    const newPublic = !isPublic.value
    const response = await axios.post(`/api/mindmaps/${props.mindmapId}/share`, {
      isPublic: newPublic
    })
    isPublic.value = response.data.isPublic
    shareToken.value = response.data.shareToken
  } catch (error) {
    console.error('Failed to toggle share:', error)
    alert('操作失败')
  } finally {
    loading.value = false
  }
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    alert('链接已复制到剪贴板！')
  } catch (error) {
    console.error('Failed to copy:', error)
    alert('复制失败，请手动复制')
  }
}

onMounted(() => {
  fetchShareStatus()
})
</script>
