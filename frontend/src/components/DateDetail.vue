<template>
  <div class="date-detail fade-in">
    <div class="detail-header">
      <div class="date-info">
        <h3>{{ formatDate }}</h3>
        <span class="weekday">{{ formatWeekday }}</span>
      </div>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>

    <div class="habit-list">
      <h4 class="section-title">📋 今日打卡清单</h4>
      <div 
        v-for="habit in dayHabits" 
        :key="habit.id" 
        :class="['habit-item', { 'completed': habit.completed }]"
        @click="toggleHabit(habit)"
      >
        <div class="habit-checkbox" :style="habit.completed ? { background: habit.color } : {}">
          <span v-if="habit.completed" class="check-icon">✓</span>
        </div>
        <div class="habit-info">
          <span class="habit-icon">{{ habit.icon }}</span>
          <span class="habit-name">{{ habit.name }}</span>
          <span v-if="habit.reminder" class="habit-reminder">⏰ {{ habit.reminder }}</span>
        </div>
      </div>
    </div>

    <div class="timeline-section">
      <h4 class="section-title">⏰ 作息时间轴</h4>
      <div class="timeline">
        <div 
          v-for="item in timelineItems" 
          :key="item.id"
          :class="['timeline-item', { 'completed': item.completed, 'now': isNow(item) }]"
        >
          <div class="timeline-dot" :style="item.completed ? { background: item.color } : {}"></div>
          <div class="timeline-content">
            <div class="timeline-time">{{ item.reminder || '--:--' }}</div>
            <div class="timeline-name">
              <span class="timeline-icon">{{ item.icon }}</span>
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="completion-rate">
      <div class="rate-circle">
        <svg viewBox="0 0 100 100" class="ring">
          <circle cx="50" cy="50" r="42" stroke="#e0e0e0" stroke-width="8" fill="none" />
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            :stroke="completionColor"
            stroke-width="8" 
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>
        <div class="rate-text">
          <span class="rate-number">{{ completionRate }}%</span>
          <span class="rate-label">完成率</span>
        </div>
      </div>
      <div class="rate-info">
        <div class="rate-item">
          <span class="count">{{ completedCount }}</span>
          <span class="label">已完成</span>
        </div>
        <div class="rate-divider"></div>
        <div class="rate-item">
          <span class="count">{{ totalCount }}</span>
          <span class="label">待打卡</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  date: String,
  habits: Array,
  records: Array
})

const emit = defineEmits(['toggle', 'close'])

const formatDate = computed(() => {
  const d = new Date(props.date)
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`
})

const formatWeekday = computed(() => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const d = new Date(props.date)
  return weekdays[d.getDay()]
})

const dayHabits = computed(() => {
  return props.habits.filter(h => h.active).map(habit => {
    const record = props.records.find(r => r.habitId === habit.id)
    return {
      ...habit,
      completed: record ? record.completed : false
    }
  })
})

const timelineItems = computed(() => {
  return dayHabits.value
    .filter(h => h.reminder)
    .sort((a, b) => a.reminder.localeCompare(b.reminder))
})

const completedCount = computed(() => dayHabits.value.filter(h => h.completed).length)
const totalCount = computed(() => dayHabits.value.length)
const completionRate = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

const completionColor = computed(() => {
  if (completionRate.value === 100) return '#88B04B'
  if (completionRate.value >= 60) return '#92A8D1'
  return '#F7CAC9'
})

const circumference = 2 * Math.PI * 42
const dashOffset = computed(() => {
  return circumference * (1 - completionRate.value / 100)
})

const toggleHabit = (habit) => {
  emit('toggle', habit.id, !habit.completed)
}

const isNow = (item) => {
  if (!item.reminder) return false
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return item.reminder === currentTime
}
</script>

<style scoped>
.date-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.date-info h3 {
  font-size: 24px;
  font-weight: 600;
  color: #3d3d3d;
  margin-bottom: 4px;
}

.weekday {
  font-size: 14px;
  color: #8a8a8a;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f0e6;
  border-radius: 50%;
  font-size: 20px;
  color: #8a8a8a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #ebe3d5;
  color: #4a4a4a;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #6a6a6a;
  margin-bottom: 12px;
}

.habit-list {
  margin-bottom: 28px;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #faf8f4;
  border-radius: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.habit-item:hover {
  background: #f5f0e6;
}

.habit-item.completed {
  background: linear-gradient(135deg, rgba(136, 176, 75, 0.1) 0%, rgba(107, 142, 35, 0.1) 100%);
}

.habit-checkbox {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #d4c9b5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.habit-item.completed .habit-checkbox {
  border: none;
}

.check-icon {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.habit-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.habit-icon {
  font-size: 20px;
}

.habit-name {
  font-size: 15px;
  font-weight: 500;
  color: #4a4a4a;
}

.habit-item.completed .habit-name {
  text-decoration: line-through;
  color: #9a9a9a;
}

.habit-reminder {
  font-size: 12px;
  color: #8a8a8a;
  margin-left: auto;
}

.timeline-section {
  margin-bottom: 28px;
}

.timeline {
  position: relative;
  padding-left: 16px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item {
  position: relative;
  padding: 8px 0 8px 24px;
  display: flex;
  align-items: center;
}

.timeline-dot {
  position: absolute;
  left: -4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #d4c9b5;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #e0e0e0;
  transition: all 0.3s ease;
}

.timeline-item.completed .timeline-dot {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

.timeline-item.now .timeline-dot {
  animation: pulse 1.5s ease-in-out infinite;
}

.timeline-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.timeline-time {
  font-size: 13px;
  font-weight: 600;
  color: #6a6a6a;
  min-width: 45px;
}

.timeline-name {
  font-size: 14px;
  color: #4a4a4a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.timeline-icon {
  font-size: 16px;
}

.completion-rate {
  display: flex;
  align-items: center;
  gap: 32px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.rate-circle {
  position: relative;
  width: 100px;
  height: 100px;
}

.ring {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.rate-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.rate-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #3d3d3d;
}

.rate-label {
  font-size: 11px;
  color: #8a8a8a;
}

.rate-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.rate-item {
  text-align: center;
}

.rate-item .count {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #3d3d3d;
}

.rate-item .label {
  font-size: 12px;
  color: #8a8a8a;
}

.rate-divider {
  width: 1px;
  height: 40px;
  background: #e0e0e0;
}
</style>
