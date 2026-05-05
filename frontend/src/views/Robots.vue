<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRobotStore } from '@/stores/robot'
import type { CreateRobotDto } from '@/api/robot'

const robotStore = useRobotStore()

const dialogVisible = ref(false)
const dialogTitle = ref('添加机器人')
const editingRobot = ref<string | null>(null)

const formData = reactive<CreateRobotDto>({
  name: '',
  status: 'idle',
  position: { x: 0, y: 0 },
  batteryLevel: 100,
  speed: 1.0,
})

const formRules = {
  name: [{ required: true, message: '请输入机器人名称', trigger: 'blur' }],
}

onMounted(() => {
  robotStore.fetchRobots()
})

function openAddDialog() {
  editingRobot.value = null
  dialogTitle.value = '添加机器人'
  Object.assign(formData, {
    name: '',
    status: 'idle',
    position: { x: 0, y: 0 },
    batteryLevel: 100,
    speed: 1.0,
  })
  dialogVisible.value = true
}

function openEditDialog(robot: any) {
  editingRobot.value = robot.id
  dialogTitle.value = '编辑机器人'
  Object.assign(formData, {
    name: robot.name,
    status: robot.status,
    position: { ...robot.position },
    batteryLevel: robot.batteryLevel,
    speed: robot.speed,
  })
  dialogVisible.value = true
}

async function handleSave() {
  try {
    if (editingRobot.value) {
      await robotStore.updateRobot(editingRobot.value, formData)
      ElMessage.success('更新成功')
    } else {
      await robotStore.createRobot(formData)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

async function handleDelete(robot: any) {
  try {
    await ElMessageBox.confirm('确定要删除该机器人吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await robotStore.deleteRobot(robot.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

async function handleMoveRobot(robot: any) {
  if (robot.path && robot.path.length > 0) {
    await robotStore.moveRobot(robot.id)
    ElMessage.success('机器人移动')
  } else {
    ElMessage.warning('机器人没有规划路径')
  }
}

function getBatteryClass(level: number): string {
  if (level > 60) return 'battery-high'
  if (level > 30) return 'battery-medium'
  return 'battery-low'
}
</script>

<template>
  <div>
    <h1 class="page-header">机器人管理</h1>

    <div class="action-bar">
      <div></div>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加机器人
      </el-button>
    </div>

    <el-card>
      <el-table :data="robotStore.robots" stripe v-loading="robotStore.loading">
        <el-table-column prop="id" label="ID" width="150" />
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="'status-' + row.status">
              {{
                {
                  idle: '空闲',
                  working: '工作中',
                  charging: '充电中',
                  error: '错误',
                  moving: '移动中',
                }[row.status]
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="电量" width="150">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px">
              <div class="battery-bar">
                <div
                  class="battery-fill"
                  :class="getBatteryClass(row.batteryLevel)"
                  :style="{ width: row.batteryLevel + '%' }"
                ></div>
              </div>
              <span>{{ row.batteryLevel }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="speed" label="速度" width="80">
          <template #default="{ row }">
            {{ row.speed.toFixed(1) }}x
          </template>
        </el-table-column>
        <el-table-column label="位置" width="100">
          <template #default="{ row }">
            ({{ row.position.x }}, {{ row.position.y }})
          </template>
        </el-table-column>
        <el-table-column label="最后更新" width="180">
          <template #default="{ row }">
            {{ new Date(row.lastUpdate).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleMoveRobot(row)"
              :disabled="!row.path || row.path.length === 0"
            >
              移动
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
        ref="formRef"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入机器人名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option label="空闲" value="idle" />
            <el-option label="工作中" value="working" />
            <el-option label="充电中" value="charging" />
            <el-option label="错误" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-input-number
                v-model="formData.position.x"
                :min="0"
                :max="19"
                label="X"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="12">
              <el-input-number
                v-model="formData.position.y"
                :min="0"
                :max="19"
                label="Y"
                style="width: 100%"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="电量">
          <el-slider
            v-model="formData.batteryLevel"
            :min="0"
            :max="100"
            :show-tooltip="true"
          />
        </el-form-item>
        <el-form-item label="速度">
          <el-slider
            v-model="formData.speed"
            :min="0.1"
            :max="2.0"
            :step="0.1"
            :show-tooltip="true"
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
