<template>
  <div class="w-full h-full flex items-center justify-center p-8">
    <div 
      class="relative w-full max-w-md h-[600px] rounded-2xl shadow-floating glass-panel overflow-hidden"
    >
      <transition name="fade">
        <div 
          v-if="showCopied"
          class="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/90 text-white text-sm shadow-lg"
        >
          <svg class="w-4 h-4 checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>已复制</span>
        </div>
      </transition>

      <div class="h-full flex flex-col">
        <div class="flex-none p-4 pb-2">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-lg font-medium text-gray-700 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="8" y="3" width="8" height="18" rx="2" stroke-width="2"/>
                <rect x="3" y="8" width="18" height="8" rx="2" stroke-width="2"/>
              </svg>
              剪贴板助手
            </h1>
            <div class="flex items-center gap-2">
              <button 
                @click="manualRefreshClipboard"
                class="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-all"
                title="读取剪贴板"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                刷新
              </button>
              <button 
                @click="handleClearAll"
                class="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                清空
              </button>
            </div>
          </div>

          <div class="relative mb-4">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke-width="2"/>
              <path stroke-linecap="round" stroke-width="2" d="M21 21l-4.35-4.35"/>
            </svg>
            <input 
              v-model="searchKeyword"
              type="text"
              placeholder="搜索剪贴记录..."
              class="w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 rounded-xl border border-gray-200/50 focus:outline-none focus:border-gray-300 focus:bg-white/80 transition-all"
              @input="handleSearch"
            />
            <transition name="fade">
              <button 
                v-if="searchKeyword"
                @click="clearSearch"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </transition>
          </div>

          <div class="flex gap-2">
            <button 
              v-for="cat in categories" 
              :key="cat.type"
              @click="selectedCategory = cat.type"
              :class="[
                'px-3 py-1.5 text-xs rounded-lg transition-all duration-200',
                selectedCategory === cat.type 
                  ? cat.activeClass 
                  : 'bg-gray-100/50 text-gray-500 hover:bg-gray-100'
              ]"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-4 pb-4">
          <transition-group name="slide-up" tag="div" class="space-y-2">
            <div 
              v-for="(item, index) in displayItems" 
              :key="item.id"
              :class="[
                'group relative p-3 rounded-xl bg-white/40 hover:bg-white/70 card-hover border border-transparent hover:border-gray-200/50 cursor-pointer',
                `type-${item.type}`,
                item.pinned ? 'ring-1 ring-amber-200 bg-amber-50/30' : ''
              ]"
              :style="{ animationDelay: `${index * 30}ms` }"
              @click="copyToClipboard(item)"
              @mouseenter="hoveredItem = item.id"
              @mouseleave="hoveredItem = null"
            >
              <div v-if="item.pinned" class="absolute top-2 left-2">
                <svg class="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                </svg>
              </div>

              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span :class="['text-xs px-2 py-0.5 rounded-full', `type-badge-${item.type}`]">
                    {{ getTypeLabel(item.type) }}
                  </span>
                  <span class="text-xs text-gray-400">{{ formatTime(item.createdAt) }}</span>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    @click.stop="togglePin(item)"
                    class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    :class="item.pinned ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'"
                  >
                    <svg class="w-4 h-4" :fill="item.pinned ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                    </svg>
                  </button>
                  <button 
                    @click.stop="deleteItem(item)"
                    class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="pl-1">
                <template v-if="item.type === 'image'">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img v-if="isValidImageContent(item.content)" :src="item.content" class="w-full h-full object-cover" alt=""/>
                      <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path stroke-width="2" d="M21 15l-5-5L5 21"/>
                      </svg>
                    </div>
                    <span class="text-sm text-gray-500 truncate">图片内容</span>
                  </div>
                </template>
                <template v-else-if="item.type === 'link'">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-link flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                    <a 
                      :href="item.content" 
                      target="_blank" 
                      class="text-sm text-link hover:underline truncate"
                      @click.stop
                    >
                      {{ item.content }}
                    </a>
                  </div>
                </template>
                <template v-else>
                  <p class="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {{ truncateText(item.content, 150) }}
                  </p>
                </template>
              </div>

              <transition name="fade">
                <div 
                  v-if="hoveredItem === item.id"
                  class="absolute inset-0 rounded-xl bg-gray-50/50 flex items-center justify-center pointer-events-none"
                >
                  <span class="text-xs text-gray-400 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                    点击复制
                  </span>
                </div>
              </transition>
            </div>
          </transition-group>

          <transition name="fade">
            <div v-if="!loading && displayItems.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="8" y="3" width="8" height="18" rx="2" stroke-width="1.5"/>
                <rect x="3" y="8" width="18" height="8" rx="2" stroke-width="1.5"/>
              </svg>
              <p class="text-sm">暂无剪贴记录</p>
              <p class="text-xs mt-1 text-gray-300">复制内容后会自动保存</p>
            </div>
          </transition>

          <transition name="fade">
            <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-gray-400">
              <div class="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mb-4"></div>
              <p class="text-sm">加载中...</p>
            </div>
          </transition>
        </div>

        <div class="flex-none px-4 py-3 border-t border-gray-100/50 bg-white/30">
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-green-400"></span>
              服务运行中
            </span>
            <span>{{ items.length }} 条记录</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { clipboardApi } from './utils/api'

