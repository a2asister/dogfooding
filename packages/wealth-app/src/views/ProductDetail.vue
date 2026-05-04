<template>
  <div class="detail-container">
    <div class="page-header">
      <button @click="goBack" class="btn btn-text">
        ← 返回列表
      </button>
      <div v-if="product">
        <h1>{{ product.name }}</h1>
        <p class="subtitle">{{ product.code }} | {{ getTypeLabel(product.type) }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <template v-else-if="product">
      <div class="summary-card">
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">预期年化收益率</span>
            <span class="summary-value highlight">{{ (product.expectedReturn * 100).toFixed(2) }}%</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">投资期限</span>
            <span class="summary-value">{{ product.term }}天</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">起投金额</span>
            <span class="summary-value">¥{{ product.minimumInvestment.toLocaleString() }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">风险等级</span>
            <span :class="'risk-badge risk-' + product.riskLevel">
              {{ getRiskLabel(product.riskLevel) }}
            </span>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="main-content">
          <div class="content-card">
            <h3>产品信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">产品代码</span>
                <span class="info-value">{{ product.code }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">产品类型</span>
                <span class="info-value">{{ getTypeLabel(product.type) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">发行日期</span>
                <span class="info-value">{{ formatDate(product.issueDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">到期日期</span>
                <span class="info-value">{{ formatDate(product.maturityDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">产品规模</span>
                <span class="info-value">¥{{ (product.scale / 10000).toFixed(0) }}万</span>
              </div>
              <div class="info-item">
                <span class="info-label">计息方式</span>
                <span class="info-value">{{ product.interestType }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">赎回规则</span>
                <span class="info-value">{{ product.redemptionRule }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">产品状态</span>
                <span class="info-value">{{ getStatusLabel(product.status) }}</span>
              </div>
            </div>
          </div>

          <div class="content-card">
            <h3>产品特点</h3>
            <div class="features-list">
              <div v-for="(feature, index) in product.features" :key="index" class="feature-item">
                <span class="feature-icon">✓</span>
                <span>{{ feature }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar">
          <div class="invest-card">
            <h3>立即投资</h3>
            <form @submit.prevent="handleInvest">
              <div class="form-group">
                <label>客户ID</label>
                <input v-model="investForm.customerId" type="text" class="form-input" placeholder="请输入客户ID" required />
              </div>
              <div class="form-group">
                <label>投资金额</label>
                <div class="input-group">
                  <span class="input-prefix">¥</span>
                  <input 
                    v-model.number="investForm.investAmount" 
                    type="number" 
                    class="form-input" 
                    :placeholder="'最低 ' + product.minimumInvestment.toLocaleString()"
                    :min="product.minimumInvestment"
                    required 
                  />
                </div>
              </div>
              <div class="invest-info">
                <div class="invest-row">
                  <span>预期收益</span>
                  <span class="highlight">¥{{ expectedReturn.toFixed(2) }}</span>
                </div>
                <div class="invest-row">
                  <span>投资期限</span>
                  <span>{{ product.term }}天</span>
                </div>
                <div class="invest-row">
                  <span>到期日期</span>
                  <span>{{ formatDate(maturityDate) }}</span>
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-block" :disabled="investing">
                {{ investing ? '投资中...' : '确认投资' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductById, createInvestment } from '../api/wealth'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const investing = ref(false)
const product = ref(null)
const investForm = ref({
  customerId: '',
  investAmount: null
})

const expectedReturn = computed(() => {
  if (!product.value || !investForm.value.investAmount) return 0
  return investForm.value.investAmount * product.value.expectedReturn * (product.value.term / 365)
})

const maturityDate = computed(() => {
  if (!product.value) return ''
  return new Date(Date.now() + product.value.term * 24 * 60 * 60 * 1000).toISOString()
})

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

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const goBack = () => {
  router.push('/wealth/')
}

const fetchProduct = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const res = await getProductById(id)
    if (res.data?.success) {
      product.value = res.data.data
      investForm.value.investAmount = product.value.minimumInvestment
    }
  } catch (err) {
    console.error('Fetch product error:', err)
  } finally {
    loading.value = false
  }
}

const handleInvest = async () => {
  if (!investForm.value.customerId || !investForm.value.investAmount) {
    alert('请填写完整信息')
    return
  }
  if (investForm.value.investAmount < product.value.minimumInvestment) {
    alert(`投资金额不能低于 ${product.value.minimumInvestment}`)
    return
  }
  
  investing.value = true
  try {
    const res = await createInvestment({
      customerId: investForm.value.customerId,
      productId: product.value.id,
      investAmount: investForm.value.investAmount
    })
    if (res.data?.success) {
      alert('投资成功！')
      router.push('/wealth/investments')
    }
  } catch (err) {
    console.error('Invest error:', err)
    alert('投资失败，请重试')
  } finally {
    investing.value = false
  }
}

onMounted(() => {
  fetchProduct()
})
</script>

<style scoped>
.detail-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 12px 0 4px 0;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.loading-state {
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

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #fff;
}

.summary-label {
  font-size: 13px;
  opacity: 0.8;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
}

.summary-value.highlight {
  font-size: 32px;
  color: #ffd700;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.content-card:last-child {
  margin-bottom: 0;
}

.content-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 16px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #999;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.feature-icon {
  width: 20px;
  height: 20px;
  background: #52c41a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.risk-badge {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
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

.invest-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 24px;
}

.invest-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-group {
  display: flex;
  align-items: center;
  position: relative;
}

.input-prefix {
  position: absolute;
  left: 12px;
  color: #999;
}

.input-group .form-input {
  padding-left: 30px;
}

.invest-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.invest-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

.invest-row:not(:last-child) {
  border-bottom: 1px solid #e8e8e8;
}

.invest-row .highlight {
  color: #e74c3c;
  font-weight: 600;
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

.btn-text {
  background: transparent;
  color: #3b82f6;
  padding: 0;
}

.btn-text:hover {
  color: #2563eb;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
  justify-content: center;
  padding: 12px 16px;
  font-size: 15px;
}
</style>
