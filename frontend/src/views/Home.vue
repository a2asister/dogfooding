<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">网络仪表盘</h1>
      <button @click="refreshDashboard" class="btn btn-primary">
        刷新数据
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-lg">
            <div class="w-8 h-8 text-blue-600">📱</div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">在线设备</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.onlineDevices }} / {{ stats.totalDevices }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-lg">
            <div class="w-8 h-8 text-green-600">📥</div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">下载速度</p>
            <p class="text-2xl font-bold text-gray-900">{{ realtimeTraffic.download?.toFixed(2) || 0 }} MB/s</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-100 rounded-lg">
            <div class="w-8 h-8 text-yellow-600">📤</div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">上传速度</p>
            <p class="text-2xl font-bold text-gray-900">{{ realtimeTraffic.upload?.toFixed(2) || 0 }} MB/s</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="p-3 bg-red-100 rounded-lg">
            <div class="w-8 h-8 text-red-600">⚠️</div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">未读告警</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.unreadAlerts }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">最近设备</h2>
        <div class="space-y-3">
          <div 
            v-for="device in recentDevices" 
            :key="device.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {{ device.type === '手机' ? '📱' : device.type === '电脑' ? '💻' : '📺' }}
              </div>
              <div class="ml-3">
                <p class="font-medium">{{ device.name }}</p>
                <p class="text-sm text-gray-500">{{ device.ip }}</p>
              </div>
            </div>
            <div class="flex items-center">
              <div 
                class="w-3 h-3 rounded-full mr-2"
                :class="device.online ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
              <span class="text-sm text-gray-500">{{ device.online ? '在线' : '离线' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-4">最近告警</h2>
        <div class="space-y-3">
          <div 
            v-for="alert in recentAlerts" 
            :key="alert.id"
            class="flex items-start p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                 :class="alert.type === 'anomaly' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'">
              ⚠️
            </div>
            <div class="ml-3 flex-1">
              <p class="font-medium" :class="alert.read ? 'text-gray-500' : 'text-gray-900'">
                {{ alert.title }}
              </p>
              <p class="text-sm text-gray-500">{{ alert.message }}</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ new Date(alert.timestamp).toLocaleString('zh-CN') }}
              </p>
            </div>
          </div>
          <div v-if="recentAlerts.length === 0" class="text-center text-gray-500 py-4">
            暂无告警
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const stats = ref({
  onlineDevices: 0,
  totalDevices: 0,
  unreadAlerts: 0
})

const realtimeTraffic = ref({
  upload: 0,
  download: 0
})

const recentDevices = ref([])
const recentAlerts = ref([])
let trafficInterval = null

const fetchStats = async () => {
  try {
    const [devicesRes, alertsRes] = await Promise.all([
      axios.get('/api/devices'),
      axios.get('/api/alerts/unread-count')
    ])

    if (devicesRes.data.success) {
      const devices = devicesRes.data.data
      stats.value.totalDevices = devices.length
      stats.value.onlineDevices = devices.filter(d => d.online).length
      recentDevices.value = devices.slice(0, 5)
    }

    if (alertsRes.data.success) {
      stats.value.unreadAlerts = alertsRes.data.data.count
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchRealtimeTraffic = async () => {
  try {
    const response = await axios.get('/api/traffic/realtime')
    if (response.data.success) {
      realtimeTraffic.value = response.data.data
    }
  } catch (error) {
    console.error('获取实时流量失败:', error)
  }
}

const fetchAlerts = async () => {
  try {
    const response = await axios.get('/api/alerts')
    if (response.data.success) {
      recentAlerts.value = response.data.data.slice(0, 5)
    }
  } catch (error) {
    console.error('获取告警失败:', error)
  }
}

const refreshDashboard = () => {
  fetchStats()
  fetchRealtimeTraffic()
  fetchAlerts()
}

onMounted(() => {
  refreshDashboard()
  trafficInterval = setInterval(fetchRealtimeTraffic, 5000)
})

onUnmounted(() => {
  if (trafficInterval) {
    clearInterval(trafficInterval)
  }
})
</script>
