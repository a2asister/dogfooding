<template>
  <div class="min-h-screen bg-dark text-text-primary overflow-x-hidden">
    <header class="bg-dark-secondary border-b border-border px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-xl">
          🦁
        </div>
        <div>
          <h1 class="text-xl font-bold text-text-primary">动物园管理大屏</h1>
          <p class="text-sm text-text-tertiary">实时监控与管理系统</p>
        </div>
      </div>
      
      <nav class="flex gap-1 bg-dark-tertiary p-1 rounded-lg">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-2 text-sm rounded-md transition-all"
          :class="[
            activeTab === tab.id 
              ? 'bg-primary text-white shadow-glow-blue' 
              : 'text-text-tertiary hover:text-text-secondary hover:bg-dark-secondary'
          ]">
          <span class="mr-1">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </nav>
      
      <div class="flex items-center gap-4">
        <div class="text-text-tertiary text-sm">
          系统时间: {{ currentTime }}
        </div>
        <div class="flex items-center gap-2">
          <span class="status-dot bg-success animate-pulse"></span>
          <span class="text-sm text-text-secondary">系统正常</span>
        </div>
      </div>
    </header>

    <main class="p-4">
      <section v-if="activeTab === 'overview'" class="grid grid-cols-4 gap-4 mb-4">
        <div v-for="stat in overviewStats" :key="stat.label" class="stat-card">
          <div class="text-3xl font-bold" :class="stat.color">{{ stat.value }}</div>
          <div class="text-sm text-text-tertiary mt-1">{{ stat.label }}</div>
          <div class="text-xs" :class="stat.trend > 0 ? 'text-success' : 'text-error'">
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}% 较昨日
          </div>
        </div>
      </section>

      <div v-if="activeTab === 'overview'" class="grid grid-cols-12 gap-4">
        <div class="col-span-3 space-y-4">
          <div class="card-base">
            <h3 class="card-header">
              <span class="text-primary">🐾</span>
              动物状态监测
            </h3>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-for="animal in animals" :key="animal.id" 
                class="flex items-center justify-between p-2 bg-dark-tertiary rounded hover:bg-dark/50 transition-colors cursor-pointer">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ getAnimalEmoji(animal.species) }}</span>
                  <div>
                    <div class="text-sm font-medium">{{ animal.name }}</div>
                    <div class="text-xs text-text-tertiary">{{ animal.species }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs" :class="animal.status === '正常' ? 'text-success' : 'text-warning'">
                    {{ animal.status }}
                  </div>
                  <div class="w-16 h-1 bg-dark rounded-full mt-1 overflow-hidden">
                    <div class="h-full rounded-full transition-all" 
                      :class="animal.health >= 90 ? 'bg-success' : animal.health >= 70 ? 'bg-warning' : 'bg-error'"
                      :style="{ width: animal.health + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card-base">
            <h3 class="card-header">
              <span class="text-warning">👥</span>
              人流统计
            </h3>
            <div class="h-40">
              <v-chart class="w-full h-full" :option="crowdChartOption" autoresize />
            </div>
            <div class="mt-3 flex justify-between text-xs text-text-tertiary">
              <span>高峰时段: {{ crowds.peakHour || 'N/A' }}</span>
              <span>当前密度: {{ (crowds.density || 0) * 100 }}%</span>
            </div>
          </div>
        </div>

        <div class="col-span-6">
          <div class="card-base h-full">
            <h3 class="card-header">
              <span class="text-primary">🗺️</span>
              园区全景监控
            </h3>
            <div class="relative bg-dark-tertiary rounded-lg overflow-hidden h-96">
              <div class="absolute inset-0 p-4">
                <div class="grid grid-cols-3 gap-2 h-full">
                  <div v-for="venue in venues" :key="venue.id" 
                    class="bg-dark-secondary/80 rounded p-2 flex flex-col justify-between cursor-pointer hover:bg-dark-secondary border border-transparent hover:border-primary/50 transition-all"
                    @click="selectedVenue = venue">
                    <div>
                      <div class="flex items-center gap-1">
                        <span class="status-dot" :class="venue.status === '开放' ? 'bg-success' : 'bg-error'"></span>
                        <span class="text-sm font-medium">{{ venue.name }}</span>
                      </div>
                      <div class="text-xs text-text-tertiary mt-1">{{ venue.location }}</div>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-xs text-text-tertiary">{{ venue.currentVisitors }}/{{ venue.capacity }}</span>
                      <div class="w-12 h-1 bg-dark rounded-full overflow-hidden">
                        <div class="h-full bg-primary rounded-full" 
                          :style="{ width: (venue.currentVisitors / venue.capacity) * 100 + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedVenue" class="mt-4 p-3 bg-dark-tertiary rounded-lg">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-bold text-primary">{{ selectedVenue.name }}</h4>
                  <p class="text-sm text-text-tertiary">{{ selectedVenue.description }}</p>
                </div>
                <button @click="selectedVenue = null" class="text-text-tertiary hover:text-text-primary">✕</button>
              </div>
              <div class="grid grid-cols-4 gap-2 mt-3">
                <div class="text-center p-2 bg-dark-secondary rounded">
                  <div class="text-lg font-bold text-primary">{{ getVenueEnv(selectedVenue.id)?.temperature || 'N/A' }}°C</div>
                  <div class="text-xs text-text-tertiary">温度</div>
                </div>
                <div class="text-center p-2 bg-dark-secondary rounded">
                  <div class="text-lg font-bold text-info">{{ getVenueEnv(selectedVenue.id)?.humidity || 'N/A' }}%</div>
                  <div class="text-xs text-text-tertiary">湿度</div>
                </div>
                <div class="text-center p-2 bg-dark-secondary rounded">
                  <div class="text-lg font-bold text-warning">{{ getVenueEnv(selectedVenue.id)?.co2 || 'N/A' }}</div>
                  <div class="text-xs text-text-tertiary">CO₂</div>
                </div>
                <div class="text-center p-2 bg-dark-secondary rounded">
                  <div class="text-lg font-bold text-success">{{ getVenueEnv(selectedVenue.id)?.pm25 || 'N/A' }}</div>
                  <div class="text-xs text-text-tertiary">PM2.5</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-3 space-y-4">
          <div class="card-base">
            <h3 class="card-header">
              <span class="text-error">⚠️</span>
              异常告警
              <span class="ml-auto bg-error/20 text-error text-xs px-2 py-0.5 rounded-full">
                {{ pendingAlerts }} 待处理
              </span>
            </h3>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="alert in alerts" :key="alert.id" 
                class="p-2 rounded border transition-all"
                :class="[
                  alert.status === '未处理' ? 'bg-error/10 border-error/30' : 
                  alert.status === '处理中' ? 'bg-warning/10 border-warning/30' : 'bg-success/10 border-success/30'
                ]">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span :class="[
                      'status-dot',
                      alert.severity === '紧急' ? 'bg-error animate-pulse' : 
                      alert.severity === '警告' ? 'bg-warning' : 'bg-info'
                    ]"></span>
                    <span class="text-sm">{{ alert.type }}</span>
                  </div>
                  <span class="text-xs" :class="[
                    alert.status === '未处理' ? 'text-error' : 
                    alert.status === '处理中' ? 'text-warning' : 'text-success'
                  ]">{{ alert.status }}</span>
                </div>
                <p class="text-xs text-text-tertiary mt-1">{{ alert.message }}</p>
              </div>
            </div>
          </div>

          <div class="card-base">
            <h3 class="card-header">
              <span class="text-info">📊</span>
              设备状态
            </h3>
            <div class="h-32">
              <v-chart class="w-full h-full" :option="deviceChartOption" autoresize />
            </div>
          </div>

          <div class="card-base">
            <h3 class="card-header">
              <span class="text-success">🎥</span>
              安防监控
            </h3>
            <div class="space-y-2">
              <div v-for="cam in security" :key="cam.id" 
                class="flex items-center justify-between p-2 bg-dark-tertiary rounded">
                <div class="flex items-center gap-2">
                  <span class="status-dot" :class="cam.status === '在线' ? 'bg-success animate-pulse' : 'bg-error'"></span>
                  <div>
                    <div class="text-sm">{{ cam.name }}</div>
                    <div class="text-xs text-text-tertiary">{{ cam.location }}</div>
                  </div>
                </div>
                <span class="text-xs px-2 py-0.5 rounded" 
                  :class="cam.status === '在线' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'">
                  {{ cam.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'park-3d'" class="h-[calc(100vh-140px)]">
        <div class="card-base h-full">
          <div class="h-full">
            <ParkOverview3D 
              :venues="venues" 
              :selected-venue="selectedVenue"
              @venue-select="handleVenueSelect"
            />
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'security-3d'" class="h-[calc(100vh-140px)]">
        <div class="card-base h-full">
          <div class="h-full">
            <SecurityMonitor3D 
              :security-devices="security"
              @camera-select="handleCameraSelect"
            />
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'alerts-3d'" class="h-[calc(100vh-140px)]">
        <div class="card-base h-full">
          <div class="h-full">
            <AlertMonitor3D 
              :alerts="alerts"
              @alert-update="handleAlertUpdate"
              @alert-select="handleAlertSelect"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { apiService } from './utils/api'
import ParkOverview3D from './components/ParkOverview3D.vue'
import SecurityMonitor3D from './components/SecurityMonitor3D.vue'
import AlertMonitor3D from './components/AlertMonitor3D.vue'

const tabs = [
  { id: 'overview', label: '数据总览', icon: '📊' },
  { id: 'park-3d', label: '园区全景 3D', icon: '🗺️' },
  { id: 'security-3d', label: '安防监控 3D', icon: '🎥' },
  { id: 'alerts-3d', label: '告警监控 3D', icon: '⚠️' }
]

const activeTab = ref('overview')
const currentTime = ref('')
const overview = ref({})
const animals = ref([])
const venues = ref([])
const crowds = ref({})
const environments = ref([])
const security = ref([])
const devices = ref([])
const alerts = ref([])
const selectedVenue = ref(null)

const overviewStats = computed(() => [
  { label: '动物总数', value: overview.value.animals?.total || 0, color: 'text-primary', trend: 5 },
  { label: '场馆开放', value: `${overview.value.venues?.open || 0}/${overview.value.venues?.total || 0}`, color: 'text-success', trend: 0 },
  { label: '今日游客', value: overview.value.visitors || 0, color: 'text-warning', trend: 12 },
  { label: '待处理告警', value: overview.value.alerts?.pending || 0, color: 'text-error', trend: -8 }
])

const pendingAlerts = computed(() => {
  return alerts.value.filter(a => a.status === '未处理').length
})

const crowdChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { top: 10, left: 30, right: 10, bottom: 30 },
  xAxis: {
    type: 'category',
    data: crowds.value.predictions?.map(p => p.hour) || ['15:00', '16:00', '17:00'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
    axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
  },
  series: [{
    data: crowds.value.predictions?.map(p => p.visitors) || [1100, 900, 500],
    type: 'line',
    smooth: true,
    lineStyle: { color: '#1890ff' },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(24,144,255,0.3)' },
          { offset: 1, color: 'rgba(24,144,255,0.05)' }
        ]
      }
    },
    itemStyle: { color: '#1890ff' }
  }]
}))

