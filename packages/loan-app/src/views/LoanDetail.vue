<template>
  <div class="detail-container">
    <div class="page-header">
      <button @click="goBack" class="btn btn-text">← 返回列表</button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <template v-else-if="loan">
      <div class="summary-card">
        <div class="summary-header">
          <h2>{{ loan.loanTypeName }}</h2>
          <span :class="'badge badge-' + loan.approvalStatus">
            {{ getApprovalLabel(loan.approvalStatus) }}
          </span>
        </div>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">贷款金额</span>
            <span class="value highlight">¥{{ loan.loanAmount.toLocaleString() }}</span>
          </div>
          <div class="summary-item">
            <span class="label">年利率</span>
            <span class="value">{{ (loan.interestRate * 100).toFixed(2) }}%</span>
          </div>
          <div class="summary-item">
            <span class="label">贷款期限</span>
            <span class="value">{{ loan.term }}个月</span>
          </div>
          <div class="summary-item">
            <span class="label">月供金额</span>
            <span class="value">¥{{ loan.monthlyPayment?.toFixed(2) || '-' }}</span>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="main-content">
          <div class="content-card">
            <h3>基本信息</h3>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">贷款编号</span>
                <span class="info-value">{{ loan.id }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">客户ID</span>
                <span class="info-value">{{ loan.customerId }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">贷款类型</span>
                <span class="info-value">{{ loan.loanTypeName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">贷款状态</span>
                <span :class="'badge badge-' + loan.status">
                  {{ getStatusLabel(loan.status) }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">审批金额</span>
                <span class="info-value">¥{{ loan.approvedAmount?.toLocaleString() || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">已发放金额</span>
                <span class="info-value">¥{{ loan.disbursedAmount?.toLocaleString() || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">剩余本金</span>
                <span class="info-value text-danger">¥{{ loan.outstandingBalance?.toLocaleString() || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">贷款用途</span>
                <span class="info-value">{{ loan.purpose || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">申请日期</span>
                <span class="info-value">{{ formatDate(loan.applyDate) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">到期日期</span>
                <span class="info-value">{{ formatDate(loan.maturityDate) }}</span>
              </div>
            </div>
          </div>

          <div v-if="loan.approvalStatus === 'pending'" class="content-card">
            <h3>审批操作</h3>
            <div class="action-buttons">
              <button @click="handleApprove" class="btn btn-success">批准贷款</button>
              <button @click="handleReject" class="btn btn-danger">拒绝贷款</button>
            </div>
          </div>
        </div>

        <div class="sidebar">
          <div class="content-card">
            <h3>还款计划</h3>
            <div v-if="payments.length === 0" class="empty-state-small">
              <p>暂无还款记录</p>
            </div>
            <div v-else class="payment-list">
              <div v-for="payment in payments.slice(0, 5)" :key="payment.id" class="payment-item">
                <div class="payment-info">
                  <span class="payment-date">{{ formatDate(payment.paymentDate) }}</span>
                  <span class="payment-amount">¥{{ payment.paymentAmount.toFixed(2) }}</span>
                </div>
                <span :class="'badge badge-' + payment.status">
                  {{ payment.status === 'paid' ? '已还款' : '待还款' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLoanById, getLoanPayments, approveLoan } from '../api/loan'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const loan = ref(null)
const payments = ref([])

const getStatusLabel = (status) => {
  const labels = { active: '正常', overdue: '逾期', closed: '已结清' }
  return labels[status] || status
}

const getApprovalLabel = (status) => {
  const labels = { pending: '待审批', approved: '已批准', rejected: '已拒绝' }
  return labels[status] || status
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const goBack = () => {
  router.push('/loan/')
}

const fetchLoan = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const [loanRes, paymentsRes] = await Promise.all([
      getLoanById(id),
      getLoanPayments(id).catch(() => ({ data: { success: true, data: [] } }))
    ])
    if (loanRes.data?.success) {
      loan.value = loanRes.data.data
    }
    if (paymentsRes.data?.success) {
      payments.value = paymentsRes.data.data
    }
  } catch (err) {
    console.error('Fetch loan error:', err)
  } finally {
    loading.value = false
  }
}

const handleApprove = async () => {
  if (confirm('确定要批准这笔贷款吗？')) {
    try {
      const res = await approveLoan(loan.value.id)
      if (res.data?.success) {
        alert('贷款已批准！')
        fetchLoan()
      }
    } catch (err) {
      console.error('Approve error:', err)
      alert('操作失败')
    }
  }
}

const handleReject = () => {
  if (confirm('确定要拒绝这笔贷款吗？')) {
    alert('拒绝功能开发中')
  }
}

onMounted(() => {
  fetchLoan()
})
</script>

<style scoped>
.detail-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
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
  color: #fff;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-item .label {
  font-size: 13px;
  opacity: 0.8;
}

.summary-item .value {
  font-size: 22px;
  font-weight: 600;
}

.summary-item .value.highlight {
  font-size: 28px;
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
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  font-size: 13px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.info-value.text-danger {
  color: #e74c3c;
}

.badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.badge-active {
  background: #d4edda;
  color: #155724;
}

.badge-overdue {
  background: #f8d7da;
  color: #721c24;
}

.badge-closed {
  background: #e2e3e5;
  color: #383d41;
}

.badge-pending {
  background: #fff3cd;
  color: #856404;
}

.badge-approved {
  background: #d4edda;
  color: #155724;
}

.badge-rejected {
  background: #f8d7da;
  color: #721c24;
}

.badge-paid {
  background: #d4edda;
  color: #155724;
}

.badge-pending {
  background: #fff3cd;
  color: #856404;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
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

.btn-success {
  background: #52c41a;
  color: #fff;
}

.btn-success:hover {
  background: #45a316;
}

.btn-danger {
  background: #ff4d4f;
  color: #fff;
}

.btn-danger:hover {
  background: #d9363e;
}

.empty-state-small {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #fafafa;
  border-radius: 8px;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-date {
  font-size: 12px;
  color: #666;
}

.payment-amount {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.sidebar {
  position: sticky;
  top: 24px;
}
</style>
