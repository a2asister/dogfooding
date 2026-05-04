<template>
  <div class="alert-container">
    <div class="page-header"><div class="header-left"><h1>风险预警</h1><p class="subtitle">风险预警监控与处理</p></div></div>
    <div class="nav-tabs">
      <router-link to="/risk/" class="tab-item">仪表盘</router-link>
      <router-link to="/risk/assessments" class="tab-item">风险评估</router-link>
      <router-link to="/risk/alerts" class="tab-item active">风险预警</router-link>
      <router-link to="/risk/blacklist" class="tab-item">黑名单</router-link>
    </div>
    <div class="filter-section">
      <div class="filter-group"><label>严重程度</label>
        <select v-model="filters.severity" class="form-input" @change="fetchAlerts">
          <option value="">全部</option><option value="critical">高</option><option value="high">中</option><option value="medium">低</option>
        </select>
      </div>
      <div class="filter-group"><label>状态</label>
        <select v-model="filters.status" class="form-input" @change="fetchAlerts">
          <option value="">全部</option><option value="active">待处理</option><option value="resolved">已处理</option>
        </select>
      </div>
    </div>
    <div class="content-card">
      <div v-if="loading" class="loading-state"><div class="spinner"></div><p>加载中...</p></div>
      <div v-else-if="alerts.length === 0" class="empty-state"><span class="empty-icon">🛡️</span><p>暂无预警记录</p></div>
      <div v-else class="alert-list">
        <div v-for="alert in alerts" :key="alert.id" class="alert-item">
          <div class="alert-header">
            <div class="alert-title">
              <span :class="'severity-indicator severity-' + alert.severity"></span>
              <span class="alert-type">{{ alert.alertType }}</span>
              <span :class="'severity-label severity-' + alert.severity">{{ getSeverityLabel(alert.severity) }}风险</span>
            </div>
            <span :class="'badge ' + (alert.status === 'active' ? 'badge-warning' : 'badge-success')">{{ getStatusLabel(alert.status) }}</span>
          </div>
          <div class="alert-body">
            <p class="alert-desc">{{ alert.description }}</p>
            <div class="alert-meta">
              <span>客户ID: {{ alert.customerId }}</span>
              <span>触发时间: {{ formatDate(alert.triggerTime) }}</span>
            </div>
          </div>
          <div v-if="alert.status === 'active'" class="alert-actions">
            <button @click="handleResolve(alert.id)" class="btn btn-text">标记已处理</button>
          </div>
          <div v-else class="alert-actions resolved">
            <span class="resolution-text">处理结果: {{ alert.resolution || '已处理' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAlerts, resolveAlert } from '../api/risk'

const loading = ref(false)
const alerts = ref([])
const filters = ref({ severity: '', status: '' })

const getSeverityLabel = (s) => ({ critical: '高', high: '中', medium: '低' }[s] || s)
const getStatusLabel = (s) => ({ active: '待处理', resolved: '已处理' }[s] || s)
const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-'

const fetchAlerts = async () => {
  loading.value = true
  try {
    const params = { ...filters.value }
    Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
    const res = await getAlerts(params)
    if (res.data?.success) alerts.value = res.data.data.alerts || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleResolve = async (id) => {
  if (confirm('确定标记为已处理？')) {
    try {
      const res = await resolveAlert(id, { resolution: '已处理' })
      if (res.data?.success) { alert('已处理'); fetchAlerts() }
    } catch (e) { console.error(e); alert('操作失败') }
  }
}

onMounted(() => fetchAlerts())
</script>

<style scoped>
.alert-container{padding:24px}
.page-header{margin-bottom:16px}
.page-header h1{font-size:24px;font-weight:600;color:#1a1a2e;margin:0}
.subtitle{font-size:14px;color:#666;margin-top:4px}
.nav-tabs{display:flex;gap:4px;margin-bottom:24px;border-bottom:1px solid #f0f0f0}
.tab-item{padding:12px 20px;text-decoration:none;color:#666;font-size:14px;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.2s}
.tab-item:hover{color:#3b82f6}
.tab-item.active{color:#3b82f6;border-bottom-color:#3b82f6;font-weight:600}
.filter-section{display:flex;gap:16px;margin-bottom:24px}
.filter-group{display:flex;flex-direction:column;gap:6px}
.filter-group label{font-size:13px;font-weight:500;color:#555}
.form-input{padding:8px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;min-width:140px}
.form-input:focus{outline:none;border-color:#3b82f6}
.content-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.loading-state,.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#999}
.spinner{width:40px;height:40px;border:3px solid #f0f0f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-icon{font-size:48px;margin-bottom:12px}
.alert-list{display:flex;flex-direction:column;gap:16px}
.alert-item{border:1px solid #e8e8e8;border-radius:8px;overflow:hidden}
.alert-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#fafafa;border-bottom:1px solid #e8e8e8}
.alert-title{display:flex;align-items:center;gap:10px}
.severity-indicator{width:12px;height:12px;border-radius:50%}
.severity-critical{background:#e74c3c}
.severity-high{background:#e67e22}
.severity-medium{background:#f39c12}
.alert-type{font-size:14px;font-weight:600;color:#333}
.severity-label{font-size:12px;padding:2px 8px;border-radius:4px;font-weight:500}
.severity-label.severity-critical{background:#f8d7da;color:#721c24}
.severity-label.severity-high{background:#fff3cd;color:#856404}
.severity-label.severity-medium{background:#fff3cd;color:#856404}
.badge{padding:4px 10px;border-radius:4px;font-size:12px;font-weight:500}
.badge-warning{background:#fff3cd;color:#856404}
.badge-success{background:#d4edda;color:#155724}
.alert-body{padding:16px}
.alert-desc{font-size:14px;color:#333;margin:0 0 12px 0}
.alert-meta{display:flex;gap:24px;font-size:12px;color:#666}
.alert-actions{padding:12px 16px;border-top:1px solid #f0f0f0}
.alert-actions.resolved{background:#f8f9fa}
.resolution-text{font-size:13px;color:#666;font-style:italic}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-text{background:transparent;color:#3b82f6;padding:0}
.btn-text:hover{color:#2563eb}
</style>
