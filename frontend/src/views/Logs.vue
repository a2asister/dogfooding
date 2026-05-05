<template>
  <div class="logs-container">
    <el-card class="search-form">
      <el-form :inline="true" :model="searchForm" label-width="80px">
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
        <el-form-item label="级别">
          <el-select v-model="searchForm.level" placeholder="全部级别" clearable style="width: 120px">
            <el-option label="DEBUG" value="DEBUG" />
            <el-option label="INFO" value="INFO" />
            <el-option label="WARN" value="WARN" />
            <el-option label="ERROR" value="ERROR" />
            <el-option label="FATAL" value="FATAL" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="Docker容器" value="docker" />
            <el-option label="K8s容器" value="k8s" />
            <el-option label="后端服务" value="backend" />
            <el-option label="前端埋点" value="frontend" />
            <el-option label="小程序" value="miniprogram" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="搜索关键词" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px"
          />
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

    <el-card class="table-container">
      <template #header>
        <div class="card-header">
          <span>日志列表</span>
          <div>
            <el-button type="primary" size="small" @click="generateTestLogs">
              <el-icon><Plus /></el-icon>
              生成测试日志
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="logs" 
        v-loading="loading"
        style="width: 100%"
        @row-click="handleRowClick"
      >
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
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="service" label="服务" width="150" />
        <el-table-column prop="message" label="消息" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="log-message" :class="getLevelClass(row.level)">
              {{ row.message }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="traceId" label="TraceID" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button 
              v-if="row.traceId" 
              type="primary" 
              link 
              size="small"
              @click.stop="viewTrace(row.traceId)"
            >
              {{ row.traceId.substring(0, 12) }}...
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog 
      v-model="detailVisible" 
      title="日志详情" 
      width="800px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border v-if="currentLog">
        <el-descriptions-item label="ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ formatTime(currentLog.timestamp) }}</el-descriptions-item>
        <el-descriptions-item label="级别">
          <el-tag :type="getLevelType(currentLog.level)">{{ currentLog.level }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="类型">{{ getTypeName(currentLog.type) }}</el-descriptions-item>
        <el-descriptions-item label="服务">{{ currentLog.service }}</el-descriptions-item>
        <el-descriptions-item label="TraceID">
          <span v-if="currentLog.traceId">{{ currentLog.traceId }}</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="消息" :span="2">
          <div class="detail-message">{{ currentLog.message }}</div>
        </el-descriptions-item>
      </el-descriptions>
      
      <el-divider />
      
      <el-tabs v-model="detailTab" type="border-card">
        <el-tab-pane label="原始数据" name="original">
          <el-input
            v-model="originalJson"
            type="textarea"
            :rows="10"
            readonly
            style="font-family: monospace"
          />
        </el-tab-pane>
        <el-tab-pane label="脱敏后数据" name="masked">
          <el-input
            v-model="maskedJson"
            type="textarea"
            :rows="10"
            readonly
            style="font-family: monospace"
          />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useLogsStore } from '@/stores/logs'

const router = useRouter()
const logsStore = useLogsStore()

const logs = computed(() => logsStore.logs)
const loading = computed(() => logsStore.loading)
const total = computed(() => logsStore.total)
const services = computed(() => logsStore.services)

const searchForm = ref({
  service: '',
  level: '',
  type: '',
  keyword: '',
  timeRange: null
})

const pagination = ref({
  page: 1,
  pageSize: 20
})

const detailVisible = ref(false)
const detailTab = ref('original')
const currentLog = ref(null)
const originalJson = ref('')
const maskedJson = ref('')

function formatTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')
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

function getLevelClass(level) {
  const classes = {
    DEBUG: 'log-debug',
    INFO: 'log-info',
    WARN: 'log-warn',
    ERROR: 'log-error',
    FATAL: 'log-fatal'
  }
  return classes[level] || ''
}

function getTypeName(type) {
  const names = {
    docker: 'Docker容器',
    k8s: 'K8s容器',
    backend: '后端服务',
    frontend: '前端埋点',
    miniprogram: '小程序'
  }
  return names[type] || type
}

function buildSearchParams() {
  const params = {
    limit: pagination.value.pageSize,
    offset: (pagination.value.page - 1) * pagination.value.pageSize
  }
  
  if (searchForm.value.service) {
    params.service = searchForm.value.service
  }
  
  if (searchForm.value.level) {
    params.level = searchForm.value.level
  }
  
  if (searchForm.value.type) {
    params.type = searchForm.value.type
  }
  
  if (searchForm.value.keyword) {
    params.keyword = searchForm.value.keyword
  }
  
  if (searchForm.value.timeRange && searchForm.value.timeRange.length === 2) {
    params.startTime = searchForm.value.timeRange[0].valueOf()
    params.endTime = searchForm.value.timeRange[1].valueOf()
  }
  
  return params
}

async function handleSearch() {
  pagination.value.page = 1
  const params = buildSearchParams()
  await logsStore.fetchLogs(params)
}

function handleReset() {
  searchForm.value = {
    service: '',
    level: '',
    type: '',
    keyword: '',
    timeRange: null
  }
  pagination.value.page = 1
  handleSearch()
}

function handleSizeChange(size) {
  pagination.value.pageSize = size
  handleSearch()
}

function handleCurrentChange(page) {
  pagination.value.page = page
  handleSearch()
}

function handleRowClick(row) {
  viewDetail(row)
}

function viewDetail(row) {
  currentLog.value = row
  originalJson.value = JSON.stringify(row.originalData || {}, null, 2)
  maskedJson.value = JSON.stringify(row.maskedData || {}, null, 2)
  detailVisible.value = true
}

function viewTrace(traceId) {
  router.push(`/traces?traceId=${traceId}`)
}

async function generateTestLogs() {
  const testLogs = []
  const services = ['api-gateway', 'user-service', 'order-service', 'payment-service', 'notification-service']
  const levels = ['DEBUG', 'INFO', 'INFO', 'INFO', 'WARN', 'ERROR']
  const types = ['docker', 'k8s', 'backend', 'frontend', 'miniprogram']
  
  const messages = [
    'User authentication successful',
    'Database connection established',
    'Request processed successfully',
    'Cache miss for key: user:123',
    'Rate limit exceeded for API endpoint',
    'Failed to connect to external service',
    'NullPointerException occurred',
    'Memory usage exceeded threshold',
    'Page view tracked successfully',
    'Component mounted: Dashboard'
  ]
  
  for (let i = 0; i < 50; i++) {
    testLogs.push({
      timestamp: Date.now() - Math.floor(Math.random() * 86400000),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      service: services[Math.floor(Math.random() * services.length)],
      type: types[Math.floor(Math.random() * types.length)],
      traceId: Math.random() > 0.5 ? `trace-${Date.now()}-${i}` : null,
      tags: {
        environment: 'production',
        version: '1.0.0',
        instance: `instance-${Math.floor(Math.random() * 5)}`
      }
    })
  }
  
  await logsStore.ingestLogs(testLogs, 'backend')
  await handleSearch()
  ElMessage.success(`成功生成 ${testLogs.length} 条测试日志`)
}

onMounted(async () => {
  await logsStore.fetchServices()
  await handleSearch()
})
</script>

<style scoped>
.logs-container {
  width: 100%;
}

.log-message {
  font-family: monospace;
  font-size: 13px;
}

.log-debug { color: #909399; }
.log-info { color: #67c23a; }
.log-warn { color: #e6a23c; }
.log-error { color: #f56c6c; }
.log-fatal { color: #c03636; font-weight: bold; }

.detail-message {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
