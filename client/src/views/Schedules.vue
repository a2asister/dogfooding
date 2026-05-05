<template>
  <div>
    <div class="toolbar">
      <h2 style="margin: 0; font-size: 20px; font-weight: 600">定时任务</h2>
      <div class="toolbar-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建任务
        </el-button>
      </div>
    </div>

    <el-card class="page-card">
      <el-table :data="schedules" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="任务名称" min-width="200">
          <template #default="{ row }">
            <div>
              <div style="font-weight: 500; color: #303133">{{ row.name }}</div>
              <div style="font-size: 12px; color: #909399">{{ row.description || '暂无描述' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="关联流程" width="180">
          <template #default="{ row }">
            <el-tag type="primary" size="small" effect="plain">
              {{ getWorkflowName(row.workflowId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">
              {{ row.type === 'cron' ? 'Cron 表达式' : '固定间隔' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="调度规则" min-width="200">
          <template #default="{ row }">
            <div>
              <el-tag type="info" size="small">
                {{ row.type === 'cron' ? row.cronExpression : `每 ${row.intervalMinutes} 分钟` }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              @change="toggleSchedule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="上次执行" width="180">
          <template #default="{ row }">
            {{ formatTime(row.lastRun) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editSchedule(row)">
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="runSchedule(row)">
              执行
            </el-button>
            <el-button type="danger" link size="small" @click="deleteSchedule(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingSchedule ? '编辑定时任务' : '新建定时任务'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入任务描述"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="选择流程" prop="workflowId">
          <el-select v-model="formData.workflowId" placeholder="请选择关联的流程" style="width: 100%">
            <el-option
              v-for="workflow in workflows"
              :key="workflow.id"
              :label="workflow.name"
              :value="workflow.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择机器人" prop="robotId">
          <el-select v-model="formData.robotId" placeholder="请选择执行机器人" style="width: 100%">
            <el-option
              v-for="robot in robots"
              :key="robot.id"
              :label="robot.name"
              :value="robot.id"
              :disabled="robot.status !== 'online'"
            >
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%">
                <span>{{ robot.name }}</span>
                <span class="status-tag">
                  <span class="status-dot" :class="robot.status"></span>
                  <span :style="{ color: robot.status === 'online' ? '#67c23a' : '#909399' }">
                    {{ robot.status === 'online' ? '在线' : '离线' }}
                  </span>
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="调度类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio value="cron">Cron 表达式</el-radio>
            <el-radio value="interval">固定间隔</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Cron 表达式" v-if="formData.type === 'cron'" prop="cronExpression">
          <el-input v-model="formData.cronExpression" placeholder="例如: 0 2 * * * (每天凌晨 2 点)" />
          <div style="margin-top: 8px; font-size: 12px; color: #909399">
            格式: 秒 分 时 日 月 周
          </div>
        </el-form-item>
        <el-form-item label="间隔时间" v-else prop="intervalMinutes">
          <el-input-number v-model="formData.intervalMinutes" :min="1" :max="1440" />
          <span style="margin-left: 8px; color: #909399">分钟</span>
        </el-form-item>
        <el-form-item label="立即启用">
          <el-switch v-model="formData.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { schedulesAPI, workflowsAPI, robotsAPI } from '@/api'

const schedules = ref([])
const workflows = ref([])
const robots = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingSchedule = ref(null)
const formRef = ref(null)

const formData = reactive({
  name: '',
  description: '',
  workflowId: '',
  robotId: '',
  type: 'cron',
  cronExpression: '0 2 * * *',
  intervalMinutes: 60,
  enabled: true
})

const rules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  workflowId: [{ required: true, message: '请选择关联流程', trigger: 'change' }],
  robotId: [{ required: true, message: '请选择执行机器人', trigger: 'change' }]
}

const formatTime = (time) => {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const getWorkflowName = (workflowId) => {
  const workflow = workflows.value.find(w => w.id === workflowId)
  return workflow?.name || workflowId
}

const loadSchedules = async () => {
  loading.value = true
  try {
    const res = await schedulesAPI.getSchedules()
    schedules.value = res.data
  } catch (error) {
    ElMessage.error('加载定时任务列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadWorkflows = async () => {
  try {
    const res = await workflowsAPI.getWorkflows()
    workflows.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const loadRobots = async () => {
  try {
    const res = await robotsAPI.getRobots()
    robots.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const openCreateDialog = () => {
  editingSchedule.value = null
  Object.assign(formData, {
    name: '',
    description: '',
    workflowId: '',
    robotId: '',
    type: 'cron',
    cronExpression: '0 2 * * *',
    intervalMinutes: 60,
    enabled: true
  })
  dialogVisible.value = true
}

const editSchedule = (schedule) => {
  editingSchedule.value = schedule
  Object.assign(formData, {
    name: schedule.name,
    description: schedule.description,
    workflowId: schedule.workflowId,
    robotId: schedule.robotId,
    type: schedule.type,
    cronExpression: schedule.cronExpression,
    intervalMinutes: schedule.intervalMinutes,
    enabled: schedule.enabled
  })
  dialogVisible.value = true
}

const toggleSchedule = async (schedule) => {
  try {
    await schedulesAPI.toggleSchedule(schedule.id)
    ElMessage.success(schedule.enabled ? '任务已启用' : '任务已禁用')
  } catch (error) {
    schedule.enabled = !schedule.enabled
    ElMessage.error('操作失败')
    console.error(error)
  }
}

const runSchedule = async (schedule) => {
  try {
    await ElMessageBox.confirm(
      `确定要立即执行任务 "${schedule.name}" 吗？`,
      '执行确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    await schedulesAPI.runSchedule(schedule.id)
    ElMessage.success('任务已开始执行')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('执行失败')
      console.error(error)
    }
  }
}

const deleteSchedule = async (schedule) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务 "${schedule.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await schedulesAPI.deleteSchedule(schedule.id)
    ElMessage.success('删除成功')
    loadSchedules()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    
    if (editingSchedule.value) {
      await schedulesAPI.updateSchedule(editingSchedule.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      await schedulesAPI.createSchedule(formData)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadSchedules()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(editingSchedule.value ? '更新失败' : '创建失败')
      console.error(error)
    }
  }
}

onMounted(() => {
  loadSchedules()
  loadWorkflows()
  loadRobots()
})
</script>
