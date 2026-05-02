<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">效能概览</h1>
      <p class="page-subtitle">整合多维度数据，全面掌握团队效能状态</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>正在加载数据...</span>
    </div>

    <div v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalEmployees }}</div>
            <div class="stat-label">总员工数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">📁</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeProjects }}</div>
            <div class="stat-label">进行中项目</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">⏰</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.avgWorkHours }}</div>
            <div class="stat-label">平均工时/天</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ (stats.taskCompletionRate * 100).toFixed(1) }}%</div>
            <div class="stat-label">任务完成率</div>
          </div>
        </div>
        <div class="stat-card" :class="{ 'warning': stats.overtimeCount > 5 }">
          <div class="stat-icon orange">⚠️</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.overtimeCount }}</div>
            <div class="stat-label">加班告警</div>
          </div>
        </div>
        <div class="stat-card" :class="{ 'warning': stats.allocationIssueCount > 3 }">
          <div class="stat-icon yellow">⚖️</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.allocationIssueCount }}</div>
            <div class="stat-label">分配失衡</div>
          </div>
        </div>
      </div>

      <div class="chart-grid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">每日工时趋势</h3>
          </div>
          <div ref="dailyChartRef" class="chart-container" style="height: 380px; width: 100%;"></div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">协作类型分布</h3>
          </div>
          <div ref="collabTypeChartRef" class="chart-container" style="height: 380px; width: 100%;"></div>
        </div>
      </div>

      <div class="chart-grid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">员工效能评分</h3>
          </div>
          <div ref="efficiencyChartRef" class="chart-container" style="height: 380px; width: 100%;"></div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">项目任务分布</h3>
          </div>
          <div ref="projectTaskChartRef" class="chart-container" style="height: 380px; width: 100%;"></div>
        </div>
      </div>

      <div class="chart-grid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">团队效能雷达图</h3>
          </div>
          <div ref="radarChartRef" class="chart-container" style="height: 380px; width: 100%;"></div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">团队效能综合得分趋势</h3>
          </div>
          <div ref="trendChartRef" class="chart-container" style="height: 380px; width: 100%;"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">团队效能热力图</h3>
          <p class="page-subtitle" style="margin: 0;">员工×项目 工时分布</p>
        </div>
        <div ref="heatmapChartRef" class="chart-container" style="height: 450px; width: 100%;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { dashboardApi, attendanceApi, collaborationApi, efficiencyApi, tasksApi, projectsApi } from '../api'

interface Stats {
  totalEmployees: number
  activeProjects: number
  avgWorkHours: number
  taskCompletionRate: number
  overtimeCount: number
  allocationIssueCount: number
  avgOverallScore?: number
}

const loading = ref(true)
const stats = ref<Stats>({
  totalEmployees: 0,
  activeProjects: 0,
  avgWorkHours: 0,
  taskCompletionRate: 0,
  overtimeCount: 0,
  allocationIssueCount: 0,
  avgOverallScore: 0
})

const dailyChartRef = ref<HTMLElement>()
const collabTypeChartRef = ref<HTMLElement>()
const efficiencyChartRef = ref<HTMLElement>()
const projectTaskChartRef = ref<HTMLElement>()
const radarChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
const heatmapChartRef = ref<HTMLElement>()

let dailyChart: echarts.ECharts | null = null
let collabTypeChart: echarts.ECharts | null = null
let efficiencyChart: echarts.ECharts | null = null
let projectTaskChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null
let heatmapChart: echarts.ECharts | null = null

const chartData = ref({
  dailyData: [] as any[],
  collabTypeData: [] as any[],
  metricsData: [] as any[],
  projectStatsData: [] as any[],
  allocationStats: [] as any[]
})

const colors = ['#667eea', '#38ef7d', '#f5576c', '#4facfe', '#f093fb', '#fee140']

function handleResize() {
  dailyChart?.resize()
  collabTypeChart?.resize()
  efficiencyChart?.resize()
  projectTaskChart?.resize()
  radarChart?.resize()
  trendChart?.resize()
  heatmapChart?.resize()
}

