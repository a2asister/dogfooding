<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">协作分析</h1>
      <p class="page-subtitle">分析团队协作网络，识别信息流通瓶颈</p>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'network' }" @click="activeTab = 'network'">
        协作网络
      </button>
      <button class="tab" :class="{ active: activeTab === 'types' }" @click="activeTab = 'types'">
        协作类型
      </button>
      <button class="tab" :class="{ active: activeTab === 'records' }" @click="activeTab = 'records'">
        协作记录
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>正在加载数据...</span>
    </div>

    <div v-else>
      <div v-show="activeTab === 'network'" class="card">
        <div class="card-header">
          <h3 class="card-title">团队协作网络图</h3>
        </div>
        <div class="chart-container" ref="networkChartRef" style="height: 500px;"></div>
        <div class="legend-note">
          <p><strong>图例说明：</strong></p>
          <p>• 节点大小：表示该员工的协作活跃度（频次越高节点越大）</p>
          <p>• 连线粗细：表示两员工之间的协作频率</p>
          <p>• 入度：收到的协作请求数量</p>
          <p>• 出度：发起的协作请求数量</p>
        </div>
      </div>

      <div v-show="activeTab === 'types'">
        <div class="chart-grid">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">协作类型分布</h3>
            </div>
            <div class="chart-container small" ref="typeChartRef"></div>
          </div>
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">各类型平均时长</h3>
            </div>
            <div class="chart-container small" ref="durationChartRef"></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">协作类型详情</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>协作类型</th>
                <th>发生次数</th>
                <th>总频次</th>
                <th>总时长(分钟)</th>
                <th>平均时长(分钟)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in typeStats" :key="stat.type">
                <td>{{ getTypeName(stat.type) }}</td>
                <td>{{ stat.count }}</td>
                <td>{{ stat.totalFrequency }}</td>
                <td>{{ stat.totalDuration }}</td>
                <td>{{ stat.avgDuration }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-show="activeTab === 'records'" class="card">
        <div class="card-header">
          <h3 class="card-title">协作记录列表</h3>
        </div>
        <div class="filter-bar">
          <div class="filter-group">
            <label class="filter-label">发起方：</label>
            <select v-model="filters.fromEmployeeId" @change="loadRecords">
              <option value="">全部</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">接收方：</label>
            <select v-model="filters.toEmployeeId" @change="loadRecords">
              <option value="">全部</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>发起方</th>
              <th>接收方</th>
              <th>协作类型</th>
              <th>频次</th>
              <th>时长(分钟)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in collaborationRecords" :key="record.id">
              <td>{{ record.date }}</td>
              <td>{{ getEmployeeName(record.fromEmployeeId) }}</td>
              <td>{{ getEmployeeName(record.toEmployeeId) }}</td>
              <td>
                <span class="badge badge-info">{{ getTypeName(record.type) }}</span>
              </td>
              <td>{{ record.frequency }}</td>
              <td>{{ record.duration }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { collaborationApi, employeesApi } from '../api'

interface Employee {
  id: string
  name: string
  department: string
}

interface CollaborationRecord {
  id: string
  fromEmployeeId: string
  toEmployeeId: string
  date: string
  type: 'meeting' | 'email' | 'chat' | 'code-review'
  frequency: number
  duration: number
}

const loading = ref(true)
const activeTab = ref('network')
const employees = ref<Employee[]>([])
const collaborationRecords = ref<CollaborationRecord[]>([])
const typeStats = ref<any[]>([])
const networkData = ref<any>({ nodes: [], links: [] })

const networkChartRef = ref<HTMLElement>()
const typeChartRef = ref<HTMLElement>()
const durationChartRef = ref<HTMLElement>()

let networkChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null
let durationChart: echarts.ECharts | null = null

const filters = ref({
  fromEmployeeId: '',
  toEmployeeId: ''
})

const colors = ['#667eea', '#38ef7d', '#f5576c', '#4facfe', '#f093fb', '#fee140', '#ff6b6b', '#74b9ff']

const typeNames: Record<string, string> = {
  'meeting': '会议',
  'email': '邮件',
  'chat': '即时聊天',
  'code-review': '代码审查'
}

const employeeMap = computed(() => {
  const map = new Map<string, string>()
  employees.value.forEach(emp => map.set(emp.id, emp.name))
  return map
})

function getEmployeeName(id: string): string {
  return employeeMap.value.get(id) || id
}

function getTypeName(type: string): string {
  return typeNames[type] || type
}

onMounted(async () => {
  try {
    const employeesRes = await employeesApi.getAll()
    employees.value = employeesRes.data.data
    
    await loadRecords()
    await loadTypeStats()
    await loadNetworkData()
  } catch (error) {
    console.error('Failed to load collaboration data:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  networkChart?.dispose()
  typeChart?.dispose()
  durationChart?.dispose()
})

async function loadRecords() {
  const params: any = {}
  if (filters.value.fromEmployeeId) params.fromEmployeeId = filters.value.fromEmployeeId
  if (filters.value.toEmployeeId) params.toEmployeeId = filters.value.toEmployeeId
  
  const res = await collaborationApi.getAll(params)
  collaborationRecords.value = res.data.data.sort((a: CollaborationRecord, b: CollaborationRecord) => 
    b.date.localeCompare(a.date)
  )
}

async function loadTypeStats() {
  const res = await collaborationApi.getTypeStats()
  typeStats.value = res.data.data
  
  nextTick(() => {
    initTypeChart()
    initDurationChart()
  })
}

async function loadNetworkData() {
  const res = await collaborationApi.getNetwork()
  networkData.value = res.data.data
  
  nextTick(() => {
    initNetworkChart()
  })
}

function nextTick(callback: () => void) {
  setTimeout(callback, 100)
}

function initNetworkChart() {
  if (!networkChartRef.value) return
  
  networkChart = echarts.init(networkChartRef.value)
  
  const { nodes, links } = networkData.value
  
  const deptColors: Record<string, string> = {
    '技术研发部': '#667eea',
    '产品设计部': '#38ef7d',
    '市场营销部': '#f5576c',
    '人力资源部': '#4facfe'
  }
  
  const echartNodes = nodes.map((n: any) => ({
    name: n.name,
    value: n.value,
    symbolSize: 30 + n.value * 2,
    category: n.department,
    itemStyle: { color: deptColors[n.department] || '#667eea' },
    label: { show: true, formatter: '{b}' }
  }))
  
  const echartLinks = links.map((l: any) => ({
    source: employees.value.find(e => e.id === l.source)?.name || l.source,
    target: employees.value.find(e => e.id === l.target)?.name || l.target,
    value: l.value,
    lineStyle: { 
      width: Math.min(l.value * 0.5, 5),
      opacity: 0.6
    }
  }))
  
  const categories = Array.from(new Set(nodes.map((n: any) => n.department))).map(dept => ({
    name: dept
  }))
  
  networkChart.setOption({
    tooltip: {
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/>协作频次: ${params.data.value}`
        }
        const node = nodes.find((n: any) => n.name === params.name)
        return `<strong>${params.name}</strong><br/>
                部门: ${node?.department}<br/>
                协作活跃度: ${node?.value}<br/>
                入度: ${node?.inCount}<br/>
                出度: ${node?.outCount}`
      }
    },
    legend: { data: categories.map(c => c.name), left: 'center' },
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}'
      },
      draggable: true,
      data: echartNodes,
      categories,
      links: echartLinks,
      lineStyle: {
        color: 'source',
        curveness: 0.2
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 10
        }
      },
      force: {
        repulsion: 400,
        edgeLength: 120
      }
    }]
  })
}

function initTypeChart() {
  if (!typeChartRef.value) return
  
  typeChart = echarts.init(typeChartRef.value)
  
  typeChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: typeStats.value.map((s: any, i: number) => ({
        value: s.count,
        name: getTypeName(s.type),
        itemStyle: { color: colors[i % colors.length] }
      }))
    }]
  })
}

function initDurationChart() {
  if (!durationChartRef.value) return
  
  durationChart = echarts.init(durationChartRef.value)
  
  durationChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: typeStats.value.map((s: any) => getTypeName(s.type))
    },
    yAxis: { type: 'value', name: '时长(分钟)' },
    series: [{
      type: 'bar',
      data: typeStats.value.map((s: any, i: number) => ({
        value: s.avgDuration,
        itemStyle: { color: colors[i % colors.length] }
      })),
      label: { show: true, position: 'top' }
    }]
  })
}
</script>

<style scoped>
.legend-note {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
}

.legend-note p {
  margin: 4px 0;
}
</style>
