<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">任务产出</h1>
      <p class="page-subtitle">追踪任务完成情况，评估个人与团队产出效率</p>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
        任务列表
      </button>
      <button class="tab" :class="{ active: activeTab === 'efficiency' }" @click="activeTab = 'efficiency'">
        效率分析
      </button>
      <button class="tab" :class="{ active: activeTab === 'projects' }" @click="activeTab = 'projects'">
        项目任务分布
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>正在加载数据...</span>
    </div>

    <div v-else>
      <div v-show="activeTab === 'list'" class="card">
        <div class="card-header">
          <h3 class="card-title">任务列表</h3>
        </div>
        <div class="filter-bar">
          <div class="filter-group">
            <label class="filter-label">员工：</label>
            <select v-model="filters.employeeId" @change="loadTasks">
              <option value="">全部员工</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">状态：</label>
            <select v-model="filters.status" @change="loadTasks">
              <option value="">全部状态</option>
              <option value="completed">已完成</option>
              <option value="in-progress">进行中</option>
              <option value="pending">待处理</option>
            </select>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>任务名称</th>
              <th>员工</th>
              <th>开始日期</th>
              <th>结束日期</th>
              <th>计划工时</th>
              <th>实际工时</th>
              <th>效率</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task.id">
              <td>{{ task.taskName }}</td>
              <td>{{ getEmployeeName(task.employeeId) }}</td>
              <td>{{ task.startDate }}</td>
              <td>{{ task.endDate }}</td>
              <td>{{ task.plannedHours }} 小时</td>
              <td>{{ task.actualHours }} 小时</td>
              <td>
                <span :class="{ 'text-danger': task.efficiency < 0.7, 'text-success': task.efficiency >= 1 }">
                  {{ (task.efficiency * 100).toFixed(0) }}%
                </span>
              </td>
              <td>
                <span class="badge" :class="getStatusClass(task.status)">
                  {{ getStatusText(task.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-show="activeTab === 'efficiency'">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">员工效率排行</h3>
          </div>
          <div class="chart-container" ref="efficiencyChartRef"></div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">效率详情</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>员工</th>
                <th>总任务数</th>
                <th>已完成</th>
                <th>完成率</th>
                <th>平均效率</th>
                <th>总计划工时</th>
                <th>总实际工时</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in efficiencyStats" :key="stat.employeeId">
                <td>{{ stat.employeeName }}</td>
                <td>{{ stat.totalTasks }}</td>
                <td>{{ stat.completedTasks }}</td>
                <td>{{ (stat.completionRate * 100).toFixed(1) }}%</td>
                <td>
                  <span :class="{ 'text-danger': stat.avgEfficiency < 0.7, 'text-success': stat.avgEfficiency >= 1 }">
                    {{ (stat.avgEfficiency * 100).toFixed(1) }}%
                  </span>
                </td>
                <td>{{ stat.totalPlannedHours }}</td>
                <td>{{ stat.totalActualHours }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-show="activeTab === 'projects'" class="card">
        <div class="card-header">
          <h3 class="card-title">各项目任务分布</h3>
        </div>
        <div class="chart-container" ref="projectChartRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { tasksApi, employeesApi } from '../api'

interface Employee {
  id: string
  name: string
  department: string
}

interface Task {
  id: string
  employeeId: string
  projectId: string
  taskName: string
  startDate: string
  endDate: string
  plannedHours: number
  actualHours: number
  status: 'pending' | 'in-progress' | 'completed'
  efficiency: number
}

interface EfficiencyStat {
  employeeId: string
  employeeName: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  avgEfficiency: number
  totalPlannedHours: number
  totalActualHours: number
}

const loading = ref(true)
const activeTab = ref('list')
const employees = ref<Employee[]>([])
const tasks = ref<Task[]>([])
const efficiencyStats = ref<EfficiencyStat[]>([])
const projectStats = ref<any[]>([])

const efficiencyChartRef = ref<HTMLElement>()
const projectChartRef = ref<HTMLElement>()

let efficiencyChart: echarts.ECharts | null = null
let projectChart: echarts.ECharts | null = null

const filters = ref({
  employeeId: '',
  status: ''
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

function getStatusClass(status: string): string {
  switch (status) {
    case 'completed': return 'badge-success'
    case 'in-progress': return 'badge-info'
    default: return 'badge-secondary'
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'completed': return '已完成'
    case 'in-progress': return '进行中'
    default: return '待处理'
  }
}

onMounted(async () => {
  try {
    const employeesRes = await employeesApi.getAll()
    employees.value = employeesRes.data.data
    
    await loadTasks()
    await loadEfficiencyStats()
    await loadProjectStats()
  } catch (error) {
    console.error('Failed to load tasks data:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  efficiencyChart?.dispose()
  projectChart?.dispose()
})

async function loadTasks() {
  const params: any = {}
  if (filters.value.employeeId) params.employeeId = filters.value.employeeId
  if (filters.value.status) params.status = filters.value.status
  
  const res = await tasksApi.getAll(params)
  tasks.value = res.data.data.sort((a: Task, b: Task) => b.endDate.localeCompare(a.endDate))
}

async function loadEfficiencyStats() {
  const res = await tasksApi.getEfficiencyStats()
  efficiencyStats.value = res.data.data.sort((a: EfficiencyStat, b: EfficiencyStat) => 
    b.avgEfficiency - a.avgEfficiency
  )
  
  nextTick(() => {
    initEfficiencyChart()
  })
}

async function loadProjectStats() {
  const res = await tasksApi.getProjectStats()
  projectStats.value = res.data.data
  
  nextTick(() => {
    initProjectChart()
  })
}

function nextTick(callback: () => void) {
  setTimeout(callback, 100)
}

function initEfficiencyChart() {
  if (!efficiencyChartRef.value) return
  
  efficiencyChart = echarts.init(efficiencyChartRef.value)
  
  const sorted = efficiencyStats.value.slice(0, 8)
  
  efficiencyChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['平均效率', '完成率'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: sorted.map(s => s.employeeName),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', max: 1.2, axisLabel: { formatter: '{value}' } },
    series: [
      {
        name: '平均效率',
        type: 'bar',
        data: sorted.map(s => ({
          value: s.avgEfficiency,
          itemStyle: {
            color: s.avgEfficiency < 0.7 ? '#ff6b6b' : s.avgEfficiency >= 1 ? '#38ef7d' : '#4facfe'
          }
        }))
      },
      {
        name: '完成率',
        type: 'line',
        smooth: true,
        data: sorted.map(s => s.completionRate),
        itemStyle: { color: colors[0] }
      }
    ]
  })
}

function initProjectChart() {
  if (!projectChartRef.value) return
  
  projectChart = echarts.init(projectChartRef.value)
  
  projectChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['已完成', '进行中', '待处理'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: projectStats.value.map((s: any) => s.projectName),
      axisLabel: { width: 100, overflow: 'truncate' }
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '已完成',
        type: 'bar',
        stack: 'total',
        data: projectStats.value.map((s: any) => s.completedTasks),
        itemStyle: { color: colors[1] }
      },
      {
        name: '进行中',
        type: 'bar',
        stack: 'total',
        data: projectStats.value.map((s: any) => s.inProgressTasks),
        itemStyle: { color: colors[3] }
      },
      {
        name: '待处理',
        type: 'bar',
        stack: 'total',
        data: projectStats.value.map((s: any) => s.pendingTasks),
        itemStyle: { color: colors[5] }
      }
    ]
  })
}
</script>

<style scoped>
.text-success { color: #155724; font-weight: 600; }
.text-danger { color: #721c24; font-weight: 600; }
</style>
