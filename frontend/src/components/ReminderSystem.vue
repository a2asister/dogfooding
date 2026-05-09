<template>
  <div v-if="showReminder" class="reminder-popup" @click.self="closeReminder">
    <div class="reminder-content card">
      <div class="reminder-header">
        <span class="reminder-icon">{{ currentReminder?.icon || '🔔' }}</span>
        <h3>打卡提醒</h3>
        <button class="close-btn" @click="closeReminder">×</button>
      </div>
      <div class="reminder-body">
        <p class="reminder-text">
          现在是 <strong>{{ currentReminder?.reminder }}</strong>，该完成「{{ currentReminder?.name }}」啦！
        </p>
      </div>
      <div class="reminder-actions">
        <button class="btn btn-secondary" @click="snoozeReminder">稍后提醒</button>
        <button class="btn btn-primary" @click="markCompleted">✅ 已完成</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  habits: Array
})

const showReminder = ref(false)
const currentReminder = ref(null)
const lastRemindedTime = ref(null)
let checkInterval = null

const checkReminders = () => {
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const todayStr = now.toISOString().split('T')[0]
  
  if (lastRemindedTime.value === currentTime) return
  
  const habit = props.habits.find(h => 
    h.active && 
    h.reminder === currentTime
  )
  
  if (habit) {
    lastRemindedTime.value = currentTime
    currentReminder.value = habit
    showReminder.value = true
  }
}

const closeReminder = () => {
  showReminder.value = false
  currentReminder.value = null
}

const snoozeReminder = () => {
  closeReminder()
  setTimeout(() => {
    if (currentReminder.value) {
      showReminder.value = true
    }
  }, 5 * 60 * 1000)
}

const markCompleted = async () => {
  if (!currentReminder.value) return
  
  const todayStr = new Date().toISOString().split('T')[0]
  
  await fetch(`/api/records/${todayStr}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      habitId: currentReminder.value.id, 
      completed: true 
    })
  })
  
  closeReminder()
}

watch(() => props.habits, () => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
  checkInterval = setInterval(checkReminders, 30000)
}, { immediate: true })

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>

<style scoped>
.reminder-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.reminder-content {
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.4s ease-out;
  margin-bottom: 0;
}

.reminder-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.reminder-icon {
  font-size: 32px;
}

.reminder-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #3d3d3d;
  flex: 1;
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

.reminder-body {
  margin-bottom: 20px;
}

.reminder-text {
  font-size: 15px;
  color: #4a4a4a;
  line-height: 1.6;
}

.reminder-text strong {
  color: #3d3d3d;
  font-weight: 600;
}

.reminder-actions {
  display: flex;
  gap: 12px;
}

.reminder-actions .btn {
  flex: 1;
  padding: 12px;
  font-size: 14px;
}
</style>
