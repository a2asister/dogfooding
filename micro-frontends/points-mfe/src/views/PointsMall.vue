<template>
  <div class="points-mall">
    <div class="filter-section">
      <div class="filter-left">
        <span class="filter-label">分类:</span>
        <el-select v-model="filterCategory" placeholder="全部" clearable @change="loadProducts">
          <el-option label="全部" value="" />
          <el-option 
            v-for="cat in categories" 
            :key="cat" 
            :label="cat" 
            :value="cat" 
          />
        </el-select>
      </div>
      <div class="filter-right">
        <span class="my-points">
          我的积分: <span class="points">{{ balance?.availablePoints || 0 }}</span>
        </span>
      </div>
    </div>

    <div class="products-grid" v-loading="loading">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="product-card"
      >
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
          <div class="stock-badge" v-if="product.remainingStock < 10">
            仅剩 {{ product.remainingStock }} 件
          </div>
          <div class="sold-out-badge" v-if="product.remainingStock <= 0">
            已兑完
          </div>
        </div>
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-desc">{{ product.description }}</div>
          <div class="product-categories" v-if="product.category">
            <el-tag size="small" type="info">{{ product.category }}</el-tag>
          </div>
          <div class="product-footer">
            <div class="price-section">
              <span class="points-price">{{ product.pointsPrice }} 积分</span>
              <span class="original-price" v-if="product.originalPrice">
                价值 ¥{{ product.originalPrice }}
              </span>
            </div>
            <el-button 
              type="primary" 
              size="small"
              :loading="product.exchanging"
              :disabled="product.remainingStock <= 0 || (balance?.availablePoints || 0) < product.pointsPrice"
              @click="handleExchange(product)"
            >
              {{ product.remainingStock <= 0 ? '已兑完' : '立即兑换' }}
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && products.length === 0" description="暂无积分商品" />
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[8, 16, 24]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

const API_BASE = 'http://localhost:3007/api';
const USER_ID = 'user_001';

const loading = ref(false);
const filterCategory = ref('');
const products = ref([]);
const balance = ref(null);
const categories = ref([]);
const currentPage = ref(1);
const pageSize = ref(8);
const total = ref(0);

const loadBalance = async () => {
  try {
    const response = await axios.get(`${API_BASE}/balances/${USER_ID}`);
    if (response.data.success) {
      balance.value = response.data.data;
    }
  } catch (error) {
    console.error('加载积分余额失败:', error);
  }
};

const loadProducts = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    };

    if (filterCategory.value) {
      params.category = filterCategory.value;
    }

    const response = await axios.get(`${API_BASE}/products`, { params });
    if (response.data.success) {
      products.value = response.data.data;
      categories.value = response.data.categories || [];
      total.value = response.data.pagination?.total || products.value.length;
    }
  } catch (error) {
    console.error('加载积分商品失败:', error);
    ElMessage.error('加载积分商品失败');
  } finally {
    loading.value = false;
  }
};

const handleExchange = async (product) => {
  if ((balance.value?.availablePoints || 0) < product.pointsPrice) {
    ElMessage.warning('积分不足');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确认使用 ${product.pointsPrice} 积分兑换「${product.name}」？`,
      '确认兑换',
      {
        confirmButtonText: '确认兑换',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    product.exchanging = true;
    const response = await axios.post(`${API_BASE}/products/${product.id}/exchange`, {
      userId: USER_ID
    });

    if (response.data.success) {
      ElMessage.success('兑换成功！');
      loadBalance();
      loadProducts();
    }
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.error) {
        ElMessage.error(error.response.data.error);
      } else {
        ElMessage.error('兑换失败，请稍后重试');
      }
      console.error(error);
    }
  } finally {
    product.exchanging = false;
  }
};

const handleSizeChange = () => {
  currentPage.value = 1;
  loadProducts();
};

const handleCurrentChange = () => {
  loadProducts();
};

onMounted(() => {
  Promise.all([
    loadBalance(),
    loadProducts()
  ]);
});
</script>

<style scoped>
.points-mall {
  padding-bottom: 40px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #6c757d;
}

.my-points {
  font-size: 14px;
  color: #6c757d;
}

.my-points .points {
  font-size: 18px;
  font-weight: 700;
  color: #fa709a;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f5f7fa;
  overflow: hidden;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.sold-out-badge {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 700;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-categories {
  margin-bottom: 12px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.points-price {
  font-size: 18px;
  font-weight: 700;
  color: #fa709a;
}

.original-price {
  font-size: 11px;
  color: #999;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
