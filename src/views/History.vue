<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSleepStore } from '@/stores/sleep'
import { useRouter } from 'vue-router'

const store = useSleepStore()
const router = useRouter()

const viewMode = ref<'week' | 'month'>('week')

const weekData = computed(() => {
  const last7 = store.historyData.slice(-7)
  return last7
})

const monthData = computed(() => {
  return store.historyData.slice(-30)
})

const displayData = computed(() => viewMode.value === 'week' ? weekData.value : monthData.value)

function getSmoothPath(data: number[], width: number, height: number) {
  if (data.length === 0) return ''
  const padding = 20
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2
  const maxVal = Math.max(...data, 100)
  const points = data.map((val, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * innerWidth
    const y = padding + (1 - val / maxVal) * innerHeight
    return { x, y }
  })
  
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const cp1x = p1.x + (p2.x - p1.x) / 3
    const cp1y = p1.y
    const cp2x = p1.x + (p2.x - p1.x) * 2 / 3
    const cp2y = p2.y
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  
  return path
}

const areaPath = computed(() => {
  const width = 400
  const height = 200
  const scores = displayData.value.map(d => d.score)
  const basePath = getSmoothPath(scores, width, height)
  const lastPoint = displayData.value.length - 1
  const startX = 20
  const endX = 380
  const bottomY = height - 20
  return `${basePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`
})

const scoreLinePath = computed(() => {
  const width = 400
  const height = 200
  const scores = displayData.value.map(d => d.score)
  return getSmoothPath(scores, width, height)
})

const avgScore = computed(() => {
  if (displayData.value.length === 0) return 0
  const sum = displayData.value.reduce((acc, d) => acc + d.score, 0)
  return Math.round(sum / displayData.value.length)
})

const avgDuration = computed(() => {
  if (displayData.value.length === 0) return 0
  const sum = displayData.value.reduce((acc, d) => acc + d.duration, 0)
  return Math.round((sum / displayData.value.length) * 10) / 10
})

function goToDetail(id: string) {
  router.push(`/detail/${id}`)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<template>
  <div class="history-view">
    <header class="history-header">
      <h1 class="history-title">历史记录</h1>
      <div class="view-toggle">
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'week' }"
          @click="viewMode = 'week'"
        >周</button>
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'month' }"
          @click="viewMode = 'month'"
        >月</button>
      </div>
    </header>

    <div class="summary-card">
      <div class="summary-item">
        <span class="summary-value">{{ avgScore }}</span>
        <span class="summary-label">平均评分</span>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <span class="summary-value">{{ avgDuration }}h</span>
        <span class="summary-label">平均时长</span>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <span class="summary-value">{{ displayData.length }}</span>
        <span class="summary-label">记录天数</span>
      </div>
    </div>

    <div class="chart-card">
      <svg viewBox="0 0 400 200" class="chart-svg">
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#818cf8" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#6366f1"/>
            <stop offset="50%" stop-color="#a78bfa"/>
            <stop offset="100%" stop-color="#c4b5fd"/>
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#6366f1" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <g class="grid-lines" opacity="0.3">
          <line x1="20" y1="20" x2="380" y2="20" stroke="#475569" stroke-dasharray="4 4"/>
          <line x1="20" y1="65" x2="380" y2="65" stroke="#475569" stroke-dasharray="4 4"/>
          <line x1="20" y1="110" x2="380" y2="110" stroke="#475569" stroke-dasharray="4 4"/>
          <line x1="20" y1="155" x2="380" y2="155" stroke="#475569" stroke-dasharray="4 4"/>
        </g>

        <path :d="areaPath" fill="url(#areaGradient)"/>
        <path :d="scoreLinePath" fill="none" stroke="url(#lineGradient)" stroke-width="2.5" stroke-linecap="round" filter="url(#shadow)"/>
        
        <g v-for="(d, i) in displayData" :key="d.id" class="data-point">
          <circle
            :cx="20 + (i / Math.max(displayData.length - 1, 1)) * 360"
            :cy="20 + (1 - d.score / 100) * 160"
            r="4"
            fill="#c4b5fd"
            stroke="#6366f1"
            stroke-width="2"
          />
        </g>

        <text x="10" y="24" class="y-label" font-size="10" fill="#64748b">100</text>
        <text x="10" y="69" class="y-label" font-size="10" fill="#64748b">75</text>
        <text x="10" y="114" class="y-label" font-size="10" fill="#64748b">50</text>
        <text x="10" y="175" class="y-label" font-size="10" fill="#64748b">0</text>
      </svg>
      <div class="chart-labels">
        <span v-if="displayData.length > 0">{{ formatDate(displayData[0].date) }}</span>
        <span v-if="displayData.length > 0">{{ formatDate(displayData[Math.floor(displayData.length / 2)].date) }}</span>
        <span v-if="displayData.length > 0">{{ formatDate(displayData[displayData.length - 1].date) }}</span>
      </div>
    </div>

    <div class="records-list">
      <div class="list-header">
        <span class="list-title">{{ viewMode === 'week' ? '本周记录' : '本月记录' }}</span>
      </div>
      <div class="records-content">
        <div
          v-for="record in displayData.slice().reverse()"
          :key="record.id"
          class="record-item"
          @click="goToDetail(record.id)"
        >
          <div class="record-left">
            <div class="record-date">
              <span class="date-week">{{ ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(record.date).getDay()] }}</span>
              <span class="date-full">{{ formatDate(record.date) }}</span>
            </div>
            <div class="record-times">
              <span>{{ record.bedTime }}</span>
              <span class="time-arrow">→</span>
              <span>{{ record.wakeTime }}</span>
            </div>
          </div>
          <div class="record-right">
            <div class="score-badge" :class="record.quality">
              {{ record.score }}
            </div>
            <span class="duration-text">{{ record.duration }}h</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-view {
  height: 100%;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  animation: fadeIn 0.4s ease;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.history-title {
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(135deg, #e0e7ff, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.view-toggle {
  display: flex;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 10px;
  padding: 4px;
}

.toggle-btn {
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: rgba(99, 102, 241, 0.3);
  color: #c7d2fe;
}

.summary-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 18px 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(100, 116, 139, 0.15);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-value {
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #e0e7ff, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.summary-label {
  font-size: 11px;
  color: #64748b;
}

.summary-divider {
  width: 1px;
  height: 40px;
  background: rgba(100, 116, 139, 0.3);
}

.chart-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(100, 116, 139, 0.15);
}

.chart-svg {
  width: 100%;
  height: auto;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 30px;
  font-size: 10px;
  color: #64748b;
}

.records-list {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(100, 116, 139, 0.15);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.list-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(100, 116, 139, 0.15);
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.records-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.record-item:active {
  background: rgba(99, 102, 241, 0.1);
}

.record-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-date {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-week {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}

.date-full {
  font-size: 12px;
  color: #64748b;
}

.record-times {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
}

.time-arrow {
  color: #64748b;
}

.record-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.score-badge.excellent {
  background: linear-gradient(135deg, rgba(134, 239, 172, 0.2), rgba(74, 222, 128, 0.2));
  color: #86efac;
}

.score-badge.good {
  background: linear-gradient(135deg, rgba(165, 180, 252, 0.2), rgba(129, 140, 248, 0.2));
  color: #a5b4fc;
}

.score-badge.fair {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
  color: #fbbf24;
}

.score-badge.poor {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.2), rgba(239, 68, 68, 0.2));
  color: #f87171;
}

.duration-text {
  font-size: 13px;
  color: #94a3b8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
