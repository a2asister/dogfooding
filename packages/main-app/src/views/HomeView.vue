<template>
  <div class="home-view">
    <div class="stats-grid grid grid-4">
      <div class="stat-card">
        <div class="stat-label">总客户数</div>
        <div class="stat-value">{{ stats.totalCustomers }}</div>
        <div class="stat-change">+2.5% 较上月</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">总账户数</div>
        <div class="stat-value">{{ stats.totalAccounts }}</div>
        <div class="stat-change">+1.8% 较上月</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">今日交易</div>
        <div class="stat-value">{{ stats.todayTransactions }}</div>
        <div class="stat-change">-0.5% 较昨日</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-label">待处理预警</div>
        <div class="stat-value">{{ stats.pendingAlerts }}</div>
        <div class="stat-change">需要关注</div>
      </div>
    </div>

    <div class="content-grid grid grid-2 mt-4">
      <div class="card">
        <div class="card-header">最近交易</div>
        <div class="card-body">
          <table class="table">
            <thead>
              <tr>
                <th>交易号</th>
                <th>类型</th>
                <th>金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="txn in recentTransactions" :key="txn.id">
                <td>{{ txn.id }}</td>
                <td>{{ txn.transactionTypeName }}</td>
                <td class="text-right">¥{{ txn.amount.toLocaleString() }}</td>
                <td>
                  <span :class="['badge', getStatusClass(txn.status)]">
                    {{ txn.status === 'success' ? '成功' : txn.status === 'pending' ? '处理中' : '失败' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">快速操作</div>
        <div class="card-body">
          <div class="quick-actions">
            <router-link to="/customer" class="action-item">
              <span class="action-icon">👥</span>
              <span class="action-text">客户管理</span>
            </router-link>
            <router-link to="/account" class="action-item">
              <span class="action-icon">💳</span>
              <span class="action-text">账户查询</span>
            </router-link>
            <router-link to="/transaction" class="action-item">
              <span class="action-icon">📊</span>
              <span class="action-text">交易查询</span>
            </router-link>
            <router-link to="/wealth" class="action-item">
              <span class="action-icon">💰</span>
              <span class="action-text">理财管理</span>
            </router-link>
            <router-link to="/loan" class="action-item">
              <span class="action-icon">🏦</span>
              <span class="action-text">贷款申请</span>
            </router-link>
            <router-link to="/risk" class="action-item">
              <span class="action-icon">🛡️</span>
              <span class="action-text">风控监控</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">系统概览</div>
      <div class="card-body">
        <div class="system-overview">
          <div class="overview-item">
            <span class="overview-label">微服务状态</span>
            <div class="overview-services">
              <span v-for="(status, service) in serviceStatus" :key="service" 
                    :class="['service-status', status ? 'active' : 'inactive']">
                {{ service }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref({
  totalCustomers: 12580,
  totalAccounts: 18420,
  todayTransactions: 3240,
  pendingAlerts: 3
})

const recentTransactions = ref([
  { id: 'TXN001', transactionTypeName: '转账', amount: 10000.00, status: 'success' },
  { id: 'TXN002', transactionTypeName: '存款', amount: 5000.00, status: 'success' },
  { id: 'TXN003', transactionTypeName: '取款', amount: 20000.00, status: 'success' },
  { id: 'TXN004', transactionTypeName: '转账', amount: 3000.00, status: 'pending' }
])

const serviceStatus = ref({
  '账户服务': true,
  '交易服务': true,
  '理财服务': true,
  '贷款服务': true,
  '信用卡服务': true,
  '风控服务': true,
  '报表服务': true,
  '客户服务': true
})

const getStatusClass = (status) => {
  const classes = {
    success: 'badge-success',
    pending: 'badge-warning',
    failed: 'badge-danger'
  }
  return classes[status] || 'badge-info'
}
</script>

<style scoped>
.home-view {
  min-height: 100%;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background-color: var(--bg-color);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary);
  transition: all var(--transition);
}

.action-item:hover {
  background-color: var(--primary-color);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.action-text {
  font-size: 14px;
  font-weight: 500;
}

.system-overview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overview-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.overview-label {
  font-weight: 500;
  color: var(--text-primary);
  min-width: 100px;
  padding-top: 8px;
}

.overview-services {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.service-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.service-status::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.service-status.active {
  background-color: #f6ffed;
  color: #52c41a;
}

.service-status.active::before {
  background-color: #52c41a;
}

.service-status.inactive {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.service-status.inactive::before {
  background-color: #ff4d4f;
}
</style>
