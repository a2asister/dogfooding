<template>
  <div class="replay-container">
    <el-card v-if="!currentSession" class="session-form">
      <template #header>
        <div class="card-header">
          <span>创建回放会话</span>
          <el-button type="primary" size="small" @click="loadSessions">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="sessionForm" label-width="100px">
        <el-form-item label="TraceID">
          <el-input v-model="sessionForm.traceId" placeholder="通过TraceID创建会话" clearable style="width: 280px" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="sessionForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 400px"
          />
        </el-form-item>
        <el-form-item label="服务筛选">
          <el-select v-model="sessionForm.service" placeholder="全部服务" clearable style="width: 150px">
            <el-option 
              v-for="s in services" 
              :key="s.id" 
              :label="s.name" 
              :value="s.name" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="级别">
          <el-select v-model="sessionForm.level" placeholder="全部级别" clearable style="width: 120px">
            <el-option label="DEBUG" value="DEBUG" />
            <el-option label="INFO" value="INFO" />
            <el-option label="WARN" value="WARN" />
            <el-option label="ERROR" value="ERROR" />
            <el-option label="FATAL" value="FATAL" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createSession" :loading="creating">
            <el-icon><Plus /></el-icon>
            创建会话
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="!currentSession && sessions.length > 0" class="sessions-list" style="margin-top: 20px">
      <template #header>
        <span>现有会话</span>
      </template>

      <el-table :data="sessions" style="width: 100%">
        <el-table-column prop="id" label="会话ID" min-width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="joinSession(row.id)">
              {{ row.id }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentIndex" label="进度" width="150">
          <template #default="{ row }">
            <span>{{ row.currentIndex }} / {{ row.totalLogs }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="config" label="配置" min-width="200">
          <template #default="{ row }">
            <span v-if="row.config.traceId">Trace: {{ row.config.traceId }}</span>
            <span v-else-if="row.config.service">服务: {{ row.config.service }}</span>
            <span v-else>全部</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="danger" link @click="closeSession(row.id)">
              关闭
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-if="currentSession" class="replay-player">
      <template #header>
        <div class="card-header">
          <div class="session-info">
            <el-button type="primary" link @click="leaveSession">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <span class="session-title">回放会话: {{ currentSession.id }}</span>
            <el-tag :type="getStatusTagType(currentSession.status)" size="small">
              {{ getStatusName(currentSession.status) }}
            </el-tag>
          </div>
          <div class="session-stats">
            <span>日志总数: {{ currentSession.statistics?.totalLogs || 0 }}</span>
            <el-divider direction="vertical" />
            <span>进度: {{ currentSession.currentIndex }} / {{ currentSession.statistics?.totalLogs || 0 }}</span>
          </div>
        </div>
      </template>

      <div class="player-controls">
        <div class="control-buttons">
          <el-button-group>
            <el-button @click="handlePlay" :disabled="isPlaying">
              <el-icon><VideoPlay /></el-icon>
              播放
            </el-button>
            <el-button @click="handlePause" :disabled="!isPlaying">
              <el-icon><VideoPause /></el-icon>
              暂停
            </el-button>
            <el-button @click="handleStop">
              <el-icon><Close /></el-icon>
              停止
            </el-button>
          </el-button-group>

          <el-divider direction="vertical" />

          <el-button-group>
            <el-button @click="handleStepBack">
              <el-icon><Back /></el-icon>
              上一条
            </el-button>
            <el-button @click="handleStepForward">
              <el-icon><Right /></el-icon>
              下一条
            </el-button>
          </el-button-group>

          <el-divider direction="vertical" />

          <el-select v-model="playSpeed" @change="handleSpeedChange" style="width: 100px">
            <el-option :value="0.5" label="0.5x" />
            <el-option :value="1" label="1x" />
            <el-option :value="2" label="2x" />
            <el-option :value="5" label="5x" />
            <el-option :value="10" label="10x" />
          </el-select>
        </div>

        <div class="timeline-control">
          <span class="time-label">开始: {{ formatTime(currentSession.timeline?.minTime) }}</span>
          <el-slider
            v-model="currentSliderIndex"
            :min="0"
            :max="totalLogs - 1"
            :step="1"
            @change="handleSliderChange"
            class="slider"
          />
          <span class="time-label">结束: {{ formatTime(currentSession.timeline?.maxTime) }}</span>
        </div>
      </div>

      <el-tabs v-model="playerTab" class="player-tabs">
        <el-tab-pane label="实时日志流" name="logStream">
          <div class="log-stream-container">
            <div v-if="currentLog" class="current-log-highlight">
              <el-card>
                <template #header>
                  <div class="log-header">
                    <span class="log-time">{{ formatTime(currentLog.timestamp) }}</span>
                    <el-tag :type="getLevelTagType(currentLog.level)" size="small">
                      {{ currentLog.level }}
                    </el-tag>
                    <el-tag size="small" type="info">{{ currentLog.service }}</el-tag>
                    <span class="log-index">第 {{ currentSession.currentIndex + 1 }} 条</span>
                  </div>
                </template>
                <div class="log-message">
                  {{ currentLog.message }}
                </div>
                <el-collapse v-if="currentLog.data" style="margin-top: 10px">
                  <el-collapse-item title="详细数据" name="data">
                    <pre>{{ JSON.stringify(currentLog.data, null, 2) }}</pre>
                  </el-collapse-item>
                </el-collapse>
              </el-card>
            </div>

            <el-table :data="recentLogs" style="width: 100%; margin-top: 20px" max-height="400">
              <el-table-column prop="timestamp" label="时间" width="180">
                <template #default="{ row }">
                  {{ formatTime(row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column prop="level" label="级别" width="100">
                <template #default="{ row }">
                  <el-tag :type="getLevelTagType(row.level)" size="small">
                    {{ row.level }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="service" label="服务" width="150" />
              <el-table-column prop="type" label="类型" width="120" />
              <el-table-column prop="message" label="消息" min-width="300">
                <template #default="{ row }">
                  <span class="log-message-text">{{ row.message }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="traceId" label="TraceID" width="200">
                <template #default="{ row }">
                  <span v-if="row.traceId" class="trace-id">{{ row.traceId }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="时间轴" name="timeline">
          <div class="timeline-chart-container">
            <div ref="timelineChart" class="chart-container"></div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="调用链" name="callchain">
          <div class="callchain-container">
            <div v-if="callChain" class="callchain-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="总Span数">{{ callChain.totalSpans || 0 }}</el-descriptions-item>
                <el-descriptions-item label="调用深度">{{ callChain.depth || 0 }}</el-descriptions-item>
              </el-descriptions>

              <div v-if="callChain.callChain && callChain.callChain.length > 0" class="callchain-tree">
                <h4 style="margin: 20px 0 10px">调用树</h4>
                <el-tree
                  :data="callChain.callChain"
                  :props="callchainTreeProps"
                  default-expand-all
                >
                  <template #default="{ node, data }">
                    <div class="callchain-node">
                      <el-tag :type="getServiceTagType(data.service)" size="small">
                        {{ data.service }}
                      </el-tag>
                      <span class="node-operation">{{ data.operation || data.message }}</span>
                      <el-tag v-if="data.status" :type="getStatusTagType(data.status)" size="small">
                        {{ data.status }}
                      </el-tag>
                    </div>
                  </template>
                </el-tree>
              </div>
            </div>
            <el-empty v-else description="暂无调用链数据" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="会话统计" name="stats">
          <div class="stats-container">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-value">{{ currentSession.statistics?.totalLogs || 0 }}</div>
                  <div class="stat-label">总日志数</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-value">{{ Object.keys(currentSession.statistics?.services || {}).length }}</div>
                  <div class="stat-label">涉及服务数</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-value">{{ currentSession.timeline?.totalDuration ? formatDuration(currentSession.timeline.totalDuration) : '0ms' }}</div>
                  <div class="stat-label">总时长</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-value">{{ Object.keys(currentSession.statistics?.levels || {}).filter(k => currentSession.statistics.levels[k] > 0).length }}</div>
                  <div class="stat-label">级别类型</div>
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="20" style="margin-top: 20px">
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>级别分布</span>
                  </template>
                  <div ref="levelChart" class="chart-container"></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>服务分布</span>
                  </template>
                  <div ref="serviceChart" class="chart-container"></div>
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="20" style="margin-top: 20px">
              <el-col :span="24">
                <el-card>
                  <template #header>
                    <span>类型分布</span>
                  </template>
                  <div ref="typeChart" class="chart-container"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus, ArrowLeft, VideoPlay, VideoPause, Close, Back, Right } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { replayApi, timeSeriesApi, logsApi } from '../api'
import dayjs from 'dayjs'

const sessions = ref([])
const currentSession = ref(null)
const currentLog = ref(null)
const recentLogs = ref([])
const creating = ref(false)
const playing = ref(false)
const playerTab = ref('logStream')
const playSpeed = ref(1)
const currentSliderIndex = ref(0)
const callChain = ref(null)
const timelineIntervals = ref([])

const sessionForm = ref({
  traceId: '',
  timeRange: null,
  service: '',
  level: ''
})

const services = ref([])
const playInterval = ref(null)
const timelineChart = ref(null)
const levelChart = ref(null)
const serviceChart = ref(null)
const typeChart = ref(null)

const totalLogs = computed(() => currentSession.value?.statistics?.totalLogs || 0)
const isPlaying = computed(() => playing.value)

const callchainTreeProps = {
  children: 'children',
  label: 'operation'
}

const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`
  return `${(ms / 3600000).toFixed(2)}h`
}

const getStatusTagType = (status) => {
  const typeMap = {
    created: 'info',
    playing: 'success',
    paused: 'warning',
    stopped: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusName = (status) => {
  const nameMap = {
    created: '已创建',
    playing: '播放中',
    paused: '已暂停',
    stopped: '已停止'
  }
  return nameMap[status] || status
}

const getLevelTagType = (level) => {
  const typeMap = {
    DEBUG: 'info',
    INFO: 'success',
    WARN: 'warning',
    ERROR: 'danger',
    FATAL: 'danger'
  }
  return typeMap[level] || 'info'
}

const getServiceTagType = (service) => {
  const types = ['primary', 'success', 'warning', 'danger', 'info']
  if (!service) return 'info'
  const index = service.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return types[index % types.length]
}

const loadServices = async () => {
  try {
    const result = await logsApi.getServices()
    if (result.success) {
      services.value = result.data || []
    }
  } catch (error) {
    console.error('Failed to load services:', error)
  }
}

const loadSessions = async () => {
  try {
    const result = await replayApi.getAllSessions()
    if (result.success) {
      sessions.value = result.data || []
    }
  } catch (error) {
    console.error('Failed to load sessions:', error)
  }
}

const createSession = async () => {
  creating.value = true
  try {
    const data = {
      traceId: sessionForm.value.traceId || null,
      service: sessionForm.value.service || null,
      level: sessionForm.value.level || null,
      replaySpeed: playSpeed.value
    }

    if (sessionForm.value.timeRange && sessionForm.value.timeRange.length === 2) {
      data.startTime = sessionForm.value.timeRange[0].valueOf()
      data.endTime = sessionForm.value.timeRange[1].valueOf()
    }

    const result = await replayApi.createSession(data)
    if (result.success) {
      currentSession.value = result.data
      currentSliderIndex.value = 0
      ElMessage.success('会话创建成功')
      await loadTimeline()
      await loadCallChain()
      updateCurrentLog()
    }
  } catch (error) {
    console.error('Failed to create session:', error)
    ElMessage.error('创建会话失败')
  } finally {
    creating.value = false
  }
}

const joinSession = async (sessionId) => {
  try {
    const result = await replayApi.getSession(sessionId)
    if (result.success) {
      currentSession.value = result.data
      currentSliderIndex.value = currentSession.value.currentIndex || 0
      await loadTimeline()
      await loadCallChain()
      updateCurrentLog()
    }
  } catch (error) {
    console.error('Failed to join session:', error)
    ElMessage.error('加入会话失败')
  }
}

const leaveSession = () => {
  stopPlay()
  currentSession.value = null
  currentLog.value = null
  recentLogs.value = []
  loadSessions()
}

const closeSession = async (sessionId) => {
  try {
    await replayApi.closeSession(sessionId)
    ElMessage.success('会话已关闭')
    loadSessions()
  } catch (error) {
    console.error('Failed to close session:', error)
    ElMessage.error('关闭会话失败')
  }
}

const loadTimeline = async () => {
  if (!currentSession.value) return
  try {
    const result = await replayApi.getTimeline(currentSession.value.id)
    if (result.success) {
      timelineIntervals.value = result.data || []
      await nextTick()
      renderTimelineChart()
    }
  } catch (error) {
    console.error('Failed to load timeline:', error)
  }
}

const loadCallChain = async () => {
  if (!currentSession.value) return
  try {
    const result = await replayApi.getCallChain(currentSession.value.id)
    if (result.success) {
      callChain.value = result.data
    }
  } catch (error) {
    console.error('Failed to load call chain:', error)
  }
}

const updateCurrentLog = () => {
  if (!currentSession.value) return
  
  const logs = currentSession.value.logs || []
  if (logs.length === 0) return

  const index = currentSession.value.currentIndex
  currentLog.value = logs[index]

  const startIndex = Math.max(0, index - 10)
  const endIndex = Math.min(logs.length, index + 10)
  recentLogs.value = logs.slice(startIndex, endIndex)
}

const handlePlay = async () => {
  if (!currentSession.value) return
  
  try {
    await replayApi.play(currentSession.value.id)
    playing.value = true
    currentSession.value.status = 'playing'
    startAutoPlay()
  } catch (error) {
    console.error('Failed to start play:', error)
    ElMessage.error('开始播放失败')
  }
}

const handlePause = async () => {
  if (!currentSession.value) return
  
  try {
    await replayApi.pause(currentSession.value.id)
    playing.value = false
    currentSession.value.status = 'paused'
    stopAutoPlay()
  } catch (error) {
    console.error('Failed to pause play:', error)
    ElMessage.error('暂停播放失败')
  }
}

const handleStop = async () => {
  if (!currentSession.value) return
  
  try {
    await replayApi.stop(currentSession.value.id)
    playing.value = false
    currentSession.value.status = 'stopped'
    currentSession.value.currentIndex = 0
    currentSliderIndex.value = 0
    stopAutoPlay()
    updateCurrentLog()
  } catch (error) {
    console.error('Failed to stop play:', error)
    ElMessage.error('停止播放失败')
  }
}

const handleStepBack = async () => {
  if (!currentSession.value) return
  if (currentSession.value.currentIndex <= 0) return

  const newIndex = currentSession.value.currentIndex - 1
  await seekToIndex(newIndex)
}

const handleStepForward = async () => {
  if (!currentSession.value) return
  if (currentSession.value.currentIndex >= totalLogs.value - 1) return

  const newIndex = currentSession.value.currentIndex + 1
  await seekToIndex(newIndex)
}

const seekToIndex = async (index) => {
  if (!currentSession.value) return
  
  try {
    const result = await replayApi.seek(currentSession.value.id, { index })
    if (result.success) {
      currentSession.value = { ...currentSession.value, ...result.data }
      currentSliderIndex.value = currentSession.value.currentIndex
      updateCurrentLog()
    }
  } catch (error) {
    console.error('Failed to seek:', error)
    ElMessage.error('跳转失败')
  }
}

const handleSliderChange = (value) => {
  seekToIndex(value)
}

const handleSpeedChange = (value) => {
  playSpeed.value = value
  if (playing.value) {
    stopAutoPlay()
    startAutoPlay()
  }
}

const startAutoPlay = () => {
  stopAutoPlay()
  
  const interval = 1000 / playSpeed.value
  playInterval.value = setInterval(async () => {
    if (currentSession.value.currentIndex >= totalLogs.value - 1) {
      await handlePause()
      return
    }
    
    const newIndex = currentSession.value.currentIndex + 1
    await seekToIndex(newIndex)
  }, interval)
}

const stopAutoPlay = () => {
  if (playInterval.value) {
    clearInterval(playInterval.value)
    playInterval.value = null
  }
}

const renderTimelineChart = () => {
  if (!timelineChart.value || timelineIntervals.value.length === 0) return

  const chart = echarts.init(timelineChart.value)
  
  const xData = timelineIntervals.value.map((item, index) => {
    return dayjs(item.startTime).format('HH:mm:ss')
  })

  const seriesData = timelineIntervals.value.map(item => item.count)
  const errorData = timelineIntervals.value.map(item => item.levels?.ERROR || 0)
  const warnData = timelineIntervals.value.map(item => item.levels?.WARN || 0)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['总日志', '错误', '警告']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '总日志',
        type: 'line',
        stack: 'Total',
        areaStyle: { opacity: 0.3 },
        data: seriesData
      },
      {
        name: '错误',
        type: 'line',
        stack: 'Error',
        areaStyle: { opacity: 0.3 },
        data: errorData
      },
      {
        name: '警告',
        type: 'line',
        stack: 'Warning',
        areaStyle: { opacity: 0.3 },
        data: warnData
      }
    ]
  }

  chart.setOption(option)
}

const renderStatsCharts = () => {
  if (!currentSession.value) return

  if (levelChart.value) {
    const chart = echarts.init(levelChart.value)
    const levels = currentSession.value.statistics?.levels || {}
    const data = Object.entries(levels)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({ name: key, value }))

    const option = {
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    chart.setOption(option)
  }

  if (serviceChart.value) {
    const chart = echarts.init(serviceChart.value)
    const services = currentSession.value.statistics?.services || {}
    const data = Object.entries(services)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({ name: key, value }))

    const option = {
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    chart.setOption(option)
  }

  if (typeChart.value) {
    const chart = echarts.init(typeChart.value)
    const types = currentSession.value.statistics?.types || {}
    const categories = Object.keys(types)
    const values = Object.values(types)

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: values
        }
      ]
    }
    chart.setOption(option)
  }
}

watch(playerTab, (newTab) => {
  if (newTab === 'stats') {
    nextTick(() => {
      renderStatsCharts()
    })
  }
})

onMounted(() => {
  loadServices()
  loadSessions()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
.replay-container {
  padding: 0;
}

.session-form,
.sessions-list,
.replay-player {
  margin-bottom: 20px;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.session-title {
  font-size: 16px;
  font-weight: bold;
}

.session-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #606266;
}

.player-controls {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.timeline-control {
  display: flex;
  align-items: center;
  gap: 20px;
}

.slider {
  flex: 1;
}

.time-label {
  color: #606266;
  font-size: 13px;
  white-space: nowrap;
}

.player-tabs {
  margin-top: 10px;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-time {
  color: #909399;
  font-size: 13px;
}

.log-index {
  margin-left: auto;
  color: #606266;
  font-size: 13px;
}

.log-message {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-message-text {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.trace-id {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #409eff;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.timeline-chart-container {
  padding: 10px;
}

.callchain-container {
  padding: 10px;
}

.callchain-node {
  display: flex;
  align-items: center;
  gap: 10px;
}

.node-operation {
  flex: 1;
  font-size: 14px;
}

.stats-container {
  padding: 10px;
}

.stat-card {
  text-align: center;
}

.stat-card .stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-card .stat-label {
  font-size: 14px;
  color: #606266;
}

.current-log-highlight {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

pre {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
}
</style>