const items = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('all')
const hoveredItem = ref(null)
const showCopied = ref(false)

let searchTimer = null

const categories = [
  { type: 'all', label: '全部', activeClass: 'bg-gray-700 text-white' },
  { type: 'text', label: '文本', activeClass: 'bg-gray-500 text-white' },
  { type: 'link', label: '链接', activeClass: 'bg-blue-500 text-white' },
  { type: 'image', label: '图片', activeClass: 'bg-amber-500 text-white' }
]

const displayItems = computed(() => {
  let filtered = [...items.value]
  
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(item => item.type === selectedCategory.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.content.toLowerCase().includes(keyword)
    )
  }
  
  return filtered
})

async function loadItems() {
  try {
    const result = await clipboardApi.getItems()
    if (result.success) {
      items.value = result.data
    }
  } catch (error) {
    console.error('加载失败:', error)
  }
}

function handleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    if (searchKeyword.value) {
      loading.value = true
      try {
        const result = await clipboardApi.search(searchKeyword.value, selectedCategory.value === 'all' ? null : selectedCategory.value)
        if (result.success) {
          items.value = result.data
        }
      } catch (error) {
        console.error('搜索失败:', error)
      } finally {
        loading.value = false
      }
    } else {
      loadItems()
    }
  }, 200)
}

function clearSearch() {
  searchKeyword.value = ''
  loadItems()
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function readClipboard() {
  try {
    if (navigator.clipboard && navigator.clipboard.read) {
      const clipboardItems = await navigator.clipboard.read()
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            const base64 = await blobToBase64(blob)
            const existing = items.value.find(i => i.content === base64)
            if (!existing) {
              await clipboardApi.addItem(base64)
              await loadItems()
            }
            return
          }
        }
      }
    }
    
    const text = await navigator.clipboard.readText()
    if (text && text.trim()) {
      const existing = items.value.find(item => item.content === text.trim())
      if (!existing) {
        await clipboardApi.addItem(text)
        await loadItems()
      }
    }
  } catch (error) {
    console.warn('读取剪贴板失败:', error.message)
  }
}

async function manualRefreshClipboard() {
  await readClipboard()
}

function handleVisibilityChange() {
  if (!document.hidden) {
    readClipboard()
  }
}

async function base64ToBlob(base64) {
  const parts = base64.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length
  const uInt8Array = new Uint8Array(rawLength)
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }
  
  return new Blob([uInt8Array], { type: contentType })
}

async function copyToClipboard(item) {
  try {
    if (item.type === 'image' && item.content.startsWith('data:image/')) {
      const blob = await base64ToBlob(item.content)
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
    } else {
      await navigator.clipboard.writeText(item.content)
    }
    showCopied.value = true
    setTimeout(() => {
      showCopied.value = false
    }, 1500)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

async function togglePin(item) {
  try {
    await clipboardApi.updateItem(item.id, { pinned: !item.pinned })
    await loadItems()
  } catch (error) {
    console.error('置顶失败:', error)
  }
}

async function deleteItem(item) {
  try {
    await clipboardApi.deleteItem(item.id)
    items.value = items.value.filter(i => i.id !== item.id)
  } catch (error) {
    console.error('删除失败:', error)
  }
}

async function handleClearAll() {
  if (confirm('确定要清空所有非置顶记录吗？')) {
    try {
      await clipboardApi.clearAll()
      await loadItems()
    } catch (error) {
      console.error('清空失败:', error)
    }
  }
}

function getTypeLabel(type) {
  const labels = { text: '文本', link: '链接', image: '图片' }
  return labels[type] || type
}

function isValidImageContent(content) {
  return content.startsWith('data:image/') || 
         (content.startsWith('http') && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(content))
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return `${date.getMonth() + 1}/${date.getDate()}`
}

watch(selectedCategory, () => {
  if (searchKeyword.value) {
    handleSearch()
  } else {
    loadItems()
  }
})

onMounted(async () => {
  loading.value = true
  await loadItems()
  loading.value = false
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
