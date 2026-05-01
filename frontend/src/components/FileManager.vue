<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          📁 文件管理
        </h2>
        <div class="flex gap-2">
          <button @click="$emit('new')" class="btn btn-primary flex items-center gap-1">
            ➕ 新建
          </button>
          <button @click="$emit('close')" class="btn btn-secondary">
            ✕ 关闭
          </button>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="loading" class="flex items-center justify-center h-40">
          <div class="text-gray-500">加载中...</div>
        </div>
        
        <div v-else-if="mindmaps.length === 0" class="flex flex-col items-center justify-center h-40">
          <div class="text-4xl mb-2">📭</div>
          <div class="text-gray-500">暂无文件，点击上方按钮创建新的思维导图</div>
        </div>
        
        <div v-else class="grid gap-4">
          <div 
            v-for="mindmap in mindmaps" 
            :key="mindmap.id"
            class="card flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer"
            @click="loadMindmap(mindmap.id)"
          >
            <div class="flex-1">
              <h3 class="font-semibold text-gray-800 text-lg">{{ mindmap.title }}</h3>
              <div class="flex gap-4 mt-2 text-sm text-gray-500">
                <span>📅 创建: {{ formatDate(mindmap.createdAt) }}</span>
                <span>🔄 更新: {{ formatDate(mindmap.updatedAt) }}</span>
                <span v-if="mindmap.isPublic" class="text-green-600">🔗 已分享</span>
              </div>
            </div>
            <div class="flex gap-2 ml-4">
              <button 
                @click.stop="loadMindmap(mindmap.id)" 
                class="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                打开
              </button>
              <button 
                @click.stop="confirmDelete(mindmap)" 
                class="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div 
      v-if="showDeleteConfirm" 
      class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center"
      @click.self="showDeleteConfirm = false"
    >
      <div class="bg-white rounded-xl p-6 max-w-md">
        <h3 class="text-lg font-bold text-gray-800 mb-2">确认删除</h3>
        <p class="text-gray-600 mb-4">确定要删除 "{{ mindmapToDelete?.title }}" 吗？此操作不可撤销。</p>
        <div class="flex gap-3 justify-end">
          <button @click="showDeleteConfirm = false" class="btn btn-secondary">取消</button>
          <button @click="deleteMindmap" class="btn btn-danger">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const emit = defineEmits(['close', 'load', 'new'])

const mindmaps = ref([])
const loading = ref(true)
const showDeleteConfirm = ref(false)
const mindmapToDelete = ref(null)

const fetchMindmaps = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/mindmaps')
    mindmaps.value = response.data
  } catch (error) {
    console.error('Failed to fetch mindmaps:', error)
  } finally {
    loading.value = false
  }
}

const loadMindmap = (id) => {
  emit('load', id)
}

const confirmDelete = (mindmap) => {
  mindmapToDelete.value = mindmap
  showDeleteConfirm.value = true
}

const deleteMindmap = async () => {
  if (!mindmapToDelete.value) return
  
  try {
    await axios.delete(`/api/mindmaps/${mindmapToDelete.value.id}`)
    await fetchMindmaps()
  } catch (error) {
    console.error('Failed to delete mindmap:', error)
    alert('删除失败')
  } finally {
    showDeleteConfirm.value = false
    mindmapToDelete.value = null
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchMindmaps()
})
</script>