onMounted(async () => {
  try {
    const [dashboardRes, dailyRes, collabTypeRes, metricsRes, projectStatsRes, allocationRes] = await Promise.all([
      dashboardApi.getStats(),
      attendanceApi.getDailyStats(),
      collaborationApi.getTypeStats(),
      efficiencyApi.getMetrics(),
      tasksApi.getProjectStats(),
      projectsApi.getAllocationStats()
    ])

    console.log('Dashboard response:', dashboardRes.data)
    console.log('Daily stats:', dailyRes.data)
    console.log('Metrics:', metricsRes.data)

    stats.value = dashboardRes.data.data
    chartData.value = {
      dailyData: dailyRes.data.data,
      collabTypeData: collabTypeRes.data.data,
      metricsData: metricsRes.data.data,
      projectStatsData: projectStatsRes.data.data,
      allocationStats: allocationRes.data.data
    }

    await nextTick()
    
    initAllCharts()

    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  dailyChart?.dispose()
  collabTypeChart?.dispose()
  efficiencyChart?.dispose()
  projectTaskChart?.dispose()
  radarChart?.dispose()
  trendChart?.dispose()
  heatmapChart?.dispose()
})

function initAllCharts() {
  initDailyChart()
  initCollabTypeChart()
  initEfficiencyChart()
  initProjectTaskChart()
  initRadarChart()
  initTrendChart()
  initHeatmapChart()

  setTimeout(() => {
    handleResize()
  }, 100)
}

function initDailyChart() {
  if (!dailyChartRef.value) return
  
  dailyChart = echarts.init(dailyChartRef.value)
  
  const sorted = chartData.value.dailyData.slice().sort((a: any, b: any) => a.date.localeCompare(b.date))
  const last14 = sorted.slice(-14)
  
  const option = {
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: { color: '#333' }
    },
    legend: { 
      data: ['平均工时'],
      top: 10,
      textStyle: { fontSize: 12 }
    },
    grid: { 
      left: '8%', 
      right: '8%', 
      bottom: '15%', 
      top: '18%',
      containLabel: true 
    },
    xAxis: {
      type: 'category',
      data: last14.map((d: any) => d.date.slice(5)),
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
        data: last14.map((d: any) => d.avgHours),
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
  
  dailyChart.setOption(option)
}

function initCollabTypeChart() {
  if (!collabTypeChartRef.value) return
  
  collabTypeChart = echarts.init(collabTypeChartRef.value)
  
  const typeNames: Record<string, string> = {
    'meeting': '会议',
    'email': '邮件',
    'chat': '即时聊天',
    'code-review': '代码审查'
  }
  
  const option = {
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c}次 ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1
    },
    legend: { 
      orient: 'vertical', 
      left: '5%',
      top: 'center',
      textStyle: { fontSize: 12 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
      label: { 
        show: true, 
        formatter: '{b}\n{d}%',
        fontSize: 12,
        lineHeight: 18
      },
      labelLine: { 
        show: true,
        length: 15,
        length2: 10
      },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 0, 0, 0.3)' }
      },
      data: chartData.value.collabTypeData.map((d: any, i: number) => ({
        value: d.count,
        name: typeNames[d.type] || d.type,
        itemStyle: { color: colors[i % colors.length] }
      }))
    }]
  }
  
  collabTypeChart.setOption(option)
}

