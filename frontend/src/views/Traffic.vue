<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">流量统计</h1>
      <div class="flex items-center space-x-4">
        <select v-model="period" class="input w-40">
          <option value="day">今日</option>
          <option value="week">本周</option>
          <option value="month">本月</option>
        </select>
        <button @click="refreshData" class="btn btn-primary">
          刷新
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card">
        <p class="text-sm font-medium text-gray-500">实时上传速度</p>
        <p class="text-2xl font-bold text-blue-600">{{ realtimeTraffic.upload?.toFixed(2) || 0 }} MB/s</p>
      </div>
      <div class="card">
        <p class="text-sm font-medium text-gray-500">实时下载速度</p>
        <p class="text-2xl font-bold text-green-600">{{ realtimeTraffic.download?.toFixed(2) || 0 }} MB/s</p>
      </div>
      <div class="card">
        <p class="text-sm font-medium text-gray-500">总上传流量</p>
        <p class="text-2xl font-bold text-yellow-600">{{ realtimeTraffic.totalUpload?.toFixed(2) || 0 }} GB</p>
      </div>
      <div class="card">
        <p class="text-sm font-medium text-gray-500">总下载流量</p>
        <p class="text-2xl font-bold text-purple-600">{{ realtimeTraffic.totalDownload?.toFixed(2) || 0 }} GB</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">实时流量监控</h2>
        <div class="h-64">
          <Line v-if="realtimeChartData" :data="realtimeChartData" :options="chartOptions" />
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-4">历史流量统计</h2>
        <div class="h-64">
          <Bar v-if="historyChartData" :data="historyChartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold mb-4">设备流量排行</h2>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上传流量</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下载流量</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总流量</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(device, index) in deviceTraffic" :key="index" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                  {{ index + 1 }}
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ device.name }}</div>
                  <div class="text-sm text-gray-500">{{ device.ip }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ device.upload?.toFixed(2) || 0 }} MB
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ device.download?.toFixed(2) || 0 }} MB
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ (device.upload + device.download)?.toFixed(2) || 0 }} MB
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import axios from 'axios'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const period = ref('day')
const realtimeTraffic = ref({
  upload: 0,
  download: 0,
  totalUpload: 0,
  totalDownload: 0
})

const historyData = ref([])
const realtimeDataPoints = ref([])
const deviceTraffic = ref([
  { name: '客厅电视', ip: '192.168.1.101', upload: 125.5, download: 2048.3 },
  { name: '卧室手机', ip: '192.168.1.102', upload: 85.2, download: 1536.7 },
  { name: '书房电脑', ip: '192.168.1.103', upload: 256.8, download: 4096.2 }
])

let realtimeInterval = null

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

const realtimeChartData = computed(() => {
  if (realtimeDataPoints.value.length === 0) return null
  
  const labels = realtimeDataPoints.value.map((_, i) => `${i * 5}s`)
  
  return {
    labels,
    datasets: [
      {
        label: '上传 (MB/s)',
        data: realtimeDataPoints.value.map(d => d.upload),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: '下载 (MB/s)',
        data: realtimeDataPoints.value.map(d => d.download),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const historyChartData = computed(() => {
  if (historyData.value.length === 0) return null
  
  const labels = historyData.value.map(d => {
    const date = new Date(d.timestamp)
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  })
  
  return {
    labels,
    datasets: [
      {
        label: '上传 (MB)',
        data: historyData.value.map(d => d.upload),
        backgroundColor: '#3b82f6'
      },
      {
        label: '下载 (MB)',
        data: historyData.value.map(d => d.download),
        backgroundColor: '#10b981'
      }
    ]
  }
})

const fetchRealtimeTraffic = async () => {
  try {
    const response = await axios.get('/api/traffic/realtime')
    if (response.data.success) {
      realtimeTraffic.value = response.data.data
      
      realtimeDataPoints.value.push({
        upload: response.data.data.upload,
        download: response.data.data.download
      })
      
      if (realtimeDataPoints.value.length > 20) {
        realtimeDataPoints.value.shift()
      }
    }
  } catch (error) {
    console.error('获取实时流量失败:', error)
  }
}

const fetchHistoryData = async () => {
  try {
    const response = await axios.get(`/api/traffic/history?period=${period.value}`)
    if (response.data.success) {
      historyData.value = response.data.data
    }
  } catch (error) {
    console.error('获取历史流量失败:', error)
  }
}

const refreshData = () => {
  fetchRealtimeTraffic()
  fetchHistoryData()
}

onMounted(() => {
  refreshData()
  realtimeInterval = setInterval(fetchRealtimeTraffic, 5000)
})

onUnmounted(() => {
  if (realtimeInterval) {
    clearInterval(realtimeInterval)
  }
})
</script>
