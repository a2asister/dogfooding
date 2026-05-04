<template>
  <div class="investment-container">
    <div class="page-header">
      <div class="header-left">
        <h1>我的投资</h1>
        <p class="subtitle">查看和管理已投资的理财产品</p>
      </div>
      <div class="header-actions">
        <router-link to="/wealth/" class="btn btn-secondary">
          理财产品列表
        </router-link>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
          <span class="stat-emoji">📊</span>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ totalInvestments }}</span>
          <span class="stat-label">投资笔数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #11998e, #38ef7d)">
          <span class="stat-emoji">💰</span>
        </div>
        <div class="stat-info">
          <span class="stat-value" style="color: #11998e">¥{{ totalInvestAmount.toLocaleString() }}</span>
          <span class="stat-label">总投资金额</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
          <span class="stat-emoji">📈</span>
        </div>
        <div class="stat-info">
          <span class="stat-value" style="color: #f5576c">¥{{ totalCurrentValue.toLocaleString() }}</span>
          <span class="stat-label">当前市值</span>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-group">
        <label>投资状态</label>
        <select v-model="filters.status" class="form-input" @change="fetchInvestments">
          <option value="">全部</option>
          <option value="active">持有中</option>
          <option value="matured">已到期</option>
          <option value="redeemed">已赎回</option>
        </select>
      </div>
    </div>

    <div class="content-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="investments.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无投资记录</p>
        <router-link to="/wealth/" class="btn btn-primary" style="margin-top: 16px">
          去投资
        </router-link>
      </div>
      
      <div v-else class="investment-list">
        <div 
          v-for="investment in investments" 
          :key="investment.id" 
          class="investment-item"
        >
          <div class="investment-main">
            <div class="investment-header">
              <h3 class="investment-name">{{ investment.productName }}</h3>
              <span :class="'status-badge status-' + investment.status">
                {{ getStatusLabel(investment.status) }}
              </span>
            </div>
            <p class="investment-code">{{ investment.id }}</p>
            
            <div class="investment-metrics">
              <div class="metric-item">
                <span class="metric-label">投资金额</span>
                <span class="metric-value">¥{{ investment.investAmount.toLocaleString() }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">当前市值</span>
                <span class="metric-value highlight">¥{{ investment.currentValue.toLocaleString() }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">预期收益率</span>
                <span class="metric-value">{{ (investment.expectedReturn * 100).toFixed(2) }}%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">盈亏</span>
                <span 
                  class="metric-value" 
                  :class="{ positive: profit(investment) > 0, negative: profit(investment) < 0 }"
                >
                  {{ profit(investment) >= 0 ? '+' : '' }}¥{{ profit(investment).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="investment-footer">
            <div class="date-info">
              <span>投资日期: {{ formatDate(investment.investDate) }}</span>
              <span>到期日期: {{ formatDate(investment.maturityDate) }}</span>
            </div>
            <div class="actions">
              <button 
                v-if="investment.status === 'active'"
                @click="handleRedeem(investment)"
                class="btn btn-outline"
              >
                赎回
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pagination.totalPages > 1" class="pagination">
        <button 
          @click="changePage(pagination.page - 1)" 
          :disabled="pagination.page <= 1"
          class="page-btn"
        >
          上一页
        </button>
        <span class="page-info">第 {{ pagination.page }} 页 / 共 {{ pagination.totalPages }} 页</span>
        <button 
          @click="changePage(pagination.page + 1)" 
          :disabled="pagination.page >= pagination.totalPages"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getInvestments } from '../api/wealth'

const loading = ref(false)
const investments = ref([])
const filters = ref({
  status: ''
})
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

const totalInvestments = computed(() => investments.value.length)
const totalInvestAmount = computed(() => investments.value.reduce((sum, i) => sum + i.investAmount, 0))
const totalCurrentValue = computed(() => investments.value.reduce((sum, i) => sum + i.currentValue, 0))

const getStatusLabel = (status) => {
  const labels = { active: '持有中', matured: '已到期', redeemed: '已赎回' }
  return labels[status] || status
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const profit = (investment) => {
  return investment.currentValue - investment.investAmount
}

const fetchInvestments = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...filters.value
    }
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key]
    })
    const res = await getInvestments(params)
    if (res.data?.success) {
      investments.value = res.data.data.investments
      pagination.value = res.data.data.pagination
    }
  } catch (err) {
    console.error('Fetch investments error:', err)
  } finally {
    loading.value = false
  }
}

const handleRedeem = (investment) => {
  if (confirm(`确定要赎回 ${investment.productName} 吗？`)) {
    alert('赎回功能开发中')
  }
}

const changePage = (page) => {
  pagination.value.page = page
  fetchInvestments()
}

onMounted(() => {
  fetchInvestments()
})
</script>

<style scoped>
.investment-container {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-emoji {
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.investment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.investment-item {
  background: #fafbfc;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.investment-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.investment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.investment-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-matured {
  background: #fff3cd;
  color: #856404;
}

.status-redeemed {
  background: #e2e3e5;
  color: #383d41;
}

.investment-code {
  font-size: 12px;
  color: #999;
  margin: 0 0 16px 0;
}

.investment-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: #999;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.metric-value.highlight {
  color: #11998e;
}

.metric-value.positive {
  color: #e74c3c;
}

.metric-value.negative {
  color: #3498db;
}

.investment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-info {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}

.page-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.btn-outline {
  background: #fff;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-outline:hover {
  background: #3b82f6;
  color: #fff;
}
</style>
