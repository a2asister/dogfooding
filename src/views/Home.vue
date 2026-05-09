<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useSleepStore } from '@/stores/sleep'
import { useRouter } from 'vue-router'
import SleepRing from '@/components/SleepRing.vue'

const store = useSleepStore()
const router = useRouter()

const currentTime = ref(new Date())

onMounted(() => {
  setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

const greeting = computed(() => {
  const hour = currentTime.value.getHours()
  if (hour >= 5 && hour < 12) return '早上好'
  if (hour >= 12 && hour < 18) return '下午好'
  return '晚上好'
})

const dateStr = computed(() => {
  const d = currentTime.value
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
})

const displayData = computed(() => {
  return store.todayData || {
    duration: store.avgDuration,
    score: store.avgScore,
    deepSleep: 1.5,
    lightSleep: 4,
    remSleep: 1.5,
    bedTime: '--:--',
    wakeTime: '--:--'
  }
})

function goToDetail() {
  if (store.todayData) {
    router.push(`/detail/${store.todayData.id}`)
  } else {
    router.push('/history')
  }
}

function formatDuration(hours: number) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}小时${m > 0 ? m + '分' : ''}`
}
</script>

<template>
  <div class="home-view">
    <header class="home-header">
      <div class="header-left">
        <h1 class="greeting">{{ greeting }}</h1>
        <p class="date">{{ dateStr }}</p>
      </div>
      <div class="header-right">
        <div class="moon-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
      </div>
    </header>

    <div class="main-ring" @click="goToDetail">
      <SleepRing
        :score="displayData.score"
        :deep-sleep="displayData.deepSleep"
        :light-sleep="displayData.lightSleep"
        :rem-sleep="displayData.remSleep"
        :size="260"
      />
      <div class="ring-hint">点击查看详情</div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon sleep">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 8a9 9 0 1 1-9 9"/>
            <path d="M21 12h-2"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatDuration(displayData.duration) }}</span>
          <span class="stat-label">睡眠时长</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon deep">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2a6 6 0 0 0-6 6 6 6 0 0 0 3.17 5.27l-.84 8.41"/>
            <path d="M13.67 21.68l-.84-8.41A6 6 0 0 0 18 8a6 6 0 0 0-6-6z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ displayData.deepSleep }}h</span>
          <span class="stat-label">深睡时长</span>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="action-card" @click="router.push('/noise')">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <span class="action-label">白噪音</span>
      </div>
      <div class="action-card" @click="router.push('/settings')">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M23 12h-6M7 12H1m13.22 4.22l4.24 4.24M1.54 22.46l4.24-4.24"/>
          </svg>
        </div>
        <span class="action-label">提醒</span>
      </div>
      <div class="action-card" @click="router.push('/history')">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 3v18h18"/>
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
          </svg>
        </div>
        <span class="action-label">历史</span>
      </div>
    </div>

    <div class="weekly-preview" v-if="store.historyData.length >= 7">
      <div class="preview-header">
        <span class="preview-title">本周概览</span>
        <span class="preview-sub">平均 {{ store.avgDuration }}h · {{ store.avgScore }}分</span>
      </div>
      <div class="mini-bars">
        <div 
          v-for="(data, i) in store.historyData.slice(-7)" 
          :key="data.id"
          class="mini-bar-wrapper"
        >
          <div class="mini-bar">
            <div 
              class="mini-bar-fill"
              :style="{ height: (data.score / 100) * 100 + '%' }"
            ></div>
          </div>
          <span class="mini-bar-label">{{ ['日', '一', '二', '三', '四', '五', '六'][new Date(data.date).getDay()] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  height: 100%;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s ease;
  overflow-y: auto;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.greeting {
  font-size: 24px;
  font-weight: 500;
  background: linear-gradient(135deg, #e0e7ff, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.date {
  font-size: 13px;
  color: #64748b;
}

.moon-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(99, 102, 241, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
}

.moon-icon svg {
  width: 22px;
  height: 22px;
}

.main-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0 20px;
  cursor: pointer;
}

.ring-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(100, 116, 139, 0.15);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.sleep {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  color: #a5b4fc;
}

.stat-icon.deep {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(59, 130, 246, 0.2));
  color: #7dd3fc;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.action-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(100, 116, 139, 0.15);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-card:active {
  transform: scale(0.96);
}

.action-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.25));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
}

.action-icon svg {
  width: 20px;
  height: 20px;
}

.action-label {
  font-size: 12px;
  color: #94a3b8;
}

.weekly-preview {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(100, 116, 139, 0.15);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.preview-sub {
  font-size: 11px;
  color: #64748b;
}

.mini-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 60px;
  gap: 4px;
}

.mini-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.mini-bar {
  width: 100%;
  max-width: 24px;
  height: 40px;
  background: rgba(100, 116, 139, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.mini-bar-fill {
  width: 100%;
  background: linear-gradient(to top, #6366f1, #a78bfa);
  border-radius: 4px;
  min-height: 4px;
}

.mini-bar-label {
  font-size: 10px;
  color: #64748b;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
