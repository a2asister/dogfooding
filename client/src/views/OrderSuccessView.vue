<template>
  <div class="order-success-view">
    <div class="container">
      <div class="success-card card">
        <div class="success-icon">
          <el-icon class="icon-circle-check"><CircleCheck /></el-icon>
        </div>
        <h1 class="success-title">购票成功！</h1>
        <p class="success-message">您的订单已支付成功，请在演出开始前到达场馆</p>
        
        <div class="order-info-section">
          <h3 class="section-title">订单信息</h3>
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">订单号</span>
              <span class="detail-value highlight">{{ orderStore.orderInfo.orderNo }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">演出名称</span>
              <span class="detail-value">{{ orderStore.orderInfo.event?.title }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">演出时间</span>
              <span class="detail-value">{{ orderStore.orderInfo.session?.date }} {{ orderStore.orderInfo.session?.time }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">演出场馆</span>
              <span class="detail-value">{{ orderStore.orderInfo.session?.venue }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">座位信息</span>
              <span class="detail-value">
                <span 
                  v-for="(seat, index) in orderStore.orderInfo.seats" 
                  :key="seat.id"
                >
                  {{ seat.sectionName }} {{ seat.row }}排{{ seat.number }}座
                  <span v-if="index < orderStore.orderInfo.seats.length - 1">、</span>
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">支付金额</span>
              <span class="detail-value price">¥{{ orderStore.orderInfo.totalPrice }}</span>
            </div>
          </div>
        </div>
        
        <div class="action-section">
          <button class="btn-secondary" @click="goToMyOrders">
            查看我的订单
          </button>
          <button class="btn-primary" @click="goToHome">
            返回首页
          </button>
        </div>
      </div>
      
      <div class="tips-section card">
        <h3 class="section-title">温馨提示</h3>
        <ul class="tips-list">
          <li class="tip-item">
            <span class="tip-icon">📱</span>
            <span class="tip-text">请妥善保管您的订单号，入场时可能需要出示</span>
          </li>
          <li class="tip-item">
            <span class="tip-icon">⏰</span>
            <span class="tip-text">建议提前30分钟到达场馆，配合安检工作</span>
          </li>
          <li class="tip-item">
            <span class="tip-icon">📋</span>
            <span class="tip-text">请携带购票时使用的身份证件，以便核对信息</span>
          </li>
          <li class="tip-item">
            <span class="tip-icon">🎒</span>
            <span class="tip-text">场馆内禁止携带食品、饮料及专业摄影设备</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'

const router = useRouter()
const orderStore = useOrderStore()

const goToMyOrders = () => {
  ElMessage.info('订单管理功能开发中，即将上线')
}

const goToHome = () => {
  orderStore.clearOrderInfo()
  router.push('/')
}

onMounted(() => {
  if (!orderStore.orderInfo.orderNo) {
    router.push('/')
  }
})
</script>

<style lang="scss" scoped>
.order-success-view {
  padding: 20px 0;
  
  .success-card {
    text-align: center;
    padding: 50px 40px;
    margin-bottom: 30px;
  }
  
  .success-icon {
    margin-bottom: 25px;
    
    .icon-circle-check {
      font-size: 80px;
      color: #67c23a;
    }
  }
  
  .success-title {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 15px;
  }
  
  .success-message {
    font-size: 16px;
    color: #666;
    margin-bottom: 40px;
  }
  
  .order-info-section {
    text-align: left;
    background: #fafafa;
    border-radius: 12px;
    padding: 25px 30px;
    margin-bottom: 30px;
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
  
  .order-details {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .detail-row {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
  }
  
  .detail-label {
    color: #999;
    width: 100px;
    flex-shrink: 0;
  }
  
  .detail-value {
    color: #333;
    flex: 1;
    line-height: 1.6;
    
    &.highlight {
      font-weight: 600;
      color: #667eea;
      font-family: 'Courier New', monospace;
    }
    
    &.price {
      font-size: 20px;
      font-weight: 700;
      color: #f5576c;
    }
  }
  
  .action-section {
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  
  .tips-section {
    padding: 30px;
  }
  
  .tips-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .tip-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 15px;
    background: #f9f9f9;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background: #f0f0f0;
    }
  }
  
  .tip-icon {
    font-size: 20px;
  }
  
  .tip-text {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
  }
}
</style>
