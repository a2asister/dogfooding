<template>
  <div id="app">
    <header class="header">
      <h1 class="title">✨ 极简作息打卡日历</h1>
      <p class="subtitle">治愈系全方位作息管理工具</p>
    </header>

    <CalendarComponent 
      v-model:selectedDate="selectedDate"
      :habits="habits"
      :records="allRecords"
      :streak="streak.current"
      @dateClick="onDateClick"
    />

    <HabitManager 
      v-if="showHabitManager"
      :habits="habits"
      @close="showHabitManager = false"
      @update="loadHabits"
    />

    <div class="stats-container" v-if="selectedDate">
      <div class="card">
        <DateDetail 
          :date="selectedDate"
          :habits="habits"
          :records="allRecords[selectedDate] || []"
          @toggle="toggleHabit"
          @close="selectedDate = null"
        />
      </div>
    </div>

    <StatsChart 
      :weekStats="weekStats"
      :monthStats="monthStats"
      :streak="streak"
    />

    <button class="fab-btn" @click="showHabitManager = true">
      <span class="fab-icon">+</span>
    </button>

    <ReminderSystem :habits="habits" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import CalendarComponent from './components/CalendarComponent.vue'
import DateDetail from './components/DateDetail.vue'
import HabitManager from './components/HabitManager.vue'
import StatsChart from './components/StatsChart.vue'
import ReminderSystem from './components/ReminderSystem.vue'

const habits = ref([])
const allRecords = ref({})
const weekStats = ref([])
const monthStats = ref([])
const streak = ref({ current: 0, longest: 0 })
const selectedDate = ref(null)
const showHabitManager = ref(false)

const loadHabits = async () => {
  const res = await fetch('/api/habits')
  habits.value = await res.json()
}

const loadRecords = async () => {
  const res = await fetch('/api/records')
  allRecords.value = await res.json()
}

const loadStats = async () => {
  const [weekRes, monthRes, streakRes] = await Promise.all([
    fetch('/api/stats/week'),
    fetch('/api/stats/month'),
    fetch('/api/stats/streak')
  ])
  weekStats.value = await weekRes.json()
  monthStats.value = await monthRes.json()
  streak.value = await streakRes.json()
}

const onDateClick = (date) => {
  selectedDate.value = date
}

const toggleHabit = async (habitId, completed) => {
  try {
    const date = selectedDate.value
    const response = await fetch(`/api/records/${date}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId, completed })
    })
    
    if (!response.ok) {
      console.error('Failed to toggle habit:', response.status)
      return
    }
    
    await Promise.all([loadRecords(), loadStats()])
  } catch (error) {
    console.error('Error toggling habit:', error)
  }
}

onMounted(() => {
  loadHabits()
  loadRecords()
  loadStats()
})
</script>

<style scoped>
.header {
  text-align: center;
  padding: 30px 0 20px;
  animation: slideUp 0.5s ease-out;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #3d3d3d;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 14px;
  color: #8a8a8a;
  font-weight: 400;
}

.stats-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.stats-container .card {
  width: 100%;
  max-width: 600px;
  animation: slideUp 0.4s ease-out;
  margin-bottom: 0;
  max-height: 70vh;
  overflow-y: auto;
}

.fab-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #88B04B 0%, #6B8E23 100%);
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(136, 176, 75, 0.4);
  transition: all 0.3s ease;
  z-index: 50;
}

.fab-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(136, 176, 75, 0.5);
}

.fab-icon {
  color: white;
  font-size: 28px;
  line-height: 1;
}
</style>
