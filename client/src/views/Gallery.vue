<template>
  <div class="gallery-container">
    <h2 class="page-title">🎨 作品画廊</h2>
    
    <div v-if="works.length === 0" class="empty-state">
      <div class="empty-icon">🖼️</div>
      <p>还没有保存的作品</p>
      <router-link to="/" class="go-edit-btn">去创作</router-link>
    </div>

    <div v-else class="works-grid">
      <div v-for="work in works" :key="work.id" class="work-card">
        <div class="work-image">
          <img :src="work.imageUrl" :alt="work.title">
        </div>
        <div class="work-info">
          <h3 class="work-title">{{ work.title }}</h3>
          <p class="work-date">{{ formatDate(work.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getWorks } from '../api'

interface Work {
  id: number
  title: string
  imageUrl: string
  createdAt: string
  params: any
}

const works = ref<Work[]>([])

onMounted(async () => {
  const res = await getWorks()
  works.value = res.data.items || []
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.gallery-container {
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  margin-bottom: 24px;
}

.go-edit-btn {
  display: inline-block;
  padding: 12px 32px;
  background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.go-edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 210, 255, 0.4);
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.work-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.work-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 210, 255, 0.2);
  border-color: rgba(0, 210, 255, 0.5);
}

.work-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.5);
}

.work-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-info {
  padding: 16px;
}

.work-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: white;
}

.work-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
