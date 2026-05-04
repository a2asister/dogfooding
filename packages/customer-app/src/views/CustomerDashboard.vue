<template>
  <div class="dashboard-container">
    <div class="page-header">
      <div class="header-left"><h1>客户管理</h1><p class="subtitle">客户信息管理与统计分析</p></div>
      <div class="header-actions"><router-link to="/customer/create" class="btn btn-primary">+ 新增客户</router-link></div>
    </div>
    <div class="nav-tabs">
      <router-link to="/customer/" class="tab-item active">仪表盘</router-link>
      <router-link to="/customer/list" class="tab-item">客户列表</router-link>
    </div>
    <div class="stats-row">
      <div class="stat-card" style="border-left:4px solid #3b82f6">
        <div class="stat-info"><span class="stat-label">总客户数</span><span class="stat-value">{{ stats.totalCustomers }}</span><span class="stat-trend up">本月 +128</span></div>
        <div class="stat-icon" style="background:linear-gradient(135deg,#60a5fa,#3b82f6)"><span class="stat-emoji">👥</span></div>
      </div>
      <div class="stat-card" style="border-left:4px solid #10b981">
        <div class="stat-info"><span class="stat-label">VIP客户</span><span class="stat-value">{{ stats.vipCustomers }}</span><span class="stat-trend up">占比 {{ vipRate }}%</span></div>
        <div class="stat-icon" style="background:linear-gradient(135deg,#34d399,#10b981)"><span class="stat-emoji">👑</span></div>
      </div>
      <div class="stat-card" style="border-left:4px solid #f59e0b">
        <div class="stat-info"><span class="stat-label">企业客户</span><span class="stat-value">{{ stats.enterpriseCustomers }}</span><span class="stat-trend up">较上月 +12</span></div>
        <div class="stat-icon" style="background:linear-gradient(135deg,#fbbf24,#f59e0b)"><span class="stat-emoji">🏢</span></div>
      </div>
      <div class="stat-card" style="border-left:4px solid #8b5cf6">
        <div class="stat-info"><span class="stat-label">活跃客户</span><span class="stat-value">{{ stats.activeCustomers }}</span><span class="stat-trend up">活跃率 {{ activeRate }}%</span></div>
        <div class="stat-icon" style="background:linear-gradient(135deg,#a78bfa,#8b5cf6)"><span class="stat-emoji">⚡</span></div>
      </div>
    </div>
    <div class="content-grid">
      <div class="content-card">
        <h3>客户类型分布</h3>
        <div class="type-distribution">
          <div class="type-item">
            <div class="type-header"><span class="type-name">个人客户</span><span class="type-count">{{ stats.personalCustomers || 895 }}</span></div>
            <div class="type-bar"><div class="type-bar-fill" style="width:70%;background:linear-gradient(90deg,#3b82f6,#60a5fa)"></div></div>
          </div>
          <div class="type-item">
            <div class="type-header"><span class="type-name">企业客户</span><span class="type-count">{{ stats.enterpriseCustomers || 156 }}</span></div>
            <div class="type-bar"><div class="type-bar-fill" style="width:25%;background:linear-gradient(90deg,#10b981,#34d399)"></div></div>
          </div>
          <div class="type-item">
            <div class="type-header"><span class="type-name">VIP客户</span><span class="type-count">{{ stats.vipCustomers || 45 }}</span></div>
            <div class="type-bar"><div class="type-bar-fill" style="width:15%;background:linear-gradient(90deg,#f59e0b,#fbbf24)"></div></div>
          </div>
        </div>
      </div>
      <div class="content-card">
        <h3>快速操作</h3>
        <div class="quick-actions">
          <router-link to="/customer/list" class="action-card"><span class="action-icon" style="background:#dbeafe;color:#3b82f6">📋</span><span class="action-text">查看客户列表</span></router-link>
          <router-link to="/customer/create" class="action-card"><span class="action-icon" style="background:#d1fae5;color:#10b981">➕</span><span class="action-text">新增客户</span></router-link>
          <button @click="showStats = true" class="action-card" style="background:#fafafa;border:none"><span class="action-icon" style="background:#ede9fe;color:#8b5cf6">📊</span><span class="action-text">查看统计</span></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getStats } from '../api/customer'

const showStats = ref(false)
const stats = ref({
  totalCustomers: 1096,
  vipCustomers: 45,
  enterpriseCustomers: 156,
  personalCustomers: 895,
  activeCustomers: 895
})

const vipRate = computed(() => stats.value.totalCustomers > 0 ? Math.round(stats.value.vipCustomers / stats.value.totalCustomers * 100) : 0)
const activeRate = computed(() => stats.value.totalCustomers > 0 ? Math.round(stats.value.activeCustomers / stats.value.totalCustomers * 100) : 0)

const fetchData = async () => {
  try {
    const res = await getStats()
    if (res.data?.success) {
      const d = res.data.data
      stats.value = {
        totalCustomers: d.totalCustomers || 1096,
        vipCustomers: d.vipCustomers || 45,
        enterpriseCustomers: d.enterpriseCustomers || 156,
        personalCustomers: d.personalCustomers || 895,
        activeCustomers: d.activeCustomers || 895
      }
    }
  } catch (e) { console.error(e) }
}

onMounted(() => fetchData())
</script>

<style scoped>
.dashboard-container{padding:24px}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
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
.stat-icon{width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center}
.stat-emoji{font-size:22px}
.content-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.content-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.content-card h3{font-size:16px;font-weight:600;color:#1a1a2e;margin:0 0 20px 0}
.type-distribution{display:flex;flex-direction:column;gap:20px}
.type-item{display:flex;flex-direction:column;gap:10px}
.type-header{display:flex;justify-content:space-between;align-items:center}
.type-name{font-size:14px;font-weight:500;color:#333}
.type-count{font-size:14px;font-weight:600;color:#1a1a2e}
.type-bar{height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden}
.type-bar-fill{height:100%;border-radius:4px}
.quick-actions{display:flex;gap:16px}
.action-card{display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;background:#fafafa;border-radius:10px;text-decoration:none;transition:all 0.2s;cursor:pointer}
.action-card:hover{background:#f0f4ff;transform:translateY(-2px)}
.action-icon{width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px}
.action-text{font-size:14px;font-weight:500;color:#333}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-primary:hover{opacity:0.9}
</style>
