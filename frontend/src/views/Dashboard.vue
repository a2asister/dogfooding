<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRobotStore } from '@/stores/robot'
import { useTaskStore } from '@/stores/task'
import { useObstacleStore } from '@/stores/obstacle'
import type { Position } from '@/api/robot'

const robotStore = useRobotStore()
const taskStore = useTaskStore()
const obstacleStore = useObstacleStore()

const GRID_SIZE = 20
const gridData = ref<number[][]>(
  Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0)),
)

const autoRefresh = ref(false)
let refreshInterval: ReturnType<typeof setInterval> | null = null

const stats = computed(() => ({
  totalRobots: robotStore.robots.length,
  idleRobots: robotStore.idleRobots.length,
  workingRobots: robotStore.workingRobots.length,
  lowBatteryRobots: robotStore.lowBatteryRobots.length,
  totalTasks: taskStore.tasks.length,
  pendingTasks: taskStore.pendingTasks.length,
  inProgressTasks: taskStore.inProgressTasks.length,
  completedTasks: taskStore.completedTasks.length,
}))

function getCellClass(x: number, y: number): string {
  const classes: string[] = []
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

  return classes.join(' ')
}

function getCellContent(x: number, y: number): string {
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

  return ''
}

async function refreshData() {
  await Promise.all([
    robotStore.fetchRobots(),
    taskStore.fetchTasks(),
    obstacleStore.fetchObstacles(),
  ])
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    refreshInterval = setInterval(refreshData, 3000)
  } else if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

onMounted(() => {
  refreshData()
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<template>
  <div>
    <h1 class="page-header">仪表盘</h1>

    <div class="action-bar">
      <div></div>
      <div class="filter-bar">
        <el-switch
          v-model="autoRefresh"
          @change="toggleAutoRefresh"
          active-text="自动刷新"
        />
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" style="margin-bottom: 24px">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-number">{{ stats.totalRobots }}</div>
          <div class="stats-label">机器人总数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-number" style="color: #67c23a">
            {{ stats.idleRobots }}
          </div>
          <div class="stats-label">空闲机器人</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-number" style="color: #e6a23c">
            {{ stats.workingRobots }}
          </div>
          <div class="stats-label">工作中</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-number" style="color: #f56c6c">
            {{ stats.lowBatteryRobots }}
          </div>
          <div class="stats-label">低电量警告</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-bottom: 24px">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-number">{{ stats.totalTasks }}</div>
          <div class="stats-label">任务总数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-number" style="color: #909399">
            {{ stats.pendingTasks }}
          </div>
          <div class="stats-label">待分配</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-number" style="color: #e6a23c">
            {{ stats.inProgressTasks }}
          </div>
          <div class="stats-label">进行中</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-number" style="color: #67c23a">
            {{ stats.completedTasks }}
          </div>
          <div class="stats-label">已完成</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>实时地图</span>
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
                >
                  {{ getCellContent(x - 1, y - 1) }}
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top: 16px; display: flex; gap: 16px">
            <span style="display: flex; align-items: center; gap: 4px">
              <span style="font-size: 16px">🤖</span> 机器人
            </span>
            <span style="display: flex; align-items: center; gap: 4px">
              <span style="font-size: 16px">🚧</span> 障碍物
            </span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card style="margin-bottom: 20px">
          <template #header>
            <span>机器人状态</span>
          </template>
          <el-table :data="robotStore.robots" stripe>
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
            <el-table-column label="电量" width="120">
              <template #default="{ row }">
                <div style="display: flex; align-items: center; gap: 8px">
                  <div class="battery-bar">
                    <div
                      class="battery-fill"
                      :class="{
                        'battery-high': row.batteryLevel > 60,
                        'battery-medium':
                          row.batteryLevel <= 60 && row.batteryLevel > 30,
                        'battery-low': row.batteryLevel <= 30,
                      }"
                      :style="{ width: row.batteryLevel + '%' }"
                    ></div>
                  </div>
                  <span>{{ row.batteryLevel }}%</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="位置" width="100">
              <template #default="{ row }">
                ({{ row.position.x }}, {{ row.position.y }})
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card>
          <template #header>
            <span>待处理任务</span>
          </template>
          <el-table
            :data="taskStore.pendingTasks.slice(0, 5)"
            stripe
            empty-text="暂无待处理任务"
          >
            <el-table-column prop="name" label="任务名称" />
            <el-table-column label="优先级" width="80">
              <template #default="{ row }">
                <span :class="'priority-' + row.priority">
                  {{
                    { low: '低', medium: '中', high: '高' }[row.priority]
                  }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="目标位置" width="100">
              <template #default="{ row }">
                ({{ row.targetPosition.x }}, {{ row.targetPosition.y }})
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
</style>
