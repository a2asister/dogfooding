<template>
  <div class="seat-selection-view">
    <div class="container">
      <div class="breadcrumb" @click="goBack">
        <span class="breadcrumb-icon">←</span>
        <span class="breadcrumb-text">返回演出详情</span>
      </div>
      
      <div class="seat-selection-content" v-if="!loading">
        <div class="seat-selection-header card">
          <div class="event-info">
            <h1 class="event-title">{{ event?.title }}</h1>
            <div class="session-info">
              <span class="session-date">{{ session?.date }}</span>
              <span class="session-time">{{ session?.time }}</span>
              <span class="session-venue">{{ session?.venue }}</span>
            </div>
          </div>
          
          <div class="countdown-section" v-if="seatStore.lockExpiresAt">
            <div class="countdown-label">座位锁定中</div>
            <div class="countdown-time" :class="{ warning: remainingTime <= 60 }">
              {{ formatCountdown(remainingTime) }}
            </div>
          </div>
        </div>
        
        <div class="seat-map-section card">
          <div class="stage">
            <div class="stage-label">舞台</div>
          </div>
          
          <div class="seat-legend">
            <div class="legend-item">
              <div class="legend-seat available"></div>
              <span class="legend-text">可选</span>
            </div>
            <div class="legend-item">
              <div class="legend-seat selected"></div>
              <span class="legend-text">已选</span>
            </div>
            <div class="legend-item">
              <div class="legend-seat locked"></div>
              <span class="legend-text">锁定</span>
            </div>
            <div class="legend-item">
              <div class="legend-seat sold"></div>
              <span class="legend-text">已售</span>
            </div>
            <div class="legend-item">
              <div class="legend-seat forbidden"></div>
              <span class="legend-text">禁售</span>
            </div>
          </div>
          
          <div class="seat-sections">
            <div 
              v-for="section in sections" 
              :key="section.id" 
              class="seat-section"
            >
              <div class="section-header">
                <div class="section-name">{{ section.name }}</div>
                <div class="section-price">¥{{ section.price }}/座</div>
              </div>
              <div class="section-seats">
                <div class="row" v-for="row in section.rows" :key="row">
                  <div class="row-label">{{ row }}排</div>
                  <div 
                    v-for="seat in getSectionSeats(section.id, row)" 
                    :key="seat.id" 
                    class="seat"
                    :class="getSeatClass(seat)"
                    :disabled="isSeatDisabled(seat)"
                    @click="toggleSeat(seat)"
                  >
                    <span class="seat-number">{{ seat.number }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="fixed-bottom-bar">
          <div class="bottom-bar-content container">
            <div class="selected-info">
              <div class="selected-label">已选座位</div>
              <div class="selected-seats" v-if="seatStore.selectedSeats.length > 0">
                <span 
                  v-for="seat in seatStore.selectedSeats" 
                  :key="seat.id" 
                  class="selected-seat-tag"
                >
                  {{ seat.sectionName }} {{ seat.row }}排{{ seat.number }}座
                </span>
              </div>
              <div class="no-selection" v-else>
                请点击座位进行选择
              </div>
            </div>
            
            <div class="price-info">
              <div class="price-label">合计</div>
              <div class="price-value">
                <span class="price-currency">¥</span>
                <span class="price-amount">{{ seatStore.totalPrice }}</span>
              </div>
              <div class="seat-count">({{ seatStore.seatCount }}张票)</div>
            </div>
            
            <div class="action-buttons">
              <button 
                class="btn-secondary"
                :disabled="seatStore.selectedSeats.length === 0"
                @click="clearSelection"
              >
                清空选择
              </button>
              <button 
                class="btn-primary"
                :disabled="canProceed === false"
                @click="handleProceed"
              >
                {{ proceedButtonText }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="loading-container" v-if="loading">
        <el-icon class="is-loading" size="32">
          <Loading />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventApi, sessionApi, seatApi } from '@/api'
import { useSeatStore, useOrderStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const seatStore = useSeatStore()
const orderStore = useOrderStore()

const event = ref(null)
const session = ref(null)
const seats = ref([])
const sections = ref([])
const loading = ref(true)
const remainingTime = ref(0)
let countdownInterval = null

const proceedButtonText = computed(() => {
  if (seatStore.lockExpiresAt) {
    return '确认购票'
  }
  return '锁定座位'
})

const canProceed = computed(() => {
  if (seatStore.lockExpiresAt) {
    return seatStore.lockedSeats.length > 0
  }
  return seatStore.selectedSeats.length > 0
})

const loadData = async () => {
  try {
    loading.value = true
    const eventId = route.params.eventId
    const sessionId = route.params.sessionId
    
    seatStore.setSessionId(sessionId)
    
    const eventResult = await eventApi.getEventById(eventId)
    event.value = eventResult.data
    
    const sessionResult = await sessionApi.getSessionById(sessionId)
    session.value = sessionResult.data
    sections.value = session.value.sections || []
    
    const seatsResult = await seatApi.getSeatsBySessionId(sessionId)
    seats.value = seatsResult.data.seats
    seatStore.lockDuration = seatsResult.data.lockDuration
  } catch (error) {
    ElMessage.error('加载座位信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getSectionSeats = (sectionId, row) => {
  return seats.value
    .filter(seat => seat.sectionId === sectionId && seat.row === row)
    .sort((a, b) => a.number - b.number)
}

const getSeatClass = (seat) => {
  const classes = []
  
  if (seat.isForbidden) {
    classes.push('forbidden')
  } else if (seat.isSold) {
    classes.push('sold')
  } else if (seat.isLocked) {
    const isMyLock = seatStore.lockedSeats.some(lock => lock.seatId === seat.id)
    if (isMyLock) {
      classes.push('locked-by-me')
    } else {
      classes.push('locked')
    }
  } else {
    const isSelected = seatStore.selectedSeats.some(s => s.id === seat.id)
    if (isSelected) {
      classes.push('selected')
    } else {
      classes.push('available')
    }
  }
  
  return classes
}

const isSeatDisabled = (seat) => {
  return seat.isForbidden || seat.isSold || (seat.isLocked && !seatStore.lockedSeats.some(lock => lock.seatId === seat.id))
}

const toggleSeat = (seat) => {
  if (isSeatDisabled(seat)) {
    if (seat.isForbidden) {
      ElMessage.info('该座位为禁售区域')
    } else if (seat.isSold) {
      ElMessage.info('该座位已售出')
    } else if (seat.isLocked) {
      ElMessage.info('该座位已被其他用户锁定')
    }
    return
  }
  
  if (seatStore.lockExpiresAt) {
    ElMessage.warning('您已锁定座位，如需修改请先解锁')
    return
  }
  
  seatStore.selectSeat(seat)
}

const clearSelection = () => {
  if (seatStore.lockExpiresAt) {
    ElMessageBox.confirm(
      '您已锁定座位，确认解锁后将释放所有锁定的座位？',
      '确认解锁',
      {
        confirmButtonText: '确认解锁',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await seatStore.unlockSeats()
        ElMessage.success('已解锁所有座位')
      } catch (error) {
        ElMessage.error('解锁失败')
      }
    }).catch(() => {})
  } else {
    seatStore.clearSelectedSeats()
  }
}

const handleProceed = async () => {
  if (seatStore.lockExpiresAt) {
    goToOrderConfirm()
  } else {
    try {
      const result = await seatStore.lockSelectedSeats()
      
      if (result.data.failedSeats && result.data.failedSeats.length > 0) {
        const failedMessages = result.data.failedSeats.map(f => `${f.seatId}: ${f.reason}`).join(', ')
        ElMessage.warning(`部分座位锁定失败: ${failedMessages}`)
      }
      
      if (result.data.lockedSeats && result.data.lockedSeats.length > 0) {
        ElMessage.success('座位锁定成功，请在倒计时结束前完成购票')
        startCountdown()
      }
    } catch (error) {
      ElMessage.error(error.message || '锁定座位失败')
    }
  }
}

const startCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  
  updateRemainingTime()
  countdownInterval = setInterval(() => {
    updateRemainingTime()
    if (remainingTime.value <= 0) {
      clearInterval(countdownInterval)
      handleLockExpired()
    }
  }, 1000)
}

const updateRemainingTime = () => {
  if (!seatStore.lockExpiresAt) {
    remainingTime.value = 0
    return
  }
  remainingTime.value = Math.max(0, Math.ceil((seatStore.lockExpiresAt - Date.now()) / 1000))
}

const formatCountdown = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const handleLockExpired = () => {
  ElMessage.warning('座位锁定已过期，请重新选择座位')
  seatStore.resetStore()
  loadData()
}

const goToOrderConfirm = () => {
  orderStore.setOrderInfo({
    event: event.value,
    session: session.value,
    seats: seatStore.selectedSeats,
    totalPrice: seatStore.totalPrice
  })
  router.push('/order-confirm')
}

const goBack = () => {
  if (seatStore.lockExpiresAt) {
    ElMessageBox.confirm(
      '您已锁定座位，返回后将释放所有锁定的座位，确定要返回吗？',
      '确认返回',
      {
        confirmButtonText: '确认返回',
        cancelButtonText: '继续购票',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await seatStore.unlockSeats()
        router.back()
      } catch (error) {
        ElMessage.error('解锁失败')
      }
    }).catch(() => {})
  } else {
    router.back()
  }
}

onMounted(() => {
  loadData()
  
  if (seatStore.lockExpiresAt && seatStore.lockExpiresAt > Date.now()) {
    startCountdown()
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style lang="scss" scoped>
.seat-selection-view {
  padding-bottom: 100px;
  
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
  
  .seat-selection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px 30px;
    margin-bottom: 20px;
  }
  
  .event-title {
    font-size: 22px;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
  }
  
  .session-info {
    display: flex;
    gap: 20px;
    color: #666;
    font-size: 14px;
    
    span {
      position: relative;
      
      &:not(:last-child):after {
        content: '';
        position: absolute;
        right: -10px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 4px;
        background: #999;
        border-radius: 50%;
      }
    }
  }
  
  .countdown-section {
    text-align: right;
  }
  
  .countdown-label {
    font-size: 12px;
    color: #999;
    margin-bottom: 5px;
  }
  
  .countdown-time {
    font-family: 'Courier New', monospace;
    font-size: 32px;
    font-weight: 700;
    color: #667eea;
    
    &.warning {
      color: #f56c6c;
      animation: pulse 1s infinite;
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  
  .seat-map-section {
    padding: 30px;
    margin-bottom: 20px;
  }
  
  .stage {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    height: 50px;
    border-radius: 0 0 100px 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  .stage-label {
    color: white;
    font-weight: 600;
    font-size: 16px;
  }
  
  .seat-legend {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .legend-seat {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    
    &.available {
      background: #e6f7ff;
      border: 1px solid #91d5ff;
    }
    
    &.selected {
      background: #667eea;
      border: 1px solid #667eea;
    }
    
    &.locked {
      background: #fff7e6;
      border: 1px solid #ffd591;
    }
    
    &.sold {
      background: #f5f5f5;
      border: 1px solid #e8e8e8;
    }
    
    &.forbidden {
      background: #ffccc7;
      border: 1px solid #ffa39e;
    }
  }
  
  .legend-text {
    font-size: 14px;
    color: #666;
  }
  
  .seat-sections {
    display: flex;
    flex-direction: column;
    gap: 50px;
  }
  
  .seat-section {
    text-align: center;
  }
  
  .section-header {
    margin-bottom: 20px;
  }
  
  .section-name {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
  }
  
  .section-price {
    font-size: 14px;
    color: #667eea;
    font-weight: 500;
  }
  
  .section-seats {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  
  .row-label {
    width: 50px;
    text-align: right;
    font-size: 12px;
    color: #999;
    padding-right: 10px;
  }
  
  .seat {
    width: 32px;
    height: 32px;
    border-radius: 4px 4px 12px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    
    &.available {
      background: #e6f7ff;
      border: 1px solid #91d5ff;
      
      &:hover {
        background: #91d5ff;
        transform: scale(1.1);
      }
    }
    
    &.selected {
      background: #667eea;
      border: 1px solid #667eea;
      
      .seat-number {
        color: white;
      }
    }
    
    &.locked-by-me {
      background: #667eea;
      border: 1px solid #667eea;
      opacity: 0.7;
      
      .seat-number {
        color: white;
      }
    }
    
    &.locked {
      background: #fff7e6;
      border: 1px solid #ffd591;
      cursor: not-allowed;
      
      .seat-number {
        color: #faad14;
      }
    }
    
    &.sold {
      background: #f5f5f5;
      border: 1px solid #e8e8e8;
      cursor: not-allowed;
      
      .seat-number {
        color: #ccc;
      }
    }
    
    &.forbidden {
      background: #ffccc7;
      border: 1px solid #ffa39e;
      cursor: not-allowed;
      
      .seat-number {
        color: #f5222d;
      }
    }
  }
  
  .seat-number {
    font-size: 11px;
    font-weight: 500;
    color: #1890ff;
  }
  
  .fixed-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  
  .bottom-bar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
  }
  
  .selected-info {
    flex: 1;
  }
  
  .selected-label {
    font-size: 12px;
    color: #999;
    margin-bottom: 5px;
  }
  
  .selected-seats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .selected-seat-tag {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 13px;
    font-weight: 500;
  }
  
  .no-selection {
    color: #999;
    font-size: 14px;
  }
  
  .price-info {
    display: flex;
    align-items: baseline;
    margin: 0 30px;
  }
  
  .price-label {
    font-size: 14px;
    color: #666;
    margin-right: 10px;
  }
  
  .price-value {
    display: flex;
    align-items: baseline;
  }
  
  .price-currency {
    font-size: 14px;
    color: #f5576c;
    font-weight: 600;
  }
  
  .price-amount {
    font-size: 28px;
    font-weight: 700;
    color: #f5576c;
  }
  
  .seat-count {
    font-size: 12px;
    color: #999;
    margin-left: 10px;
  }
  
  .action-buttons {
    display: flex;
    gap: 15px;
  }
}
</style>
