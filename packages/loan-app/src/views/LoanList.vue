<template>
  <div class="loan-container">
    <div class="page-header">
      <div class="header-left">
        <h1>贷款管理</h1>
        <p class="subtitle">查看和管理所有贷款信息</p>
      </div>
      <div class="header-actions">
        <router-link to="/loan/create" class="btn btn-primary">
          + 申请贷款
        </router-link>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
          <span class="stat-emoji">📊</span>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ totalLoans }}</span>
          <span class="stat-label">贷款笔数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #11998e, #38ef7d)">
          <span class="stat-emoji">💰</span>
        </div>
        <div class="stat-info">
          <span class="stat-value">¥{{ totalAmount.toLocaleString() }}</span>
          <span class="stat-label">总贷款金额</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
          <span class="stat-emoji">⏳</span>
        </div>
        <div class="stat-info">
          <span class="stat-value" style="color: #f5576c">{{ pendingCount }}</span>
          <span class="stat-label">待审批</span>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-group">
        <label>客户ID</label>
        <input v-model="filters.customerId" type="text" class="form-input" placeholder="输入客户ID" @keyup.enter="fetchLoans" />
      </div>
      <div class="filter-group">
        <label>贷款类型</label>
        <select v-model="filters.loanType" class="form-input" @change="fetchLoans">
          <option value="">全部</option>
          <option value="personal">个人消费贷</option>
          <option value="mortgage">房屋抵押贷款</option>
          <option value="business">企业经营贷</option>
          <option value="auto">汽车贷款</option>
        </select>
      </div>
      <div class="filter-group">
        <label>状态</label>
        <select v-model="filters.status" class="form-input" @change="fetchLoans">
          <option value="">全部</option>
          <option value="active">正常</option>
          <option value="overdue">逾期</option>
          <option value="closed">已结清</option>
        </select>
      </div>
      <div class="filter-group">
        <label>审批状态</label>
        <select v-model="filters.approvalStatus" class="form-input" @change="fetchLoans">
          <option value="">全部</option>
          <option value="pending">待审批</option>
          <option value="approved">已批准</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>
      <div class="filter-group">
        <button @click="fetchLoans" class="btn btn-primary">查询</button>
      </div>
    </div>

    <div class="content-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="loans.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无贷款记录</p>
      </div>
      
      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>贷款编号</th>
              <th>贷款类型</th>
              <th>贷款金额</th>
              <th>年利率</th>
              <th>期限</th>
              <th>状态</th>
              <th>审批状态</th>
              <th>申请日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loan in loans" :key="loan.id" @click="goToDetail(loan.id)" class="clickable-row">
              <td class="text-primary font-medium">{{ loan.id }}</td>
              <td>{{ loan.loanTypeName }}</td>
              <td class="text-bold">¥{{ loan.loanAmount.toLocaleString() }}</td>
              <td class="text-danger">{{ (loan.interestRate * 100).toFixed(2) }}%</td>
              <td>{{ loan.term }}个月</td>
              <td>
                <span :class="'badge badge-' + loan.status">
                  {{ getStatusLabel(loan.status) }}
                </span>
              </td>
              <td>
                <span :class="'badge badge-' + loan.approvalStatus">
                  {{ getApprovalLabel(loan.approvalStatus) }}
                </span>
              </td>
              <td>{{ formatDate(loan.applyDate) }}</td>
              <td>
                <button @click.stop="goToDetail(loan.id)" class="btn btn-text">详情</button>
              </td>
            </tr>
          </tbody>
        </table>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getLoans } from '../api/loan'

const router = useRouter()
const loading = ref(false)
const loans = ref([])
const filters = ref({
  customerId: '',
  loanType: '',
  status: '',
  approvalStatus: ''
})
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

const totalLoans = computed(() => loans.value.length)
const totalAmount = computed(() => loans.value.reduce((sum, l) => sum + l.loanAmount, 0))
const pendingCount = computed(() => loans.value.filter(l => l.approvalStatus === 'pending').length)

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

const fetchLoans = async () => {
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
    const res = await getLoans(params)
    if (res.data?.success) {
      loans.value = res.data.data.loans
      pagination.value = res.data.data.pagination
    }
  } catch (err) {
    console.error('Fetch loans error:', err)
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/loan/${id}`)
}

const changePage = (page) => {
  pagination.value.page = page
  fetchLoans()
}

onMounted(() => {
  fetchLoans()
})
</script>

<style scoped>
.loan-container {
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
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: flex-end;
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

.form-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  min-width: 140px;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
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

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #fafafa;
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #e8e8e8;
}

.data-table td {
  padding: 14px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.clickable-row {
  cursor: pointer;
  transition: background 0.2s;
}

.clickable-row:hover {
  background: #fafafa;
}

.text-primary {
  color: #3b82f6;
}

.text-danger {
  color: #e74c3c;
}

.text-bold {
  font-weight: 600;
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

.btn-primary:hover {
  opacity: 0.9;
}

.btn-text {
  background: transparent;
  color: #3b82f6;
  padding: 0;
}

.btn-text:hover {
  color: #2563eb;
}
</style>
