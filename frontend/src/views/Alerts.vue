<template>
  <div class="alerts-container">
    <el-card class="search-form">
      <el-form :inline="true" :model="searchForm" label-width="80px">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="待处理" value="OPEN" />
            <el-option label="已确认" value="ACKNOWLEDGED" />
            <el-option label="已解决" value="RESOLVED" />
            <el-option label="已关闭" value="CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item label="级别">
          <el-select v-model="searchForm.severity" placeholder="全部级别" clearable style="width: 150px">
            <el-option label="低" value="LOW" />
            <el-option label="中" value="MEDIUM" />
            <el-option label="高" value="HIGH" />
            <el-option label="严重" value="CRITICAL" />
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

    <el-card class="table-container">
      <template #header>
        <div class="card-header">
          <span>告警列表</span>
          <div>
            <el-button type="warning" size="small" @click="evaluateRules">
              <el-icon><Warning /></el-icon>
              评估规则
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="alerts" v-loading="loading" style="width: 100%">
        <el-table-column prop="severity" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getSeverityType(row.severity)">
              {{ getSeverityName(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ruleName" label="规则名称" width="150" />
        <el-table-column prop="message" label="消息" min-width="250" show-overflow-tooltip />
        <el-table-column prop="currentValue" label="当前值" width="100">
          <template #default="{ row }">
            <span class="alert-value">
              {{ row.currentValue }} / {{ row.threshold }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                type="primary" 
                link 
                size="small"
                :disabled="row.status !== 'OPEN'"
                @click="handleAcknowledge(row)"
              >
                确认
              </el-button>
              <el-button 
                type="success" 
                link 
                size="small"
                :disabled="row.status === 'RESOLVED' || row.status === 'CLOSED'"
                @click="handleResolve(row)"
              >
                解决
              </el-button>
              <el-button 
                type="primary" 
                link 
                size="small"
                @click="viewDetail(row)"
              >
                详情
              </el-button>
            </el-button-group>
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
      title="告警详情" 
      width="700px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border v-if="currentAlert">
        <el-descriptions-item label="ID">{{ currentAlert.id }}</el-descriptions-item>
        <el-descriptions-item label="规则ID">{{ currentAlert.ruleId }}</el-descriptions-item>
        <el-descriptions-item label="规则名称">{{ currentAlert.ruleName }}</el-descriptions-item>
        <el-descriptions-item label="级别">
          <el-tag :type="getSeverityType(currentAlert.severity)">
            {{ getSeverityName(currentAlert.severity) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentAlert.status)">
            {{ getStatusName(currentAlert.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前值/阈值">
          {{ currentAlert.currentValue }} / {{ currentAlert.threshold }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(currentAlert.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ currentAlert.updatedAt ? formatTime(currentAlert.updatedAt) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="确认人">
          {{ currentAlert.acknowledgedBy || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="解决时间">
          {{ currentAlert.resolvedAt ? formatTime(currentAlert.resolvedAt) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="消息" :span="2">
          {{ currentAlert.message }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog 
      v-model="resolveVisible" 
      title="解决告警" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="resolveForm" label-width="80px">
        <el-form-item label="解决人">
          <el-input v-model="resolveForm.resolvedBy" placeholder="请输入解决人" />
        </el-form-item>
        <el-form-item label="解决方案">
          <el-input 
            v-model="resolveForm.resolution" 
            type="textarea" 
            :rows="4"
            placeholder="请输入解决方案"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resolveVisible = false">取消</el-button>
        <el-button type="primary" @click="submitResolve">确认解决</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { alertsApi } from '@/api'

const alerts = ref([])
const loading = ref(false)
const total = ref(0)
const currentAlert = ref(null)
const detailVisible = ref(false)
const resolveVisible = ref(false)
const alertToResolve = ref(null)

const searchForm = ref({
  status: '',
  severity: ''
})

const pagination = ref({
  page: 1,
  pageSize: 20
})

const resolveForm = ref({
  resolvedBy: '',
  resolution: ''
})

function formatTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

function getSeverityType(severity) {
  const types = {
    LOW: 'info',
    MEDIUM: 'warning',
    HIGH: 'danger',
    CRITICAL: 'danger'
  }
  return types[severity] || 'info'
}

function getSeverityName(severity) {
  const names = {
    LOW: '低',
    MEDIUM: '中',
    HIGH: '高',
    CRITICAL: '严重'
  }
  return names[severity] || severity
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

function getStatusName(status) {
  const names = {
    OPEN: '待处理',
    ACKNOWLEDGED: '已确认',
    RESOLVED: '已解决',
    CLOSED: '已关闭'
  }
  return names[status] || status
}

async function handleSearch() {
  loading.value = true
  try {
    const params = {
      limit: pagination.value.pageSize,
      offset: (pagination.value.page - 1) * pagination.value.pageSize
    }
    
    if (searchForm.value.status) {
      params.status = searchForm.value.status
    }
    
    if (searchForm.value.severity) {
      params.severity = searchForm.value.severity
    }
    
    const result = await alertsApi.getAlerts(params)
    alerts.value = result.data || []
    total.value = result.total || 0
  } catch (error) {
    console.error('获取告警失败:', error)
  } finally {
    loading.value = false
  }
}

function handleReset() {
  searchForm.value = {
    status: '',
    severity: ''
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

function viewDetail(alert) {
  currentAlert.value = alert
  detailVisible.value = true
}

async function handleAcknowledge(alert) {
  try {
    await ElMessageBox.confirm(
      '确认要处理此告警吗？',
      '确认处理',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await alertsApi.acknowledge(alert.id, { acknowledgedBy: 'admin' })
    ElMessage.success('告警已确认')
    await handleSearch()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认告警失败:', error)
      ElMessage.error('确认告警失败')
    }
  }
}

function handleResolve(alert) {
  alertToResolve.value = alert
  resolveForm.value = {
    resolvedBy: 'admin',
    resolution: ''
  }
  resolveVisible.value = true
}

async function submitResolve() {
  if (!alertToResolve.value) return
  
  try {
    await alertsApi.resolve(alertToResolve.value.id, {
      resolvedBy: resolveForm.value.resolvedBy,
      resolution: resolveForm.value.resolution
    })
    
    ElMessage.success('告警已解决')
    resolveVisible.value = false
    await handleSearch()
  } catch (error) {
    console.error('解决告警失败:', error)
    ElMessage.error('解决告警失败')
  }
}

async function evaluateRules() {
  try {
    const result = await alertsApi.evaluateRules()
    const triggered = result.results.filter(r => r.triggered).length
    ElMessage.success(`规则评估完成，触发 ${triggered} 个告警`)
    await handleSearch()
  } catch (error) {
    console.error('评估规则失败:', error)
    ElMessage.error('评估规则失败')
  }
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.alerts-container {
  width: 100%;
}

.alert-value {
  font-family: monospace;
  font-weight: bold;
  color: #f56c6c;
}
</style>
