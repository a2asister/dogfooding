<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">告警中心</h1>
      <div class="flex items-center space-x-4">
        <select v-model="filterRead" class="input w-40">
          <option value="">全部</option>
          <option value="false">未读</option>
          <option value="true">已读</option>
        </select>
        <button @click="markAllAsRead" class="btn btn-secondary">全部标记已读</button>
        <button @click="createTestAlert" class="btn btn-primary">创建测试告警</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">总告警数</p>
            <p class="text-2xl font-bold text-gray-900">{{ alerts.length }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-lg">
            <div class="w-8 h-8 text-blue-600">📋</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">未读告警</p>
            <p class="text-2xl font-bold text-red-600">{{ unreadCount }}</p>
          </div>
          <div class="p-3 bg-red-100 rounded-lg">
            <div class="w-8 h-8 text-red-600">🔴</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">已读告警</p>
            <p class="text-2xl font-bold text-green-600">{{ readCount }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-lg">
            <div class="w-8 h-8 text-green-600">✅</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="space-y-4">
        <div 
          v-for="alert in filteredAlerts" 
          :key="alert.id"
          class="p-4 rounded-lg border transition-colors"
          :class="[
            alert.read ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200',
            'hover:shadow-md cursor-pointer'
          ]"
          @click="markAsRead(alert)"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center"
                :class="getAlertColor(alert.type)"
              >
                {{ getAlertIcon(alert.type) }}
              </div>
            </div>
            <div class="ml-4 flex-1">
              <div class="flex items-center justify-between">
                <h3 class="font-medium" :class="alert.read ? 'text-gray-500' : 'text-gray-900'">
                  {{ alert.title }}
                </h3>
                <span 
                  class="px-2 py-0.5 text-xs rounded-full"
                  :class="alert.read ? 'bg-gray-200 text-gray-600' : 'bg-red-200 text-red-800'"
                >
                  {{ alert.read ? '已读' : '未读' }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ alert.message }}</p>
              <div class="flex items-center justify-between mt-2">
                <p class="text-xs text-gray-400">
                  {{ new Date(alert.timestamp).toLocaleString('zh-CN') }}
                </p>
                <div v-if="alert.device" class="text-xs text-gray-500">
                  设备: {{ alert.device.name }} ({{ alert.device.ip }})
                </div>
              </div>
            </div>
            <div class="ml-4 flex flex-col space-y-2">
              <button 
                @click.stop="toggleReadStatus(alert)"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                {{ alert.read ? '标记未读' : '标记已读' }}
              </button>
              <button 
                @click.stop="deleteAlert(alert)"
                class="text-sm text-red-600 hover:text-red-800"
              >
                删除
              </button>
            </div>
          </div>
        </div>

        <div v-if="filteredAlerts.length === 0" class="text-center py-8 text-gray-500">
          暂无告警记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const alerts = ref([])
const filterRead = ref('')

const filteredAlerts = computed(() => {
  if (filterRead.value === '') {
    return alerts.value
  }
  const isRead = filterRead.value === 'true'
  return alerts.value.filter(a => a.read === isRead)
})

const unreadCount = computed(() => {
  return alerts.value.filter(a => !a.read).length
})

const readCount = computed(() => {
  return alerts.value.filter(a => a.read).length
})

const getAlertIcon = (type) => {
  const icons = {
    'anomaly': '⚠️',
    'security': '🔒',
    'performance': '⚡',
    'info': 'ℹ️'
  }
  return icons[type] || '📢'
}

const getAlertColor = (type) => {
  const colors = {
    'anomaly': 'bg-red-100 text-red-600',
    'security': 'bg-yellow-100 text-yellow-600',
    'performance': 'bg-blue-100 text-blue-600',
    'info': 'bg-green-100 text-green-600'
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}

const fetchAlerts = async () => {
  try {
    const params = filterRead.value !== '' ? { read: filterRead.value } : {}
    const response = await axios.get('/api/alerts', { params })
    if (response.data.success) {
      alerts.value = response.data.data
    }
  } catch (error) {
    console.error('获取告警失败:', error)
  }
}

const markAsRead = async (alert) => {
  if (alert.read) return
  try {
    await axios.put(`/api/alerts/${alert.id}/read`)
    alert.read = true
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

const toggleReadStatus = async (alert) => {
  if (alert.read) {
    alert.read = false
  } else {
    try {
      await axios.put(`/api/alerts/${alert.id}/read`)
      alert.read = true
    } catch (error) {
      console.error('更新告警状态失败:', error)
    }
  }
}

const markAllAsRead = async () => {
  try {
    await axios.put('/api/alerts/read-all')
    alerts.value.forEach(alert => {
      alert.read = true
    })
  } catch (error) {
    console.error('全部标记已读失败:', error)
  }
}

const deleteAlert = async (alert) => {
  if (confirm(`确定要删除此告警吗？`)) {
    try {
      await axios.delete(`/api/alerts/${alert.id}`)
      alerts.value = alerts.value.filter(a => a.id !== alert.id)
    } catch (error) {
      console.error('删除告警失败:', error)
    }
  }
}

const createTestAlert = async () => {
  try {
    await axios.post('/api/alerts/test')
    fetchAlerts()
  } catch (error) {
    console.error('创建测试告警失败:', error)
  }
}

onMounted(() => {
  fetchAlerts()
})
</script>
