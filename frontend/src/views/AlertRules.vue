<template>
  <div class="alert-rules-container">
    <el-card class="table-container">
      <template #header>
        <div class="card-header">
          <span>告警规则列表</span>
          <el-button type="primary" size="small" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建规则
          </el-button>
        </div>
      </template>

      <el-table :data="rules" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="规则名称" width="200" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="condition" label="条件" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getConditionName(row.condition) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.level" :type="getLevelType(row.level)" size="small">
              {{ row.level }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="service" label="服务" width="120">
          <template #default="{ row }">
            <span>{{ row.service || '全部服务' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="阈值" width="100">
          <template #default="{ row }">
            <span class="threshold-value">{{ row.threshold }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="告警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getSeverityType(row.severity)" size="small">
              {{ getSeverityName(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              @change="toggleEnabled(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastEvaluated" label="最后评估" width="180">
          <template #default="{ row }">
            {{ row.lastEvaluated ? formatTime(row.lastEvaluated) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑规则' : '新建规则'" 
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="ruleForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="ruleForm.description" 
            type="textarea" 
            :rows="2"
            placeholder="请输入规则描述"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="触发条件" prop="condition">
              <el-select v-model="ruleForm.condition" placeholder="请选择条件" style="width: 100%">
                <el-option label="数量大于" value="count_gt" />
                <el-option label="数量大于等于" value="count_gte" />
                <el-option label="数量小于" value="count_lt" />
                <el-option label="数量小于等于" value="count_lte" />
                <el-option label="错误率大于(%)" value="error_rate_gt" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="阈值" prop="threshold">
              <el-input-number 
                v-model="ruleForm.threshold" 
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="日志级别">
              <el-select v-model="ruleForm.level" placeholder="全部级别" clearable style="width: 100%">
                <el-option label="DEBUG" value="DEBUG" />
                <el-option label="INFO" value="INFO" />
                <el-option label="WARN" value="WARN" />
                <el-option label="ERROR" value="ERROR" />
                <el-option label="FATAL" value="FATAL" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务">
              <el-select v-model="ruleForm.service" placeholder="全部服务" clearable style="width: 100%">
                <el-option 
                  v-for="s in services" 
                  :key="s.id" 
                  :label="s.name" 
                  :value="s.name" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关键词">
              <el-input v-model="ruleForm.keyword" placeholder="可选，过滤包含关键词的日志" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时间窗口(ms)">
              <el-input-number 
                v-model="ruleForm.timeWindow" 
                :min="1000"
                :max="86400000"
                :step="1000"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="告警级别" prop="severity">
              <el-select v-model="ruleForm.severity" placeholder="请选择告警级别" style="width: 100%">
                <el-option label="低" value="LOW" />
                <el-option label="中" value="MEDIUM" />
                <el-option label="高" value="HIGH" />
                <el-option label="严重" value="CRITICAL" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态">
              <el-switch v-model="ruleForm.enabled" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { alertsApi } from '@/api'
import { useLogsStore } from '@/stores/logs'

const logsStore = useLogsStore()
const services = computed(() => logsStore.services)

const rules = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editRuleId = ref(null)

const ruleForm = ref({
  name: '',
  description: '',
  condition: 'count_gt',
  level: null,
  service: null,
  keyword: '',
  threshold: 10,
  timeWindow: 60000,
  severity: 'MEDIUM',
  enabled: true
})

const formRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  condition: [
    { required: true, message: '请选择触发条件', trigger: 'change' }
  ],
  threshold: [
    { required: true, message: '请输入阈值', trigger: 'blur' }
  ],
  severity: [
    { required: true, message: '请选择告警级别', trigger: 'change' }
  ]
}

function formatTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

function getConditionName(condition) {
  const names = {
    count_gt: '数量 >',
    count_gte: '数量 ≥',
    count_lt: '数量 <',
    count_lte: '数量 ≤',
    error_rate_gt: '错误率 >'
  }
  return names[condition] || condition
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

async function fetchRules() {
  loading.value = true
  try {
    const result = await alertsApi.getRules()
    rules.value = result.data || []
  } catch (error) {
    console.error('获取规则失败:', error)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  ruleForm.value = {
    name: '',
    description: '',
    condition: 'count_gt',
    level: null,
    service: null,
    keyword: '',
    threshold: 10,
    timeWindow: 60000,
    severity: 'MEDIUM',
    enabled: true
  }
  editRuleId.value = null
  isEdit.value = false
}

function handleCreate() {
  resetForm()
  dialogVisible.value = true
}

function handleEdit(rule) {
  isEdit.value = true
  editRuleId.value = rule.id
  ruleForm.value = {
    name: rule.name,
    description: rule.description || '',
    condition: rule.condition,
    level: rule.level,
    service: rule.service,
    keyword: rule.keyword || '',
    threshold: rule.threshold,
    timeWindow: rule.timeWindow,
    severity: rule.severity,
    enabled: rule.enabled
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      if (isEdit.value) {
        await alertsApi.updateRule(editRuleId.value, ruleForm.value)
        ElMessage.success('规则更新成功')
      } else {
        await alertsApi.createRule(ruleForm.value)
        ElMessage.success('规则创建成功')
      }
      
      dialogVisible.value = false
      await fetchRules()
    } catch (error) {
      console.error('保存规则失败:', error)
      ElMessage.error('保存规则失败')
    }
  })
}

async function handleDelete(rule) {
  try {
    await ElMessageBox.confirm(
      `确定要删除规则"${rule.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await alertsApi.deleteRule(rule.id)
    ElMessage.success('规则删除成功')
    await fetchRules()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除规则失败:', error)
      ElMessage.error('删除规则失败')
    }
  }
}

async function toggleEnabled(rule) {
  try {
    await alertsApi.updateRule(rule.id, { enabled: rule.enabled })
    ElMessage.success(`规则已${rule.enabled ? '启用' : '禁用'}`)
  } catch (error) {
    rule.enabled = !rule.enabled
    console.error('更新规则状态失败:', error)
    ElMessage.error('更新规则状态失败')
  }
}

onMounted(async () => {
  await logsStore.fetchServices()
  await fetchRules()
})
</script>

<style scoped>
.alert-rules-container {
  width: 100%;
}

.threshold-value {
  font-family: monospace;
  font-weight: bold;
  color: #409eff;
}
</style>