const deviceChartOption = computed(() => {
  const normal = devices.value.filter(d => d.status === '正常').length
  const maintenance = devices.value.filter(d => d.status === '维护中').length
  const offline = devices.value.filter(d => d.status === '离线').length

  return {
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'center',
      textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 10 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#1f1f1f', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [
        { value: normal || 3, name: '正常', itemStyle: { color: '#52c41a' } },
        { value: maintenance || 1, name: '维护中', itemStyle: { color: '#faad14' } },
        { value: offline || 0, name: '离线', itemStyle: { color: '#ff4d4f' } }
      ]
    }]
  }
})

const getAnimalEmoji = (species) => {
  const emojis = {
    '大熊猫': '🐼',
    '非洲狮': '🦁',
    '长颈鹿': '🦒',
    '帝企鹅': '🐧'
  }
  return emojis[species] || '🐾'
}

const getVenueEnv = (venueId) => {
  return environments.value.find(e => e.venueId === venueId)
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const loadData = async () => {
  try {
    const [overviewData, animalsData, venuesData, crowdsData, environmentsData, securityData, devicesData, alertsData] = await Promise.all([
      apiService.getOverview(),
      apiService.getAnimals(),
      apiService.getVenues(),
      apiService.getCrowds(),
      apiService.getEnvironments(),
      apiService.getSecurity(),
      apiService.getDevices(),
      apiService.getAlerts()
    ])
    
    overview.value = overviewData
    animals.value = animalsData
    venues.value = venuesData
    crowds.value = crowdsData
    environments.value = environmentsData
    security.value = securityData
    devices.value = devicesData
    alerts.value = alertsData
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const handleVenueSelect = (venue) => {
  selectedVenue.value = venue
}

const handleCameraSelect = (camera) => {
  console.log('选中摄像头:', camera)
}

const handleAlertSelect = (alert) => {
  console.log('选中告警:', alert)
}

const handleAlertUpdate = async ({ alertId, status }) => {
  await loadData()
}

let timeInterval = null
let dataInterval = null

onMounted(() => {
  nextTick(() => {
    updateTime()
    loadData()
    
    timeInterval = setInterval(updateTime, 1000)
    dataInterval = setInterval(loadData, 30000)
  })
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (dataInterval) clearInterval(dataInterval)
})
</script>
