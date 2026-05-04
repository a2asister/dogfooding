<template>
  <div class="wealth-container">
    <div class="page-header">
      <div class="header-left">
        <h1>理财产品</h1>
        <p class="subtitle">查看和管理各类理财产品</p>
      </div>
      <div class="header-actions">
        <router-link to="/wealth/investments" class="btn btn-secondary">
          我的投资
        </router-link>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
          <span class="stat-emoji">📊</span>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ productsCount }}</span>
          <span class="stat-label">在售产品</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #11998e, #38ef7d)">
          <span class="stat-emoji">💰</span>
        </div>
        <div class="stat-info">
          <span class="stat-value" style="color: #11998e">{{ avgReturn }}%</span>
          <span class="stat-label">平均收益率</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
          <span class="stat-emoji">🔒</span>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ lowRiskCount }}</span>
          <span class="stat-label">低风险产品</span>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-group">
        <label>产品类型</label>
        <select v-model="filters.type" class="form-input" @change="fetchProducts">
          <option value="">全部</option>
          <option value="fixed">定期理财</option>
          <option value="fund">基金</option>
          <option value="bond">债券</option>
          <option value="structure">结构性存款</option>
        </select>
      </div>
      <div class="filter-group">
        <label>风险等级</label>
        <select v-model="filters.riskLevel" class="form-input" @change="fetchProducts">
          <option value="">全部</option>
          <option value="low">低风险</option>
          <option value="medium">中风险</option>
          <option value="high">高风险</option>
        </select>
      </div>
      <div class="filter-group">
        <label>状态</label>
        <select v-model="filters.status" class="form-input" @change="fetchProducts">
          <option value="">全部</option>
          <option value="active">在售</option>
          <option value="soldout">已售罄</option>
        </select>
      </div>
    </div>

    <div class="content-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="products.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无理财产品</p>
      </div>
      
      <div v-else class="product-grid">
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="product-card"
          @click="goToDetail(product.id)"
        >
          <div class="product-header">
            <span :class="'risk-badge risk-' + product.riskLevel">
              {{ getRiskLabel(product.riskLevel) }}
            </span>
            <span class="product-type">{{ getTypeLabel(product.type) }}</span>
          </div>
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-code">{{ product.code }}</p>
          
          <div class="product-metrics">
            <div class="metric-item">
              <span class="metric-value" style="color: #e74c3c">{{ (product.expectedReturn * 100).toFixed(2) }}%</span>
              <span class="metric-label">预期年化</span>
            </div>
            <div class="metric-item">
              <span class="metric-value">{{ product.term }}天</span>
              <span class="metric-label">投资期限</span>
            </div>
            <div class="metric-item">
              <span class="metric-value">¥{{ product.minimumInvestment.toLocaleString() }}</span>
              <span class="metric-label">起投金额</span>
            </div>
          </div>

          <div class="product-footer">
            <span class="status-dot" :class="product.status"></span>
            <span class="status-text">{{ getStatusLabel(product.status) }}</span>
            <span class="product-scale">规模: ¥{{ (product.scale / 10000).toFixed(0) }}万</span>
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
import { useRouter } from 'vue-router'
import { getProducts } from '../api/wealth'

const router = useRouter()
const loading = ref(false)
const products = ref([])
const filters = ref({
  type: '',
  riskLevel: '',
  status: ''
})
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

const productsCount = computed(() => products.value.length)
const avgReturn = computed(() => {
  if (products.value.length === 0) return '0.00'
  const sum = products.value.reduce((acc, p) => acc + p.expectedReturn, 0)
  return ((sum / products.value.length) * 100).toFixed(2)
})
const lowRiskCount = computed(() => products.value.filter(p => p.riskLevel === 'low').length)

const getRiskLabel = (level) => {
  const labels = { low: '低风险', medium: '中风险', high: '高风险' }
  return labels[level] || level
}

const getTypeLabel = (type) => {
  const labels = { fixed: '定期理财', fund: '基金', bond: '债券', structure: '结构性存款' }
  return labels[type] || type
}

const getStatusLabel = (status) => {
  const labels = { active: '在售', soldout: '已售罄', closed: '已结束' }
  return labels[status] || status
}

const fetchProducts = async () => {
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
    const res = await getProducts(params)
    if (res.data?.success) {
      products.value = res.data.data.products
      pagination.value = res.data.data.pagination
    }
  } catch (err) {
    console.error('Fetch products error:', err)
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/wealth/products/${id}`)
}

const changePage = (page) => {
  pagination.value.page = page
  fetchProducts()
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.wealth-container {
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
  font-size: 24px;
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
  flex-wrap: wrap;
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.product-card {
  background: linear-gradient(135deg, #fafbfc 0%, #fff 100%);
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.risk-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.risk-low {
  background: #d4edda;
  color: #155724;
}

.risk-medium {
  background: #fff3cd;
  color: #856404;
}

.risk-high {
  background: #f8d7da;
  color: #721c24;
}

.product-type {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 10px;
  border-radius: 4px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.product-code {
  font-size: 12px;
  color: #999;
  margin: 0 0 16px 0;
}

.product-metrics {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.metric-item {
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
}

.metric-label {
  font-size: 12px;
  color: #999;
}

.product-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.active {
  background: #52c41a;
}

.status-dot.soldout {
  background: #faad14;
}

.status-dot.closed {
  background: #999;
}

.status-text {
  font-size: 13px;
  color: #666;
}

.product-scale {
  margin-left: auto;
  font-size: 12px;
  color: #999;
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

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e8e8e8;
}
</style>
