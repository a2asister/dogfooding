<template>
  <div class="points-home">
    <div class="balance-section">
      <div class="balance-card">
        <div class="balance-left">
          <div class="balance-label">可用积分</div>
          <div class="balance-value">
            <span class="currency">积分</span>
            <span class="amount">{{ balance?.availablePoints || 0 }}</span>
          </div>
          <div class="balance-info">
            <span>累计积分: {{ balance?.totalPoints || 0 }}</span>
            <span>|</span>
            <span>已使用: {{ balance?.usedPoints || 0 }}</span>
          </div>
        </div>
        <div class="balance-right">
          <div class="level-badge">
            <el-icon :size="24"><Medal /></el-icon>
            <span>{{ balance?.levelName || '新会员' }}</span>
          </div>
          <div class="level-progress" v-if="balance?.nextLevelPoints">
            <div class="progress-label">
              <span>距离下一等级</span>
              <span>{{ balance.nextLevelPoints - balance.totalPoints }} 积分</span>
            </div>
            <el-progress 
              :percentage="getLevelPercentage()" 
              :stroke-width="8"
              :color="{ '0%': '#fa709a', '100%': '#fee140' }"
              show-text="false"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="action-card" @click="$router.push('/mall')">
        <div class="action-icon exchange">
          <el-icon :size="28"><Goods /></el-icon>
        </div>
        <div class="action-text">
          <span class="action-title">积分兑换</span>
          <span class="action-desc">好礼等你来</span>
        </div>
        <el-icon class="action-arrow"><ArrowRight /></el-icon>
      </div>
      <div class="action-card" @click="handleSignIn">
        <div class="action-icon signin">
          <el-icon :size="28"><Calendar /></el-icon>
        </div>
        <div class="action-text">
          <span class="action-title">每日签到</span>
          <span class="action-desc" v-if="!signedIn">+10积分</span>
          <span class="action-desc success" v-else>已签到</span>
        </div>
        <el-icon class="action-arrow"><ArrowRight /></el-icon>
      </div>
      <div class="action-card" @click="$router.push('/transactions')">
        <div class="action-icon history">
          <el-icon :size="28"><List /></el-icon>
        </div>
        <div class="action-text">
          <span class="action-title">积分明细</span>
          <span class="action-desc">查看记录</span>
        </div>
        <el-icon class="action-arrow"><ArrowRight /></el-icon>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><TrendCharts /></el-icon>
          本月统计
        </h3>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon earn">
            <el-icon :size="22"><Plus /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">+{{ statistics?.thisMonthEarned || 0 }}</div>
            <div class="stat-label">本月获得</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon spend">
            <el-icon :size="22"><Minus /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">-{{ statistics?.totalSpent || 0 }}</div>
            <div class="stat-label">本月消费</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><StarFilled /></el-icon>
          热门兑换
        </h3>
        <el-button type="primary" link @click="$router.push('/mall')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="products-grid" v-loading="loading">
        <div 
          v-for="product in hotProducts" 
          :key="product.id" 
          class="product-card"
          @click="handleExchange(product)"
        >
          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
            <el-tag type="danger" size="small" class="hot-tag">热门</el-tag>
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-desc">{{ product.description }}</div>
            <div class="product-price">
              <span class="points-price">{{ product.pointsPrice }} 积分</span>
              <span class="original-price" v-if="product.originalPrice">
                原价 ¥{{ product.originalPrice }}
              </span>
            </div>
          </div>
        </div>
        <el-empty v-if="!loading && hotProducts.length === 0" description="暂无热门商品" />
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><Timer /></el-icon>
          最近明细
        </h3>
        <el-button type="primary" link @click="$router.push('/transactions')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="transactions-list" v-loading="loading">
        <div 
          v-for="transaction in recentTransactions" 
          :key="transaction.id" 
          class="transaction-item"
        >
          <div class="transaction-icon" :class="transaction.type">
            <el-icon :size="24">{{ getTransactionIcon(transaction.type) }}</el-icon>
          </div>
          <div class="transaction-info">
            <div class="transaction-desc">{{ transaction.description }}</div>
            <div class="transaction-time">{{ transaction.formattedCreatedAt }}</div>
          </div>
          <div class="transaction-amount" :class="transaction.type">
            <span v-if="transaction.type === 'earn'">+{{ transaction.points }}</span>
            <span v-else>{{ transaction.points }}</span>
          </div>
        </div>
        <el-empty v-if="!loading && recentTransactions.length === 0" description="暂无积分记录" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Medal, Goods, Calendar, List, ArrowRight, 
  TrendCharts, Plus, Minus, StarFilled, Timer,
  Wallet, ShoppingCart, UserFilled
} from '@element-plus/icons-vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3007/api';
const USER_ID = 'user_001';

