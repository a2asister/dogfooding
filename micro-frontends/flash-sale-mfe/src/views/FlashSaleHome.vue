<template>
  <div class="flash-sale-home">
    <div class="header-banner">
      <div class="banner-content">
        <div class="title-section">
          <h1 class="main-title">限时秒杀</h1>
          <p class="sub-title">每日限量，手慢无！</p>
        </div>
        <div class="countdown-section" v-if="activeCountdown">
          <div class="countdown-label">距结束</div>
          <div class="countdown-timer">
            <span class="time-box">{{ hours }}</span>
            <span class="time-colon">:</span>
            <span class="time-box">{{ minutes }}</span>
            <span class="time-colon">:</span>
            <span class="time-box">{{ seconds }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="hot-section" v-if="hotItems.length > 0">
      <div class="section-header">
        <div class="header-left">
          <el-icon class="promotion-icon"><Promotion /></el-icon>
          <span class="section-title">热门爆款</span>
        </div>
      </div>
      <div class="hot-products">
        <div 
          v-for="item in hotItems" 
          :key="item.id" 
          class="hot-product-card"
          @click="goToDetail(item.id)"
        >
          <div class="product-image-wrapper">
            <img :src="item.productImage" class="product-image" :alt="item.productName" />
            <div class="discount-badge">-{{ item.discountPercent }}%</div>
            <div class="hot-badge">HOT</div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ item.productName }}</h3>
            <p class="product-desc">{{ item.description }}</p>
            <div class="price-section">
              <span class="flash-price">¥{{ item.flashPrice }}</span>
              <span class="original-price">¥{{ item.originalPrice }}</span>
            </div>
            <div class="stock-bar">
              <div class="stock-progress">
                <div 
                  class="stock-fill" 
                  :style="{ width: (item.soldStock / item.totalStock * 100) + '%' }"
                ></div>
              </div>
              <span class="stock-text">已抢{{ item.soldStock }}件</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="all-section">
      <div class="section-header">
        <div class="header-left">
          <el-icon class="list-icon"><Grid /></el-icon>
          <span class="section-title">全部秒杀</span>
        </div>
        <div class="header-right">
          <el-select v-model="filterStatus" placeholder="筛选状态" size="small" @change="loadFlashSales">
            <el-option label="全部" value="" />
            <el-option label="正在秒杀" value="active" />
            <el-option label="即将开始" value="scheduled" />
            <el-option label="已售罄" value="sold_out" />
          </el-select>
        </div>
      </div>

      <div class="products-grid" v-loading="loading">
        <div 
          v-for="item in allItems" 
          :key="item.id" 
          class="product-card"
          @click="goToDetail(item.id)"
        >
          <div class="card-image-wrapper">
            <img :src="item.productImage" class="card-image" :alt="item.productName" />
            <div class="status-overlay" :class="item.status">
              <span v-if="item.status === 'scheduled'">即将开始</span>
              <span v-else-if="item.status === 'active'">秒杀中</span>
              <span v-else-if="item.status === 'sold_out'">已售罄</span>
              <span v-else>已结束</span>
            </div>
            <div class="card-discount">-{{ item.discountPercent }}%</div>
          </div>
          <div class="card-info">
            <h4 class="card-name">{{ item.productName }}</h4>
            <p class="card-desc">{{ item.description }}</p>
            <div class="card-price-row">
              <span class="card-flash-price">¥{{ item.flashPrice }}</span>
              <span class="card-original-price">¥{{ item.originalPrice }}</span>
            </div>
            <el-progress 
              :percentage="Math.round(item.soldStock / item.totalStock * 100)" 
              :color="getProgressColor(item.status)"
              :stroke-width="8"
            />
            <div class="card-stock-info">
              <span>仅剩 <strong>{{ item.availableStock }}</strong> 件</span>
              <span>限购{{ item.limitPerUser }}件</span>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && allItems.length === 0" description="暂无秒杀商品" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Promotion, Grid } from '@element-plus/icons-vue';
import axios from 'axios';

const router = useRouter();
const API_BASE = 'http://localhost:3003/api';

const loading = ref(false);
const hotItems = ref([]);
const allItems = ref([]);
const filterStatus = ref('');

const countdownSeconds = ref(0);
const timer = ref(null);

const activeCountdown = computed(() => countdownSeconds.value > 0);

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

const loadFlashSales = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE}/flash-sales/active`);
    if (response.data.success) {
      hotItems.value = response.data.data.hot || [];
      let all = response.data.data.all || [];
      
      if (filterStatus.value) {
        all = all.filter(item => item.status === filterStatus.value);
      }
      
      allItems.value = all;
      
      const activeItem = all.find(item => item.status === 'active');
      if (activeItem && activeItem.countdown) {
        countdownSeconds.value = activeItem.countdown.seconds;
        startCountdown();
      }
    }
  } catch (error) {
    console.error('加载秒杀列表失败:', error);
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
      loadFlashSales();
    }
  }, 1000);
};

const goToDetail = (id) => {
  router.push(`/detail/${id}`);
};

onMounted(() => {
  loadFlashSales();
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style scoped>
.flash-sale-home {
  min-height: 100vh;
  padding-bottom: 40px;
}

.header-banner {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #d63031 100%);
  padding: 30px 20px;
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.sub-title {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.countdown-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px 24px;
  border-radius: 12px;
}

.countdown-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.countdown-timer {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-box {
  background: white;
  color: #d63031;
  font-size: 28px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 6px;
  min-width: 48px;
  text-align: center;
}

.time-colon {
  color: white;
  font-size: 28px;
  font-weight: 700;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.promotion-icon {
  font-size: 24px;
  color: #ff6b6b;
}

.list-icon {
  font-size: 24px;
  color: #667eea;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
}

.hot-section {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.hot-products {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.hot-product-card {
  flex-shrink: 0;
  width: 280px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.hot-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.product-image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
}

.hot-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 12px;
  color: #6c757d;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.flash-price {
  font-size: 24px;
  font-weight: 700;
  color: #ff6b6b;
}

.original-price {
  font-size: 14px;
  color: #95a5a6;
  text-decoration: line-through;
}

.stock-bar {
  position: relative;
}

.stock-progress {
  height: 20px;
  background: #ffe4e4;
  border-radius: 10px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 10px;
  transition: width 0.3s;
}

.stock-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: white;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.all-section {
  max-width: 1200px;
  margin: 30px auto 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px 20px 0 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-image-wrapper {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: rgba(0, 0, 0, 0.5);
}

.status-overlay.scheduled {
  background: rgba(78, 205, 196, 0.8);
}

.status-overlay.sold_out,
.status-overlay.ended {
  background: rgba(0, 0, 0, 0.6);
}

.card-discount {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ff6b6b;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.card-info {
  padding: 14px;
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  font-size: 12px;
  color: #6c757d;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 10px;
}

.card-flash-price {
  font-size: 20px;
  font-weight: 700;
  color: #ff6b6b;
}

.card-original-price {
  font-size: 12px;
  color: #95a5a6;
  text-decoration: line-through;
}

.card-stock-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6c757d;
  margin-top: 8px;
}

.card-stock-info strong {
  color: #ff6b6b;
}
</style>
