<template>
  <div class="traces-container">
    <el-card class="search-form">
      <el-form :inline="true" :model="searchForm" label-width="80px">
        <el-form-item label="TraceID">
          <el-input v-model="searchForm.traceId" placeholder="输入TraceID" clearable style="width: 300px" />
        </el-form-item>
        <el-form-item label="服务">
          <el-select v-model="searchForm.service" placeholder="全部服务" clearable style="width: 150px">
            <el-option 
              v-for="s in services" 
              :key="s.id" 
              :label="s.name" 
              :value="s.name" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="进行中" value="in_progress" />
            <el-option label="成功" value="ok" />
            <el-option label="错误" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="!selectedTrace" class="table-container">
      <template #header>
        <div class="card-header">
          <span>链路列表</span>
          <el-button type="primary" size="small" @click="generateTestTrace">
            <el-icon><Plus /></el-icon>
            生成测试链路
          </el-button>
        </div>
      </template>

      <el-table :data="traces" v-loading="loading" style="width: 100%">
        <el-table-column prop="traceId" label="TraceID" width="280">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewTraceDetail(row)">
              {{ row.traceId }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="service" label="根服务" width="150" />
        <el-table-column prop="operation" label="操作" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="spans" label="Span数" width="80">
          <template #default="{ row }">
            {{ row.spans?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时" width="120">
          <template #default="{ row }">
            <span v-if="row.duration">{{ formatDuration(row.duration) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.startTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-else class="trace-detail-container">
      <template #header>
        <div class="card-header">
          <span>
            <el-button type="primary" link @click="selectedTrace = null">
              <el-icon><ArrowLeft /></el-icon>
              返回列表
            </el-button>
            链路详情: {{ selectedTrace.traceId }}
          </span>
          <el-button type="primary" size="small" @click="viewTraceLogs">
            <el-icon><Document /></el-icon>
            查看关联日志
          </el-button>
        </div>
      </template>

      <el-descriptions :column="3" border style="margin-bottom: 20px">
        <el-descriptions-item label="TraceID">{{ selectedTrace.traceId }}</el-descriptions-item>
        <el-descriptions-item label="根服务">{{ selectedTrace.service }}</el-descriptions-item>
        <el-descriptions-item label="操作">{{ selectedTrace.operation }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedTrace.status)">
            {{ getStatusName(selectedTrace.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="总耗时">
          {{ selectedTrace.duration ? formatDuration(selectedTrace.duration) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="Span数量">{{ selectedTrace.spans?.length || 0 }}</el-descriptions-item>
      </el-descriptions>

      <el-tabs v-model="detailTab">
        <el-tab-pane label="瀑布图" name="waterfall">
          <div ref="waterfallChart" class="chart-container"></div>
        </el-tab-pane>
        <el-tab-pane label="调用树" name="tree">
          <div class="tree-container">
            <el-tree
              :data="traceTree"
              :props="treeProps"
              default-expand-all
              :expand-on-click-node="false"
            >
              <template #default="{ node, data }">
                <div class="tree-node">
                  <span class="node-service">
                    <el-tag :type="getServiceTagType(data.service)" size="small">
                      {{ data.service }}
                    </el-tag>
                  </span>
                  <span class="node-operation">{{ data.operation }}</span>
                  <span class="node-status">
                    <el-tag :type="getStatusType(data.status)" size="small">
                      {{ getStatusName(data.status) }}
                    </el-tag>
                  </span>
                  <span class="node-duration" v-if="data.duration">
                    {{ formatDuration(data.duration) }}
                  </span>
                </div>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Span列表" name="spans">
          <el-table :data="selectedTrace.spans || []" style="width: 100%">
            <el-table-column prop="spanId" label="SpanID" width="200" />
            <el-table-column prop="parentSpanId" label="父SpanID" width="200">
              <template #default="{ row }">
                <span v-if="row.parentSpanId">{{ row.parentSpanId }}</span>
                <span v-else style="color: #909399">- (根Span)</span>
              </template>
            </el-table-column>
            <el-table-column prop="service" label="服务" width="150" />
            <el-table-column prop="operation" label="操作" width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="耗时" width="100">
              <template #default="{ row }">
                <span v-if="row.duration">{{ formatDuration(row.duration) }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog 
      v-model="logsDialogVisible" 
      title="关联日志" 
      width="90%"
      :close-on-click-modal="false"
    >
      <el-table :data="traceLogs" style="width: 100%">
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="service" label="服务" width="150" />
        <el-table-column prop="message" label="消息" min-width="300" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { useLogsStore } from '@/stores/logs'
import { tracesApi, logsApi } from '@/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const logsStore = useLogsStore()

const services = computed(() => logsStore.services)
const traces = ref([])
const loading = ref(false)
const selectedTrace = ref(null)
const detailTab = ref('waterfall')
const waterfallChart = ref(null)
let chartInstance = null

const searchForm = ref({
  traceId: '',
  service: '',
  status: ''
})

const logsDialogVisible = ref(false)
const traceLogs = ref([])

const treeProps = {
  children: 'children',
  label: 'operation'
}

const traceTree = computed(() => {
  if (!selectedTrace.value || !selectedTrace.value.spans) return []
  
  const spans = selectedTrace.value.spans
  const spanMap = {}
  const roots = []
  
  spans.forEach(span => {
    spanMap[span.spanId] = { ...span, children: [] }
  })
  
  spans.forEach(span => {
    const node = spanMap[span.spanId]
    if (span.parentSpanId && spanMap[span.parentSpanId]) {
      spanMap[span.parentSpanId].children.push(node)
    } else {
      roots.push(node)
    }
  })
  
  return roots
})

function formatTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  return `${(ms / 60000).toFixed(2)}m`
}

function getStatusType(status) {
  const types = {
    'in_progress': 'info',
    'ok': 'success',
    'error': 'danger'
  }
  return types[status] || 'info'
}

function getStatusName(status) {
  const names = {
    'in_progress': '进行中',
    'ok': '成功',
    'error': '错误'
  }
  return names[status] || status
}

function getServiceTagType(service) {
  const colors = ['primary', 'success', 'warning', 'danger', 'info']
  const hash = service.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function getLevelType(level) {
  const types = {
    DEBUG: 'info',
    INFO: 'success',
    WARN: 'warning',
    ERROR: 'danger',
    FATAL: 'danger'
  }
  return types[level] || 'info'
}

async function handleSearch() {
  loading.value = true
  try {
    const params = {}
    if (searchForm.value.traceId) {
      const trace = await tracesApi.getById(searchForm.value.traceId)
      traces.value = trace ? [trace] : []
    } else {
      if (searchForm.value.service) params.service = searchForm.value.service
      if (searchForm.value.status) params.status = searchForm.value.status
      const result = await tracesApi.search(params)
      traces.value = result.data || []
    }
  } catch (error) {
    console.error('搜索链路失败:', error)
  } finally {
    loading.value = false
  }
}

function handleReset() {
  searchForm.value = {
    traceId: '',
    service: '',
    status: ''
  }
  handleSearch()
}

async function viewTraceDetail(trace) {
  try {
    const result = await tracesApi.getTree(trace.traceId)
    selectedTrace.value = result.data
    await nextTick()
    initWaterfallChart()
  } catch (error) {
    console.error('获取链路详情失败:', error)
  }
}

async function viewTraceLogs() {
  if (!selectedTrace.value) return
  
  try {
    const result = await logsApi.search({ traceId: selectedTrace.value.traceId })
    traceLogs.value = result.data || []
    logsDialogVisible.value = true
  } catch (error) {
    console.error('获取关联日志失败:', error)
  }
}

function initWaterfallChart() {
  if (!waterfallChart.value || !selectedTrace.value) return
  
  chartInstance = echarts.init(waterfallChart.value)
  
  const spans = selectedTrace.value.spans || []
  if (spans.length === 0) return
  
  const startTime = Math.min(...spans.map(s => s.startTime))
  
  const seriesData = spans
    .sort((a, b) => a.startTime - b.startTime)
    .map((span, index) => {
      const relativeStart = span.startTime - startTime
      const duration = span.duration || 0
      
      return {
        name: `${span.service} - ${span.operation}`,
        value: [relativeStart, duration],
        itemStyle: {
          color: span.status === 'error' ? '#f56c6c' : 
                 span.status === 'in_progress' ? '#409eff' : '#67c23a'
        }
      }
    })
  
  const maxEnd = Math.max(...spans.map(s => (s.startTime - startTime) + (s.duration || 0)))
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const data = params[0].data
        return `<div>${data.name}</div>
                <div>开始: ${data.value[0]}ms</div>
                <div>耗时: ${data.value[1]}ms</div>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '时间 (ms)',
      max: maxEnd > 0 ? maxEnd * 1.1 : 100
    },
    yAxis: {
      type: 'category',
      data: seriesData.map(d => d.name),
      inverse: true
    },
    series: [
      {
        type: 'bar',
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          formatter: '{c}ms'
        },
        data: seriesData
      }
    ]
  }
  
  chartInstance.setOption(option)
}

async function generateTestTrace() {
  const services = ['api-gateway', 'user-service', 'order-service', 'payment-service']
  
  try {
    const result = await tracesApi.create({
      service: 'api-gateway',
      operation: 'POST /api/orders',
      metadata: {
        requestId: `req-${Date.now()}`,
        userId: `user-${Math.floor(Math.random() * 1000)}`
      }
    })
    
    const { traceId, spanId: rootSpanId } = result.data
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const span2 = await tracesApi.createSpan({
      traceId,
      parentSpanId: rootSpanId,
      service: 'user-service',
      operation: 'validateUser'
    })
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    await tracesApi.finishSpan(span2.data.spanId, {
      traceId,
      status: 'ok',
      tags: { userId: '123', role: 'admin' }
    })
    
    await new Promise(resolve => setTimeout(resolve, 20))
    
    const span3 = await tracesApi.createSpan({
      traceId,
      parentSpanId: rootSpanId,
      service: 'order-service',
      operation: 'createOrder'
    })
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const span4 = await tracesApi.createSpan({
      traceId,
      parentSpanId: span3.data.spanId,
      service: 'payment-service',
      operation: 'processPayment'
    })
    
    await new Promise(resolve => setTimeout(resolve, 150))
    
    await tracesApi.finishSpan(span4.data.spanId, {
      traceId,
      status: 'ok',
      tags: { amount: 99.99, currency: 'CNY' }
    })
    
    await tracesApi.finishSpan(span3.data.spanId, {
      traceId,
      status: 'ok',
      tags: { orderId: `ORD-${Date.now()}` }
    })
    
    await tracesApi.finishSpan(rootSpanId, {
      traceId,
      status: 'ok',
      tags: { statusCode: 200 }
    })
    
    await handleSearch()
    ElMessage.success('测试链路生成成功')
  } catch (error) {
    console.error('生成测试链路失败:', error)
    ElMessage.error('生成测试链路失败')
  }
}

watch(detailTab, () => {
  if (detailTab.value === 'waterfall') {
    nextTick(() => {
      initWaterfallChart()
    })
  }
})

onMounted(async () => {
  await logsStore.fetchServices()
  await handleSearch()
  
  const traceIdFromRoute = route.query.traceId
  if (traceIdFromRoute) {
    searchForm.value.traceId = traceIdFromRoute
    await handleSearch()
    if (traces.value.length > 0) {
      await viewTraceDetail(traces.value[0])
    }
  }
})
</script>

<style scoped>
.traces-container {
  width: 100%;
}

.trace-detail-container {
  width: 100%;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.tree-container {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 10px;
}

.node-service {
  min-width: 120px;
}

.node-operation {
  flex: 1;
  font-weight: 500;
}

.node-status {
  min-width: 60px;
}

.node-duration {
  min-width: 80px;
  color: #909399;
  font-family: monospace;
}
</style>
