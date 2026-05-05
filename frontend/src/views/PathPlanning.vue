<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { pathPlanningApi } from '@/api/path-planning'
import { useRobotStore } from '@/stores/robot'
import { useObstacleStore } from '@/stores/obstacle'
import type { Position } from '@/api/robot'

const robotStore = useRobotStore()
const obstacleStore = useObstacleStore()

const GRID_SIZE = 20
const startPos = reactive<Position>({ x: 1, y: 1 })
const endPos = reactive<Position>({ x: 18, y: 18 })
const plannedPath = ref<Position[]>([])
const selectedRobot = ref<string>('')
const planning = ref(false)

const robotOptions = computed(() =>
  robotStore.idleRobots.map((r) => ({ label: r.name, value: r.id })),
)

onMounted(() => {
  robotStore.fetchRobots()
  obstacleStore.fetchObstacles()
})

function getCellClass(x: number, y: number): string {
  const classes: string[] = []

  if (x === startPos.x && y === startPos.y) {
    classes.push('start')
  } else if (x === endPos.x && y === endPos.y) {
    classes.push('end')
  }

  const robot = robotStore.robots.find(
    (r) => r.position.x === x && r.position.y === y,
  )
  if (robot) {
    classes.push('robot')
  }

  const obstacle = obstacleStore.obstacles.find(
    (o) => o.position.x === x && o.position.y === y,
  )
  if (obstacle) {
    classes.push('obstacle')
  }

  const isPath = plannedPath.value.some(
    (p) => p.x === x && p.y === y,
  )
  if (isPath) {
    classes.push('path')
  }

  return classes.join(' ')
}

function getCellContent(x: number, y: number): string {
  if (x === startPos.x && y === startPos.y) {
    return '起'
  }
  if (x === endPos.x && y === endPos.y) {
    return '终'
  }

  const robot = robotStore.robots.find(
    (r) => r.position.x === x && r.position.y === y,
  )
  if (robot) {
    return '🤖'
  }

  const obstacle = obstacleStore.obstacles.find(
    (o) => o.position.x === x && o.position.y === y,
  )
  if (obstacle) {
    return '🚧'
  }

  const pathIndex = plannedPath.value.findIndex(
    (p) => p.x === x && p.y === y,
  )
  if (pathIndex > 0 && pathIndex < plannedPath.value.length - 1) {
    return '•'
  }

  return ''
}

function handleCellClick(x: number, y: number) {
  const obstacle = obstacleStore.obstacles.find(
    (o) => o.position.x === x && o.position.y === y,
  )
  if (obstacle) {
    ElMessage.warning('不能选择障碍物位置')
    return
  }

  if (!startPos.x && !startPos.y) {
    startPos.x = x
    startPos.y = y
  } else if (!endPos.x && !endPos.y) {
    endPos.x = x
    endPos.y = y
  }
}

function clearPath() {
  startPos.x = 1
  startPos.y = 1
  endPos.x = 18
  endPos.y = 18
  plannedPath.value = []
  selectedRobot.value = ''
}

async function planPath() {
  if (startPos.x === endPos.x && startPos.y === endPos.y) {
    ElMessage.warning('起点和终点不能相同')
    return
  }

  planning.value = true
  try {
    const result = await pathPlanningApi.planPath({
      start: startPos,
      end: endPos,
    })

    if (result.found) {
      plannedPath.value = result.path
      ElMessage.success(`路径规划成功，总距离: ${result.distance.toFixed(2)}`)
    } else {
      ElMessage.error('无法找到可行路径')
    }
  } catch (error) {
    console.error(error)
  } finally {
    planning.value = false
  }
}

async function assignPathToRobot() {
  if (!selectedRobot.value) {
    ElMessage.warning('请先选择机器人')
    return
  }
  if (plannedPath.value.length === 0) {
    ElMessage.warning('请先规划路径')
    return
  }

  try {
    await robotStore.updateRobot(selectedRobot.value, {
      path: plannedPath.value,
      currentPathIndex: 0,
    })
    ElMessage.success('路径已分配给机器人')
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div>
    <h1 class="page-header">路径规划</h1>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>路径规划地图</span>
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
          <div style="margin-top: 16px; display: flex; gap: 16px; flex-wrap: wrap">
            <span style="display: flex; align-items: center; gap: 4px">
              <span
                class="map-cell start"
                style="width: 24px; height: 24px"
              >起</span>
              起点
            </span>
            <span style="display: flex; align-items: center; gap: 4px">
              <span
                class="map-cell end"
                style="width: 24px; height: 24px"
              >终</span>
              终点
            </span>
            <span style="display: flex; align-items: center; gap: 4px">
              <span
                class="map-cell path"
                style="width: 24px; height: 24px"
              >•</span>
              路径
            </span>
            <span style="display: flex; align-items: center; gap: 4px">
              <span style="font-size: 16px">🤖</span> 机器人
            </span>
            <span style="display: flex; align-items: center; gap: 4px">
              <span style="font-size: 16px">🚧</span> 障碍物
            </span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card style="margin-bottom: 20px">
          <template #header>
            <span>路径设置</span>
          </template>
          <el-form label-width="80px">
            <el-form-item label="起点">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-input-number
                    v-model="startPos.x"
                    :min="0"
                    :max="19"
                    label="X"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="12">
                  <el-input-number
                    v-model="startPos.y"
                    :min="0"
                    :max="19"
                    label="Y"
                    style="width: 100%"
                  />
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="终点">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-input-number
                    v-model="endPos.x"
                    :min="0"
                    :max="19"
                    label="X"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="12">
                  <el-input-number
                    v-model="endPos.y"
                    :min="0"
                    :max="19"
                    label="Y"
                    style="width: 100%"
                  />
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="选择机器人">
              <el-select
                v-model="selectedRobot"
                placeholder="选择空闲机器人"
                style="width: 100%"
              >
                <el-option
                  v-for="robot in robotOptions"
                  :key="robot.value"
                  :label="robot.label"
                  :value="robot.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <div style="display: flex; gap: 10px; margin-top: 16px">
            <el-button type="primary" @click="planPath" :loading="planning">
              <el-icon><Guide /></el-icon>
              规划路径
            </el-button>
            <el-button @click="clearPath">
              <el-icon><Delete /></el-icon>
              清除
            </el-button>
          </div>
        </el-card>

        <el-card v-if="plannedPath.length > 0">
          <template #header>
            <span>规划结果</span>
          </template>
          <div style="margin-bottom: 16px">
            <p>路径长度: {{ plannedPath.length }} 个节点</p>
            <p
              style="
                max-height: 150px;
                overflow-y: auto;
                background: #f5f7fa;
                padding: 10px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
              "
            >
              {{
                plannedPath
                  .map((p) => `(${p.x},${p.y})`)
                  .join(' → ')
              }}
            </p>
          </div>
          <el-button
            type="success"
            :disabled="!selectedRobot"
            @click="assignPathToRobot"
          >
            <el-icon><Cpu /></el-icon>
            分配给机器人
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
</style>
