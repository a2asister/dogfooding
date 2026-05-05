<template>
  <div class="points-transactions">
    <div class="filter-section">
      <div class="filter-left">
        <span class="filter-label">类型:</span>
        <el-radio-group v-model="filterType" size="large" @change="loadTransactions">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="earn">收入</el-radio-button>
          <el-radio-button value="spend">支出</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="summary-section">
      <div class="summary-item">
        <div class="summary-icon earn">
          <el-icon :size="24"><Plus /></el-icon>
        </div>
        <div class="summary-info">
          <div class="summary-value">+{{ statistics?.totalEarned || 0 }}</div>
          <div class="summary-label">累计收入</div>
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-icon spend">
          <el-icon :size="24"><Minus /></el-icon>
        </div>
        <div class="summary-info">
          <div class="summary-value">-{{ statistics?.totalSpent || 0 }}</div>
          <div class="summary-label">累计支出</div>
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-icon this-month">
          <el-icon :size="24"><Calendar /></el-icon>
        </div>
        <div class="summary-info">
          <div class="summary-value">+{{ statistics?.thisMonthEarned || 0 }}</div>
          <div class="summary-label">本月收入</div>
        </div>
      </div>
    </div>

    <div class="transactions-list" v-loading="loading">
      <div 
        v-for="transaction in transactions" 
        :key="transaction.id" 
        class="transaction-item"
      >
        <div class="transaction-icon" :class="transaction.type">
          <el-icon :size="24">{{ getTransactionIcon(transaction.type) }}</el-icon>
        </div>
        <div class="transaction-info">
          <div class="transaction-desc">{{ transaction.description }}</div>
          <div class="transaction-detail">
            <span class="detail-item">
              <el-icon><Wallet /></el-icon>
              变动前: {{ transaction.beforeBalance }}
            </span>
            <span class="detail-item">
              <el-icon><Wallet /></el-icon>
              变动后: {{ transaction.afterBalance }}
            </span>
            <span class="detail-item" v-if="transaction.relatedOrderId">
              <el-icon><Document /></el-icon>
              订单: {{ transaction.relatedOrderId }}
            </span>
          </div>
          <div class="transaction-time">
            <el-icon><Timer /></el-icon>
            {{ transaction.formattedCreatedAt }}
          </div>
        </div>
        <div class="transaction-amount" :class="transaction.type">
          <span v-if="transaction.type === 'earn'">+{{ transaction.points }}</span>
          <span v-else>{{ transaction.points }}</span>
          <div class="transaction-type-badge">
            <el-tag :type="transaction.type === 'earn' ? 'success' : 'danger'" size="small">
              {{ getTransactionTypeName(transaction.subtype) }}
            </el-tag>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && transactions.length === 0" description="暂无积分记录" />
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Minus, Calendar, Wallet, Document, Timer } from '@element-plus/icons-vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3007/api';
const USER_ID = 'user_001';

const loading = ref(false);
const filterType = ref('');
const transactions = ref([]);
const statistics = ref({});
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const getTransactionIcon = (type) => {
  const icons = {
    earn: 'Wallet',
    spend: 'ShoppingCart'
  };
  return icons[type] || 'Wallet';
};

const getTransactionTypeName = (subtype) => {
  const names = {
    consumption: '消费获得',
    sign_in: '签到',
    exchange: '兑换',
    refund: '退款',
    bonus: '奖励',
    penalty: '惩罚',
    earn: '收入',
    spend: '支出'
  };
  return names[subtype] || names[subtype] || '其他';
};

const loadTransactions = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    };

    if (filterType.value) {
      params.type = filterType.value;
    }

    const response = await axios.get(`${API_BASE}/transactions/${USER_ID}`, { params });
    if (response.data.success) {
      transactions.value = response.data.data.map(t => ({
        ...t,
        formattedCreatedAt: t.formattedCreatedAt || new Date(t.createdAt).toLocaleString('zh-CN')
      }));
      statistics.value = response.data.statistics || {};
      total.value = response.data.pagination?.total || transactions.value.length;
    }
  } catch (error) {
    console.error('加载积分明细失败:', error);
    ElMessage.error('加载积分明细失败');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = () => {
  currentPage.value = 1;
  loadTransactions();
};

const handleCurrentChange = () => {
  loadTransactions();
};

onMounted(() => {
  loadTransactions();
});
</script>

<style scoped>
.points-transactions {
  padding-bottom: 40px;
}

.filter-section {
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

.summary-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.summary-icon.earn {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.summary-icon.spend {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.summary-icon.this-month {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 13px;
  color: #6c757d;
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.transaction-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.transaction-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
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
  min-width: 0;
}

.transaction-desc {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.transaction-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 6px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

.transaction-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.transaction-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  margin-left: 16px;
  flex-shrink: 0;
}

.transaction-amount.earn {
  color: #11998e;
}

.transaction-amount.spend {
  color: #ff6b6b;
}

.transaction-amount > span {
  font-size: 18px;
  font-weight: 700;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .summary-section {
    grid-template-columns: 1fr;
  }
  
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .transaction-amount {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-left: 0;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
