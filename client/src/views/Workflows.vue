<template>
  <div>
    <div class="toolbar">
      <h2 style="margin: 0; font-size: 20px; font-weight: 600">流程编排</h2>
      <div class="toolbar-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建流程
        </el-button>
      </div>
    </div>

    <el-card class="page-card">
      <el-table :data="workflows" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="流程名称" min-width="200">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 12px">
              <div
                :style="{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: row.type === 'web' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 18
                }"
              >
                <el-icon>
                  <component :is="row.type === 'web' ? 'Globe' : 'Monitor'" />
                </el-icon>
              </div>
              <div>
                <div style="font-weight: 500; color: #303133">{{ row.name }}</div>
                <div style="font-size: 12px; color: #909399">{{ row.description || '暂无描述' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'web' ? 'primary' : 'success'" size="small">
              {{ row.type === 'web' ? '网页' : '桌面' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="节点数量" width="100">
          <template #default="{ row }">
            {{ (row.nodes?.length || 0) }} 个
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editWorkflow(row)">
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="runWorkflow(row)">
              执行
            </el-button>
            <el-button type="danger" link size="small" @click="deleteWorkflow(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingWorkflow ? '编辑流程' : '新建流程'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="流程名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入流程名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入流程描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="formData.type">
            <el-radio value="web">网页自动化</el-radio>
            <el-radio value="desktop">桌面自动化</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio value="draft">草稿</el-radio>
            <el-radio value="active">激活</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="runDialogVisible"
      title="执行流程"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="runFormData" label-width="80px">
        <el-form-item label="选择机器人">
          <el-select v-model="runFormData.robotId" placeholder="请选择执行机器人" style="width: 100%">
            <el-option
              v-for="robot in availableRobots"
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
      </el-form>
      <template #footer>
        <el-button @click="runDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRun">开始执行</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { workflowsAPI, robotsAPI } from '@/api'

const router = useRouter()
const loading = ref(false)
const workflows = ref([])
const availableRobots = ref([])

const dialogVisible = ref(false)
const editingWorkflow = ref(null)
const formRef = ref(null)
const formData = reactive({
  name: '',
  description: '',
  type: 'web',
  status: 'draft'
})

const rules = {
  name: [{ required: true, message: '请输入流程名称', trigger: 'blur' }]
}

const runDialogVisible = ref(false)
const currentWorkflow = ref(null)
const runFormData = reactive({
  robotId: ''
})

const getStatusType = (status) => {
  const map = {
    active: 'success',
    draft: 'info',
    disabled: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    active: '激活',
    draft: '草稿',
    disabled: '禁用'
  }
  return map[status] || status
}

const formatTime = (time) => {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const loadWorkflows = async () => {
  loading.value = true
  try {
    const res = await workflowsAPI.getWorkflows()
    workflows.value = res.data
  } catch (error) {
    ElMessage.error('加载流程列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadRobots = async () => {
  try {
    const res = await robotsAPI.getRobots()
    availableRobots.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const openCreateDialog = () => {
  editingWorkflow.value = null
  Object.assign(formData, {
    name: '',
    description: '',
    type: 'web',
    status: 'draft'
  })
  dialogVisible.value = true
}

const editWorkflow = (row) => {
  router.push(`/workflows/${row.id}`)
}

const deleteWorkflow = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除流程 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await workflowsAPI.deleteWorkflow(row.id)
    ElMessage.success('删除成功')
    loadWorkflows()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const runWorkflow = (row) => {
  currentWorkflow.value = row
  runFormData.robotId = availableRobots.value.find(r => r.status === 'online')?.id || ''
  runDialogVisible.value = true
}

const confirmRun = async () => {
  if (!runFormData.robotId) {
    ElMessage.warning('请选择执行机器人')
    return
  }
  
  try {
    await workflowsAPI.runWorkflow(currentWorkflow.value.id, {
      robotId: runFormData.robotId
    })
    ElMessage.success('流程已开始执行')
    runDialogVisible.value = false
    router.push('/executions')
  } catch (error) {
    ElMessage.error('执行流程失败')
    console.error(error)
  }
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    
    if (editingWorkflow.value) {
      await workflowsAPI.updateWorkflow(editingWorkflow.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      const res = await workflowsAPI.createWorkflow(formData)
      ElMessage.success('创建成功')
      router.push(`/workflows/${res.data.id}`)
    }
    
    dialogVisible.value = false
    loadWorkflows()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(editingWorkflow.value ? '更新失败' : '创建失败')
      console.error(error)
    }
  }
}

onMounted(() => {
  loadWorkflows()
  loadRobots()
})
</script>
