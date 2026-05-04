<template>
  <div class="dashboard-container">
    <div class="page-header">
      <div class="header-left">
        <h1>风控管理</h1>
        <p class="subtitle">风险评估、预警监控与黑名单管理</p>
      </div>
    </div>
    <div class="nav-tabs">
      <router-link to="/risk/" class="tab-item active">仪表盘</router-link>
      <router-link to="/risk/assessments" class="tab-item">风险评估</router-link>
      <router-link to="/risk/alerts" class="tab-item">风险预警</router-link>
      <router-link to="/risk/blacklist" class="tab-item">黑名单</router-link>
    </div>
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)"><span class="stat-emoji">📊</span></div>
        <div class="stat-info"><span class="stat-value">{{ stats.totalAssessments }}</span><span class="stat-label">评估记录</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f39c12, #e67e22)"><span class="stat-emoji">⚠️</span></div>
        <div class="stat-info"><span class="stat-value" style="color:#f39c12">{{ stats.activeAlerts }}</span><span class="stat-label">待处理预警</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #e74c3c, #c0392b)"><span class="stat-emoji">🚫</span></div>
        <div class="stat-info"><span class="stat-value" style="color:#e74c3c">{{ stats.blacklistCount }}</span><span class="stat-label">黑名单数量</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #27ae60, #2ecc71)"><span class="stat-emoji">✅</span></div>
        <div class="stat-info"><span class="stat-value" style="color:#27ae60">{{ stats.lowRiskCount }}</span><span class="stat-label">低风险客户</span></div>
      </div>
    </div>
    <div class="content-grid">
      <div class="content-card">
        <h3>近期风险评估</h3>
        <div v-if="loading" class="loading-small"><p>加载中...</p></div>
        <div v-else-if="assessments.length === 0" class="empty-small"><p>暂无评估记录</p></div>
        <div v-else class="list-view">
          <div v-for="a in assessments.slice(0, 5)" :key="a.id" class="list-item">
            <div class="item-main">
              <span class="item-id">{{ a.id }}</span>
              <span class="item-customer">客户ID: {{ a.customerId }}</span>
            </div>
            <div class="item-right">
              <span :class="'risk-score score-' + a.riskLevel">{{ a.riskScore }}分</span>
              <span :class="'badge risk-' + a.riskLevel">{{ a.riskLevelName }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="content-card">
        <h3>风险预警</h3>
        <div v-if="alerts.length === 0" class="empty-small"><p>暂无预警</p></div>
        <div v-else class="list-view">
          <div v-for="alert in alerts.slice(0, 5)" :key="alert.id" class="list-item">
            <div class="item-main">
              <span class="item-id">{{ alert.id }}</span>
              <span class="item-desc">{{ alert.alertType }} - {{ alert.description }}</span>
            </div>
            <div class="item-right">
              <span :class="'severity-' + alert.severity">{{ getSeverityLabel(alert.severity) }}</span>
              <span :class="'badge alert-' + alert.status">{{ getAlertStatusLabel(alert.status) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAssessments, getAlerts, getBlacklist } from '../api/risk'

const loading = ref(false)
const assessments = ref([])
const alerts = ref([])
const blacklist = ref([])

const stats = computed(() => ({
  totalAssessments: assessments.value.length,
  activeAlerts: alerts.value.filter(a => a.status === 'active').length,
  blacklistCount: blacklist.value.length,
  lowRiskCount: assessments.value.filter(a => a.riskLevel === 'A' || a.riskLevel === 'B').length
}))

const getSeverityLabel = (s) => ({ critical: '高', high: '中', medium: '低' }[s] || s)
const getAlertStatusLabel = (s) => ({ active: '待处理', resolved: '已处理' }[s] || s)

const fetchData = async () => {
  loading.value = true
  try {
    const [aRes, alertRes, blRes] = await Promise.all([
      getAssessments(),
      getAlerts(),
      getBlacklist().catch(() => ({ data: { success: true, data: [] } }))
    ])
    if (aRes.data?.success) assessments.value = aRes.data.data.assessments || []
    if (alertRes.data?.success) alerts.value = alertRes.data.data.alerts || []
    if (blRes.data?.success) blacklist.value = blRes.data.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
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
.stat-card{background:#fff;border-radius:12px;padding:20px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.stat-icon{width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center}
.stat-emoji{font-size:24px}
.stat-info{display:flex;flex-direction:column;gap:4px}
.stat-value{font-size:24px;font-weight:600;color:#1a1a2e}
.stat-label{font-size:13px;color:#666}
.content-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.content-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.content-card h3{font-size:16px;font-weight:600;color:#1a1a2e;margin:0 0 16px 0}
.loading-small,.empty-small{text-align:center;padding:40px;color:#999;font-size:14px}
.list-view{display:flex;flex-direction:column;gap:12px}
.list-item{display:flex;justify-content:space-between;align-items:center;padding:12px;background:#fafafa;border-radius:8px}
.item-main{display:flex;flex-direction:column;gap:4px}
.item-id{font-size:14px;font-weight:600;color:#333}
.item-customer,.item-desc{font-size:12px;color:#666}
.item-right{display:flex;align-items:center;gap:12px}
.risk-score{font-size:18px;font-weight:700;padding:4px 8px;border-radius:4px}
.score-A{color:#27ae60;background:rgba(39,174,96,0.1)}
.score-B{color:#2980b9;background:rgba(41,128,185,0.1)}
.score-C{color:#f39c12;background:rgba(243,156,18,0.1)}
.score-D{color:#e67e22;background:rgba(230,126,34,0.1)}
.score-E{color:#e74c3c;background:rgba(231,76,60,0.1)}
.badge{padding:4px 10px;border-radius:4px;font-size:12px;font-weight:500}
.risk-A{background:#d4edda;color:#155724}
.risk-B{background:#cce5ff;color:#004085}
.risk-C{background:#fff3cd;color:#856404}
.risk-D{background:#ffe5d0;color:#854504}
.risk-E{background:#f8d7da;color:#721c24}
.alert-active{background:#fff3cd;color:#856404}
.alert-resolved{background:#d4edda;color:#155724}
.severity-critical{color:#e74c3c;font-weight:600}
.severity-high{color:#e67e22;font-weight:600}
.severity-medium{color:#f39c12;font-weight:600}
</style>
