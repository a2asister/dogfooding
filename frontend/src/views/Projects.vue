<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">项目工时</h1>
      <p class="page-subtitle">跟踪项目工时投入，分析人力资源分配合理性</p>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
        工时记录
      </button>
      <button class="tab" :class="{ active: activeTab === 'allocation' }" @click="activeTab = 'allocation'">
        人力分配
      </button>
      <button class="tab" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
        项目概览
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>正在加载数据...</span>
    </div>

    <div v-else>
      <div v-show="activeTab === 'list'" class="card">
        <div class="card-header">
          <h3 class="card-title">工时记录列表</h3>
        </div>
        <div class="filter-bar">
          <div class="filter-group">
            <label class="filter-label">员工：</label>
            <select v-model="filters.employeeId" @change="loadHours">
              <option value="">全部员工</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">项目：</label>
            <select v-model="filters.projectId" @change="loadHours">
              <option value="">全部项目</option>
              <option v-for="proj in projects" :key="proj.id" :value="proj.id">{{ proj.name }}</option>
            </select>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>员工</th>
              <th>项目</th>
              <th>活动类型</th>
              <th>投入工时</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hour in projectHours" :key="hour.id">
              <td>{{ hour.date }}</td>
              <td>{{ getEmployeeName(hour.employeeId) }}</td>
              <td>{{ hour.projectName }}</td>
              <td>{{ hour.activity }}</td>
              <td>{{ hour.hours }} 小时</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-show="activeTab === 'allocation'">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">员工项目工时分配</h3>
          </div>
          <div class="chart-container" ref="allocationChartRef"></div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">分配详情</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>员工</th>
                <th>总工时</th>
                <th>项目分配</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in allocationStats" :key="stat.employeeId">
                <td>{{ stat.employeeName }}</td>
                <td>{{ stat.totalHours }} 小时</td>
                <td>
                  <div class="project-badges">
                    <span 
                      v-for="proj in stat.projects" 
                      :key="proj.projectId" 
                      class="badge badge-info"
                      style="margin: 2px;"
                    >
                      {{ proj.projectName }}: {{ proj.hours }}小时 ({{ (proj.percentage * 100).toFixed(0) }}%)
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-show="activeTab === 'overview'" class="card">
        <div class="card-header">
          <h3 class="card-title">项目工时概览</h3>
        </div>
        <div class="chart-container" ref="overviewChartRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { projectsApi, employeesApi } from '../api'

interface Employee {
  id: string
  name: string
  department: string
}

interface Project {
  id: string
  name: string
  status: string
}

interface ProjectHour {
  id: string
  employeeId: string
  projectId: string
  projectName: string
  date: string
  hours: number
  activity: string
}

const loading = ref(true)
const activeTab = ref('list')
const employees = ref<Employee[]>([])
const projects = ref<Project[]>([])
const projectHours = ref<ProjectHour[]>([])
const allocationStats = ref<any[]>([])

const allocationChartRef = ref<HTMLElement>()
const overviewChartRef = ref<HTMLElement>()

let allocationChart: echarts.ECharts | null = null
let overviewChart: echarts.ECharts | null = null

const filters = ref({
  employeeId: '',
  projectId: ''
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

onMounted(async () => {
  try {
    const [employeesRes, projectsRes] = await Promise.all([
      employeesApi.getAll(),
      projectsApi.getAll()
    ])
    employees.value = employeesRes.data.data
    projects.value = projectsRes.data.data
    
    await loadHours()
    await loadAllocationStats()
  } catch (error) {
    console.error('Failed to load projects data:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  allocationChart?.dispose()
  overviewChart?.dispose()
})

async function loadHours() {
  const params: any = {}
  if (filters.value.employeeId) params.employeeId = filters.value.employeeId
  if (filters.value.projectId) params.projectId = filters.value.projectId
  
  const res = await projectsApi.getHours(params)
  projectHours.value = res.data.data.sort((a: ProjectHour, b: ProjectHour) => 
    b.date.localeCompare(a.date)
  )
}

async function loadAllocationStats() {
  const res = await projectsApi.getAllocationStats()
  allocationStats.value = res.data.data.sort((a: any, b: any) => b.totalHours - a.totalHours)
  
  nextTick(() => {
    initAllocationChart()
    initOverviewChart()
  })
}

function nextTick(callback: () => void) {
  setTimeout(callback, 100)
}

function initAllocationChart() {
  if (!allocationChartRef.value) return
  
  allocationChart = echarts.init(allocationChartRef.value)
  
  const projectsSet = new Set<string>()
  allocationStats.value.forEach(stat => {
    stat.projects.forEach((p: any) => projectsSet.add(p.projectName))
  })
  const allProjects = Array.from(projectsSet)
  
  const series: any[] = []
  allProjects.forEach((projName, i) => {
    series.push({
      name: projName,
      type: 'bar',
      stack: 'total',
      data: allocationStats.value.map(stat => {
        const p = stat.projects.find((p: any) => p.projectName === projName)
        return p ? p.hours : 0
      }),
      itemStyle: { color: colors[i % colors.length] }
    })
  })
  
  allocationChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: allProjects },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: allocationStats.value.map(s => s.employeeName),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '工时(小时)' },
    series
  })
}

function initOverviewChart() {
  if (!overviewChartRef.value) return
  
  overviewChart = echarts.init(overviewChartRef.value)
  
  const projectHoursMap = new Map<string, number>()
  allocationStats.value.forEach(stat => {
    stat.projects.forEach((p: any) => {
      const current = projectHoursMap.get(p.projectName) || 0
      projectHoursMap.set(p.projectName, current + p.hours)
    })
  })
  
  const pieData = Array.from(projectHoursMap.entries()).map(([name, value], i) => ({
    name,
    value,
    itemStyle: { color: colors[i % colors.length] }
  }))
  
  overviewChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}小时 ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      emphasis: {
        label: { show: true, fontSize: 16, fontWeight: 'bold' }
      },
      data: pieData
    }]
  })
}
</script>

<style scoped>
.project-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
