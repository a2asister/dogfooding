<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSleepStore } from '@/stores/sleep'
import SleepRing from '@/components/SleepRing.vue'

const route = useRoute()
const router = useRouter()
const store = useSleepStore()

const selectedIndex = ref(0)

const record = computed(() => {
  const id = route.params.id
  if (id) {
    return store.historyData.find(d => d.id === id)
  }
  return store.historyData[store.historyData.length - 1 + selectedIndex.value]
})

const availableRecords = computed(() => {
  const last7 = store.historyData.slice(-7)
  return last7.reverse()
})

watch(selectedIndex, () => {
  if (availableRecords.value[selectedIndex.value]) {
    router.push(`/detail/${availableRecords.value[selectedIndex.value].id}`)
  }
}, { immediate: true })

const stageColors: Record<string, { color: string; label: string }> = {
  deep: { color: '#6366f1', label: '深睡' },
  rem: { color: '#a78bfa', label: 'REM' },
  light: { color: '#818cf8', label: '浅睡' },
  awake: { color: '#94a3b8', label: '清醒' }
}

function formatTime(time: number) {
  const h = Math.floor(time / 60)
  const m = time % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
</script>

<template>
  <div class="detail-view">
    <header class="detail-header">
      <button class="back-btn" @click="router.push('/')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="detail-title">睡眠详情</h1>
      <div class="header-placeholder"></div>
    </header>

    <div class="date-selector" v-if="availableRecords.length > 0">
      <button
        v-for="(r, i) in availableRecords"
        :key="r.id"
        class="date-item"
        :class="{ active: selectedIndex === i }"
        @click="selectedIndex = i"
      >
        <span class="date-day">{{ ['日', '一', '二', '三', '四', '五', '六'][new Date(r.date).getDay()] }}</span>
        <span class="date-num">{{ new Date(r.date).getDate() }}</span>
      </button>
    </div>

    <div class="detail-content" v-if="record">
      <div class="ring-section">
        <SleepRing
          :score="record.score"
          :deep-sleep="record.deepSleep"
          :light-sleep="record.lightSleep"
          :rem-sleep="record.remSleep"
          :size="220"
        />
      </div>

      <div class="time-info">
        <div class="time-item">
          <div class="time-icon bed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 4v16"/>
              <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
              <path d="M2 17h20"/>
              <path d="M6 8v9"/>
            </svg>
          </div>
          <div class="time-text">
            <span class="time-label">入睡</span>
            <span class="time-value">{{ record.bedTime }}</span>
          </div>
        </div>
        <div class="time-divider"></div>
        <div class="time-item">
          <div class="time-icon wake">
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
          <div class="time-text">
            <span class="time-label">起床</span>
            <span class="time-value">{{ record.wakeTime }}</span>
          </div>
        </div>
      </div>

      <div class="stages-section">
        <div class="section-title">睡眠阶段</div>
        <div class="stages-legend">
          <div
            v-for="(info, key) in stageColors"
            :key="key"
            class="legend-item"
          >
            <span class="legend-dot" :style="{ background: info.color }"></span>
            <span class="legend-label">{{ info.label }}</span>
          </div>
        </div>
        <div class="stages-timeline">
          <div
            v-for="(stage, i) in record.stages"
            :key="i"
            class="stage-bar"
            :style="{
              width: (stage.duration / (record.duration * 60)) * 100 + '%',
              background: stageColors[stage.type].color,
              opacity: stage.type === 'awake' ? 0.4 : 0.9
            }"
            :title="`${formatTime(stage.startTime)} · ${stageColors[stage.type].label} ${stage.duration}分钟`"
          ></div>
        </div>
        <div class="timeline-labels">
          <span>{{ record.bedTime }}</span>
          <span>{{ record.wakeTime }}</span>
        </div>
      </div>

      <div class="breakdown-section">
        <div class="section-title">睡眠构成</div>
        <div class="breakdown-grid">
          <div class="breakdown-item">
            <div class="breakdown-bar-bg">
              <div
                class="breakdown-bar"
                :style="{ width: (record.deepSleep / record.duration) * 100 + '%', background: '#6366f1' }"
              ></div>
            </div>
            <div class="breakdown-info">
              <span class="breakdown-label">深睡</span>
              <span class="breakdown-value">{{ record.deepSleep }}h</span>
            </div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-bar-bg">
              <div
                class="breakdown-bar"
                :style="{ width: (record.remSleep / record.duration) * 100 + '%', background: '#a78bfa' }"
              ></div>
            </div>
            <div class="breakdown-info">
              <span class="breakdown-label">REM</span>
              <span class="breakdown-value">{{ record.remSleep }}h</span>
            </div>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-bar-bg">
              <div
                class="breakdown-bar"
                :style="{ width: (record.lightSleep / record.duration) * 100 + '%', background: '#818cf8' }"
              ></div>
            </div>
            <div class="breakdown-info">
              <span class="breakdown-label">浅睡</span>
              <span class="breakdown-value">{{ record.lightSleep }}h</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section">
        <div class="section-title">睡眠建议</div>
        <div class="tips-card">
          <p class="tips-text">
            {{ record.score >= 80 ? '您的睡眠质量很好，继续保持规律作息！' : 
               record.score >= 70 ? '睡眠质量良好，建议适当增加深睡时间。' :
               record.score >= 60 ? '睡眠质量一般，建议调整作息时间，减少夜间清醒次数。' :
               '建议改善睡眠环境，保持规律的作息时间。' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-view {
  height: 100%;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  animation: fadeIn 0.4s ease;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.detail-title {
  font-size: 17px;
  font-weight: 600;
  color: #e2e8f0;
}

.header-placeholder {
  width: 40px;
}

.date-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(100, 116, 139, 0.15);
  cursor: pointer;
  min-width: 56px;
  transition: all 0.2s ease;
}

.date-item.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
}

.date-day {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 2px;
}

.date-item.active .date-day {
  color: #a5b4fc;
}

.date-num {
  font-size: 16px;
  font-weight: 600;
  color: #cbd5e1;
}

.date-item.active .date-num {
  color: #e0e7ff;
}

.ring-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.time-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-icon.bed {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
}

.time-icon.wake {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.time-icon svg {
  width: 18px;
  height: 18px;
}

.time-text {
  display: flex;
  flex-direction: column;
}

.time-label {
  font-size: 11px;
  color: #64748b;
}

.time-value {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
}

.time-divider {
  width: 32px;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #a78bfa);
  opacity: 0.5;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.stages-section, .breakdown-section, .tips-section {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(100, 116, 139, 0.15);
}

.stages-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-label {
  font-size: 11px;
  color: #94a3b8;
}

.stages-timeline {
  display: flex;
  height: 24px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.stage-bar {
  transition: width 0.3s ease;
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
}

.breakdown-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.breakdown-bar-bg {
  height: 6px;
  background: rgba(100, 116, 139, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.breakdown-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.breakdown-info {
  display: flex;
  justify-content: space-between;
}

.breakdown-label {
  font-size: 12px;
  color: #94a3b8;
}

.breakdown-value {
  font-size: 12px;
  color: #cbd5e1;
  font-weight: 500;
}

.tips-card {
  background: rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  padding: 14px;
}

.tips-text {
  font-size: 13px;
  color: #a5b4fc;
  line-height: 1.6;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
