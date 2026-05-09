<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSleepStore } from '@/stores/sleep'

const store = useSleepStore()

const sleepTime = ref('22:30')
const wakeTime = ref('07:00')

const sleepReminder = computed(() => 
  store.reminders.find(r => r.type === 'sleep')
)

const wakeReminder = computed(() => 
  store.reminders.find(r => r.type === 'wake')
)

function toggleSleepReminder() {
  if (sleepReminder.value) {
    store.updateReminder(sleepReminder.value.id, {
      enabled: !sleepReminder.value.enabled
    })
  }
}

function toggleWakeReminder() {
  if (wakeReminder.value) {
    store.updateReminder(wakeReminder.value.id, {
      enabled: !wakeReminder.value.enabled
    })
  }
}

function updateSleepTime() {
  if (sleepReminder.value) {
    store.updateReminder(sleepReminder.value.id, {
      time: sleepTime.value
    })
  }
}

function updateWakeTime() {
  if (wakeReminder.value) {
    store.updateReminder(wakeReminder.value.id, {
      time: wakeTime.value
    })
  }
}
</script>

<template>
  <div class="settings-view">
    <header class="settings-header">
      <h1 class="settings-title">设置</h1>
    </header>

    <div class="section">
      <div class="section-title">作息提醒</div>
      
      <div class="setting-card">
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-icon sleep">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 8a9 9 0 1 1-9 9"/>
                <path d="M21 12h-2"/>
              </svg>
            </div>
            <div class="setting-text">
              <span class="setting-name">早睡提醒</span>
              <span class="setting-desc">提醒按时睡觉</span>
            </div>
          </div>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              :checked="sleepReminder?.enabled"
              @change="toggleSleepReminder"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="time-picker-wrapper" v-if="sleepReminder?.enabled">
          <input 
            type="time" 
            class="time-picker"
            v-model="sleepTime"
            @change="updateSleepTime"
          />
        </div>
      </div>

      <div class="setting-card">
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-icon wake">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2"/>
                <path d="M12 20v2"/>
                <path d="M4.93 4.93l1.41 1.41"/>
                <path d="M17.66 17.66l1.41 1.41"/>
                <path d="M2 12h2"/>
                <path d="M20 12h2"/>
                <path d="M4.93 19.07l1.41-1.41"/>
                <path d="M17.66 6.34l1.41-1.41"/>
              </svg>
            </div>
            <div class="setting-text">
              <span class="setting-name">早起提醒</span>
              <span class="setting-desc">提醒按时起床</span>
            </div>
          </div>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              :checked="wakeReminder?.enabled"
              @change="toggleWakeReminder"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="time-picker-wrapper" v-if="wakeReminder?.enabled">
          <input 
            type="time" 
            class="time-picker"
            v-model="wakeTime"
            @change="updateWakeTime"
          />
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">数据统计</div>
      
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 6v6l4 2"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <span class="stat-box-value">{{ store.historyData.length }}</span>
          <span class="stat-box-label">记录天数</span>
        </div>
        <div class="stat-box">
          <div class="stat-icon-box" style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 3v18h18"/>
              <path d="M7 15l4-4 4 4 5-5"/>
            </svg>
          </div>
          <span class="stat-box-value">{{ store.avgScore }}</span>
          <span class="stat-box-label">平均评分</span>
        </div>
        <div class="stat-box">
          <div class="stat-icon-box" style="background: rgba(165, 180, 252, 0.2); color: #a5b4fc;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 8a9 9 0 1 1-9 9"/>
              <path d="M21 12h-2"/>
            </svg>
          </div>
          <span class="stat-box-value">{{ store.avgDuration }}h</span>
          <span class="stat-box-label">平均时长</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">关于</div>
      
      <div class="about-card">
        <div class="about-header">
          <div class="app-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </div>
          <div class="about-info">
            <span class="app-name">静谧睡眠</span>
            <span class="app-version">v1.0.0</span>
          </div>
        </div>
        <p class="about-desc">
          科学静谧的睡眠管理工具，帮助您规律作息、改善睡眠质量。
        </p>
        <div class="about-features">
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span>深浅睡眠分析</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span>周月数据复盘</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span>白噪音助眠</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span>作息异常提醒</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  height: 100%;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  animation: fadeIn 0.4s ease;
}

.settings-header {
  margin-bottom: 20px;
}

.settings-title {
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(135deg, #e0e7ff, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.setting-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(100, 116, 139, 0.15);
  overflow: hidden;
  margin-bottom: 12px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setting-icon.sleep {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
}

.setting-icon.wake {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.setting-icon svg {
  width: 20px;
  height: 20px;
}

.setting-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-name {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
}

.setting-desc {
  font-size: 12px;
  color: #64748b;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
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
  background: rgba(71, 85, 105, 0.6);
  border-radius: 24px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.time-picker-wrapper {
  padding: 0 16px 14px;
  display: flex;
  justify-content: flex-end;
}

.time-picker {
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  font-size: 15px;
  font-weight: 600;
  outline: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-box {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(100, 116, 139, 0.15);
}

.stat-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(165, 180, 252, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
}

.stat-icon-box svg {
  width: 20px;
  height: 20px;
}

.stat-box-value {
  font-size: 22px;
  font-weight: 600;
  color: #e2e8f0;
}

.stat-box-label {
  font-size: 11px;
  color: #64748b;
}

.about-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(100, 116, 139, 0.15);
}

.about-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.app-logo {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.app-logo svg {
  width: 24px;
  height: 24px;
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
}

.app-version {
  font-size: 12px;
  color: #64748b;
}

.about-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 16px;
}

.about-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #818cf8, #a78bfa);
}

.feature-item span:last-child {
  font-size: 12px;
  color: #94a3b8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
