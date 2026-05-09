<template>
  <div class="stats-view">
    <div class="view-header">
      <div class="view-title-section">
        <router-link to="/" class="back-link">← 返回</router-link>
        <h2 class="view-title">数据统计</h2>
        <p class="view-subtitle">查看你的任务完成情况和效率分析</p>
      </div>
      
      <div class="period-selector">
        <button 
          v-for="p in periods"
          :key="p.value"
          class="period-btn"
          :class="{ active: activePeriod === p.value }"
          @click="activePeriod = p.value"
        >
          {{ p.label }}
        </button>
      </div>
    </div>
    
    <div class="stats-content">
      <div class="stats-grid">
        <div class="stat-card ring-card">
          <div class="ring-chart">
            <svg viewBox="0 0 100 100" class="ring-svg">
              <circle 
                cx="50" cy="50" r="40" 
                class="ring-bg"
              />
              <circle 
                cx="50" cy="50" r="40" 
                class="ring-progress"
                :style="ringStyle"
              />
            </svg>
            <div class="ring-center">
              <span class="ring-percent">{{ stats.completionRate }}%</span>
              <span class="ring-label">完成率</span>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-value">{{ stats.completed }} / {{ stats.total }}</span>
            <span class="stat-text">已完成 / 总任务</span>
          </div>
        </div>
        
        <div class="stat-card summary-card">
          <h3 class="card-title">任务概览</h3>
          <div class="summary-stats">
            <div class="summary-item">
              <span class="summary-icon">📋</span>
              <div class="summary-info">
                <span class="summary-value">{{ stats.total }}</span>
                <span class="summary-label">总任务</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">✅</span>
              <div class="summary-info">
                <span class="summary-value">{{ stats.completed }}</span>
                <span class="summary-label">已完成</span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-icon">⏳</span>
              <div class="summary-info">
                <span class="summary-value">{{ stats.total - stats.completed }}</span>
                <span class="summary-label">待完成</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="stat-card priority-card">
          <h3 class="card-title">优先级分布</h3>
          <div class="priority-list">
            <div class="priority-item">
              <div class="priority-header">
                <span class="priority-dot urgent"></span>
                <span class="priority-name">紧急</span>
                <span class="priority-count">{{ stats.byPriority?.urgent || 0 }}</span>
              </div>
              <div class="priority-bar">
                <div 
                  class="priority-fill urgent"
                  :style="{ width: priorityPercent('urgent') + '%' }"
                ></div>
              </div>
            </div>
            <div class="priority-item">
              <div class="priority-header">
                <span class="priority-dot important"></span>
                <span class="priority-name">重要</span>
                <span class="priority-count">{{ stats.byPriority?.important || 0 }}</span>
              </div>
              <div class="priority-bar">
                <div 
                  class="priority-fill important"
                  :style="{ width: priorityPercent('important') + '%' }"
                ></div>
              </div>
            </div>
            <div class="priority-item">
              <div class="priority-header">
                <span class="priority-dot normal"></span>
                <span class="priority-name">普通</span>
                <span class="priority-count">{{ stats.byPriority?.normal || 0 }}</span>
              </div>
              <div class="priority-bar">
                <div 
                  class="priority-fill normal"
                  :style="{ width: priorityPercent('normal') + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="stat-card tips-card">
          <h3 class="card-title">效率建议</h3>
          <div class="tips-list">
            <div class="tip-item" v-if="urgentTasks > 0">
              <span class="tip-icon">⚠️</span>
              <p class="tip-text">你有 <strong>{{ urgentTasks }}</strong> 个紧急任务，请优先处理。</p>
            </div>
            <div class="tip-item" v-else>
              <span class="tip-icon">🎉</span>
              <p class="tip-text">太棒了！没有紧急任务，继续保持。</p>
            </div>
            <div class="tip-item" v-if="stats.completionRate < 50">
              <span class="tip-icon">💪</span>
              <p class="tip-text">你的任务完成率还有提升空间，试试番茄工作法？</p>
            </div>
            <div class="tip-item" v-else-if="stats.completionRate >= 80">
              <span class="tip-icon">🌟</span>
              <p class="tip-text">你的效率非常高！保持这个节奏。</p>
            </div>
            <div class="tip-item" v-if="stats.total > 10">
              <span class="tip-icon">📊</span>
              <p class="tip-text">任务较多，建议按优先级排序处理。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../api'

