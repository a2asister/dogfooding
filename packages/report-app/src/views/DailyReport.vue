<template>
  <div class="report-container">
    <div class="page-header">
      <div class="header-left"><h1>日报</h1><p class="subtitle">每日业务数据报表</p></div>
    </div>
    <div class="nav-tabs">
      <router-link to="/report/" class="tab-item">仪表盘</router-link>
      <router-link to="/report/daily" class="tab-item active">日报</router-link>
      <router-link to="/report/monthly" class="tab-item">月报</router-link>
      <router-link to="/report/custom" class="tab-item">自定义报表</router-link>
    </div>
    <div class="filter-section">
      <div class="filter-group"><label>选择日期</label><input v-model="selectedDate" type="date" class="form-input" @change="fetchReport" /></div>
      <div class="filter-actions"><button @click="fetchReport" class="btn btn-primary">查询</button></div>
    </div>
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>加载中...</p></div>
    <div v-else class="report-content">
      <div class="stats-row">
        <div class="stat-box"><div class="stat-box-label">交易总金额</div><div class="stat-box-value">¥{{ formatMoney(reportData.totalAmount) }}</div><div class="stat-box-change">较昨日 +12.5%</div></div>
        <div class="stat-box"><div class="stat-box-label">交易笔数</div><div class="stat-box-value">{{ reportData.transactionCount }}</div><div class="stat-box-change">较昨日 +8.3%</div></div>
        <div class="stat-box"><div class="stat-box-label">新开户数</div><div class="stat-box-value">{{ reportData.newAccounts }}</div><div class="stat-box-change">较昨日 +15.2%</div></div>
        <div class="stat-box"><div class="stat-box-label">贷款发放额</div><div class="stat-box-value">¥{{ formatMoney(reportData.loanDisbursed) }}</div><div class="stat-box-change">较昨日 +5.8%</div></div>
      </div>
      <div class="content-grid">
        <div class="content-card">
          <h3>交易类型分布</h3>
          <div v-if="reportData.transactionTypes" class="type-list">
            <div v-for="(item, k) in reportData.transactionTypes" :key="k" class="type-item">
              <div class="type-info"><span class="type-name">{{ k }}</span><span class="type-count">{{ item.count }}笔</span></div>
              <div class="type-bar"><div class="type-bar-fill" :style="{width:getBarWidth(item.count)}"></div></div>
              <div class="type-amount">¥{{ formatMoney(item.amount) }}</div>
            </div>
          </div>
        </div>
        <div class="content-card">
          <h3>业务指标</h3>
          <table class="simple-table">
            <thead><tr><th>指标</th><th>今日</th><th>昨日</th><th>变化</th></tr></thead>
            <tbody>
              <tr><td>存款金额</td><td>¥{{ formatMoney(reportData.depositAmount || 586000) }}</td><td>¥52.3万</td><td class="up">+12.0%</td></tr>
              <tr><td>取款金额</td><td>¥{{ formatMoney(reportData.withdrawAmount || 425000) }}</td><td>¥39.8万</td><td class="up">+6.8%</td></tr>
              <tr><td>转账金额</td><td>¥{{ formatMoney(reportData.transferAmount || 1884600) }}</td><td>¥165.2万</td><td class="up">+14.1%</td></tr>
              <tr><td>理财购买</td><td>¥{{ formatMoney(reportData.wealthPurchase || 320000) }}</td><td>¥28.5万</td><td class="up">+12.3%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDailyReport } from '../api/report'

const loading = ref(false)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const reportData = ref({
  totalAmount: 2895600, transactionCount: 1256, newAccounts: 38, loanDisbursed: 850000,
  transactionTypes: {
    '存款': { count: 356, amount: 586000 },
    '取款': { count: 289, amount: 425000 },
    '转账': { count: 412, amount: 1884600 },
    '理财购买': { count: 89, amount: 320000 },
    '贷款还款': { count: 110, amount: 267000 }
  }
})

const maxCount = computed(() => {
  if (!reportData.value.transactionTypes) return 1
  return Math.max(...Object.values(reportData.value.transactionTypes).map(t => t.count))
})

const getBarWidth = (count) => (count / maxCount.value * 100) + '%'
const formatMoney = (n) => (n / 10000).toFixed(2) + '万'

const fetchReport = async () => {
  loading.value = true
  try {
    const res = await getDailyReport(selectedDate.value)
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
.form-input{padding:10px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;min-width:160px}
.form-input:focus{outline:none;border-color:#3b82f6}
.loading-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#999}
.spinner{width:40px;height:40px;border:3px solid #f0f0f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:24px}
.stat-box{background:#fff;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.stat-box-label{font-size:13px;color:#666;margin-bottom:8px}
.stat-box-value{font-size:24px;font-weight:700;color:#1a1a2e;margin-bottom:6px}
.stat-box-change{font-size:12px;color:#10b981}
.content-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.content-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.content-card h3{font-size:16px;font-weight:600;color:#1a1a2e;margin:0 0 20px 0}
.type-list{display:flex;flex-direction:column;gap:16px}
.type-item{display:grid;grid-template-columns:150px 1fr 120px;gap:16px;align-items:center}
.type-info{display:flex;flex-direction:column;gap:4px}
.type-name{font-size:14px;font-weight:500;color:#333}
.type-count{font-size:12px;color:#666}
.type-bar{height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden}
.type-bar-fill{height:100%;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:4px}
.type-amount{font-size:14px;font-weight:600;color:#1a1a2e;text-align:right}
.simple-table{width:100%;border-collapse:collapse}
.simple-table th{background:#fafafa;padding:10px 12px;text-align:left;font-size:13px;font-weight:600;color:#555;border-bottom:1px solid #e8e8e8}
.simple-table td{padding:12px;font-size:14px;color:#333;border-bottom:1px solid #f0f0f0}
.up{color:#10b981;font-weight:500}
.down{color:#ef4444;font-weight:500}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-primary:hover{opacity:0.9}
</style>
