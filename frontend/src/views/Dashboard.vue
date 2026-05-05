<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="card-section">
      <el-col :span="6">
        <div class="stat-card stat-card-info">
          <el-icon size="40" color="#fff"><Document /></el-icon>
          <div class="stat-value">{{ stats?.totalLogs || 0 }}</div>
          <div class="stat-label">总日志数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card-success">
          <el-icon size="40" color="#fff"><CircleCheck /></el-icon>
          <div class="stat-value">{{ infoCount }}</div>
          <div class="stat-label">INFO 日志</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card-warning">
          <el-icon size="40" color="#fff"><Warning /></el-icon>
          <div class="stat-value">{{ warnCount }}</div>
          <div class="stat-label">WARN 日志</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card-danger">
          <el-icon size="40" color="#fff"><CircleClose /></el-icon>
          <div class="stat-value">{{ errorCount }}</div>
          <div class="stat-label">ERROR 日志</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="card-section">
          <template #header>
            <div class="card-header">
              <span>日志趋势（近24小时）</span>
              <el-select v-model="trendType" size="small" style="width: 120px">
                <el-option label="24小时" value="day" />
                <el-option label="60分钟" value="hour" />
              </el-select>
            </div>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="card-section">
          <template #header>
            <span>日志级别分布</span>
          </template>
          <div ref="levelChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="card-section">
          <template #header>
            <div class="card-header">
              <span>服务日志统计</span>
              <el-button type="primary" link size="small" @click="$router.push('/services')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="serviceStatsList" style="width: 100%">
            <el-table-column prop="name" label="服务名称" />
            <el-table-column prop="count" label="日志数" />
            <el-table-column prop="errors" label="错误数">
              <template #default="{ row }">
                <el-tag v-if="row.errors > 0" type="danger">{{ row.errors }}</el-tag>
                <span v-else>0</span>
              </template>
            </el-table-column>
            <el-table-column label="错误率">
              <template #default="{ row }">
                <el-progress 
                  :percentage="row.count > 0 ? Math.round((row.errors / row.count) * 100) : 0"
                  :color="row.count > 0 && (row.errors / row.count) > 0.1 ? '#f56c6c' : '#67c23a'"
                  :stroke-width="10"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="card-section">
          <template #header>
            <div class="card-header">
              <span>高频错误聚合</span>
              <el-button type="primary" link size="small" @click="$router.push('/logs')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="topErrors" style="width: 100%">
            <el-table-column prop="count" label="次数" width="80">
              <template #default="{ row }">
                <el-tag type="danger">{{ row.count }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="错误信息" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="error-message">{{ row.message }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="severity" label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="getSeverityType(row.severity)">{{ row.severity }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card class="card-section">
          <template #header>
            <span>日志来源分布</span>
          </template>
          <div ref="typeChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card class="card-section">
          <template #header>
            <div class="card-header">
              <span>最新告警</span>
              <el-button type="primary" link size="small" @click="$router.push('/alerts')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="recentAlerts" style="width: 100%">
            <el-table-column prop="severity" label="级别" width="100">
              <template #default="{ row }">
                <el-tag :type="getSeverityType(row.severity)">{{ row.severity }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ruleName" label="规则名称" />
            <el-table-column prop="message" label="消息" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { useLogsStore } from '@/stores/logs'
import { alertsApi } from '@/api'

const logsStore = useLogsStore()
const stats = computed(() => logsStore.stats)
const trendType = ref('day')
const recentAlerts = ref([])

const trendChart = ref(null)
const levelChart = ref(null)
const typeChart = ref(null)

let trendChartInstance = null
let levelChartInstance = null
let typeChartInstance = null

const infoCount = computed(() => stats.value?.levelStats?.INFO || 0)
const warnCount = computed(() => stats.value?.levelStats?.WARN || 0)
const errorCount = computed(() => {
  const s = stats.value?.levelStats
  return (s?.ERROR || 0) + (s?.FATAL || 0)
})

const serviceStatsList = computed(() => {
  if (!stats.value?.serviceStats) return []
  return Object.entries(stats.value.serviceStats).map(([name, data]) => ({
    name,
    ...data
  })).slice(0, 5)
})

const topErrors = computed(() => {
  return stats.value?.topErrors || []
})

function getSeverityType(severity) {
  const types = {
    CRITICAL: 'danger',
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'info'
  }
  return types[severity] || 'info'
}

function getStatusType(status) {
  const types = {
    OPEN: 'danger',
    ACKNOWLEDGED: 'warning',
    RESOLVED: 'success',
    CLOSED: 'info'
  }
  return types[status] || 'info'
}

function formatTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

function initTrendChart() {
  if (!trendChart.value) return
  
  trendChartInstance = echarts.init(trendChart.value)
  
  const data = trendType.value === 'hour' 
    ? (stats.value?.hourTrend || Array(60).fill(0))
    : (stats.value?.dayTrend || Array(24).fill(0))
  
  const xAxisData = trendType.value === 'hour'
    ? Array.from({ length: 60 }, (_, i) => `${59 - i}分钟前`)
    : Array.from({ length: 24 }, (_, i) => `${23 - i}时`)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        interval: Math.floor(xAxisData.length / 8)
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '日志数量',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102, 126, 234, 0.8)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#667eea',
          width: 2
        },
        itemStyle: {
          color: '#667eea'
        },
        data: data
      }
    ]
  }
  
  trendChartInstance.setOption(option)
}

function initLevelChart() {
  if (!levelChart.value) return
  
  levelChartInstance = echarts.init(levelChart.value)
  
  const levelData = stats.value?.levelStats || {
    DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, FATAL: 0
  }
  
  const seriesData = Object.entries(levelData)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [
      {
        name: '日志级别',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: seriesData,
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#C03636']
      }
    ]
  }
  
  levelChartInstance.setOption(option)
}

function initTypeChart() {
  if (!typeChart.value) return
  
  typeChartInstance = echarts.init(typeChart.value)
  
  const typeData = stats.value?.typeStats || {
    docker: 0, k8s: 0, backend: 0, frontend: 0, miniprogram: 0
  }
  
  const typeNames = {
    docker: 'Docker容器',
    k8s: 'K8s容器',
    backend: '后端服务',
    frontend: '前端埋点',
    miniprogram: '小程序'
  }
  
  const seriesData = Object.entries(typeData)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name: typeNames[name] || name, value }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '日志来源',
        type: 'pie',
        radius: '65%',
        center: ['50%', '50%'],
        data: seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  typeChartInstance.setOption(option)
}

async function fetchRecentAlerts() {
  try {
    const result = await alertsApi.getAlerts({ limit: 5 })
    recentAlerts.value = result.data || []
  } catch (error) {
    console.error('获取告警失败:', error)
  }
}

onMounted(async () => {
  await logsStore.fetchStats()
  await fetchRecentAlerts()
  
  await nextTick()
  initTrendChart()
  initLevelChart()
  initTypeChart()
})

watch(trendType, () => {
  nextTick(() => {
    initTrendChart()
  })
})

watch(stats, () => {
  nextTick(() => {
    initTrendChart()
    initLevelChart()
    initTypeChart()
  })
}, { deep: true })
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.error-message {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
