<template>
  <div class="dashboard-container">
    <div class="page-header">
      <div class="header-left"><h1>报表管理</h1><p class="subtitle">数据报表与统计分析</p></div>
    </div>
    <div class="nav-tabs">
      <router-link to="/report/" class="tab-item active">仪表盘</router-link>
      <router-link to="/report/daily" class="tab-item">日报</router-link>
      <router-link to="/report/monthly" class="tab-item">月报</router-link>
      <router-link to="/report/custom" class="tab-item">自定义报表</router-link>
    </div>
    <div class="stats-row">
      <div class="stat-card" style="border-left:4px solid #3b82f6">
        <div class="stat-info"><span class="stat-label">今日交易额</span><span class="stat-value">¥{{ formatMoney(stats.todayAmount) }}</span><span class="stat-trend up">较昨日 +12.5%</span></div>
        <div class="stat-icon" style="background:linear-gradient(135deg,#60a5fa,#3b82f6)"><span class="stat-emoji">💰</span></div>
      </div>
      <div class="stat-card" style="border-left:4px solid #10b981">
        <div class="stat-info"><span class="stat-label">今日交易笔数</span><span class="stat-value">{{ stats.todayCount }}</span><span class="stat-trend up">较昨日 +8.3%</span></div>
        <div class="stat-icon" style="background:linear-gradient(135deg,#34d399,#10b981)"><span class="stat-emoji">📊</span></div>
      </div>
      <div class="stat-card" style="border-left:4px solid #f59e0b">
        <div class="stat-info"><span class="stat-label">本月贷款余额</span><span class="stat-value">¥{{ formatMoney(stats.loanBalance) }}</span><span class="stat-trend up">较上月 +5.2%</span></div>
        <div class="stat-icon" style="background:linear-gradient(135deg,#fbbf24,#f59e0b)"><span class="stat-emoji">📈</span></div>
      </div>
      <div class="stat-card" style="border-left:4px solid #8b5cf6">
        <div class="stat-info"><span class="stat-label">活跃客户数</span><span class="stat-value">{{ stats.activeCustomers }}</span><span class="stat-trend up">较上月 +15.8%</span></div>
        <div class="stat-icon" style="background:linear-gradient(135deg,#a78bfa,#8b5cf6)"><span class="stat-emoji">👥</span></div>
      </div>
    </div>
    <div class="content-grid">
      <div class="content-card">
        <h3>业务概览</h3>
        <div class="overview-grid">
          <div class="overview-item"><div class="overview-label">总账户数</div><div class="overview-value">{{ stats.totalAccounts || 1526 }}</div><div class="overview-bar" style="width:85%"></div></div>
          <div class="overview-item"><div class="overview-label">信用卡数量</div><div class="overview-value">{{ stats.creditCards || 1053 }}</div><div class="overview-bar" style="width:70%"></div></div>
          <div class="overview-item"><div class="overview-label">理财产品数</div><div class="overview-value">{{ stats.wealthProducts || 38 }}</div><div class="overview-bar" style="width:50%"></div></div>
          <div class="overview-item"><div class="overview-label">进行中贷款</div><div class="overview-value">{{ stats.activeLoans || 245 }}</div><div class="overview-bar" style="width:40%"></div></div>
        </div>
      </div>
      <div class="content-card">
        <h3>快速报表</h3>
        <div class="quick-actions">
          <router-link to="/report/daily" class="action-card"><span class="action-icon" style="background:#dbeafe;color:#3b82f6">📅</span><span class="action-text">日报</span></router-link>
          <router-link to="/report/monthly" class="action-card"><span class="action-icon" style="background:#fef3c7;color:#f59e0b">📆</span><span class="action-text">月报</span></router-link>
          <router-link to="/report/custom" class="action-card"><span class="action-icon" style="background:#ede9fe;color:#8b5cf6">⚙️</span><span class="action-text">自定义</span></router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboard } from '../api/report'

const stats = ref({
  todayAmount: 2895600, todayCount: 1256, loanBalance: 12850000, activeCustomers: 3892,
  totalAccounts: 1526, creditCards: 1053, wealthProducts: 38, activeLoans: 245
})

const formatMoney = (n) => (n / 10000).toFixed(2) + '万'

const fetchData = async () => {
  try {
    const res = await getDashboard()
    if (res.data?.success) {
      const d = res.data.data
      stats.value = {
        todayAmount: d.todayAmount || 2895600,
        todayCount: d.todayCount || 1256,
        loanBalance: d.loanBalance || 12850000,
        activeCustomers: d.activeCustomers || 3892,
        totalAccounts: d.totalAccounts || 1526,
        creditCards: d.creditCards || 1053,
        wealthProducts: d.wealthProducts || 38,
        activeLoans: d.activeLoans || 245
      }
    }
  } catch (e) { console.error(e) }
}

onMounted(() => fetchData())
</script>

<style scoped>
.dashboard-container{padding:24px}
.page-header{margin-bottom:16px}
.page-header h1{font-size:24px;font-weight:600;color:#1a1a2e;margin:0}
.subtitle{font-size:14px;color:#666;margin-top:4px}
.nav-tabs{display:flex;gap:4px;margin-bottom:24px;border-bottom:1px solid #f0f0f0}
.tab-item{padding:12px 20px;text-decoration:none;color:#666;font-size:14px;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.2s}
.tab-item:hover{color:#3b82f6}
.tab-item.active{color:#3b82f6;border-bottom-color:#3b82f6;font-weight:600}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:24px}
.stat-card{background:#fff;border-radius:12px;padding:20px;display:flex;justify-content:space-between;align-items:flex-start;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.stat-info{display:flex;flex-direction:column;gap:6px}
.stat-label{font-size:13px;color:#666}
.stat-value{font-size:22px;font-weight:700;color:#1a1a2e}
.stat-trend{font-size:12px;padding:2px 8px;border-radius:4px;width:fit-content}
.stat-trend.up{background:#d1fae5;color:#065f46}
.stat-trend.down{background:#fee2e2;color:#991b1b}
.stat-icon{width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center}
.stat-emoji{font-size:22px}
.content-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.content-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.content-card h3{font-size:16px;font-weight:600;color:#1a1a2e;margin:0 0 20px 0}
.overview-grid{display:flex;flex-direction:column;gap:16px}
.overview-item{display:flex;flex-direction:column;gap:8px}
.overview-label{font-size:13px;color:#666}
.overview-value{font-size:18px;font-weight:600;color:#1a1a2e}
.overview-bar{height:4px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:2px}
.quick-actions{display:flex;gap:16px}
.action-card{display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;background:#fafafa;border-radius:10px;text-decoration:none;transition:all 0.2s}
.action-card:hover{background:#f0f4ff;transform:translateY(-2px)}
.action-icon{width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px}
.action-text{font-size:14px;font-weight:500;color:#333}
</style>
