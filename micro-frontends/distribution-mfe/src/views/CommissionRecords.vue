<template>
  <div class="commission-records">
    <div class="summary-section">
      <div class="summary-item">
        <div class="summary-icon total">
          <el-icon :size="24"><Wallet /></el-icon>
        </div>
        <div class="summary-info">
          <div class="summary-value">¥{{ statistics?.totalCommission || 0 }}</div>
          <div class="summary-label">累计佣金</div>
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-icon settled">
          <el-icon :size="24"><Check /></el-icon>
        </div>
        <div class="summary-info">
          <div class="summary-value">¥{{ statistics?.settledCommission || 0 }}</div>
          <div class="summary-label">已结算</div>
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-icon pending">
          <el-icon :size="24"><Clock /></el-icon>
        </div>
        <div class="summary-info">
          <div class="summary-value">¥{{ statistics?.pendingCommission || 0 }}</div>
          <div class="summary-label">待结算</div>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-left">
        <span class="filter-label">状态:</span>
        <el-select v-model="filterStatus" placeholder="全部" clearable @change="loadCommissions">
          <el-option label="全部" value="" />
          <el-option label="待结算" value="pending" />
          <el-option label="已结算" value="settled" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </div>
    </div>

    <div class="commissions-list" v-loading="loading">
      <div 
        v-for="commission in commissions" 
        :key="commission.id" 
        class="commission-item"
      >
        <div class="commission-icon" :class="commission.status">
          <el-icon :size="24">{{ getCommissionIcon(commission.status) }}</el-icon>
        </div>
        <div class="commission-info">
          <div class="commission-header">
            <span class="commission-desc">{{ commission.description }}</span>
            <span class="commission-level">
              <el-tag :type="commission.level === 1 ? 'primary' : 'success'" size="small">
                {{ commission.level === 1 ? '一级分销' : '二级分销' }}
              </el-tag>
            </span>
          </div>
          <div class="commission-detail">
            <span class="detail-item">
              <el-icon><ShoppingCart /></el-icon>
              订单金额: ¥{{ commission.orderAmount }}
            </span>
            <span class="detail-item">
              <el-icon><TrendCharts /></el-icon>
              佣金比例: {{ (commission.commissionRate * 100).toFixed(0) }}%
            </span>
          </div>
          <div class="commission-time">
            <el-icon><Timer /></el-icon>
            {{ commission.formattedCreatedAt }}
            <span v-if="commission.status === 'pending'" class="settle-time">
              (预计 {{ commission.formattedSettleAt || '结算中' }})
            </span>
            <span v-else-if="commission.status === 'settled'" class="settle-time">
              (结算于 {{ commission.formattedSettledAt }})
            </span>
          </div>
        </div>
        <div class="commission-amount" :class="commission.status">
          +¥{{ commission.commissionAmount }}
          <div class="commission-status">
            <el-tag :type="getCommissionTagType(commission.status)" size="small">
              {{ getCommissionStatusName(commission.status) }}
            </el-tag>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && commissions.length === 0" description="暂无佣金记录" />
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
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Wallet, Check, Clock, ShoppingCart, TrendCharts, Timer } from '@element-plus/icons-vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3008/api';
const DISTRIBUTOR_ID = 'distributor_001';

const loading = ref(false);
const filterStatus = ref('');
const commissions = ref([]);
const statistics = ref({});
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const getCommissionIcon = (status) => {
  const icons = {
    pending: 'Clock',
    settled: 'Check',
    cancelled: 'Close'
  };
  return icons[status] || 'Wallet';
};

const getCommissionStatusName = (status) => {
  const names = {
    pending: '待结算',
    settled: '已结算',
    cancelled: '已取消'
  };
  return names[status] || status;
};

const getCommissionTagType = (status) => {
  const types = {
    pending: 'warning',
    settled: 'success',
    cancelled: 'danger'
  };
  return types[status] || 'info';
};

const loadCommissions = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    };

    if (filterStatus.value) {
      params.status = filterStatus.value;
    }

    const response = await axios.get(`${API_BASE}/commissions/${DISTRIBUTOR_ID}`, { params });
    if (response.data.success) {
      commissions.value = response.data.data.map(c => ({
        ...c,
        formattedCreatedAt: c.formattedCreatedAt || new Date(c.createdAt).toLocaleString('zh-CN'),
        formattedSettledAt: c.formattedSettledAt || (c.settledAt ? new Date(c.settledAt).toLocaleString('zh-CN') : null),
        formattedSettleAt: c.formattedSettleAt || (c.settleAt ? new Date(c.settleAt).toLocaleString('zh-CN') : null)
      }));
      statistics.value = response.data.statistics || {};
      total.value = response.data.pagination?.total || commissions.value.length;
    }
  } catch (error) {
    console.error('加载佣金明细失败:', error);
    ElMessage.error('加载佣金明细失败');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = () => {
  currentPage.value = 1;
  loadCommissions();
};

const handleCurrentChange = () => {
  loadCommissions();
};

onMounted(() => {
  loadCommissions();
});
</script>

<style scoped>
.commission-records {
  padding-bottom: 40px;
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

.summary-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.summary-icon.settled {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.summary-icon.pending {
  background: linear-gradient(135deg, #ffd93d 0%, #ff9a3d 100%);
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

.commissions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.commission-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.commission-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.commission-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.commission-icon.settled {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.commission-icon.pending {
  background: linear-gradient(135deg, #ffd93d 0%, #ff9a3d 100%);
  color: white;
}

.commission-icon.cancelled {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: white;
}

.commission-info {
  flex: 1;
  min-width: 0;
}

.commission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.commission-desc {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.commission-detail {
  display: flex;
  gap: 20px;
  margin-bottom: 6px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

.commission-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.settle-time {
  color: #667eea;
}

.commission-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  margin-left: 16px;
  flex-shrink: 0;
  font-size: 18px;
  font-weight: 700;
}

.commission-amount.settled {
  color: #11998e;
}

.commission-amount.pending {
  color: #ff9a3d;
}

.commission-amount.cancelled {
  color: #999;
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
  
  .commission-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .commission-amount {
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