const loading = ref(false);
const balance = ref(null);
const statistics = ref({});
const hotProducts = ref([]);
const recentTransactions = ref([]);
const signedIn = ref(false);

const getLevelPercentage = () => {
  if (!balance.value?.nextLevelPoints) return 100;
  const current = balance.value.totalPoints;
  const next = balance.value.nextLevelPoints;
  if (next === 0) return 100;
  return Math.min(100, Math.round((current / next) * 100));
};

const getTransactionIcon = (type) => {
  return type === 'earn' ? 'Wallet' : 'ShoppingCart';
};

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

const loadTransactions = async () => {
  try {
    const response = await axios.get(`${API_BASE}/transactions/${USER_ID}`, {
      params: { limit: 5 }
    });
    if (response.data.success) {
      recentTransactions.value = response.data.data.map(t => ({
        ...t,
        formattedCreatedAt: t.formattedCreatedAt || new Date(t.createdAt).toLocaleString('zh-CN')
      }));
      statistics.value = response.data.statistics || {};
    }
  } catch (error) {
    console.error('加载积分明细失败:', error);
  }
};

const loadProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE}/products`, {
      params: { limit: 4 }
    });
    if (response.data.success) {
      hotProducts.value = response.data.data;
    }
  } catch (error) {
    console.error('加载积分商品失败:', error);
  }
};

const handleSignIn = async () => {
  if (signedIn.value) {
    ElMessage.warning('今日已签到');
    return;
  }

  try {
    const response = await axios.post(`${API_BASE}/balances/${USER_ID}/earn`, {
      points: 10,
      type: 'sign_in',
      description: '每日签到'
    });

    if (response.data.success) {
      signedIn.value = true;
      ElMessage.success('签到成功！获得 10 积分');
      loadBalance();
      loadTransactions();
    }
  } catch (error) {
    ElMessage.error('签到失败，请稍后重试');
    console.error(error);
  }
};

const handleExchange = async (product) => {
  if (balance.value?.availablePoints < product.pointsPrice) {
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

    const response = await axios.post(`${API_BASE}/products/${product.id}/exchange`, {
      userId: USER_ID
    });

    if (response.data.success) {
      ElMessage.success('兑换成功！');
      loadBalance();
      loadTransactions();
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
  }
};

onMounted(() => {
  loading.value = true;
  Promise.all([
    loadBalance(),
    loadTransactions(),
    loadProducts()
  ]).finally(() => {
    loading.value = false;
  });
});
</script>

<style scoped>
.points-home {
  padding-bottom: 40px;
}

.balance-section {
  margin-bottom: 24px;
}

.balance-card {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(250, 112, 154, 0.3);
  color: white;
}

.balance-left {
  display: flex;
  flex-direction: column;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.balance-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.currency {
  font-size: 16px;
  margin-right: 4px;
}

.amount {
  font-size: 42px;
  font-weight: 700;
  line-height: 1;
}

.balance-info {
  display: flex;
  gap: 8px;
  font-size: 12px;
  opacity: 0.85;
}

.balance-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  margin-bottom: 16px;
}

.level-badge span {
  font-size: 14px;
  font-weight: 600;
}

.level-progress {
  width: 180px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.action-icon.exchange {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-icon.signin {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.action-icon.history {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.action-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.action-desc {
  font-size: 12px;
  color: #999;
}

.action-desc.success {
  color: #11998e;
}

.action-arrow {
  color: #ccc;
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.section-title .el-icon {
  color: #fa709a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.earn {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.spend {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
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
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.product-desc {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-price {
  font-size: 16px;
  font-weight: 700;
  color: #fa709a;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.transaction-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.transaction-icon.earn {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.transaction-icon.spend {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
}

.transaction-info {
  flex: 1;
}

.transaction-desc {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.transaction-time {
  font-size: 12px;
  color: #999;
}

.transaction-amount {
  font-size: 16px;
  font-weight: 700;
}

.transaction-amount.earn {
  color: #11998e;
}

.transaction-amount.spend {
  color: #ff6b6b;
}

@media (max-width: 768px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .balance-card {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .balance-right {
    align-items: center;
  }
}
</style>
