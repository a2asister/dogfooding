<template>
  <div class="page-container">
    <div class="page-header">
      <h2>AI 节能建议</h2>
      <p>基于智能分析的节能优化建议，助您降低能耗成本</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">待处理建议</div>
        <div class="stat-value">{{ pendingSuggestions }}</div>
        <div class="stat-unit">条</div>
        <div class="stat-change negative">需要关注</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">高优先级</div>
        <div class="stat-value">{{ highPrioritySuggestions }}</div>
        <div class="stat-unit">条</div>
        <div class="stat-change positive">立即处理</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">预计节能量</div>
        <div class="stat-value">{{ totalEstimatedSaving }}</div>
        <div class="stat-unit">kWh</div>
        <div class="stat-change negative">执行所有建议后</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">已执行建议</div>
        <div class="stat-value">{{ executedSuggestions }}</div>
        <div class="stat-unit">条</div>
        <div class="stat-change negative">已优化完成</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">节能建议列表</h3>
        <div class="btn-group">
          <button class="btn btn-primary btn-small" @click="filterPriority = 'all'">全部</button>
          <button class="btn btn-danger btn-small" @click="filterPriority = 'high'">高优先级</button>
          <button class="btn btn-warning btn-small" @click="filterPriority = 'medium'">中优先级</button>
          <button class="btn btn-success btn-small" @click="filterPriority = 'low'">低优先级</button>
        </div>
      </div>

      <div v-if="filteredSuggestions.length > 0">
        <div
          v-for="suggestion in filteredSuggestions"
          :key="suggestion.id"
          class="suggestion-card"
          :class="[suggestion.priority, suggestion.executed ? 'resolved' : '']"
        >
          <div class="suggestion-header">
            <h4 class="suggestion-title">{{ suggestion.title }}</h4>
            <span class="suggestion-priority" :class="suggestion.priority">
              {{ getPriorityText(suggestion.priority) }}
            </span>
          </div>
          <p class="suggestion-description">{{ suggestion.description }}</p>
          <div class="suggestion-footer">
            <div class="saving-badge">
              预计节省: {{ suggestion.estimatedSaving }} kWh
            </div>
            <div class="btn-group">
              <button
                v-if="!suggestion.executed"
                class="btn btn-success btn-small"
                @click="executeSuggestion(suggestion)"
              >
                执行建议
              </button>
              <button
                v-if="!suggestion.executed"
                class="btn btn-primary btn-small"
                @click="scheduleSuggestion(suggestion)"
              >
                稍后提醒
              </button>
              <button
                v-if="!suggestion.executed"
                class="btn btn-danger btn-small"
                @click="ignoreSuggestion(suggestion)"
              >
                忽略
              </button>
              <span v-else style="color: #2e7d32; font-weight: 500;">
                ✅ 已执行
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty">
        <div class="empty-icon">💡</div>
        <p>暂无符合条件的节能建议</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">AI 节能分析报告</h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <div class="report-stat">
          <div class="report-stat-value">25%</div>
          <div class="report-stat-label">当前能耗优化空间</div>
          <div class="report-stat-change negative">基于历史数据分析</div>
        </div>
        <div class="report-stat">
          <div class="report-stat-value">18%</div>
          <div class="report-stat-label">本月节能率</div>
          <div class="report-stat-change positive">较上月提升 3.2%</div>
        </div>
        <div class="report-stat">
          <div class="report-stat-value">¥12,580</div>
          <div class="report-stat-label">本月节省费用</div>
          <div class="report-stat-change negative">基于当前电价计算</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">智能优化策略</h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #1e3c72;">
          <h4 style="color: #1e3c72; margin-bottom: 0.8rem;">🌡️ 温度自适应调节</h4>
          <p style="color: #666; line-height: 1.6;">
            根据室外温度、人员密度和历史能耗数据，自动调节中央空调温度设定，在保证舒适度的同时最大限度节能。
          </p>
        </div>
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #f57c00;">
          <h4 style="color: #1e3c72; margin-bottom: 0.8rem;">💡 智能照明控制</h4>
          <p style="color: #666; line-height: 1.6;">
            结合自然光强度、人员存在检测和时间表，智能控制照明系统的开关和亮度，避免不必要的能源浪费。
          </p>
        </div>
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #43a047;">
          <h4 style="color: #1e3c72; margin-bottom: 0.8rem;">🛗 电梯调度优化</h4>
          <p style="color: #666; line-height: 1.6;">
            分析历史使用数据，预测高峰时段，优化电梯运行数量和调度策略，降低空载能耗。
          </p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">数据加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'AISuggestions',
  setup() {
    const loading = ref(false)
    const error = ref(null)
    const suggestions = ref([])
    const filterPriority = ref('all')

    const filteredSuggestions = computed(() => {
      if (filterPriority.value === 'all') return suggestions.value
      return suggestions.value.filter(s => s.priority === filterPriority.value)
    })

    const pendingSuggestions = computed(() => {
      return suggestions.value.filter(s => !s.executed).length
    })

    const highPrioritySuggestions = computed(() => {
      return suggestions.value.filter(s => s.priority === 'high' && !s.executed).length
    })

    const totalEstimatedSaving = computed(() => {
      return suggestions.value
        .filter(s => !s.executed)
        .reduce((sum, s) => sum + s.estimatedSaving, 0)
    })

    const executedSuggestions = computed(() => {
      return suggestions.value.filter(s => s.executed).length
    })

    const getPriorityText = (priority) => {
      const texts = {
        high: '高优先级',
        medium: '中优先级',
        low: '低优先级'
      }
      return texts[priority] || priority
    }

    const fetchSuggestions = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await axios.get('/api/ai-suggestions')
        suggestions.value = response.data.map(s => ({
          ...s,
          executed: false
        }))
      } catch (err) {
        error.value = '加载 AI 建议失败，请稍后重试'
        console.error('Error fetching suggestions:', err)
      } finally {
        loading.value = false
      }
    }

    const executeSuggestion = (suggestion) => {
      suggestion.executed = true
    }

    const scheduleSuggestion = (suggestion) => {
      alert(`已设置提醒：${suggestion.title} 将在稍后提醒您处理`)
    }

    const ignoreSuggestion = (suggestion) => {
      if (confirm(`确定要忽略此建议吗？\n\n${suggestion.title}`)) {
        const index = suggestions.value.indexOf(suggestion)
        if (index > -1) {
          suggestions.value.splice(index, 1)
        }
      }
    }

    onMounted(() => {
      fetchSuggestions()
    })

    return {
      loading,
      error,
      suggestions,
      filterPriority,
      filteredSuggestions,
      pendingSuggestions,
      highPrioritySuggestions,
      totalEstimatedSaving,
      executedSuggestions,
      getPriorityText,
      executeSuggestion,
      scheduleSuggestion,
      ignoreSuggestion
    }
  }
}
</script>
