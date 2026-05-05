<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import { useRobotStore } from '@/stores/robot'
import type { CreateTaskDto } from '@/api/task'

const taskStore = useTaskStore()
const robotStore = useRobotStore()

const dialogVisible = ref(false)
const dialogTitle = ref('添加任务')
const editingTask = ref<string | null>(null)
const statusFilter = ref<string>('all')

const formData = reactive<CreateTaskDto>({
  name: '',
  description: '',
  priority: 'medium',
  startPosition: { x: 0, y: 0 },
  targetPosition: { x: 0, y: 0 },
  estimatedTime: 0,
})

const formRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
}

const filteredTasks = computed(() => {
  if (statusFilter.value === 'all') {
    return taskStore.tasks
  }
  return taskStore.tasks.filter((t) => t.status === statusFilter.value)
})

onMounted(() => {
  taskStore.fetchTasks()
  robotStore.fetchRobots()
})

function openAddDialog() {
  editingTask.value = null
  dialogTitle.value = '添加任务'
  Object.assign(formData, {
    name: '',
    description: '',
    priority: 'medium',
    startPosition: { x: 0, y: 0 },
    targetPosition: { x: 0, y: 0 },
    estimatedTime: 0,
  })
  dialogVisible.value = true
}

function openEditDialog(task: any) {
  editingTask.value = task.id
  dialogTitle.value = '编辑任务'
  Object.assign(formData, {
    name: task.name,
    description: task.description,
    priority: task.priority,
    startPosition: { ...task.startPosition },
    targetPosition: { ...task.targetPosition },
    estimatedTime: task.estimatedTime || 0,
  })
  dialogVisible.value = true
}

async function handleSave() {
  try {
    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value, formData)
      ElMessage.success('更新成功')
    } else {
      await taskStore.createTask(formData)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

async function handleDelete(task: any) {
  try {
    await ElMessageBox.confirm('确定要删除该任务吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await taskStore.deleteTask(task.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

async function handleAssign(task: any) {
  try {
    await taskStore.assignTask(task.id)
    ElMessage.success('任务已分配')
  } catch (error: any) {
    ElMessage.error(error.message || '分配失败')
  }
}

async function handleStart(task: any) {
  try {
    await taskStore.startTask(task.id)
    ElMessage.success('任务已开始')
  } catch (error: any) {
    ElMessage.error(error.message || '开始失败')
  }
}

async function handleComplete(task: any) {
  try {
    await taskStore.completeTask(task.id)
    ElMessage.success('任务已完成')
  } catch (error: any) {
    ElMessage.error(error.message || '完成失败')
  }
}

async function handleCancel(task: any) {
  try {
    await taskStore.cancelTask(task.id)
    ElMessage.success('任务已取消')
  } catch (error: any) {
    ElMessage.error(error.message || '取消失败')
  }
}

function getRobotName(robotId?: string): string {
  const robot = robotStore.robots.find((r) => r.id === robotId)
  return robot ? robot.name : '未分配'
}
</script>

<template>
  <div>
    <h1 class="page-header">任务管理</h1>

    <div class="action-bar">
      <div class="filter-bar">
        <span>状态筛选：</span>
        <el-select v-model="statusFilter" style="width: 150px">
          <el-option label="全部" value="all" />
          <el-option label="待分配" value="pending" />
          <el-option label="已分配" value="assigned" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </div>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加任务
      </el-button>
    </div>

    <el-card>
      <el-table :data="filteredTasks" stripe v-loading="taskStore.loading">
        <el-table-column prop="id" label="ID" width="150" />
        <el-table-column prop="name" label="任务名称" width="150" />
        <el-table-column label="优先级" width="80">
          <template #default="{ row }">
            <span :class="'priority-' + row.priority">
              {{
                { low: '低', medium: '中', high: '高' }[row.priority]
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="'task-' + row.status">
              {{
                {
                  pending: '待分配',
                  assigned: '已分配',
                  in_progress: '进行中',
                  completed: '已完成',
                  cancelled: '已取消',
                }[row.status]
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="起始位置" width="100">
          <template #default="{ row }">
            ({{ row.startPosition.x }}, {{ row.startPosition.y }})
          </template>
        </el-table-column>
        <el-table-column label="目标位置" width="100">
          <template #default="{ row }">
            ({{ row.targetPosition.x }}, {{ row.targetPosition.y }})
          </template>
        </el-table-column>
        <el-table-column label="分配机器人" width="100">
          <template #default="{ row }">
            {{ getRobotName(row.assignedRobotId) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              link
              @click="handleAssign(row)"
            >
              分配
            </el-button>
            <el-button
              v-if="row.status === 'assigned'"
              type="primary"
              link
              @click="handleStart(row)"
            >
              开始
            </el-button>
            <el-button
              v-if="row.status === 'in_progress'"
              type="success"
              link
              @click="handleComplete(row)"
            >
              完成
            </el-button>
            <el-button
              v-if="
                row.status === 'pending' ||
                row.status === 'assigned' ||
                row.status === 'in_progress'
              "
              type="warning"
              link
              @click="handleCancel(row)"
            >
              取消
            </el-button>
            <el-button type="primary" link @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入任务描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="formData.priority" style="width: 100%">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="起始位置">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-input-number
                v-model="formData.startPosition.x"
                :min="0"
                :max="19"
                label="X"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="12">
              <el-input-number
                v-model="formData.startPosition.y"
                :min="0"
                :max="19"
                label="Y"
                style="width: 100%"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="目标位置">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-input-number
                v-model="formData.targetPosition.x"
                :min="0"
                :max="19"
                label="X"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="12">
              <el-input-number
                v-model="formData.targetPosition.y"
                :min="0"
                :max="19"
                label="Y"
                style="width: 100%"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="预计时间(分钟)">
          <el-input-number
            v-model="formData.estimatedTime"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
</style>
