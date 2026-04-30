<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-blue-600 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-xl font-bold">家庭局域网管理</router-link>
          </div>
          <div class="flex items-center space-x-1">
            <router-link 
              v-for="item in navItems" 
              :key="item.path" 
              :to="item.path"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              :class="{ 'bg-blue-700': $route.path === item.path }"
            >
              {{ item.name }}
            </router-link>
            <div class="relative ml-4">
              <button 
                @click="showAlerts = !showAlerts"
                class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <span>告警</span>
                <span 
                  v-if="unreadAlerts > 0" 
                  class="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5"
                >
                  {{ unreadAlerts }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const navItems = [
  { path: '/', name: '仪表盘' },
  { path: '/devices', name: '设备管理' },
  { path: '/traffic', name: '流量统计' },
  { path: '/access-control', name: '访问控制' },
  { path: '/settings', name: '系统设置' },
  { path: '/guest-network', name: '访客网络' },
  { path: '/file-share', name: '文件共享' }
]

const showAlerts = ref(false)
const unreadAlerts = ref(0)

const fetchUnreadAlerts = async () => {
  try {
    const response = await axios.get('/api/alerts/unread-count')
    if (response.data.success) {
      unreadAlerts.value = response.data.data.count
    }
  } catch (error) {
    console.error('获取未读告警数量失败:', error)
  }
}

onMounted(() => {
  fetchUnreadAlerts()
  setInterval(fetchUnreadAlerts, 30000)
})
</script>
