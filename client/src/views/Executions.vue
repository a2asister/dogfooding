<template>
  <div>
    <div class="toolbar">
      <h2 style="margin: 0; font-size: 20px; font-weight: 600">执行记录</h2>
      <div class="toolbar-right">
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 150px; margin-right: 10px">
          <el-option label="运行中" value="running" />
          <el-option label="已完成" value="completed" />
          <el-option label="已失败" value="failed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-button @click="loadExecutions">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-card class="page-card">
      <el-table :data="filteredExecutions" v-loading="loading" style="width: 100%">
        <el-table-column label="执行 ID" width="280">
          <template #default="{ row }">
            <div style="font-family: monospace; font-size: 12px; color: #606266">{{ row.id }}</div>
          </template>
        </el-table-column>
        <el-table-column label="流程名称" min-width="180">
          <template #default="{ row }">
            <div>
              <div style="font-weight: 500; color: #303133">{{ row.workflowName || '-' }}</div>
              <div style="font-size: 12px; color: #909399">{{ getWorkflowType(row) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="执行机器人" width="150">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.robotName || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
              effect="dark"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress || 0"
              :stroke-width="8"
              :color="getStatusColor(row.status)"
            />
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="100">
          <template #default="{ row }">
            <span v-if="row.duration">
              {{ formatDuration(row.duration) }}
            </span>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.startedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.completedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button type="primary" link size="small" @click="viewLogs(row)">
              日志
            </el-button>
            <el-button
              v-if="row.status === 'running'"
              type="danger"
              link
              size="small"
              @click="cancelExecution(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="detailDialogVisible"
      title="执行详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border style="margin-bottom: 20px">
        <el-descriptions-item label="执行 ID">
          <span style="font-family: monospace; font-size: 12px">{{ currentExecution?.id }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="流程名称">
          {{ currentExecution?.workflowName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="执行机器人">
          <el-tag size="small" effect="plain">{{ currentExecution?.robotName || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            :type="getStatusType(currentExecution?.status)"
            size="small"
            effect="dark"
          >
            {{ getStatusText(currentExecution?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ formatTime(currentExecution?.startedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ formatTime(currentExecution?.completedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="耗时" :span="2">
          {{ currentExecution?.duration ? formatDuration(currentExecution.duration) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <div v-if="currentExecution?.error">
        <div style="font-weight: 600; margin-bottom: 8px; color: #f56c6c">错误信息:</div>
        <el-input
          type="textarea"
          :rows="4"
          :model-value="currentExecution.error"
          readonly
          style="background: #fef0f0"
        />
      </div>
      
      <div v-if="currentExecution?.steps?.length > 0">
        <div style="font-weight: 600; margin-bottom: 12px">执行步骤:</div>
        <el-timeline>
          <el-timeline-item
            v-for="(step, index) in currentExecution.steps"
            :key="index"
            :type="getStepStatusType(step.status)"
            :timestamp="formatTime(step.timestamp)"
          >
            <el-card shadow="hover">
              <h4 style="margin: 0; font-weight: 600; color: #303133">{{ step.name }}</h4>
              <p v-if="step.description" style="margin: 8px 0; color: #909399; font-size: 13px">
                {{ step.description }}
              </p>
              <div style="display: flex; gap: 12px; font-size: 12px; color: #c0c4cc">
                <span>状态: {{ getStepStatusText(step.status) }}</span>
                <span v-if="step.duration">耗时: {{ formatDuration(step.duration) }}</span>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button v-if="currentExecution?.status === 'completed'" type="success">
          重新执行
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="logsDialogVisible"
      title="执行日志"
      width="800px"
      :close-on-click-modal="false"
    >
      <div style="display: flex; gap: 8px; margin-bottom: 16px">
        <el-radio-group v-model="logLevelFilter">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="info">信息</el-radio-button>
          <el-radio-button label="warn">警告</el-radio-button>
          <el-radio-button label="error">错误</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="logs-container">
        <div
          v-for="(log, index) in filteredLogs"
          :key="index"
          class="log-line"
          :class="`log-${log.level}`"
        >
          <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
          <span class="log-level" :class="`log-level-${log.level}`">
            [{{ log.level.toUpperCase() }}]
          </span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <el-empty v-if="filteredLogs.length === 0" description="暂无日志" :image-size="80" />
      </div>
      
      <template #footer>
        <el-button @click="logsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { executionsAPI } from '@/api'

const executions = ref([])
const loading = ref(false)
const filterStatus = ref('')

const detailDialogVisible = ref(false)
const currentExecution = ref(null)

const logsDialogVisible = ref(false)
const logLevelFilter = ref('all')
const logs = ref([])

const filteredExecutions = computed(() => {
  if (!filterStatus.value) return executions.value
  return executions.value.filter(e => e.status === filterStatus.value)
})

const filteredLogs = computed(() => {
  if (logLevelFilter.value === 'all') return logs.value
  return logs.value.filter(l => l.level === logLevelFilter.value)
})

const formatTime = (time) => {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

const formatLogTime = (time) => {
  if (!time) return ''
  return dayjs(time).format('HH:mm:ss.SSS')
}

const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}min`
}

const getWorkflowType = (execution) => {
  if (execution.type === 'api') return '接口自动化'
  if (execution.type === 'schedule') return '定时任务'
  return '手动执行'
}

const getStatusType = (status) => {
  const map = {
    running: 'primary',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info',
    pending: 'warning'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    running: '运行中',
    completed: '已完成',
    failed: '已失败',
    cancelled: '已取消',
    pending: '待执行'
  }
  return map[status] || status
}

const getStatusColor = (status) => {
  const map = {
    running: '#409eff',
    completed: '#67c23a',
    failed: '#f56c6c',
    cancelled: '#909399',
    pending: '#e6a23c'
  }
  return map[status] || '#409eff'
}

const getStepStatusType = (status) => {
  const map = {
    completed: 'success',
    running: 'primary',
    failed: 'danger',
    pending: 'warning'
  }
  return map[status] || 'info'
}

const getStepStatusText = (status) => {
  const map = {
    completed: '已完成',
    running: '运行中',
    failed: '失败',
    pending: '待执行'
  }
  return map[status] || status
}

const loadExecutions = async () => {
  loading.value = true
  try {
    const res = await executionsAPI.getExecutions()
    executions.value = res.data
  } catch (error) {
    ElMessage.error('加载执行记录失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const viewDetail = async (execution) => {
  currentExecution.value = execution
  detailDialogVisible.value = true
  
  try {
    const res = await executionsAPI.getExecutionSteps(execution.id)
    currentExecution.value = { ...currentExecution.value, steps: res.data }
  } catch (error) {
    console.error(error)
  }
}

const viewLogs = async (execution) => {
  logsDialogVisible.value = true
  logs.value = []
  
  try {
    const res = await executionsAPI.getExecutionLogs(execution.id)
    logs.value = res.data || []
  } catch (error) {
    ElMessage.error('加载日志失败')
    console.error(error)
  }
}

const cancelExecution = async (execution) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消此执行吗？',
      '取消确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await executionsAPI.cancelExecution(execution.id)
    ElMessage.success('已取消')
    loadExecutions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
      console.error(error)
    }
  }
}

onMounted(() => {
  loadExecutions()
})
</script>

<style scoped>
.logs-container {
  max-height: 400px;
  overflow-y: auto;
  background: #1e1e1e;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
}

.log-line {
  display: flex;
  gap: 8px;
  padding: 2px 0;
  line-height: 1.6;
}

.log-time {
  color: #6e7681;
  flex-shrink: 0;
}

.log-level {
  flex-shrink: 0;
  font-weight: 600;
}

.log-level-info {
  color: #569cd6;
}

.log-level-warn {
  color: #dcdcaa;
}

.log-level-error {
  color: #f48771;
}

.log-message {
  color: #d4d4d4;
  word-break: break-all;
}
</style>
