<template>
  <div class="order-confirm-view">
    <div class="container">
      <div class="breadcrumb" @click="goBack">
        <span class="breadcrumb-icon">←</span>
        <span class="breadcrumb-text">返回座位选择</span>
      </div>
      
      <div class="order-confirm-content">
        <div class="countdown-alert" v-if="seatStore.lockExpiresAt">
          <div class="countdown-content">
            <el-icon class="warning-icon"><Warning /></el-icon>
            <span class="countdown-text">
              座位锁定中，请在</span>
            <span class="countdown-time" :class="{ warning: remainingTime <= 60 }">
              {{ formatCountdown(remainingTime) }}
            </span>
            <span class="countdown-text">内完成支付</span>
          </div>
        </div>
        
        <div class="order-card card">
          <div class="order-section">
            <h3 class="section-title">演出信息</h3>
            <div class="event-info">
              <div class="event-image">
                <img :src="orderStore.orderInfo.event?.image" :alt="orderStore.orderInfo.event?.title" />
              </div>
              <div class="event-details">
                <h2 class="event-title">{{ orderStore.orderInfo.event?.title }}</h2>
                <div class="event-meta">
                  <div class="meta-item">
                    <span class="meta-icon">📍</span>
                    <span class="meta-value">{{ orderStore.orderInfo.session?.venue }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <span class="meta-value">{{ orderStore.orderInfo.session?.date }} {{ orderStore.orderInfo.session?.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="order-section">
            <h3 class="section-title">座位信息</h3>
            <div class="seats-list">
              <div 
                v-for="seat in orderStore.orderInfo.seats" 
                :key="seat.id" 
                class="seat-item"
              >
                <div class="seat-info">
                  <span class="seat-section">{{ seat.sectionName }}</span>
                  <span class="seat-position">{{ seat.row }}排{{ seat.number }}座</span>
                </div>
                <div class="seat-price">¥{{ seat.price }}</div>
              </div>
            </div>
          </div>
          
          <div class="order-section">
            <h3 class="section-title">联系信息</h3>
            <el-form :model="contactForm" label-width="80px" class="contact-form">
              <el-form-item label="姓名" required>
                <el-input 
                  v-model="contactForm.name" 
                  placeholder="请输入姓名" 
                  style="max-width: 300px"
                />
              </el-form-item>
              <el-form-item label="手机号" required>
                <el-input 
                  v-model="contactForm.phone" 
                  placeholder="请输入手机号" 
                  style="max-width: 300px"
                />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input 
                  v-model="contactForm.email" 
                  placeholder="请输入邮箱（选填）" 
                  style="max-width: 300px"
                />
              </el-form-item>
            </el-form>
          </div>
          
          <div class="order-section price-summary">
            <div class="summary-row">
              <span class="summary-label">票价小计</span>
              <span class="summary-value">¥{{ orderStore.orderInfo.totalPrice }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">服务费</span>
              <span class="summary-value">¥0</span>
            </div>
            <div class="summary-row total">
              <span class="summary-label">应付金额</span>
              <span class="summary-value">¥{{ orderStore.orderInfo.totalPrice }}</span>
            </div>
          </div>
        </div>
        
        <div class="action-section">
          <button class="btn-secondary" @click="goBack">
            返回修改座位
          </button>
          <button 
            class="btn-primary pay-button" :disabled="!canSubmit" @click="handlePay">
            立即支付 ¥{{ orderStore.orderInfo.totalPrice }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSeatStore, useOrderStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'

const router = useRouter()
const seatStore = useSeatStore()
const orderStore = useOrderStore()

const remainingTime = ref(0)
let countdownInterval = null

const contactForm = ref({
  name: '',
  phone: '',
  email: ''
})

const canSubmit = computed(() => {
  return contactForm.value.name && 
         contactForm.value.phone && 
         contactForm.value.phone.length === 11
})

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
  router.push(`/event/${orderStore.orderInfo.event?.id}`)
}

const goBack = () => {
  ElMessageBox.confirm(
    '确定要返回座位选择页面吗？',
    '确认返回',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    router.back()
  }).catch(() => {})
}

const handlePay = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('请填写完整的联系信息')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确认支付 ¥' + orderStore.orderInfo.totalPrice + ' 元？',
      '确认支付',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    await seatStore.confirmSeats()
    
    orderStore.generateOrderNo()
    
    ElMessage.success('支付成功！')
    
    router.push('/order-success')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '支付失败')
    }
  }
}

onMounted(() => {
  if (orderStore.orderInfo.seats.length === 0) {
    ElMessage.warning('请先选择座位')
    router.push('/')
    return
  }
  
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
.order-confirm-view {
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
  
  .countdown-alert {
    background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
    border-radius: 8px;
    padding: 15px 20px;
    margin-bottom: 20px;
    border: 1px solid #ffd591;
  }
  
  .countdown-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .warning-icon {
    font-size: 20px;
    color: #faad14;
  }
  
  .countdown-text {
    font-size: 14px;
    color: #8c6b00;
  }
  
  .countdown-time {
    font-family: 'Courier New', monospace;
    font-size: 20px;
    font-weight: 700;
    color: #fa8c16;
    
    &.warning {
      color: #f5222d;
      animation: pulse 1s infinite;
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  
  .order-card {
    padding: 30px;
    margin-bottom: 20px;
  }
  
  .order-section {
    padding: 20px 0;
    
    &:not(:last-child) {
      border-bottom: 1px dashed #e9e9e9;
    }
  }
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #667eea;
    display: inline-block;
  }
  
  .event-info {
    display: flex;
    gap: 25px;
  }
  
  .event-image {
    width: 160px;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 110px;
      object-fit: cover;
      border-radius: 8px;
    }
  }
  
  .event-details {
    flex: 1;
  }
  
  .event-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    line-height: 1.4;
  }
  
  .event-meta {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #666;
  }
  
  .meta-icon {
    margin-right: 10px;
    font-size: 16px;
  }
  
  .seats-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .seat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #f9f9f9;
    border-radius: 8px;
  }
  
  .seat-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .seat-section {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
  }
  
  .seat-position {
    font-size: 15px;
    color: #333;
    font-weight: 500;
  }
  
  .seat-price {
    font-size: 16px;
    font-weight: 600;
    color: #f5576c;
  }
  
  .contact-form {
    margin-top: 10px;
  }
  
  .price-summary {
    background: #fafafa;
    border-radius: 8px;
    padding: 20px;
    margin-top: 10px;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 14px;
    
    &.total {
      margin-top: 10px;
      padding-top: 15px;
      border-top: 1px solid #e9e9e9;
      font-size: 16px;
      font-weight: 600;
      
      .summary-label {
        color: #333;
      }
      
      .summary-value {
        color: #f5576c;
        font-size: 22px;
      }
    }
  }
  
  .summary-label {
    color: #666;
  }
  
  .summary-value {
    color: #333;
    font-weight: 500;
  }
  
  .action-section {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
    margin-top: 30px;
  }
  
  .pay-button {
    font-size: 18px;
    padding: 15px 40px;
  }
}
</style>
