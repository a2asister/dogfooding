<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '@/store/assessment'
import { getHistory, getTagStats } from '@/api'
import { ref, onMounted } from 'vue'

const router = useRouter()
const store = useAssessmentStore()
const history = ref<any[]>([])
const tagStats = ref<Record<string, number>>({})
const loading = ref(true)

onMounted(async () => {
  try {
    const [historyData, statsData] = await Promise.all([
      getHistory(store.userId),
      getTagStats(store.userId)
    ])
    history.value = historyData
    tagStats.value = statsData
  } catch (error) {
    console.error('Failed to load history:', error)
  } finally {
    loading.value = false
  }
})

function goHome() {
  router.push('/')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="history">
    <div class="header">
      <button class="back-btn" @click="goHome">← 返回</button>
      <h1 class="title">测评历史</h1>
    </div>

    <div class="content">
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="history.length === 0" class="empty">
        <p>暂无测评记录</p>
        <button class="btn primary" @click="() => router.push('/assessment')">开始第一次测评</button>
      </div>

      <div v-else class="history-list">
        <div v-for="item in history" :key="item.id" class="history-card">
          <div class="card-header">
            <h3 class="temperament-name">{{ item.result.temperamentName }}</h3>
            <span class="date">{{ formatDate(item.createdAt) }}</span>
          </div>
          <p class="description">{{ item.result.description }}</p>
          <div class="tags">
            <span v-for="tag in item.result.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <div v-if="Object.keys(tagStats).length > 0" class="stats-section">
        <h2 class="stats-title">标签统计</h2>
        <div class="stats-list">
          <div v-for="(count, tag) in tagStats" :key="tag" class="stat-item">
            <span class="stat-tag">{{ tag }}</span>
            <span class="stat-count">{{ count }} 次</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history {
  min-height: 100vh;
  padding: 2rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.title {
  color: white;
  font-size: 2rem;
}

.content {
  max-width: 800px;
  margin: 0 auto;
}

.loading, .empty {
  text-align: center;
  color: white;
  font-size: 1.2rem;
  padding: 4rem 0;
}

.empty p {
  margin-bottom: 2rem;
}

.btn {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn.primary {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.history-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.temperament-name {
  font-size: 1.3rem;
  color: #2d3748;
  font-weight: 600;
}

.date {
  color: #718096;
  font-size: 0.9rem;
}

.description {
  color: #4a5568;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.stats-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
}

.stats-title {
  color: #2d3748;
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

.stats-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: #f7fafc;
  border-radius: 12px;
}

.stat-tag {
  font-weight: 600;
  color: #2d3748;
}

.stat-count {
  color: #718096;
  font-size: 0.9rem;
}
</style>
