<template>
  <div class="report-container">
    <div class="page-header">
      <div class="header-left"><h1>月报</h1><p class="subtitle">月度业务数据报表</p></div>
    </div>
    <div class="nav-tabs">
      <router-link to="/report/" class="tab-item">仪表盘</router-link>
      <router-link to="/report/daily" class="tab-item">日报</router-link>
      <router-link to="/report/monthly" class="tab-item active">月报</router-link>
      <router-link to="/report/custom" class="tab-item">自定义报表</router-link>
    </div>
    <div class="filter-section">
      <div class="filter-group"><label>年份</label>
        <select v-model="selectedYear" class="form-input">
          <option v-for="y in [2025,2024,2023]" :key="y" :value="y">{{ y }}年</option>
        </select>
      </div>
      <div class="filter-group"><label>月份</label>
        <select v-model="selectedMonth" class="form-input">
          <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
        </select>
      </div>
      <div class="filter-actions"><button @click="fetchReport" class="btn btn-primary">查询</button></div>
    </div>
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>加载中...</p></div>
    <div v-else class="report-content">
      <div class="stats-row">
        <div class="stat-card"><div class="stat-label">本月交易额</div><div class="stat-value">¥{{ formatMoney(reportData.totalAmount) }}</div><div class="stat-sub">较上月 +8.5%</div></div>
        <div class="stat-card"><div class="stat-label">交易笔数</div><div class="stat-value">{{ reportData.transactionCount }}</div><div class="stat-sub">较上月 +5.2%</div></div>
        <div class="stat-card"><div class="stat-label">新开户数</div><div class="stat-value">{{ reportData.newAccounts }}</div><div class="stat-sub">较上月 +12.8%</div></div>
        <div class="stat-card"><div class="stat-label">贷款余额</div><div class="stat-value">¥{{ formatMoney(reportData.loanBalance) }}</div><div class="stat-sub">较上月 +3.2%</div></div>
      </div>
      <div class="content-grid">
        <div class="content-card">
          <h3>月度数据汇总</h3>
          <table class="data-table">
            <thead><tr><th>业务类型</th><th>金额</th><th>笔数</th><th>占比</th></tr></thead>
            <tbody>
              <tr><td>存款</td><td>¥{{ formatMoney(reportData.depositTotal || 15680000) }}</td><td>{{ reportData.depositCount || 3856 }}</td><td>35.2%</td></tr>
              <tr><td>取款</td><td>¥{{ formatMoney(reportData.withdrawTotal || 11250000) }}</td><td>{{ reportData.withdrawCount || 2896 }}</td><td>25.3%</td></tr>
              <tr><td>转账</td><td>¥{{ formatMoney(reportData.transferTotal || 22560000) }}</td><td>{{ reportData.transferCount || 4125 }}</td><td>50.6%</td></tr>
              <tr><td>理财</td><td>¥{{ formatMoney(reportData.wealthTotal || 8560000) }}</td><td>{{ reportData.wealthCount || 896 }}</td><td>19.2%</td></tr>
              <tr><td>贷款</td><td>¥{{ formatMoney(reportData.loanTotal || 6850000) }}</td><td>{{ reportData.loanCount || 245 }}</td><td>15.4%</td></tr>
            </tbody>
          </table>
        </div>
        <div class="content-card">
          <h3>客户指标</h3>
          <div class="metrics-list">
            <div class="metric-item"><div class="metric-info"><span class="metric-name">新增客户</span><span class="metric-value">{{ reportData.newCustomers || 128 }}</span></div><div class="metric-bar" style="width:65%"></div></div>
            <div class="metric-item"><div class="metric-info"><span class="metric-name">活跃客户</span><span class="metric-value">{{ reportData.activeCustomers || 895 }}</span></div><div class="metric-bar" style="width:85%"></div></div>
            <div class="metric-item"><div class="metric-info"><span class="metric-name">休眠客户</span><span class="metric-value">{{ reportData.inactiveCustomers || 156 }}</span></div><div class="metric-bar" style="width:25%"></div></div>
            <div class="metric-item"><div class="metric-info"><span class="metric-name">高净值客户</span><span class="metric-value">{{ reportData.highValueCustomers || 45 }}</span></div><div class="metric-bar" style="width:15%"></div></div>
            <div class="metric-item"><div class="metric-info"><span class="metric-name">信用卡客户</span><span class="metric-value">{{ reportData.creditCardCustomers || 523 }}</span></div><div class="metric-bar" style="width:55%"></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMonthlyReport } from '../api/report'

const loading = ref(false)
const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth() + 1)
const reportData = ref({
  totalAmount: 44560000, transactionCount: 12856, newAccounts: 456, loanBalance: 12850000,
  newCustomers: 128, activeCustomers: 895, inactiveCustomers: 156, highValueCustomers: 45, creditCardCustomers: 523
})

const formatMoney = (n) => (n / 10000).toFixed(2) + '万'

const fetchReport = async () => {
  loading.value = true
  try {
    const res = await getMonthlyReport(selectedYear.value, selectedMonth.value)
    if (res.data?.success) reportData.value = res.data.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

onMounted(() => fetchReport())
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
.filter-section{display:flex;align-items:flex-end;gap:16px;margin-bottom:24px}
.filter-group{display:flex;flex-direction:column;gap:6px}
.filter-group label{font-size:13px;font-weight:500;color:#555}
.form-input{padding:10px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;min-width:120px}
.form-input:focus{outline:none;border-color:#3b82f6}
.loading-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#999}
.spinner{width:40px;height:40px;border:3px solid #f0f0f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:24px}
.stat-card{background:#fff;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.stat-card .stat-label{font-size:13px;color:#666;margin-bottom:8px}
.stat-card .stat-value{font-size:24px;font-weight:700;color:#1a1a2e;margin-bottom:4px}
.stat-card .stat-sub{font-size:12px;color:#10b981}
.content-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.content-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.content-card h3{font-size:16px;font-weight:600;color:#1a1a2e;margin:0 0 20px 0}
.data-table{width:100%;border-collapse:collapse}
.data-table th{background:#fafafa;padding:10px 12px;text-align:left;font-size:13px;font-weight:600;color:#555;border-bottom:1px solid #e8e8e8}
.data-table td{padding:12px;font-size:14px;color:#333;border-bottom:1px solid #f0f0f0}
.metrics-list{display:flex;flex-direction:column;gap:20px}
.metric-item{display:flex;flex-direction:column;gap:8px}
.metric-info{display:flex;justify-content:space-between;align-items:center}
.metric-name{font-size:14px;color:#666}
.metric-value{font-size:18px;font-weight:600;color:#1a1a2e}
.metric-bar{height:6px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:3px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-primary:hover{opacity:0.9}
</style>
