<template>
  <div>
    <div class="toolbar">
      <h2 style="margin: 0; font-size: 20px; font-weight: 600">仪表盘</h2>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div style="font-size: 32px; font-weight: 700; color: #667eea; margin-bottom: 4px">
                {{ stats.totalWorkflows || 0 }}
              </div>
              <div style="font-size: 14px; color: #909399">流程总数</div>
            </div>
            <div
              style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px"
            >
              <el-icon><Share /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div style="font-size: 32px; font-weight: 700; color: #10b981; margin-bottom: 4px">
                {{ stats.activeRobots || 0 }} / {{ stats.totalRobots || 0 }}
              </div>
              <div style="font-size: 14px; color: #909399">在线机器人</div>
            </div>
            <div
              style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px"
            >
              <el-icon><Cpu /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div style="font-size: 32px; font-weight: 700; color: #f59e0b; margin-bottom: 4px">
                {{ stats.activeSchedules || 0 }}
              </div>
              <div style="font-size: 14px; color: #909399">激活定时任务</div>
            </div>
            <div
              style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px"
            >
              <el-icon><Timer /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div style="font-size: 32px; font-weight: 700; color: #409eff; margin-bottom: 4px">
                {{ stats.totalExecutions || 0 }}
              </div>
              <div style="font-size: 14px; color: #909399">执行记录</div>
            </div>
            <div
              style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px"
            >
              <el-icon><List /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="page-card">
          <template #header>
            <div class="card-header" style="margin-bottom: 0; padding-bottom: 0; border-bottom: none">
              <span class="card-title">执行趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="page-card">
          <template #header>
            <div class="card-header" style="margin-bottom: 0; padding-bottom: 0; border-bottom: none">
              <span class="card-title">执行状态分布</span>
            </div>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="page-card">
          <template #header>
            <div class="card-header" style="margin-bottom: 0; padding-bottom: 0; border-bottom: none">
              <span class="card-title">最近执行记录</span>
              <el-button type="primary" link @click="$router.push('/executions')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentExecutions" style="width: 100%">
            <el-table-column prop="name" label="流程名称" min-width="150" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <span class="status-tag">
                  <span class="status-dot" :class="row.status"></span>
                  <el-tag :type="getStatusType(row.status)" size="small">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.type === 'manual' ? '手动' : '定时' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="执行时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.startTime) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="page-card">
          <template #header>
            <div class="card-header" style="margin-bottom: 0; padding-bottom: 0; border-bottom: none">
              <span class="card-title">机器人状态</span>
              <el-button type="primary" link @click="$router.push('/robots')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="robots" style="width: 100%">
            <el-table-column prop="name" label="机器人名称" min-width="150" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <span class="status-tag">
                  <span class="status-dot" :class="row.status"></span>
                  <el-tag :type="row.status === 'online' ? 'success' : 'info'" size="small">
                    {{ row.status === 'online' ? '在线' : '离线' }}
                  </el-tag>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="资源使用" min-width="150">
              <template #default="{ row }">
                <div style="display: flex; flex-direction: column; gap: 4px">
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span style="font-size: 12px; color: #909399; width: 32px">CPU</span>
                    <el-progress :percentage="row.cpuUsage" :stroke-width="8" :color="row.cpuUsage > 80 ? '#f56c6c' : '#67c23a'" />
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span style="font-size: 12px; color: #909399; width: 32px">内存</span>
                    <el-progress :percentage="row.memoryUsage" :stroke-width="8" :color="row.memoryUsage > 80 ? '#f56c6c' : '#409eff'" />
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { statsAPI, executionsAPI, robotsAPI } from '@/api'

const stats = reactive({
  totalWorkflows: 0,
  totalRobots: 0,
  activeRobots: 0,
  totalSchedules: 0,
  activeSchedules: 0,
  totalExecutions: 0,
  successfulExecutions: 0,
  failedExecutions: 0,
  runningExecutions: 0
})

const recentExecutions = ref([])
const robots = ref([])

const trendChartRef = ref(null)
const statusChartRef = ref(null)
let trendChart = null
let statusChart = null

const trendChartOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['成功', '失败', '运行中'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: { type: 'value' },
  series: [
    { name: '成功', type: 'line', smooth: true, data: [12, 19, 15, 22, 18, 8, 10], areaStyle: { opacity: 0.1 }, itemStyle: { color: '#67c23a' } },
    { name: '失败', type: 'line', smooth: true, data: [2, 1, 3, 1, 0, 2, 1], areaStyle: { opacity: 0.1 }, itemStyle: { color: '#f56c6c' } },
    { name: '运行中', type: 'line', smooth: true, data: [1, 0, 2, 1, 3, 0, 1], areaStyle: { opacity: 0.1 }, itemStyle: { color: '#409eff' } }
  ]
}

const getStatusChartOption = (data) => ({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    avoidLabelOverlap: false,
    itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
    label: { show: false },
    emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
    labelLine: { show: false },
    data: data || [
      { value: 85, name: '成功', itemStyle: { color: '#67c23a' } },
      { value: 10, name: '失败', itemStyle: { color: '#f56c6c' } },
      { value: 5, name: '运行中', itemStyle: { color: '#409eff' } }
    ]
  }]
})

const getStatusType = (status) => {
  const map = {
    success: 'success',
    failed: 'danger',
    running: 'primary',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    success: '成功',
    failed: '失败',
    running: '运行中',
    cancelled: '已取消'
  }
  return map[status] || status
}

const formatTime = (time) => {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

const initCharts = () => {
  nextTick(() => {
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      trendChart.setOption(trendChartOption)
    }
    if (statusChartRef.value) {
      statusChart = echarts.init(statusChartRef.value)
      statusChart.setOption(getStatusChartOption())
    }
  })
}

const updateStatusChart = (statsData) => {
  if (statusChart) {
    const data = [
      { value: statsData.successfulExecutions || 10, name: '成功', itemStyle: { color: '#67c23a' } },
      { value: statsData.failedExecutions || 2, name: '失败', itemStyle: { color: '#f56c6c' } },
      { value: statsData.runningExecutions || 1, name: '运行中', itemStyle: { color: '#409eff' } }
    ]
    statusChart.setOption(getStatusChartOption(data))
  }
}

const handleResize = () => {
  trendChart?.resize()
  statusChart?.resize()
}

const loadData = async () => {
  try {
    const [statsRes, executionsRes, robotsRes] = await Promise.all([
      statsAPI.getStats(),
      executionsAPI.getExecutions({ limit: 5 }),
      robotsAPI.getRobots()
    ])
    
    Object.assign(stats, statsRes.data)
    recentExecutions.value = executionsRes.data
    robots.value = robotsRes.data
    
    updateStatusChart(statsRes.data)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  initCharts()
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  trendChart?.dispose()
  statusChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