function initEfficiencyChart() {
  if (!efficiencyChartRef.value) return
  
  efficiencyChart = echarts.init(efficiencyChartRef.value)
  
  const sorted = chartData.value.metricsData.slice().sort((a: any, b: any) => b.overallScore - a.overallScore)
  
  const option = {
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1
    },
    legend: { 
      data: ['工作效率', '任务完成率', '协作评分'],
      top: 10,
      textStyle: { fontSize: 12 }
    },
    grid: { 
      left: '15%', 
      right: '8%', 
      bottom: '15%', 
      top: '18%',
      containLabel: true 
    },
    xAxis: { 
      type: 'value', 
      max: 1.2,
      axisLabel: { 
        formatter: '{value}',
        fontSize: 11
      },
      axisLine: { lineStyle: { color: '#ddd' } },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: sorted.map((d: any) => d.employeeName),
      axisLabel: { 
        fontSize: 11,
        width: 80,
        overflow: 'truncate'
      },
      axisLine: { lineStyle: { color: '#ddd' } }
    },
    series: [
      {
        name: '工作效率',
        type: 'bar',
        barWidth: '25%',
        data: sorted.map((d: any) => d.workEfficiency),
        itemStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: colors[0] },
            { offset: 1, color: '#9381ff' }
          ]),
          borderRadius: [0, 4, 4, 0]
        }
      },
      {
        name: '任务完成率',
        type: 'bar',
        barWidth: '25%',
        data: sorted.map((d: any) => d.taskCompletionRate),
        itemStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: colors[1] },
            { offset: 1, color: '#6ae4a7' }
          ]),
          borderRadius: [0, 4, 4, 0]
        }
      },
      {
        name: '协作评分',
        type: 'bar',
        barWidth: '25%',
        data: sorted.map((d: any) => d.collaborationScore),
        itemStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: colors[2] },
            { offset: 1, color: '#ff8a9a' }
          ]),
          borderRadius: [0, 4, 4, 0]
        }
      }
    ]
  }
  
  efficiencyChart.setOption(option)
}

function initProjectTaskChart() {
  if (!projectTaskChartRef.value) return
  
  projectTaskChart = echarts.init(projectTaskChartRef.value)
  
  const option = {
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1
    },
    legend: { 
      data: ['已完成', '进行中', '待处理'],
      top: 10,
      textStyle: { fontSize: 12 }
    },
    grid: { 
      left: '5%', 
      right: '8%', 
      bottom: '20%', 
      top: '18%',
      containLabel: true 
    },
    xAxis: {
      type: 'category',
      data: chartData.value.projectStatsData.map((d: any) => d.projectName),
      axisLabel: { 
        fontSize: 11,
        rotate: 30,
        width: 100,
        overflow: 'truncate'
      },
      axisLine: { lineStyle: { color: '#ddd' } }
    },
    yAxis: { 
      type: 'value',
      axisLabel: { fontSize: 11 },
      axisLine: { lineStyle: { color: '#ddd' } },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
    },
    series: [
      {
        name: '已完成',
        type: 'bar',
        stack: 'total',
        barWidth: '50%',
        data: chartData.value.projectStatsData.map((d: any) => d.completedTasks),
        itemStyle: { 
          color: colors[1],
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '进行中',
        type: 'bar',
        stack: 'total',
        data: chartData.value.projectStatsData.map((d: any) => d.inProgressTasks),
        itemStyle: { color: colors[3] }
      },
      {
        name: '待处理',
        type: 'bar',
        stack: 'total',
        data: chartData.value.projectStatsData.map((d: any) => d.pendingTasks),
        itemStyle: { color: colors[5] }
      }
    ]
  }
  
  projectTaskChart.setOption(option)
}

function initRadarChart() {
  if (!radarChartRef.value) return
  
  radarChart = echarts.init(radarChartRef.value)
  
  const top5 = chartData.value.metricsData.slice().sort((a: any, b: any) => b.overallScore - a.overallScore).slice(0, 3)
  
  const indicators = [
    { name: '工作效率', max: 1 },
    { name: '任务完成率', max: 1 },
    { name: '协作评分', max: 1 },
    { name: '综合评分', max: 1 }
  ]
  
  const seriesData = top5.map((emp: any, i: number) => ({
    name: emp.employeeName,
    value: [
      emp.workEfficiency,
      emp.taskCompletionRate,
      emp.collaborationScore,
      emp.overallScore
    ],
    areaStyle: {
      color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
        { offset: 0, color: colors[i] + '40' },
        { offset: 1, color: colors[i] + '10' }
      ])
    },
    lineStyle: { width: 2, color: colors[i] },
    itemStyle: { color: colors[i] }
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1
    },
    legend: {
      data: top5.map((e: any) => e.employeeName),
      bottom: 10,
      textStyle: { fontSize: 12 }
    },
    radar: {
      indicator: indicators,
      center: ['50%', '45%'],
      radius: '55%',
      splitNumber: 4,
      axisName: {
        color: '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: '#e0e0e0' }
      },
      splitArea: {
        show: true,
        areaStyle: [
          { color: 'rgba(102, 126, 234, 0.05)' },
          { color: 'rgba(102, 126, 234, 0.08)' }
        ]
      },
      axisLine: { lineStyle: { color: '#ddd' } }
    },
    series: [{
      type: 'radar',
      data: seriesData
    }]
  }
  
  radarChart.setOption(option)
}

