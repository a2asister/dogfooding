<template>
  <div class="card stats-card">
    <div class="stats-header">
      <h3>📊 打卡统计</h3>
      <div class="tab-switch">
        <button 
          :class="['tab-btn', { 'active': activeTab === 'week' }]" 
          @click="activeTab = 'week'"
        >
          本周
        </button>
        <button 
          :class="['tab-btn', { 'active': activeTab === 'month' }]" 
          @click="activeTab = 'month'"
        >
          本月
        </button>
      </div>
    </div>

    <div class="stats-overview">
      <div class="overview-item">
        <div class="overview-ring">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#e0e0e0" stroke-width="6" fill="none" />
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke="#88B04B"
              stroke-width="6" 
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="ringCircumference"
              :stroke-dashoffset="overallRingOffset"
            />
          </svg>
          <span class="ring-percent">{{ overallCompletion }}%</span>
        </div>
        <span class="overview-label">{{ activeTab === 'week' ? '本周' : '本月' }}完成率</span>
      </div>

      <div class="overview-item">
        <span class="streak-number">🔥 {{ streak.current }}</span>
        <span class="overview-label">连续打卡</span>
      </div>

      <div class="overview-item">
        <span class="streak-number best">👑 {{ streak.longest }}</span>
        <span class="overview-label">最长连续</span>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-bars">
        <div 
          v-for="item in displayData" 
          :key="item.date" 
          class="bar-item"
        >
          <div class="bar-wrapper">
            <div 
              class="bar-fill" 
              :style="{ 
                height: getBarHeight(item) + '%',
                background: getBarGradient(item)
              }"
            >
              <span v-if="getBarHeight(item) > 15" class="bar-value">{{ getPercent(item) }}%</span>
            </div>
          </div>
          <span class="bar-label">{{ formatLabel(item.date) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  weekStats: Array,
  monthStats: Array,
  streak: Object
})

const activeTab = ref('week')

const ringCircumference = 2 * Math.PI * 40

const displayData = computed(() => {
  return activeTab.value === 'week' ? props.weekStats : props.monthStats
})

const overallCompletion = computed(() => {
  const data = displayData.value
  if (data.length === 0) return 0
  const total = data.reduce((sum, item) => sum + item.total, 0)
  const completed = data.reduce((sum, item) => sum + item.completed, 0)
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
})

const overallRingOffset = computed(() => {
  return ringCircumference * (1 - overallCompletion.value / 100)
})

const getPercent = (item) => {
  if (item.total === 0) return 0
  return Math.round((item.completed / item.total) * 100)
}

const getBarHeight = (item) => {
  return getPercent(item)
}

const getBarGradient = (item) => {
  const percent = getPercent(item)
  if (percent === 100) {
    return 'linear-gradient(180deg, #88B04B 0%, #6B8E23 100%)'
  } else if (percent >= 60) {
    return 'linear-gradient(180deg, #92A8D1 0%, #6B5B95 100%)'
  } else if (percent > 0) {
    return 'linear-gradient(180deg, #F7CAC9 0%, #FF6B6B 100%)'
  }
  return '#e0e0e0'
}

const formatLabel = (date) => {
  if (activeTab.value === 'week') {
    const d = new Date(date)
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return weekdays[d.getDay()]
  } else {
    const day = new Date(date).getDate()
    return day % 5 === 0 || day === 1 ? day : ''
  }
}
</script>

<style scoped>
.stats-card {
  margin-bottom: 100px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.stats-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #3d3d3d;
}

.tab-switch {
  display: flex;
  background: #f5f0e6;
  border-radius: 12px;
  padding: 4px;
}

.tab-btn {
  padding: 8px 20px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #8a8a8a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: white;
  color: #3d3d3d;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stats-overview {
  display: flex;
  justify-content: space-around;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.overview-item {
  text-align: center;
}

.overview-ring {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 8px;
}

.overview-ring svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.ring-percent {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  font-weight: 700;
  color: #3d3d3d;
}

.streak-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #FF6B6B;
  margin-top: 16px;
  margin-bottom: 4px;
}

.streak-number.best {
  color: #FFD700;
}

.overview-label {
  font-size: 12px;
  color: #8a8a8a;
}

.chart-container {
  min-height: 180px;
  padding-top: 28px;
  padding-bottom: 8px;
  display: flex;
  align-items: flex-end;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  height: 140px;
  padding: 0 4px;
  position: relative;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;
  padding-top: 24px;
}

.bar-wrapper {
  width: 16px;
  height: 120px;
  background: #f5f0e6;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
}

.bar-fill {
  width: 100%;
  border-radius: 8px;
  transition: height 0.5s ease-out;
  position: relative;
  min-height: 0;
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 600;
  color: #6a6a6a;
  white-space: nowrap;
  z-index: 10;
  line-height: 1;
}

.bar-label {
  font-size: 11px;
  color: #9a9a9a;
}
</style>
