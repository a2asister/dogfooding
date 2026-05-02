<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">考勤管理</h1>
      <p class="page-subtitle">监控员工出勤情况，识别无效加班风险</p>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'records' }" @click="activeTab = 'records'">
        考勤记录
      </button>
      <button class="tab" :class="{ active: activeTab === 'overtime' }" @click="handleTabChange('overtime')">
        加班统计
      </button>
      <button class="tab" :class="{ active: activeTab === 'trends' }" @click="handleTabChange('trends')">
        工时趋势
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>正在加载数据...</span>
    </div>

    <div v-else>
      <div v-show="activeTab === 'records'" class="card">
        <div class="card-header">
          <h3 class="card-title">考勤记录列表</h3>
        </div>
        <div class="filter-bar">
          <div class="filter-group">
            <label class="filter-label">员工：</label>
            <select v-model="filters.employeeId" @change="loadRecords">
              <option value="">全部员工</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">开始日期：</label>
            <input type="date" v-model="filters.startDate" @change="loadRecords" />
          </div>
          <div class="filter-group">
            <label class="filter-label">结束日期：</label>
            <input type="date" v-model="filters.endDate" @change="loadRecords" />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>员工</th>
              <th>签到时间</th>
              <th>签退时间</th>
              <th>工作时长</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in attendanceRecords" :key="record.id">
              <td>{{ record.date }}</td>
              <td>{{ getEmployeeName(record.employeeId) }}</td>
              <td>{{ record.checkIn }}</td>
              <td>{{ record.checkOut }}</td>
              <td>{{ record.workHours }} 小时</td>
              <td>
                <span class="badge" :class="record.isOvertime ? 'badge-warning' : 'badge-success'">
                  {{ record.isOvertime ? '加班' : '正常' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-show="activeTab === 'overtime'">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">加班排行</h3>
          </div>
          <div ref="overtimeChartRef" class="chart-container" style="height: 400px; width: 100%;"></div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">加班详情</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>员工</th>
                <th>总加班时长</th>
                <th>加班次数</th>
                <th>平均每次加班</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in overtimeStats" :key="stat.employeeId">
                <td>{{ stat.employeeName }}</td>
                <td>{{ stat.totalOvertimeHours.toFixed(1) }} 小时</td>
                <td>{{ stat.overtimeCount }} 次</td>
                <td>{{ stat.avgOvertimeHours.toFixed(1) }} 小时</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-show="activeTab === 'trends'">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">工时趋势分析</h3>
          </div>
          <div ref="trendsChartRef" class="chart-container" style="height: 400px; width: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { attendanceApi, employeesApi } from '../api'

interface Employee {
  id: string
  name: string
  department: string
}

interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string
  checkOut: string
  workHours: number
  isOvertime: boolean
}

interface OvertimeStat {
  employeeId: string
  employeeName: string
  totalOvertimeHours: number
  overtimeCount: number
  avgOvertimeHours: number
}

const loading = ref(true)
const activeTab = ref('records')
const employees = ref<Employee[]>([])
const attendanceRecords = ref<AttendanceRecord[]>([])
const overtimeStats = ref<OvertimeStat[]>([])
const dailyStats = ref<any[]>([])

const overtimeChartRef = ref<HTMLElement>()
const trendsChartRef = ref<HTMLElement>()

let overtimeChart: echarts.ECharts | null = null
let trendsChart: echarts.ECharts | null = null

const filters = ref({
  employeeId: '',
  startDate: '',
  endDate: ''
})

const colors = ['#667eea', '#38ef7d', '#f5576c', '#4facfe', '#f093fb', '#fee140', '#ff6b6b', '#74b9ff']

const employeeMap = computed(() => {
  const map = new Map<string, string>()
  employees.value.forEach(emp => map.set(emp.id, emp.name))
  return map
})

function getEmployeeName(id: string): string {
  return employeeMap.value.get(id) || id
}

function handleResize() {
  overtimeChart?.resize()
  trendsChart?.resize()
}

async function handleTabChange(tab: string) {
  activeTab.value = tab
  await nextTick()
  
  setTimeout(() => {
    if (tab === 'overtime' && overtimeStats.value.length > 0) {
      initOvertimeChart()
      handleResize()
    } else if (tab === 'trends' && dailyStats.value.length > 0) {
      initTrendsChart()
      handleResize()
    }
  }, 100)
}

watch(activeTab, async (newTab) => {
  await nextTick()
  setTimeout(() => {
    handleResize()
  }, 50)
})

onMounted(async () => {
  try {
    const employeesRes = await employeesApi.getAll()
    employees.value = employeesRes.data.data
    
    await loadRecords()
    await loadOvertimeStats()
    await loadDailyStats()

    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('Failed to load attendance data:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  overtimeChart?.dispose()
  trendsChart?.dispose()
})

async function loadRecords() {
  const params: any = {}
  if (filters.value.employeeId) params.employeeId = filters.value.employeeId
  if (filters.value.startDate) params.startDate = filters.value.startDate
  if (filters.value.endDate) params.endDate = filters.value.endDate
  
  const res = await attendanceApi.getAll(params)
  attendanceRecords.value = res.data.data.sort((a: AttendanceRecord, b: AttendanceRecord) => 
    b.date.localeCompare(a.date)
  )
}

async function loadOvertimeStats() {
  const res = await attendanceApi.getOvertimeStats()
  overtimeStats.value = res.data.data.sort((a: OvertimeStat, b: OvertimeStat) => 
    b.totalOvertimeHours - a.totalOvertimeHours
  )
  
  if (activeTab.value === 'overtime') {
    await nextTick()
    initOvertimeChart()
    setTimeout(() => handleResize(), 100)
  }
}

async function loadDailyStats() {
  const res = await attendanceApi.getDailyStats()
  dailyStats.value = res.data.data.sort((a: any, b: any) => a.date.localeCompare(b.date))
  
  if (activeTab.value === 'trends') {
    await nextTick()
    initTrendsChart()
    setTimeout(() => handleResize(), 100)
  }
}

function initOvertimeChart() {
  if (!overtimeChartRef.value) return
  
  if (overtimeChart) {
    overtimeChart.dispose()
  }
  
  overtimeChart = echarts.init(overtimeChartRef.value)
  
  const sorted = overtimeStats.value.slice(0, 8)
  
  const option = {
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1
    },
    grid: { 
      left: '8%', 
      right: '8%', 
      bottom: '20%', 
      top: '15%',
      containLabel: true 
    },
    xAxis: {
      type: 'category',
      data: sorted.map(s => s.employeeName),
      axisLabel: { 
        rotate: 30, 
        fontSize: 12,
        width: 80,
        overflow: 'truncate'
      },
      axisLine: { lineStyle: { color: '#ddd' } }
    },
    yAxis: { 
      type: 'value', 
      name: '加班时长(小时)',
      nameTextStyle: { fontSize: 12, padding: [0, 0, 0, -20] },
      axisLabel: { fontSize: 11 },
      axisLine: { lineStyle: { color: '#ddd' } },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: sorted.map((s, i) => ({
        value: s.totalOvertimeHours,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: s.totalOvertimeHours > 30 ? '#ff6b6b' : s.totalOvertimeHours > 15 ? '#f093fb' : '#4facfe' },
            { offset: 1, color: s.totalOvertimeHours > 30 ? '#ee5a24' : s.totalOvertimeHours > 15 ? '#f5576c' : '#00f2fe' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      })),
      label: { 
        show: true, 
        position: 'top',
        fontSize: 11,
        fontWeight: 'bold'
      }
    }]
  }
  
  overtimeChart.setOption(option)
}

function initTrendsChart() {
  if (!trendsChartRef.value) return
  
  if (trendsChart) {
    trendsChart.dispose()
  }
  
  trendsChart = echarts.init(trendsChartRef.value)
  
  const last14 = dailyStats.value.slice(-14)
  
  const option = {
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1
    },
    legend: { 
      data: ['平均工时'],
      top: 10,
      textStyle: { fontSize: 12 }
    },
    grid: { 
      left: '8%', 
      right: '8%', 
      bottom: '20%', 
      top: '18%',
      containLabel: true 
    },
    xAxis: {
      type: 'category',
      data: last14.map(d => d.date.slice(5)),
      axisLabel: { 
        rotate: 0, 
        fontSize: 11,
        interval: 0
      },
      axisLine: { lineStyle: { color: '#ddd' } },
      splitLine: { show: false }
    },
    yAxis: [
      { 
        type: 'value', 
        name: '工时(h)',
        nameTextStyle: { fontSize: 12, padding: [0, 0, 0, -20] },
        axisLabel: { fontSize: 11 },
        axisLine: { lineStyle: { color: '#ddd' } },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
      }
    ],
    series: [
      {
        name: '平均工时',
        type: 'line',
        smooth: true,
        data: last14.map(d => d.avgHours),
        itemStyle: { color: colors[0], lineWidth: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102, 126, 234, 0.4)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
          ])
        },
        symbol: 'circle',
        symbolSize: 8,
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(102, 126, 234, 0.5)' }
        }
      }
    ]
  }
  
  trendsChart.setOption(option)
}
</script>
