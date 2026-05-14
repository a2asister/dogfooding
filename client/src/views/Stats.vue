<template>
  <div class="stats-container">
    <h2 class="page-title">📊 创作统计</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📸</div>
        <div class="stat-value">{{ stats.uploadCount || 0 }}</div>
        <div class="stat-label">上传图片</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎨</div>
        <div class="stat-value">{{ stats.workCount || 0 }}</div>
        <div class="stat-label">保存作品</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">💾</div>
        <div class="stat-value">{{ formatSize(stats.totalUploadSize || 0) }}</div>
        <div class="stat-label">总存储空间</div>
      </div>
    </div>

    <div class="recent-section">
      <div class="recent-column">
        <h3 class="section-title">🕐 最近上传</h3>
        <div v-if="stats.recentUploads?.length === 0" class="empty-list">
          暂无上传记录
        </div>
        <div v-else class="item-list">
          <div v-for="item in stats.recentUploads" :key="item.id" class="list-item">
            <span class="item-name">{{ item.originalName }}</span>
            <span class="item-meta">{{ formatSize(item.size) }}</span>
          </div>
        </div>
      </div>

      <div class="recent-column">
        <h3 class="section-title">✨ 最近作品</h3>
        <div v-if="stats.recentWorks?.length === 0" class="empty-list">
          暂无作品记录
        </div>
        <div v-else class="item-list">
          <div v-for="item in stats.recentWorks" :key="item.id" class="list-item">
            <span class="item-name">{{ item.title }}</span>
            <span class="item-meta">{{ formatDate(item.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStats } from '../api'

const stats = ref<any>({
  uploadCount: 0,
  workCount: 0,
  totalUploadSize: 0,
  recentUploads: [],
  recentWorks: [],
})

onMounted(async () => {
  const res = await getStats()
  stats.value = res.data
})

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.stats-container {
  width: 100%;
}

.page-title {
  font-size: 28px;
  margin-bottom: 30px;
  background: linear-gradient(90deg, #00d2ff, #3a7bd5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 210, 255, 0.2);
}

.stat-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(90deg, #00d2ff, #3a7bd5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.recent-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.recent-column {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-size: 18px;
  margin-bottom: 20px;
  color: #00d2ff;
}

.empty-list {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.4);
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.list-item:hover {
  background: rgba(0, 210, 255, 0.1);
}

.item-name {
  font-size: 14px;
  color: white;
}

.item-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