function initTrendChart() {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const employees = chartData.value.metricsData.slice().sort((a: any, b: any) => b.overallScore - a.overallScore).slice(0, 6)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['综合评分', '工作效率', '任务完成率'],
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
      data: employees.map((e: any) => e.employeeName),
      axisLabel: {
        fontSize: 11,
        rotate: 30
      },
      axisLine: { lineStyle: { color: '#ddd' } }
    },
    yAxis: {
      type: 'value',
      max: 1.2,
      axisLabel: { fontSize: 11 },
      axisLine: { lineStyle: { color: '#ddd' } },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
    },
    series: [
      {
        name: '综合评分',
        type: 'line',
        smooth: true,
        data: employees.map((e: any) => e.overallScore),
        itemStyle: { color: colors[0], lineWidth: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
          ])
        },
        symbol: 'circle',
        symbolSize: 10
      },
      {
        name: '工作效率',
        type: 'line',
        smooth: true,
        data: employees.map((e: any) => e.workEfficiency),
        itemStyle: { color: colors[1], lineWidth: 2 },
        symbol: 'diamond',
        symbolSize: 8
      },
      {
        name: '任务完成率',
        type: 'line',
        smooth: true,
        data: employees.map((e: any) => e.taskCompletionRate),
        itemStyle: { color: colors[2], lineWidth: 2 },
        symbol: 'triangle',
        symbolSize: 8
      }
    ]
  }
  
  trendChart.setOption(option)
}

function initHeatmapChart() {
  if (!heatmapChartRef.value) return
  
  heatmapChart = echarts.init(heatmapChartRef.value)
  
  const allocationStats = chartData.value.allocationStats
  const employees = allocationStats.map((s: any) => s.employeeName)
  
  const projectsSet = new Set<string>()
  allocationStats.forEach((stat: any) => {
    stat.projects.forEach((p: any) => {
      projectsSet.add(p.projectName)
    })
  })
  const projects = Array.from(projectsSet)
  
  const data: any[] = []
  employees.forEach((emp: string, empIdx: number) => {
    const stat = allocationStats.find((s: any) => s.employeeName === emp)
    projects.forEach((proj: string, projIdx: number) => {
      const p = stat?.projects.find((p: any) => p.projectName === proj)
      data.push([projIdx, empIdx, p?.hours || 0])
    })
  })
  
  const option = {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `<strong>${employees[params.data[1]]}</strong><br/>
                ${projects[params.data[0]]}<br/>
                工时: ${params.data[2]} 小时`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ddd',
      borderWidth: 1
    },
    grid: {
      height: '50%',
      top: '10%',
      left: '15%',
      right: '10%'
    },
    xAxis: {
      type: 'category',
      data: projects,
      splitArea: { show: true },
      axisLabel: {
        fontSize: 11,
        rotate: 30
      }
    },
    yAxis: {
      type: 'category',
      data: employees,
      splitArea: { show: true },
      axisLabel: { fontSize: 11 }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
      },
      textStyle: { fontSize: 11 }
    },
    series: [{
      name: '工时分布',
      type: 'heatmap',
      data: data,
      label: {
        show: true,
        fontSize: 10,
        color: '#333'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: 'rgba(0, 0, 0, 0.4)'
        }
      }
    }]
  }
  
  heatmapChart.setOption(option)
}
</script>

<style scoped>
.stat-card.warning {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }
  50% { box-shadow: 0 0 20px rgba(240, 147, 251, 0.4); }
}

.chart-container {
  width: 100%;
  min-height: 300px;
}
</style>
