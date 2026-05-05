<template>
  <div class="group-buy-home">
    <div class="header-banner">
      <div class="banner-content">
        <h1 class="main-title">拼团优惠</h1>
        <p class="sub-title">多人成团，立享低价</p>
      </div>
    </div>

    <div class="hot-section" v-if="hotItems.length > 0">
      <div class="section-header">
        <el-icon class="fire-icon"><Hot /></el-icon>
        <span class="section-title">热门拼团</span>
      </div>
      <div class="hot-products">
        <div 
          v-for="item in hotItems" 
          :key="item.id" 
          class="hot-product-card"
          @click="goToDetail(item.id)"
        >
          <div class="product-image-wrapper">
            <img :src="item.productImage" class="product-image" />
            <div class="group-badge">{{ item.groupSize }}人团</div>
            <div class="discount-badge">-{{ item.discountPercent }}%</div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ item.productName }}</h3>
            <p class="product-desc">{{ item.description }}</p>
            <div class="price-section">
              <span class="group-price">¥{{ item.groupPrice }}</span>
              <span class="original-price">¥{{ item.originalPrice }}</span>
            </div>
            <div class="group-info">
              <el-tag type="warning" size="small">{{ item.groupSize }}人成团</el-tag>
              <span class="sold-info">已拼{{ item.soldStock }}件</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="all-section">
      <div class="section-header">
        <el-icon class="list-icon"><Shop /></el-icon>
        <span class="section-title">全部拼团</span>
      </div>

      <div class="products-grid" v-loading="loading">
        <div 
          v-for="item in allItems" 
          :key="item.id" 
          class="product-card"
          @click="goToDetail(item.id)"
        >
          <div class="card-image-wrapper">
            <img :src="item.productImage" class="card-image" />
            <div class="status-badge" :class="item.status">
              <span v-if="item.status === 'active'">拼团中</span>
              <span v-else>即将开始</span>
            </div>
            <div class="card-group-badge">{{ item.groupSize }}人团</div>
          </div>
          <div class="card-info">
            <h4 class="card-name">{{ item.productName }}</h4>
            <div class="card-price-row">
              <span class="card-group-price">¥{{ item.groupPrice }}</span>
              <span class="card-original-price">¥{{ item.originalPrice }}</span>
            </div>
            <div class="card-group-info">
              <span class="need-more">还差{{ item.groupSize - 1 }}人成团</span>
              <el-tag type="success" size="small">-{{ item.discountPercent }}%</el-tag>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && allItems.length === 0" description="暂无拼团活动" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Hot, Shop } from '@element-plus/icons-vue';
import axios from 'axios';

const router = useRouter();
const API_BASE = 'http://localhost:3004/api';

const loading = ref(false);
const hotItems = ref([]);
const allItems = ref([]);

const loadGroupBuys = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE}/group-buys/active`);
    if (response.data.success) {
      hotItems.value = response.data.data.hot || [];
      allItems.value = response.data.data.all || [];
    }
  } catch (error) {
    console.error('加载拼团列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const goToDetail = (id) => {
  router.push(`/detail/${id}`);
};

onMounted(() => {
  loadGroupBuys();
});
</script>

<style scoped>
.group-buy-home {
  min-height: 100vh;
  padding-bottom: 40px;
}

.header-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  text-align: center;
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

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 0 20px;
}

.fire-icon {
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
  padding: 20px;
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
  height: 180px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.group-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 4px;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 6px 0;
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

.group-price {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.original-price {
  font-size: 14px;
  color: #95a5a6;
  text-decoration: line-through;
}

.group-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sold-info {
  font-size: 12px;
  color: #6c757d;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
  height: 160px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.status-badge.active {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.status-badge.scheduled {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-group-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
}

.card-info {
  padding: 12px;
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 8px;
}

.card-group-price {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

.card-original-price {
  font-size: 12px;
  color: #95a5a6;
  text-decoration: line-through;
}

.card-group-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.need-more {
  font-size: 12px;
  color: #ff6b6b;
  font-weight: 600;
}
</style>
