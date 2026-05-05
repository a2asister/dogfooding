<template>
  <div class="flash-sale-detail">
    <div class="back-bar">
      <el-button type="primary" link @click="goBack">
        <el-icon><ArrowLeft /></el-icon> 返回列表
      </el-button>
    </div>

    <div class="detail-content" v-loading="loading">
      <div v-if="item" class="detail-card">
        <el-row :gutter="40">
          <el-col :span="12">
            <div class="image-section">
              <div class="main-image-wrapper">
                <img :src="item.productImage" class="main-image" :alt="item.productName" />
                <div class="status-badge" :class="item.status">
                  <span v-if="item.status === 'scheduled'">即将开始</span>
                  <span v-else-if="item.status === 'active'">秒杀中</span>
                  <span v-else-if="item.status === 'sold_out'">已售罄</span>
                  <span v-else>已结束</span>
                </div>
                <div class="discount-badge">-{{ item.discountPercent }}%</div>
              </div>
            </div>
          </el-col>

          <el-col :span="12">
            <div class="info-section">
              <h1 class="product-title">{{ item.productName }}</h1>
              <p class="product-subtitle">{{ item.name }}</p>
              
              <div class="price-section">
                <div class="price-row">
                  <span class="flash-price">¥{{ item.flashPrice }}</span>
                  <span class="original-price">¥{{ item.originalPrice }}</span>
                </div>
                <div class="saving-info">
                  立省 ¥{{ item.originalPrice - item.flashPrice }}
                </div>
              </div>

              <el-divider />

              <div class="countdown-section" v-if="item.status === 'active' && countdownSeconds > 0">
                <div class="countdown-label">距离秒杀结束</div>
                <div class="countdown-timer">
                  <span class="time-box">{{ hours }}</span>
                  <span class="time-colon">:</span>
                  <span class="time-box">{{ minutes }}</span>
                  <span class="time-colon">:</span>
                  <span class="time-box">{{ seconds }}</span>
                </div>
              </div>

              <div class="countdown-section" v-if="item.status === 'scheduled' && countdownSeconds > 0">
                <div class="countdown-label upcoming">距离秒杀开始</div>
                <div class="countdown-timer">
                  <span class="time-box upcoming">{{ hours }}</span>
                  <span class="time-colon">:</span>
                  <span class="time-box upcoming">{{ minutes }}</span>
                  <span class="time-colon">:</span>
                  <span class="time-box upcoming">{{ seconds }}</span>
                </div>
              </div>

              <div class="stock-section">
                <div class="stock-label">库存进度</div>
                <el-progress 
                  :percentage="Math.round(item.soldStock / item.totalStock * 100)" 
                  :color="getProgressColor(item.status)"
                  :stroke-width="12"
                />
                <div class="stock-info">
                  <span>已售 <strong>{{ item.soldStock }}</strong> 件</span>
                  <span>剩余 <strong>{{ item.availableStock }}</strong> 件</span>
                  <span>共 {{ item.totalStock }} 件</span>
                </div>
              </div>

              <el-divider />

              <div class="action-section">
                <div class="quantity-selector">
                  <span class="selector-label">购买数量</span>
                  <el-input-number 
                    v-model="quantity" 
                    :min="1" 
                    :max="maxPurchase"
                    :disabled="item.status !== 'active'"
                  />
                  <span class="limit-hint">每人限购 {{ item.limitPerUser }} 件</span>
                </div>

                <div class="action-buttons">
                  <el-button 
                    type="primary" 
                    size="large" 
                    :loading="purchasing"
                    :disabled="item.status !== 'active'"
                    @click="handlePurchase"
                    class="buy-button"
                  >
                    <el-icon><ShoppingCart /></el-icon>
                    {{ item.status === 'active' ? '立即抢购' : getStatusText(item.status) }}
                  </el-button>
                  <el-button size="large" @click="addToCart">
                    <el-icon><Star /></el-icon> 关注
                  </el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <div class="description-section">
          <h3 class="section-title">商品详情</h3>
          <div class="description-content">
            <p>{{ item.description }}</p>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="商品分类">{{ item.category }}</el-descriptions-item>
              <el-descriptions-item label="活动时间">
                {{ item.formattedStartTime }} 至 {{ item.formattedEndTime }}
              </el-descriptions-item>
              <el-descriptions-item label="原价">¥{{ item.originalPrice }}</el-descriptions-item>
              <el-descriptions-item label="秒杀价">¥{{ item.flashPrice }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>

      <el-empty v-else-if="!loading" description="商品不存在" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, ShoppingCart, Star } from '@element-plus/icons-vue';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const API_BASE = 'http://localhost:3003/api';

const loading = ref(false);
const purchasing = ref(false);
const item = ref(null);
const quantity = ref(1);
const countdownSeconds = ref(0);
const timer = ref(null);

