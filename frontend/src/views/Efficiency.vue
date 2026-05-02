<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">效能告警</h1>
      <p class="page-subtitle">实时监控无效加班与人力分配失衡，及时发现并解决问题</p>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'overtime' }" @click="activeTab = 'overtime'">
        加班告警
      </button>
      <button class="tab" :class="{ active: activeTab === 'allocation' }" @click="activeTab = 'allocation'">
        分配失衡
      </button>
      <button class="tab" :class="{ active: activeTab === 'metrics' }" @click="activeTab = 'metrics'">
        效能指标
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>正在加载数据...</span>
    </div>

    <div v-else>
      <div v-show="activeTab === 'overtime'">
        <div class="stats-grid">
          <div class="stat-card" :class="{ 'warning': highSeverityCount > 0 }">
            <div class="stat-icon red">🔴</div>
            <div class="stat-content">
              <div class="stat-value">{{ highSeverityCount }}</div>
              <div class="stat-label">高危加班</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">🟠</div>
            <div class="stat-content">
              <div class="stat-value">{{ mediumSeverityCount }}</div>
              <div class="stat-label">中危加班</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple">🟣</div>
            <div class="stat-content">
              <div class="stat-value">{{ lowSeverityCount }}</div>
              <div class="stat-label">低危加班</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">加班告警列表</h3>
            <div class="filter-bar" style="margin-bottom: 0;">
              <div class="filter-group">
                <label class="filter-label">严重程度：</label>
                <select v-model="filters.severity" @change="loadOvertimeAlerts">
                  <option value="">全部</option>
                  <option value="high">高危</option>
                  <option value="medium">中危</option>
                  <option value="low">低危</option>
                </select>
              </div>
            </div>
          </div>
          
          <div v-if="overtimeAlerts.length === 0" class="empty-state">
            暂无加班告警
          </div>
          
          <div v-else>
            <div 
              v-for="alert in overtimeAlerts" 
              :key="alert.id" 
              class="alert-card" 
              :class="alert.severity"
            >
              <div class="alert-icon">
                {{ getSeverityIcon(alert.severity) }}
              </div>
              <div class="alert-content">
                <div class="alert-title">
                  <span class="badge" :class="getSeverityBadgeClass(alert.severity)">
                    {{ getSeverityText(alert.severity) }}
                  </span>
                  &nbsp;{{ alert.employeeName }} - {{ alert.hours }}小时加班
                </div>
                <div class="alert-desc">
                  加班日期：{{ alert.date }}<br/>
                  加班原因：{{ alert.reason }}
                </div>
                <div class="alert-meta">
                  建议：{{ getSuggestion(alert.severity, alert.hours) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'allocation'">
        <div class="stats-grid">
          <div class="stat-card" :class="{ 'warning': overAllocatedCount > 0 }">
            <div class="stat-icon red">⚡</div>
            <div class="stat-content">
              <div class="stat-value">{{ overAllocatedCount }}</div>
              <div class="stat-label">过度分配</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon yellow">📊</div>
            <div class="stat-content">
              <div class="stat-value">{{ underAllocatedCount }}</div>
              <div class="stat-label">分配不足</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple">😴</div>
            <div class="stat-content">
              <div class="stat-value">{{ idleCount }}</div>
              <div class="stat-label">闲置状态</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">人力分配问题列表</h3>
          </div>
          
          <div v-if="allocationIssues.length === 0" class="empty-state">
            暂无分配失衡问题
          </div>
          
          <div v-else>
            <table>
              <thead>
                <tr>
                  <th>员工</th>
                  <th>问题类型</th>
                  <th>涉及项目</th>
                  <th>工时</th>
                  <th>周期</th>
                  <th>建议</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="issue in allocationIssues" :key="issue.id">
                  <td>{{ issue.employeeName }}</td>
                  <td>
                    <span class="badge" :class="getIssueTypeBadgeClass(issue.issueType)">
                      {{ getIssueTypeText(issue.issueType) }}
                    </span>
                  </td>
                  <td>{{ issue.projectName || '-' }}</td>
                  <td>{{ issue.hours }} 小时</td>
                  <td>{{ issue.period }}</td>
                  <td>{{ getAllocationSuggestion(issue.issueType) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">工时分布热力图</h3>
          </div>
          <div class="chart-container" ref="heatmapChartRef"></div>
        </div>
      </div>

      <div v-show="activeTab === 'metrics'">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">综合效能评分雷达图</h3>
          </div>
          <div class="chart-container" ref="radarChartRef"></div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">效能指标详情</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>员工</th>
                <th>工作效率</th>
                <th>加班率</th>
                <th>任务完成率</th>
                <th>协作评分</th>
                <th>综合评分</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="metric in efficiencyMetrics" :key="metric.employeeId">
                <td>{{ metric.employeeName }}</td>
                <td>{{ (metric.workEfficiency * 100).toFixed(1) }}%</td>
                <td>
                  <span :class="{ 'text-danger': metric.overtimeRate > 0.3 }">
                    {{ (metric.overtimeRate * 100).toFixed(1) }}%
                  </span>
                </td>
                <td>{{ (metric.taskCompletionRate * 100).toFixed(1) }}%</td>
                <td>{{ (metric.collaborationScore * 100).toFixed(1) }}%</td>
                <td>
                  <span 
                    class="badge" 
                    :class="metric.overallScore >= 0.8 ? 'badge-success' : metric.overallScore >= 0.6 ? 'badge-warning' : 'badge-danger'"
                  >
                    {{ (metric.overallScore * 100).toFixed(1) }}%
                  </span>
                </td>
                <td>
                  <span 
                    class="badge" 
                    :class="getMetricStatusClass(metric.overallScore)"
                  >
                    {{ getMetricStatusText(metric.overallScore) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { efficiencyApi, projectsApi, employeesApi } from '../api'

interface Employee {
  id: string
  name: string
  department: string
}

interface OvertimeAlert {
  id: string
  employeeId: string
  employeeName: string
  date: string
  hours: number
  reason: string
  severity: 'low' | 'medium' | 'high'
}

interface AllocationIssue {
  id: string
  employeeId: string
  employeeName: string
  projectId: string
  projectName: string
  issueType: 'over-allocated' | 'under-allocated' | 'idle'
  hours: number
  period: string
}

interface EfficiencyMetric {
  employeeId: string
  employeeName: string
  workEfficiency: number
  overtimeRate: number
  taskCompletionRate: number
  collaborationScore: number
  overallScore: number
  period: string
}

const loading = ref(true)
const activeTab = ref('overtime')
const employees = ref<Employee[]>([])
const overtimeAlerts = ref<OvertimeAlert[]>([])
const allocationIssues = ref<AllocationIssue[]>([])
const efficiencyMetrics = ref<EfficiencyMetric[]>([])
const allocationStats = ref<any[]>([])

const heatmapChartRef = ref<HTMLElement>()
const radarChartRef = ref<HTMLElement>()

let heatmapChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null

const filters = ref({
  severity: ''
})

const colors = ['#667eea', '#38ef7d', '#f5576c', '#4facfe', '#f093fb', '#fee140']

const highSeverityCount = computed(() => 
  overtimeAlerts.value.filter(a => a.severity === 'high').length
)
const mediumSeverityCount = computed(() => 
  overtimeAlerts.value.filter(a => a.severity === 'medium').length
)
const lowSeverityCount = computed(() => 
  overtimeAlerts.value.filter(a => a.severity === 'low').length
)

const overAllocatedCount = computed(() => 
  allocationIssues.value.filter(i => i.issueType === 'over-allocated').length
)
const underAllocatedCount = computed(() => 
  allocationIssues.value.filter(i => i.issueType === 'under-allocated').length
)
const idleCount = computed(() => 
  allocationIssues.value.filter(i => i.issueType === 'idle').length
)

function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'high': return '🚨'
    case 'medium': return '⚠️'
    default: return 'ℹ️'
  }
}

function getSeverityText(severity: string): string {
  switch (severity) {
    case 'high': return '高危'
    case 'medium': return '中危'
    default: return '低危'
  }
}

function getSeverityBadgeClass(severity: string): string {
  switch (severity) {
    case 'high': return 'badge-danger'
    case 'medium': return 'badge-warning'
    default: return 'badge-info'
  }
}

function getSuggestion(severity: string, hours: number): string {
  if (severity === 'high') {
    return '建议立即关注，检查工作安排是否合理，考虑团队协作或资源重新分配'
  } else if (severity === 'medium') {
    return '建议关注，了解加班原因，评估是否需要调整工作流程'
  }
  return '建议跟踪观察，确保加班为有效产出'
}

function getIssueTypeText(type: string): string {
  switch (type) {
    case 'over-allocated': return '过度分配'
    case 'under-allocated': return '分配不足'
    default: return '闲置'
  }
}

function getIssueTypeBadgeClass(type: string): string {
  switch (type) {
    case 'over-allocated': return 'badge-danger'
    case 'under-allocated': return 'badge-warning'
    default: return 'badge-secondary'
  }
}

function getAllocationSuggestion(type: string): string {
  switch (type) {
    case 'over-allocated': return '建议减轻工作负担，合理分配任务或增加人手'
    case 'under-allocated': return '建议增加工作量，分配更多任务或参与其他项目'
    default: return '建议安排新任务或项目，避免人力资源浪费'
  }
}

function getMetricStatusClass(score: number): string {
  if (score >= 0.8) return 'badge-success'
  if (score >= 0.6) return 'badge-warning'
  return 'badge-danger'
}

function getMetricStatusText(score: number): string {
  if (score >= 0.8) return '优秀'
  if (score >= 0.6) return '良好'
  return '需要改进'
}

onMounted(async () => {
  try {
    const employeesRes = await employeesApi.getAll()
    employees.value = employeesRes.data.data
    
    await loadOvertimeAlerts()
    await loadAllocationIssues()
    await loadEfficiencyMetrics()
    await loadAllocationStats()
  } catch (error) {
    console.error('Failed to load efficiency data:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  heatmapChart?.dispose()
  radarChart?.dispose()
})

async function loadOvertimeAlerts() {
  const params: any = {}
  if (filters.value.severity) params.severity = filters.value.severity
  
  const res = await efficiencyApi.getOvertimeAlerts(params)
  overtimeAlerts.value = res.data.data.sort((a: OvertimeAlert, b: OvertimeAlert) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.severity] - order[b.severity]
  })
}

async function loadAllocationIssues() {
  const res = await efficiencyApi.getAllocationIssues()
  allocationIssues.value = res.data.data
}

async function loadEfficiencyMetrics() {
  const res = await efficiencyApi.getMetrics()
  efficiencyMetrics.value = res.data.data.sort((a: EfficiencyMetric, b: EfficiencyMetric) => 
    b.overallScore - a.overallScore
  )
  
  nextTick(() => {
    initRadarChart()
  })
}

async function loadAllocationStats() {
  const res = await projectsApi.getAllocationStats()
  allocationStats.value = res.data.data
  
  nextTick(() => {
    initHeatmapChart()
  })
}

function nextTick(callback: () => void) {
  setTimeout(callback, 100)
}

function initHeatmapChart() {
  if (!heatmapChartRef.value) return
  
  heatmapChart = echarts.init(heatmapChartRef.value)
  
  const employees = allocationStats.value.map(s => s.employeeName)
  const projects: string[] = []
  
  allocationStats.value.forEach(s => {
    s.projects.forEach((p: any) => {
      if (!projects.includes(p.projectName)) {
        projects.push(p.projectName)
      }
    })
  })
  
  const data: any[] = []
  employees.forEach((emp, empIdx) => {
    const stat = allocationStats.value.find(s => s.employeeName === emp)
    projects.forEach((proj, projIdx) => {
      const p = stat?.projects.find((p: any) => p.projectName === proj)
      data.push([projIdx, empIdx, p?.hours || 0])
    })
  })
  
  heatmapChart.setOption({
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `${employees[params.data[1]]}<br/>${projects[params.data[0]]}<br/>${params.data[2]} 小时`
      }
    },
    grid: { height: '50%', top: '10%' },
    xAxis: {
      type: 'category',
      data: projects,
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: employees,
      splitArea: { show: true }
    },
    visualMap: {
      min: 0,
      max: 200,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
      }
    },
    series: [{
      name: '工时分布',
      type: 'heatmap',
      data,
      label: { show: true },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  })
}

function initRadarChart() {
  if (!radarChartRef.value) return
  
  radarChart = echarts.init(radarChartRef.value)
  
  const indicators = [
    { name: '工作效率', max: 1 },
    { name: '任务完成率', max: 1 },
    { name: '协作评分', max: 1 },
    { name: '综合评分', max: 1 }
  ]
  
  const series: any[] = efficiencyMetrics.value.slice(0, 5).map((m, i) => ({
    name: m.employeeName,
    value: [
      m.workEfficiency,
      m.taskCompletionRate,
      m.collaborationScore,
      m.overallScore
    ],
    areaStyle: {
      color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.3, [
        { offset: 0, color: colors[i % colors.length] + '80' },
        { offset: 1, color: colors[i % colors.length] + '20' }
      ])
    }
  }))
  
  radarChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { data: efficiencyMetrics.value.slice(0, 5).map(m => m.employeeName) },
    radar: {
      indicator: indicators,
      splitArea: {
        areaStyle: ['rgba(102, 126, 234, 0.1)', 'rgba(102, 126, 234, 0.05)']
      }
    },
    series: [{
      type: 'radar',
      data: series
    }]
  })
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}

.text-danger {
  color: #721c24;
  font-weight: 600;
}
</style>
