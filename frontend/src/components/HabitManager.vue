<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card">
      <div class="modal-header">
        <h3>📝 管理打卡事项</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="existing-habits">
        <h4 class="section-title">已有打卡项</h4>
        <div v-if="habits.length === 0" class="empty-state">
          还没有打卡项，添加一个吧～
        </div>
        <div v-for="habit in habits" :key="habit.id" class="habit-card">
          <div class="habit-info">
            <span class="habit-icon">{{ habit.icon }}</span>
            <span class="habit-name">{{ habit.name }}</span>
          </div>
          <div class="habit-actions">
            <span v-if="habit.reminder" class="reminder-time">⏰ {{ habit.reminder }}</span>
            <label class="toggle-switch">
              <input type="checkbox" :checked="habit.active" @change="toggleHabit(habit)" />
              <span class="toggle-slider"></span>
            </label>
            <button class="delete-btn" @click="deleteHabit(habit)">🗑️</button>
          </div>
        </div>
      </div>

      <div class="add-habit-form">
        <h4 class="section-title">添加新打卡项</h4>
        <div class="form-group">
          <label>名称</label>
          <input 
            type="text" 
            v-model="newHabit.name" 
            placeholder="如：早起、阅读、冥想..."
          />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>图标</label>
            <div class="icon-selector">
              <button 
                v-for="icon in availableIcons" 
                :key="icon"
                :class="['icon-btn', { 'selected': newHabit.icon === icon }]"
                @click="newHabit.icon = icon"
              >
                {{ icon }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>颜色</label>
            <div class="color-selector">
              <button 
                v-for="color in availableColors" 
                :key="color"
                :class="['color-btn', { 'selected': newHabit.color === color }]"
                :style="{ background: color }"
                @click="newHabit.color = color"
              ></button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>定时提醒（可选）</label>
          <input 
            type="time" 
            v-model="newHabit.reminder"
          />
        </div>
        <button class="btn btn-primary add-btn" @click="addHabit">
          + 添加打卡项
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  habits: Array
})

const emit = defineEmits(['close', 'update'])

const availableIcons = ['🌅', '🏃', '📚', '💧', '🧘', '🌙', '✍️', '🎵', '🍎', '💪', '🎨', '📱']
const availableColors = ['#6B5B95', '#88B04B', '#92A8D1', '#87CEEB', '#F7CAC9', '#FF6B6B', '#FFD700', '#955251']

const newHabit = reactive({
  name: '',
  icon: '📚',
  color: '#92A8D1',
  reminder: ''
})

const addHabit = async () => {
  if (!newHabit.name.trim()) return
  
  try {
    const response = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHabit)
    })
    
    if (!response.ok) {
      console.error('Failed to add habit:', response.status)
      return
    }
    
    newHabit.name = ''
    newHabit.icon = '📚'
    newHabit.color = '#92A8D1'
    newHabit.reminder = ''
    
    emit('update')
  } catch (error) {
    console.error('Error adding habit:', error)
  }
}

const toggleHabit = async (habit) => {
  try {
    const response = await fetch(`/api/habits/${habit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !habit.active })
    })
    
    if (!response.ok) {
      console.error('Failed to toggle habit:', response.status)
      return
    }
    
    emit('update')
  } catch (error) {
    console.error('Error toggling habit:', error)
  }
}

const deleteHabit = async (habit) => {
  if (confirm(`确定要删除「${habit.name}」吗？`)) {
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        console.error('Failed to delete habit:', response.status)
        return
      }
      
      emit('update')
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }
}
</script>

<style scoped>
.modal-overlay {
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
  z-index: 200;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  margin-bottom: 0;
  animation: slideUp 0.4s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #3d3d3d;
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

.existing-habits {
  margin-bottom: 28px;
}

.empty-state {
  text-align: center;
  color: #9a9a9a;
  padding: 20px;
  background: #faf8f4;
  border-radius: 12px;
  font-size: 14px;
}

.habit-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #faf8f4;
  border-radius: 16px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
}

.habit-card:hover {
  background: #f5f0e6;
}

.habit-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.habit-icon {
  font-size: 22px;
}

.habit-name {
  font-size: 15px;
  font-weight: 500;
  color: #4a4a4a;
}

.habit-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reminder-time {
  font-size: 12px;
  color: #8a8a8a;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  display: inline-block;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e0e0e0;
  transition: 0.4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #88B04B 0%, #6B8E23 100%);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.delete-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #f0e6d3;
}

.add-habit-form {
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #6a6a6a;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group input[type="time"] {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
  background: #faf8f4;
}

.form-group input:focus {
  border-color: #92A8D1;
  background: white;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: #faf8f4;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  border-color: #d4c9b5;
  background: #f5f0e6;
}

.icon-btn.selected {
  border-color: #92A8D1;
  background: rgba(146, 168, 209, 0.2);
}

.color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-btn {
  width: 32px;
  height: 32px;
  border: 3px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn.selected {
  border-color: #4a4a4a;
  transform: scale(1.1);
}

.add-btn {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  margin-top: 8px;
}
</style>
