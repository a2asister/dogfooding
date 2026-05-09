<template>
  <div class="card calendar-card">
    <div class="calendar-header">
      <button class="nav-btn" @click="prevMonth">‹</button>
      <div class="month-display">
        <h2>{{ currentYear }} 年 {{ currentMonth + 1 }} 月</h2>
        <span v-if="streak > 0" class="streak-badge">🔥 连续 {{ streak }} 天</span>
      </div>
      <button class="nav-btn" @click="nextMonth">›</button>
    </div>

    <div class="weekdays">
      <span v-for="day in weekdays" :key="day" class="weekday">{{ day }}</span>
    </div>

    <div class="calendar-grid">
      <div 
        v-for="(day, index) in calendarDays" 
        :key="index"
        :class="['day-cell', { 
          'empty': !day, 
          'today': isToday(day),
          'selected': isSelected(day),
          'in-streak': isInStreak(day)
        }]"
        @click="day && selectDate(day)"
      >
        <div v-if="day" class="day-content">
          <span class="day-number">{{ day.getDate() }}</span>
          <div class="habit-dots">
            <div 
              v-for="habit in getDayHabits(day)" 
              :key="habit.id"
              :class="['habit-dot', { 'completed': habit.completed }]"
              :style="habit.completed ? { background: habit.color } : {}"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  selectedDate: String,
  habits: Array,
  records: Object,
  streak: Number
})

const emit = defineEmits(['update:selectedDate', 'dateClick'])

const today = new Date()
const currentDate = ref(new Date())
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const days = []
  
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }
  
  return days
})

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const isToday = (date) => {
  return date && date.toDateString() === today.toDateString()
}

const isSelected = (date) => {
  if (!date) return false
  const dateStr = date.toISOString().split('T')[0]
  return dateStr === props.selectedDate
}

const isInStreak = (date) => {
  if (!date || props.streak === 0) return false
  const dateStr = date.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]
  const targetDate = new Date(date)
  const todayDate = new Date(today)
  const diffDays = Math.floor((todayDate - targetDate) / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays < props.streak
}

const selectDate = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  emit('update:selectedDate', dateStr)
  emit('dateClick', dateStr)
}

const getDayHabits = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  const dayRecords = props.records[dateStr] || []
  
  return props.habits.filter(h => h.active).map(habit => {
    const record = dayRecords.find(r => r.habitId === habit.id)
    return {
      ...habit,
      completed: record ? record.completed : false
    }
  })
}
</script>

<style scoped>
.calendar-card {
  padding: 24px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f0e6;
  border-radius: 12px;
  font-size: 20px;
  color: #4a4a4a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #ebe3d5;
}

.month-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-display h2 {
  font-size: 18px;
  font-weight: 600;
  color: #3d3d3d;
}

.streak-badge {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  animation: pulse 2s ease-in-out infinite;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 13px;
  color: #9a9a9a;
  font-weight: 500;
  padding: 8px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.day-cell:hover:not(.empty) {
  background: #f5f0e6;
}

.day-cell.today {
  background: linear-gradient(135deg, rgba(136, 176, 75, 0.2) 0%, rgba(107, 142, 35, 0.2) 100%);
  border: 2px solid #88B04B;
}

.day-cell.selected {
  background: linear-gradient(135deg, rgba(146, 168, 209, 0.3) 0%, rgba(107, 91, 149, 0.3) 100%);
  transform: scale(1.05);
}

.day-cell.in-streak {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 142, 83, 0.15) 100%);
}

.day-cell.empty {
  cursor: default;
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.day-number {
  font-size: 14px;
  font-weight: 400;
  color: #4a4a4a;
}

.habit-dots {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 40px;
}

.habit-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.3s ease;
}

.habit-dot.completed {
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}
</style>