export default {
  name: 'Stats',
  setup() {
    const activePeriod = ref('week')
    const stats = ref({
      total: 0,
      completed: 0,
      completionRate: 0,
      byPriority: { urgent: 0, important: 0, normal: 0 }
    })
    const urgentTasks = ref(0)
    
    const periods = [
      { value: 'day', label: '今日' },
      { value: 'week', label: '本周' },
      { value: 'month', label: '本月' }
    ]
    
    const circumference = 2 * Math.PI * 40
    
    const ringStyle = computed(() => {
      const offset = circumference - (stats.value.completionRate / 100) * circumference
      return {
        strokeDasharray: `${circumference} ${circumference}`,
        strokeDashoffset: offset
      }
    })
    
    const priorityPercent = (priority) => {
      const total = (stats.value.byPriority?.urgent || 0) + 
                    (stats.value.byPriority?.important || 0) + 
                    (stats.value.byPriority?.normal || 0)
      if (total === 0) return 0
      const count = stats.value.byPriority?.[priority] || 0
      return Math.round((count / total) * 100)
    }
    
    const loadStats = async () => {
      try {
        const data = await api.getStats(activePeriod.value)
        stats.value = data
        
        const allTasks = await api.getTasks()
        urgentTasks.value = allTasks.filter(t => !t.isCompleted && t.priority === 'urgent').length
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }
    
    watch(activePeriod, loadStats)
    onMounted(loadStats)
    
    return {
      activePeriod,
      stats,
      urgentTasks,
      periods,
      ringStyle,
      priorityPercent
    }
  }
}
</script>

<style scoped>
.stats-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.view-title-section {
  flex: 1;
}

.back-link {
  display: inline-block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--primary-color);
}

.view-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}

.view-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.period-selector {
  display: flex;
  background: var(--bg-secondary);
  padding: 4px;
  border-radius: 12px;
}

.period-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.period-btn:hover {
  color: var(--text-primary);
}

.period-btn.active {
  background: var(--bg-card);
  color: var(--primary-color);
  box-shadow: var(--shadow-soft);
}

.stats-content {
  flex: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto;
  gap: 24px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  padding: 24px;
  transition: all var(--transition-normal);
}

.stat-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.ring-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-column: span 1;
  grid-row: span 2;
}

.ring-chart {
  position: relative;
  width: 160px;
  height: 160px;
  margin-bottom: 20px;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: var(--bg-tertiary);
  stroke-width: 12;
}

.ring-progress {
  fill: none;
  stroke: var(--primary-color);
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--transition-slow) ease;
}

.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ring-percent {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.ring-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.stat-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
  width: 100%;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-text {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.summary-card {
  grid-column: span 1;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-icon {
  font-size: 28px;
}

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.summary-label {
  font-size: 13px;
  color: var(--text-muted);
}

.priority-card {
  grid-column: span 1;
}

.priority-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.priority-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.priority-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.priority-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.priority-dot.urgent { background: var(--priority-urgent); }
.priority-dot.important { background: var(--priority-important); }
.priority-dot.normal { background: var(--priority-normal); }

.priority-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.priority-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.priority-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.priority-fill {
  height: 100%;
  border-radius: 3px;
  transition: width var(--transition-slow) ease;
}

.priority-fill.urgent { background: var(--priority-urgent); }
.priority-fill.important { background: var(--priority-important); }
.priority-fill.normal { background: var(--priority-normal); }

.tips-card {
  grid-column: span 1;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 12px;
}

.tip-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.tip-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.tip-text strong {
  color: var(--text-primary);
  font-weight: 600;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .ring-card,
  .summary-card,
  .priority-card,
  .tips-card {
    grid-column: span 1;
    grid-row: span 1;
  }
}

@media (max-width: 640px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
