<template>
  <div>
    <div class="toolbar">
      <h2 style="margin: 0; font-size: 20px; font-weight: 600">机器人集群管理</h2>
      <div class="toolbar-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新增机器人
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <div class="stat-icon" style="background: rgba(255,255,255,0.2)"><Cpu /></div>
          <div class="stat-content">
            <div class="stat-value">{{ robots.length }}</div>
            <div class="stat-label">机器人总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%)">
          <div class="stat-icon" style="background: rgba(255,255,255,0.2)"><CircleCheck /></div>
          <div class="stat-content">
            <div class="stat-value">{{ onlineCount }}</div>
            <div class="stat-label">在线机器人</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          <div class="stat-icon" style="background: rgba(255,255,255,0.2)"><Timer /></div>
          <div class="stat-content">
            <div class="stat-value">{{ runningCount }}</div>
            <div class="stat-label">运行中</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
          <div class="stat-icon" style="background: rgba(255,255,255,0.2)"><List /></div>
          <div class="stat-content">
            <div class="stat-value">{{ assignedCount }}</div>
            <div class="stat-label">已分配流程</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12" v-for="robot in robots" :key="robot.id">
        <el-card class="page-card" shadow="hover">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div style="display: flex; align-items: center; gap: 12px">
                <div
                  :style="{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: robot.status === 'online'
                      ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                      : 'linear-gradient(135deg, #909399 0%, #c0c4cc 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    color: '#fff'
                  }"
                >
                  <Cpu />
                </div>
                <div>
                  <div style="font-weight: 600; color: #303133; font-size: 16px">{{ robot.name }}</div>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span class="status-tag">
                      <span class="status-dot" :class="robot.status"></span>
                      <span :style="{ color: robot.status === 'online' ? '#67c23a' : '#909399' }">
                        {{ robot.status === 'online' ? '在线' : '离线' }}
                      </span>
                    </span>
                    <el-tag v-if="robot.isRunning" type="warning" size="small" effect="dark">
                      运行中
                    </el-tag>
                  </div>
                </div>
              </div>
              <el-dropdown @command="handleCommand">
                <el-button type="primary" link>
                  操作 <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{ action: 'edit', robot }">编辑</el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'assign', robot }">分配流程</el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'heartbeat', robot }">发送心跳</el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'delete', robot }" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          
          <el-descriptions :column="2" border size="small" style="margin-bottom: 16px">
            <el-descriptions-item label="机器人 ID">
              <span style="font-family: monospace; color: #909399">{{ robot.id }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="类型">
              <el-tag size="small">{{ robot.type }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="平台">
              <el-tag size="small" effect="plain">{{ robot.platform }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="版本">
              <span style="color: #606266">{{ robot.version }}</span>
            </el-descriptions-item>
          </el-descriptions>
          
          <div style="margin-bottom: 16px">
            <div style="font-weight: 500; margin-bottom: 12px; color: #303133">资源使用</div>
            <el-row :gutter="20">
              <el-col :span="8">
                <div style="font-size: 12px; color: #909399; margin-bottom: 4px">CPU</div>
                <el-progress
                  :percentage="robot.resources?.cpu || 0"
                  :stroke-width="8"
                  :color="getProgressColor(robot.resources?.cpu)"
                />
              </el-col>
              <el-col :span="8">
                <div style="font-size: 12px; color: #909399; margin-bottom: 4px">内存</div>
                <el-progress
                  :percentage="robot.resources?.memory || 0"
                  :stroke-width="8"
                  :color="getProgressColor(robot.resources?.memory)"
                />
              </el-col>
              <el-col :span="8">
                <div style="font-size: 12px; color: #909399; margin-bottom: 4px">磁盘</div>
                <el-progress
                  :percentage="robot.resources?.disk || 0"
                  :stroke-width="8"
                  :color="getProgressColor(robot.resources?.disk)"
                />
              </el-col>
            </el-row>
          </div>
          
          <div>
            <div style="font-weight: 500; margin-bottom: 8px; color: #303133">分配的流程</div>
            <div v-if="robot.assignedWorkflows?.length > 0">
              <el-tag
                v-for="workflowId in robot.assignedWorkflows"
                :key="workflowId"
                type="primary"
                size="small"
                closable
                @close="unassignWorkflow(robot, workflowId)"
                style="margin-right: 8px; margin-bottom: 8px"
              >
                {{ getWorkflowName(workflowId) }}
              </el-tag>
            </div>
            <el-empty v-else description="暂无分配流程" :image-size="60" />
          </div>
          
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0">
            <el-row :gutter="20">
              <el-col :span="12">
                <div style="font-size: 12px; color: #909399">上次心跳</div>
                <div style="color: #303133">{{ formatTime(robot.lastHeartbeat) }}</div>
              </el-col>
              <el-col :span="12">
                <div style="font-size: 12px; color: #909399">注册时间</div>
                <div style="color: #303133">{{ formatTime(robot.createdAt) }}</div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="dialogVisible"
      :title="editingRobot ? '编辑机器人' : '新增机器人'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="机器人名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入机器人名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入机器人描述"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" style="width: 100%">
            <el-option label="网页自动化" value="web" />
            <el-option label="桌面自动化" value="desktop" />
            <el-option label="混合自动化" value="hybrid" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-select v-model="formData.platform" style="width: 100%">
            <el-option label="Windows" value="windows" />
            <el-option label="macOS" value="macos" />
            <el-option label="Linux" value="linux" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="formData.version" placeholder="例如: 1.0.0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="assignDialogVisible"
      title="分配流程"
      width="500px"
      :close-on-click-modal="false"
    >
      <div style="margin-bottom: 16px">
        <div style="font-weight: 600; margin-bottom: 8px">机器人: {{ currentRobot?.name }}</div>
      </div>
      <el-form label-width="0">
        <el-form-item>
          <el-select
            v-model="selectedWorkflowId"
            placeholder="选择要分配的流程"
            style="width: 100%"
          >
            <el-option
              v-for="workflow in availableWorkflows"
              :key="workflow.id"
              :label="workflow.name"
              :value="workflow.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign" :disabled="!selectedWorkflowId">
          确认分配
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Cpu, CircleCheck, Timer, List, ArrowDown } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { robotsAPI, workflowsAPI } from '@/api'

const robots = ref([])
const workflows = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingRobot = ref(null)
const formRef = ref(null)

const formData = reactive({
  name: '',
  description: '',
  type: 'hybrid',
  platform: 'windows',
  version: '1.0.0'
})

const rules = {
  name: [{ required: true, message: '请输入机器人名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择机器人类型', trigger: 'change' }],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }]
}