const maxPurchase = computed(() => item.value?.limitPerUser || 1);

const hours = computed(() => {
  const h = Math.floor(countdownSeconds.value / 3600);
  return h.toString().padStart(2, '0');
});

const minutes = computed(() => {
  const m = Math.floor((countdownSeconds.value % 3600) / 60);
  return m.toString().padStart(2, '0');
});

const seconds = computed(() => {
  const s = countdownSeconds.value % 60;
  return s.toString().padStart(2, '0');
});

const getProgressColor = (status) => {
  if (status === 'active') return '#ff6b6b';
  if (status === 'scheduled') return '#4ecdc4';
  return '#95a5a6';
};

const getStatusText = (status) => {
  const texts = {
    active: '立即抢购',
    scheduled: '即将开始',
    sold_out: '已售罄',
    ended: '已结束'
  };
  return texts[status] || '已结束';
};

const goBack = () => {
  router.push('/');
};

const loadFlashSale = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE}/flash-sales/${route.params.id}`);
    if (response.data.success) {
      item.value = response.data.data;
      if (item.value.countdown) {
        countdownSeconds.value = item.value.countdown.seconds;
        startCountdown();
      }
    }
  } catch (error) {
    console.error('加载秒杀详情失败:', error);
    ElMessage.error('加载商品详情失败');
  } finally {
    loading.value = false;
  }
};

const startCountdown = () => {
  if (timer.value) clearInterval(timer.value);
  timer.value = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value--;
    } else {
      clearInterval(timer.value);
      loadFlashSale();
    }
  }, 1000);
};

const handlePurchase = async () => {
  if (item.value.status !== 'active') {
    ElMessage.warning('该活动当前不可购买');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确认购买 ${quantity.value} 件「${item.value.productName}」？`,
      '确认购买',
      {
        confirmButtonText: '确认购买',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    purchasing.value = true;
    const response = await axios.post(
      `${API_BASE}/flash-sales/${route.params.id}/purchase`,
      {
        userId: 'user_001',
        quantity: quantity.value
      }
    );

    if (response.data.success) {
      ElMessage.success('抢购成功！');
      loadFlashSale();
    }
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.error) {
        ElMessage.error(error.response.data.error);
      } else {
        ElMessage.error('抢购失败，请稍后重试');
      }
      console.error(error);
    }
  } finally {
    purchasing.value = false;
  }
};

const addToCart = () => {
  ElMessage.success('已添加关注');
};

onMounted(() => {
  loadFlashSale();
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style scoped>
.flash-sale-detail {
  min-height: 100vh;
  background: linear-gradient(180deg, #ff6b6b 0%, #ee5a24 50%, #d63031 100%);
  padding-bottom: 40px;
}

.back-bar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.detail-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.detail-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.image-section {
  position: relative;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #f5f7fa;
}

.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.status-badge.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  animation: pulse 1.5s infinite;
}

.status-badge.scheduled {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.status-badge.sold_out,
.status-badge.ended {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.discount-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  font-size: 20px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
}

.info-section {
  padding: 10px 0;
}

.product-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
}

.product-subtitle {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 20px 0;
}

.price-section {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe4e4 100%);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.flash-price {
  font-size: 36px;
  font-weight: 700;
  color: #ff6b6b;
}

.original-price {
  font-size: 18px;
  color: #95a5a6;
  text-decoration: line-through;
}

.saving-info {
  font-size: 14px;
  color: #ff6b6b;
  font-weight: 600;
}

.countdown-section {
  margin-bottom: 20px;
}

.countdown-label {
  font-size: 14px;
  color: #ff6b6b;
  font-weight:  600;
  margin-bottom: 10px;
}

.countdown-label.upcoming {
  color: #4ecdc4;
}

.countdown-timer {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-box {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  font-size: 28px;
  font-weight: 700;
  padding: 10px 14px;
  border-radius: 8px;
  min-width: 56px;
  text-align: center;
}

.time-box.upcoming {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.time-colon {
  color: #ff6b6b;
  font-size: 28px;
  font-weight: 700;
}

.stock-section {
  margin-bottom: 20px;
}

.stock-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 10px;
}

.stock-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6c757d;
  margin-top: 8px;
}

.stock-info strong {
  color: #ff6b6b;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.selector-label {
  font-size: 14px;
  color: #6c757d;
}

.limit-hint {
  font-size: 12px;
  color: #95a5a6;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.buy-button {
  flex: 2;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border: none;
}

.buy-button:hover {
  background: linear-gradient(135deg, #ee5a24 0%, #d63031 100%);
}

.section-title {
  font-size: 18px;
  font-weight:  600;
  color: #1a1a2e;
  margin: 0 0 16px 0;
}

.description-content p {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.8;
  margin-bottom: 16px;
}
</style>
