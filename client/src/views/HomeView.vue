<template>
  <div class="home-view">
    <div class="container">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">发现精彩演出</h1>
          <p class="hero-subtitle">在线选座，轻松购票，享受完美体验</p>
        </div>
      </div>
      
      <div class="events-section">
        <h2 class="section-title">热门演出</h2>
        <div class="events-grid" v-if="events.length > 0">
          <div 
            v-for="event in events" 
            :key="event.id" 
            class="event-card card"
            @click="goToEventDetail(event.id)"
          >
            <div class="event-image">
              <img :src="event.image" :alt="event.title" />
              <div class="event-status" :class="event.status">
                {{ event.status === 'active' ? '热卖中' : '即将开始' }}
              </div>
            </div>
            <div class="event-info">
              <h3 class="event-title">{{ event.title }}</h3>
              <div class="event-meta">
                <div class="meta-item">
                  <span class="meta-icon">📍</span>
                  <span class="meta-text">{{ event.venue }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span class="meta-text">{{ formatDate(event.startDate) }}</span>
                </div>
              </div>
              <div class="event-price">
                <span class="price-label">票价:</span>
                <span class="price-value">¥{{ getMinPrice(event.id) }} 起</span>
              </div>
            </div>
          </div>
        </div>
        <div class="loading-container" v-else-if="loading">
          <el-icon class="is-loading" size="32">
            <Loading />
          </el-icon>
        </div>
        <div class="no-events" v-else>
          <p>暂无演出信息</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { eventApi, sessionApi } from '@/api'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const router = useRouter()
const events = ref([])
const sessions = ref({})
const loading = ref(true)

const loadEvents = async () => {
  try {
    loading.value = true
    const result = await eventApi.getEvents()
    events.value = result.data
    
    for (const event of events.value) {
      try {
        const sessionResult = await sessionApi.getSessionsByEventId(event.id)
        sessions.value[event.id] = sessionResult.data
      } catch (error) {
        console.error(`加载演出 ${event.id} 场次失败:`, error)
      }
    }
  } catch (error) {
    ElMessage.error('加载演出列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getMinPrice = (eventId) => {
  const eventSessions = sessions.value[eventId]
  if (!eventSessions || eventSessions.length === 0) return 0
  
  let minPrice = Infinity
  for (const session of eventSessions) {
    for (const section of session.sections) {
      if (section.price < minPrice && !section.forbidden) {
        minPrice = section.price
      }
    }
  }
  
  return minPrice === Infinity ? 0 : minPrice
}

const goToEventDetail = (eventId) => {
  router.push(`/event/${eventId}`)
}

onMounted(() => {
  loadEvents()
})
</script>

<style lang="scss" scoped>
.home-view {
  .hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 60px 40px;
    margin-bottom: 40px;
    position: relative;
    overflow: hidden;
    
    &:before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
    
    &:after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
    }
  }
  
  .hero-content {
    position: relative;
    z-index: 1;
  }
  
  .hero-title {
    font-size: 42px;
    font-weight: 700;
    color: white;
    margin-bottom: 15px;
  }
  
  .hero-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .events-section {
    margin-bottom: 40px;
  }
  
  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 30px;
  }
  
  .event-card {
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
    }
  }
  
  .event-image {
    position: relative;
    height: 200px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .event-status {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 6px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: white;
    
    &.active {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    &:not(.active) {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }
  
  .event-info {
    padding: 20px;
  }
  
  .event-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    line-height: 1.4;
  }
  
  .event-meta {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 14px;
  }
  
  .meta-icon {
    margin-right: 8px;
    font-size: 16px;
  }
  
  .event-price {
    display: flex;
    align-items: center;
  }
  
  .price-label {
    color: #999;
    font-size: 14px;
    margin-right: 8px;
  }
  
  .price-value {
    font-size: 20px;
    font-weight: 700;
    color: #f5576c;
  }
  
  .no-events {
    text-align: center;
    padding: 60px;
    color: #999;
    font-size: 16px;
  }
}
</style>