const assignDialogVisible = ref(false)
const currentRobot = ref(null)
const selectedWorkflowId = ref('')

const onlineCount = computed(() => robots.value.filter(r => r.status === 'online').length)
const runningCount = computed(() => robots.value.filter(r => r.isRunning).length)
const assignedCount = computed(() => {
  const set = new Set()
  robots.value.forEach(r => r.assignedWorkflows?.forEach(w => set.add(w)))
  return set.size
})

const availableWorkflows = computed(() => {
  if (!currentRobot.value) return []
  const assigned = new Set(currentRobot.value.assignedWorkflows || [])
  return workflows.value.filter(w => !assigned.has(w.id))
})

const formatTime = (time) => {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const getProgressColor = (percent) => {
  if (percent >= 80) return '#f56c6c'
  if (percent >= 60) return '#e6a23c'
  return '#67c23a'
}

const getWorkflowName = (workflowId) => {
  const workflow = workflows.value.find(w => w.id === workflowId)
  return workflow?.name || workflowId
}

const loadRobots = async () => {
  loading.value = true
  try {
    const res = await robotsAPI.getRobots()
    robots.value = res.data
  } catch (error) {
    ElMessage.error('加载机器人列表失败')
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

const openCreateDialog = () => {
  editingRobot.value = null
  Object.assign(formData, {
    name: '',
    description: '',
    type: 'hybrid',
    platform: 'windows',
    version: '1.0.0'
  })
  dialogVisible.value = true
}

const handleCommand = (cmd) => {
  const { action, robot } = cmd
  switch (action) {
    case 'edit':
      editRobot(robot)
      break
    case 'assign':
      openAssignDialog(robot)
      break
    case 'heartbeat':
      sendHeartbeat(robot)
      break
    case 'delete':
      deleteRobot(robot)
      break
  }
}

const editRobot = (robot) => {
  editingRobot.value = robot
  Object.assign(formData, {
    name: robot.name,
    description: robot.description,
    type: robot.type,
    platform: robot.platform,
    version: robot.version
  })
  dialogVisible.value = true
}

const openAssignDialog = (robot) => {
  currentRobot.value = robot
  selectedWorkflowId.value = ''
  assignDialogVisible.value = true
}

const confirmAssign = async () => {
  if (!currentRobot.value || !selectedWorkflowId.value) return
  
  try {
    await robotsAPI.assignWorkflow(currentRobot.value.id, {
      workflowId: selectedWorkflowId.value
    })
    ElMessage.success('分配成功')
    assignDialogVisible.value = false
    loadRobots()
  } catch (error) {
    ElMessage.error('分配失败')
    console.error(error)
  }
}

const unassignWorkflow = async (robot, workflowId) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消分配此流程吗？',
      '确认',
      { type: 'warning' }
    )
    await robotsAPI.unassignWorkflow(robot.id, {
      workflowId
    })
    ElMessage.success('已取消分配')
    loadRobots()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
      console.error(error)
    }
  }
}

const sendHeartbeat = async (robot) => {
  try {
    await robotsAPI.sendHeartbeat(robot.id)
    ElMessage.success('心跳发送成功')
    loadRobots()
  } catch (error) {
    ElMessage.error('心跳发送失败')
    console.error(error)
  }
}

const deleteRobot = async (robot) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除机器人 "${robot.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await robotsAPI.deleteRobot(robot.id)
    ElMessage.success('删除成功')
    loadRobots()
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
    
    if (editingRobot.value) {
      await robotsAPI.updateRobot(editingRobot.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      await robotsAPI.createRobot(formData)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadRobots()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(editingRobot.value ? '更新失败' : '创建失败')
      console.error(error)
    }
  }
}

onMounted(() => {
  loadRobots()
  loadWorkflows()
})
</script>
