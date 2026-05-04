<template>
  <div class="report-container">
    <div class="page-header">
      <div class="header-left"><h1>自定义报表</h1><p class="subtitle">根据条件生成自定义报表</p></div>
    </div>
    <div class="nav-tabs">
      <router-link to="/report/" class="tab-item">仪表盘</router-link>
      <router-link to="/report/daily" class="tab-item">日报</router-link>
      <router-link to="/report/monthly" class="tab-item">月报</router-link>
      <router-link to="/report/custom" class="tab-item active">自定义报表</router-link>
    </div>
    <div class="filter-card">
      <h3>查询条件</h3>
      <div class="filter-grid">
        <div class="filter-group"><label>开始日期</label><input v-model="filters.startDate" type="date" class="form-input" /></div>
        <div class="filter-group"><label>结束日期</label><input v-model="filters.endDate" type="date" class="form-input" /></div>
        <div class="filter-group"><label>业务类型</label>
          <select v-model="filters.businessType" class="form-input">
            <option value="">全部</option><option value="account">账户</option><option value="transaction">交易</option><option value="loan">贷款</option><option value="wealth">理财</option><option value="creditcard">信用卡</option>
          </select>
        </div>
        <div class="filter-group"><label>客户类型</label>
          <select v-model="filters.customerType" class="form-input">
            <option value="">全部</option><option value="personal">个人客户</option><option value="enterprise">企业客户</option><option value="vip">VIP客户</option>
          </select>
        </div>
      </div>
      <div class="filter-actions"><button @click="generateReport" class="btn btn-primary" :disabled="generating">{{ generating ? '生成中...' : '生成报表' }}</button></div>
    </div>
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>加载中...</p></div>
    <div v-else-if="!hasReport" class="empty-state"><span class="empty-icon">📋</span><p>设置查询条件后点击"生成报表"</p></div>
    <div v-else class="report-content">
      <div class="stats-row">
        <div class="stat-card"><div class="stat-label">交易总金额</div><div class="stat-value">¥{{ formatMoney(reportData.totalAmount) }}</div></div>
        <div class="stat-card"><div class="stat-label">交易笔数</div><div class="stat-value">{{ reportData.transactionCount }}</div></div>
        <div class="stat-card"><div class="stat-label">涉及客户数</div><div class="stat-value">{{ reportData.customerCount }}</div></div>
        <div class="stat-card"><div class="stat-label">平均交易额</div><div class="stat-value">¥{{ formatMoney(reportData.avgAmount) }}</div></div>
      </div>
      <div class="content-card">
        <h3>报表数据</h3>
        <table class="data-table">
          <thead><tr><th>日期</th><th>业务类型</th><th>客户ID</th><th>金额</th><th>状态</th></tr></thead>
          <tbody>
            <tr v-for="item in reportData.records" :key="item.id">
              <td>{{ formatDate(item.date) }}</td><td>{{ item.businessType }}</td><td>{{ item.customerId }}</td><td>¥{{ formatMoney(item.amount) }}</td><td><span :class="'badge ' + (item.status === 'success' ? 'badge-success' : 'badge-warning')">{{ getStatusLabel(item.status) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCustomReport } from '../api/report'

const loading = ref(false)
const generating = ref(false)
const hasReport = ref(false)
const now = new Date()
const filters = ref({
  startDate: new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
  endDate: now.toISOString().split('T')[0],
  businessType: '', customerType: ''
})

const reportData = ref({
  totalAmount: 28956000, transactionCount: 12856, customerCount: 3892, avgAmount: 2252,
  records: [
    { id: 'TXN001', date: '2025-01-15', businessType: '转账', customerId: 'C001', amount: 50000, status: 'success' },
    { id: 'TXN002', date: '2025-01-15', businessType: '存款', customerId: 'C002', amount: 20000, status: 'success' },
    { id: 'TXN003', date: '2025-01-14', businessType: '理财购买', customerId: 'C003', amount: 100000, status: 'success' },
    { id: 'TXN004', date: '2025-01-14', businessType: '贷款发放', customerId: 'C004', amount: 200000, status: 'success' },
    { id: 'TXN005', date: '2025-01-13', businessType: '取款', customerId: 'C005', amount: 15000, status: 'success' }
  ]
})

const formatMoney = (n) => (n / 10000).toFixed(2) + '万'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '-'
const getStatusLabel = (s) => ({ success: '成功', pending: '处理中', failed: '失败' }[s] || s)

const generateReport = async () => {
  if (!filters.value.startDate || !filters.value.endDate) { alert('请选择日期范围'); return }
  generating.value = true
  try {
    const params = { ...filters.value }
    Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
    const res = await getCustomReport(params)
    if (res.data?.success) {
      reportData.value = res.data.data
      hasReport.value = true
    }
  } catch (e) { console.error(e); hasReport.value = true }
  finally { generating.value = false }
}

onMounted(() => {})
</script>

<style scoped>
.report-container{padding:24px}
.page-header{margin-bottom:16px}
.page-header h1{font-size:24px;font-weight:600;color:#1a1a2e;margin:0}
.subtitle{font-size:14px;color:#666;margin-top:4px}
.nav-tabs{display:flex;gap:4px;margin-bottom:24px;border-bottom:1px solid #f0f0f0}
.tab-item{padding:12px 20px;text-decoration:none;color:#666;font-size:14px;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.2s}
.tab-item:hover{color:#3b82f6}
.tab-item.active{color:#3b82f6;border-bottom-color:#3b82f6;font-weight:600}
.filter-card{background:#fff;border-radius:12px;padding:24px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.filter-card h3{font-size:16px;font-weight:600;color:#1a1a2e;margin:0 0 20px 0}
.filter-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:20px}
.filter-group{display:flex;flex-direction:column;gap:6px}
.filter-group label{font-size:13px;font-weight:500;color:#555}
.form-input{padding:10px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px}
.form-input:focus{outline:none;border-color:#3b82f6}
.filter-actions{display:flex;justify-content:flex-end}
.loading-state,.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#999}
.spinner{width:40px;height:40px;border:3px solid #f0f0f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-icon{font-size:48px;margin-bottom:12px}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:24px}
.stat-card{background:#fff;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.stat-card .stat-label{font-size:13px;color:#666;margin-bottom:8px}
.stat-card .stat-value{font-size:22px;font-weight:700;color:#1a1a2e}
.content-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.content-card h3{font-size:16px;font-weight:600;color:#1a1a2e;margin:0 0 20px 0}
.data-table{width:100%;border-collapse:collapse}
.data-table th{background:#fafafa;padding:10px 12px;text-align:left;font-size:13px;font-weight:600;color:#555;border-bottom:1px solid #e8e8e8}
.data-table td{padding:12px;font-size:14px;color:#333;border-bottom:1px solid #f0f0f0}
.badge{padding:4px 10px;border-radius:4px;font-size:12px;font-weight:500}
.badge-success{background:#d4edda;color:#155724}
.badge-warning{background:#fff3cd;color:#856404}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-primary:hover:not(:disabled){opacity:0.9}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed}
</style>
