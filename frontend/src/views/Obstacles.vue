<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useObstacleStore } from '@/stores/obstacle'
import type { CreateObstacleDto } from '@/api/obstacle'

const obstacleStore = useObstacleStore()

const GRID_SIZE = 20
const dialogVisible = ref(false)
const formData = reactive<CreateObstacleDto>({
  position: { x: 0, y: 0 },
  type: 'static',
  size: 1,
})

const formRules = {}

onMounted(() => {
  obstacleStore.fetchObstacles()
})

function getCellClass(x: number, y: number): string {
  const classes: string[] = []

  const obstacle = obstacleStore.obstacles.find(
    (o) => o.position.x === x && o.position.y === y,
  )
  if (obstacle) {
    classes.push('obstacle')
  }

  return classes.join(' ')
}

function getCellContent(x: number, y: number): string {
  const obstacle = obstacleStore.obstacles.find(
    (o) => o.position.x === x && o.position.y === y,
  )
  if (obstacle) {
    return '🚧'
  }

  return ''
}

function handleCellClick(x: number, y: number) {
  const existingObstacle = obstacleStore.obstacles.find(
    (o) => o.position.x === x && o.position.y === y,
  )

  if (existingObstacle) {
    handleDelete(existingObstacle)
  } else {
    formData.position = { x, y }
    dialogVisible.value = true
  }
}

async function handleSave() {
  try {
    const existing = obstacleStore.obstacles.find(
      (o) =>
        o.position.x === formData.position.x &&
        o.position.y === formData.position.y,
    )

    if (existing) {
      ElMessage.warning('该位置已存在障碍物')
      return
    }

    await obstacleStore.addObstacle(formData)
    ElMessage.success('添加成功')
    dialogVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

async function handleDelete(obstacle: any) {
  try {
    await ElMessageBox.confirm('确定要删除该障碍物吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await obstacleStore.removeObstacle(obstacle.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

async function updateDynamicObstacles() {
  await obstacleStore.updateDynamicObstacles()
  ElMessage.success('动态障碍物已更新')
}
</script>

<template>
  <div>
    <h1 class="page-header">障碍物管理</h1>

    <div class="action-bar">
      <div></div>
      <div class="filter-bar">
        <el-button type="warning" @click="updateDynamicObstacles">
          <el-icon><Refresh /></el-icon>
          更新动态障碍物
        </el-button>
        <el-button type="primary" @click="dialogVisible = true">
          <el-icon><Plus /></el-icon>
          添加障碍物
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>障碍物地图 (点击格子添加/移除障碍物)</span>
          </template>
          <div class="map-container">
            <div
              class="map-grid"
              :style="{ gridTemplateColumns: `repeat(${GRID_SIZE}, 30px)` }"
            >
              <div
                v-for="y in GRID_SIZE"
                :key="`row-${y}`"
                class="map-row"
              >
                <div
                  v-for="x in GRID_SIZE"
                  :key="`cell-${x}-${y}`"
                  class="map-cell"
                  :class="getCellClass(x - 1, y - 1)"
                  @click="handleCellClick(x - 1, y - 1)"
                >
                  {{ getCellContent(x - 1, y - 1) }}
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top: 16px; display: flex; gap: 16px">
            <span style="display: flex; align-items: center; gap: 4px">
              <span style="font-size: 16px">🚧</span> 障碍物
            </span>
            <span style="color: #909399">
              提示：点击空白格子添加障碍物，点击障碍物格子移除
            </span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>障碍物列表</span>
          </template>
          <el-table
            :data="obstacleStore.obstacles"
            stripe
            v-loading="obstacleStore.loading"
            empty-text="暂无障碍物"
          >
            <el-table-column prop="id" label="ID" width="150" />
            <el-table-column label="位置" width="80">
              <template #default="{ row }">
                ({{ row.position.x }}, {{ row.position.y }})
              </template>
            </el-table-column>
            <el-table-column label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.type === 'static' ? '' : 'warning'">
                  {{ row.type === 'static' ? '静态' : '动态' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button type="danger" link @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div
            style="margin-top: 20px; padding: 16px; background: #f5f7fa; border-radius: 8px"
          >
            <h4 style="margin-bottom: 12px; color: #303133">图例说明</h4>
            <div style="display: flex; flex-direction: column; gap: 8px">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-tag>静态</el-tag>
                <span style="color: #606266; font-size: 12px"
                  >固定不动的障碍物，如墙壁、柱子等</span
                >
              </div>
              <div style="display: flex; align-items: center; gap: 8px">
                <el-tag type="warning">动态</el-tag>
                <span style="color: #606266; font-size: 12px"
                  >可移动的障碍物，可随机更新位置</span
                >
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog title="添加障碍物" v-model="dialogVisible" width="400px">
      <el-form :model="formData" :rules="formRules" label-width="80px">
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
        <el-form-item label="类型">
          <el-select v-model="formData.type" style="width: 100%">
            <el-option label="静态" value="static" />
            <el-option label="动态" value="dynamic" />
          </el-select>
        </el-form-item>
        <el-form-item label="大小">
          <el-input-number
            v-model="formData.size"
            :min="1"
            :max="5"
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
