<template>
  <div class="event-detail-view">
    <div class="container">
      <div class="breadcrumb" @click="$router.back()">
        <span class="breadcrumb-icon">←</span>
        <span class="breadcrumb-text">返回</span>
      </div>
      
      <div class="event-detail-content" v-if="event">
        <div class="event-header">
          <div class="event-image">
            <img :src="event.image" :alt="event.title" />
          </div>
          <div class="event-info">
            <h1 class="event-title">{{ event.title }}</h1>
            <div class="event-meta">
              <div class="meta-item">
                <span class="meta-icon">📍</span>
                <span class="meta-label">场馆:</span>
                <span class="meta-value">{{ event.venue }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span class="meta-label">日期:</span>
                <span class="meta-value">{{ formatDate(event.startDate) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🕐</span>
                <span class="meta-label">时长:</span>
                <span class="meta-value">{{ getDuration(event.startDate, event.endDate) }}</span>
              </div>
            </div>
            <div class="event-description">
              <p>{{ event.description }}</p>
            </div>
          </div>
        </div>
        
        <div class="sessions-section card">
          <h2 class="section-title">选择场次</h2>
          <div class="sessions-list" v-if="sessions.length > 0">
            <div 
              v-for="session in sessions" 
              :key="session.id" 
              class="session-item"
              :class="{ selected: selectedSessionId === session.id }"
              @click="selectSession(session)"
            >
              <div class="session-info">
                <div class="session-title">{{ session.title }}</div>
                <div class="session-time">
                  <span class="time-label">时间:</span>
                  <span class="time-value">{{ session.date }} {{ session.time }}</span>
                </div>
              </div>
              <div class="session-price">
                <span class="price-min">¥{{ getMinSectionPrice(session) }} 起</span>
              </div>
              <div class="session-status" :class="session.status">
                {{ session.status === 'active' ? '可购票' : '即将开售' }}
              </div>
            </div>
          </div>
          <div class="no-sessions" v-else>
            <p>暂无可选场次</p>
          </div>
        </div>
        
        <div class="price-section card" v-if="selectedSession">
          <h2 class="section-title">票价信息</h2>
          <div class="price-list">
            <div 
              v-for="section in selectedSession.sections" 
              :key="section.id" 
              class="price-item"
              :class="{ forbidden: section.forbidden }"
            >
              <div class="section-info">
                <div class="section-name">{{ section.name }}</div>
                <div class="section-specs">
                  {{ section.rows }}排 × {{ section.seatsPerRow }}座
                  <span class="specs-separator">|</span>
                  共 {{ section.rows * section.seatsPerRow }} 个座位
                </div>
              </div>
              <div class="section-price">
                <span class="price-icon">¥</span>
                <span class="price-value">{{ section.price }}</span>
              </div>
              <div class="section-status" v-if="section.forbidden">
                禁售
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-section" v-if="selectedSession">
          <button 
            class="btn-primary"
            :disabled="!canProceed"
            @click="goToSeatSelection"
          >
            立即选座
          </button>
        </div>
      </div>
      
      <div class="loading-container" v-else-if="loading">
        <el-icon class="is-loading" size="32">
          <Loading />
        </el-icon>
      </div>
      
      <div class="not-found" v-else>
        <p>演出不存在或已下架</p>
        <button class="btn-secondary mt-20" @click="$router.push('/')">
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventApi, sessionApi } from '@/api'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const event = ref(null)
const sessions = ref([])
const selectedSessionId = ref(null)
const loading = ref(true)

const selectedSession = computed(() => {
  return sessions.value.find(s => s.id === selectedSessionId.value)
})

const canProceed = computed(() => {
  return selectedSession.value && selectedSession.value.status === 'active'
})

const loadEventDetail = async () => {
  try {
    loading.value = true
    const eventId = route.params.id
    
    const eventResult = await eventApi.getEventById(eventId)
    event.value = eventResult.data
    
    const sessionsResult = await sessionApi.getSessionsByEventId(eventId)
    sessions.value = sessionsResult.data
    
    if (sessions.value.length > 0) {
      selectedSessionId.value = sessions.value[0].id
    }
  } catch (error) {
    ElMessage.error('加载演出详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const getDuration = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const durationMs = end - start
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (minutes > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${hours}小时`
}

const getMinSectionPrice = (session) => {
  if (!session || !session.sections) return 0
  
  const availableSections = session.sections.filter(s => !s.forbidden)
  if (availableSections.length === 0) return 0
  
  return Math.min(...availableSections.map(s => s.price))
}

const selectSession = (session) => {
  if (session.status === 'active') {
    selectedSessionId.value = session.id
  } else {
    ElMessage.info('该场次暂未开售')
  }
}

const goToSeatSelection = () => {
  if (!selectedSession.value) {
    ElMessage.warning('请先选择场次')
    return
  }
  
  if (selectedSession.value.status !== 'active') {
    ElMessage.warning('该场次暂未开售')
    return
  }
  
  router.push(`/seat-selection/${event.value.id}/${selectedSession.value.id}`)
}

onMounted(() => {
  loadEventDetail()
})
</script>

<style lang="scss" scoped>
.event-detail-view {
  .breadcrumb {
    display: inline-flex;
    align-items: center;
    color: #667eea;
    cursor: pointer;
    margin-bottom: 20px;
    font-size: 14px;
    transition: color 0.3s ease;
    
    &:hover {
      color: #764ba2;
    }
  }
  
  .breadcrumb-icon {
    margin-right: 5px;
  }
  
  .event-header {
    display: flex;
    gap: 40px;
    margin-bottom: 40px;
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
  
  .event-image {
    width: 400px;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 280px;
      object-fit: cover;
      border-radius: 8px;
    }
  }
  
  .event-info {
    flex: 1;
  }
  
  .event-title {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 25px;
    line-height: 1.3;
  }
  
  .event-meta {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 25px;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    font-size: 15px;
    color: #666;
  }
  
  .meta-icon {
    margin-right: 10px;
    font-size: 18px;
  }
  
  .meta-label {
    margin-right: 8px;
  }
  
  .meta-value {
    color: #333;
    font-weight: 500;
  }
  
  .event-description {
    p {
      color: #666;
      line-height: 1.8;
      font-size: 14px;
    }
  }
  
  .sessions-section {
    padding: 30px;
    margin-bottom: 30px;
  }
  
  .sessions-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .session-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border: 2px solid #e9e9e9;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #667eea;
    }
    
    &.selected {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }
  }
  
  .session-info {
    flex: 1;
  }
  
  .session-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }
  
  .session-time {
    font-size: 14px;
    color: #666;
  }
  
  .time-label {
    margin-right: 5px;
  }
  
  .session-price {
    margin: 0 30px;
  }
  
  .price-min {
    font-size: 18px;
    font-weight: 700;
    color: #f5576c;
  }
  
  .session-status {
    padding: 6px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    
    &.active {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
    
    &:not(.active) {
      background: #f5f5f5;
      color: #999;
    }
  }
  
  .no-sessions {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 16px;
  }
  
  .price-section {
    padding: 30px;
    margin-bottom: 30px;
  }
  
  .price-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .price-item {
    flex: 1;
    min-width: 280px;
    padding: 20px;
    border: 1px solid #e9e9e9;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.3s ease;
    
    &:hover:not(.forbidden) {
      border-color: #667eea;
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.1);
    }
    
    &.forbidden {
      opacity: 0.6;
      background: #f9f9f9;
    }
  }
  
  .section-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
  }
  
  .section-specs {
    font-size: 13px;
    color: #999;
  }
  
  .specs-separator {
    margin: 0 8px;
  }
  
  .section-price {
    display: flex;
    align-items: baseline;
  }
  
  .price-icon {
    font-size: 14px;
    color: #f5576c;
    font-weight: 600;
  }
  
  .price-value {
    font-size: 24px;
    font-weight: 700;
    color: #f5576c;
  }
  
  .section-status {
    padding: 4px 12px;
    background: #f5f5f5;
    color: #999;
    border-radius: 15px;
    font-size: 12px;
    margin-left: 15px;
  }
  
  .action-section {
    text-align: center;
    padding: 20px;
  }
  
  .not-found {
    text-align: center;
    padding: 80px;
    color: #999;
    font-size: 16px;
  }
}
</style>
