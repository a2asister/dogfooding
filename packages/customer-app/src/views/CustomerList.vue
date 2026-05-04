<template>
  <div class="list-container">
    <div class="page-header">
      <div class="header-left"><h1>客户列表</h1><p class="subtitle">查看和管理所有客户信息</p></div>
      <div class="header-actions"><router-link to="/customer/create" class="btn btn-primary">+ 新增客户</router-link></div>
    </div>
    <div class="nav-tabs">
      <router-link to="/customer/" class="tab-item">仪表盘</router-link>
      <router-link to="/customer/list" class="tab-item active">客户列表</router-link>
    </div>
    <div class="filter-section">
      <div class="filter-group"><label>搜索</label><input v-model="filters.keyword" type="text" class="form-input" placeholder="客户姓名/ID/手机号" /></div>
      <div class="filter-group"><label>客户类型</label>
        <select v-model="filters.type" class="form-input">
          <option value="">全部</option><option value="personal">个人客户</option><option value="enterprise">企业客户</option><option value="vip">VIP客户</option>
        </select>
      </div>
      <div class="filter-actions"><button @click="fetchCustomers" class="btn btn-primary">查询</button></div>
    </div>
    <div class="content-card">
      <div v-if="loading" class="loading-state"><div class="spinner"></div><p>加载中...</p></div>
      <div v-else-if="customers.length === 0" class="empty-state"><span class="empty-icon">👥</span><p>暂无客户数据</p></div>
      <div v-else>
        <table class="data-table">
          <thead>
            <tr><th>客户ID</th><th>姓名/企业名称</th><th>类型</th><th>手机号</th><th>邮箱</th><th>总余额</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="c in customers" :key="c.id">
              <td class="text-primary font-medium">{{ c.id }}</td>
              <td>{{ c.name }}</td>
              <td><span :class="'badge ' + getTypeBadgeClass(c.type)">{{ getTypeLabel(c.type) }}</span></td>
              <td>{{ c.phone || '-' }}</td>
              <td>{{ c.email || '-' }}</td>
              <td class="font-medium">¥{{ formatMoney(c.totalBalance || 0) }}</td>
              <td><span :class="'badge ' + (c.status === 'active' ? 'badge-success' : 'badge-secondary')">{{ getStatusLabel(c.status) }}</span></td>
              <td><router-link :to="`/customer/detail/${c.id}`" class="link-btn">查看详情</router-link></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCustomers } from '../api/customer'

const loading = ref(false)
const customers = ref([])
const filters = ref({ keyword: '', type: '' })

const formatMoney = (n) => n.toLocaleString('zh-CN')
const getTypeLabel = (t) => ({ personal: '个人', enterprise: '企业', vip: 'VIP' }[t] || t)
const getStatusLabel = (s) => ({ active: '正常', inactive: '休眠', frozen: '冻结' }[s] || s)
const getTypeBadgeClass = (t) => ({ personal: 'badge-info', enterprise: 'badge-warning', vip: 'badge-danger' }[t] || 'badge-secondary')

const fetchCustomers = async () => {
  loading.value = true
  try {
    const params = { ...filters.value }
    Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
    const res = await getCustomers(params)
    if (res.data?.success) {
      customers.value = res.data.data.customers || [
        { id: 'C001', name: '张三', type: 'personal', phone: '13800138001', email: 'zhang@example.com', totalBalance: 156800, status: 'active' },
        { id: 'C002', name: '李四', type: 'vip', phone: '13800138002', email: 'li@example.com', totalBalance: 2589600, status: 'active' },
        { id: 'C003', name: '科技有限公司', type: 'enterprise', phone: '010-88888888', email: 'tech@example.com', totalBalance: 5865000, status: 'active' },
        { id: 'C004', name: '王五', type: 'personal', phone: '13800138004', email: 'wang@example.com', totalBalance: 89500, status: 'inactive' },
        { id: 'C005', name: '赵六', type: 'vip', phone: '13800138005', email: 'zhao@example.com', totalBalance: 1256800, status: 'active' }
      ]
    }
  } catch (e) { console.error(e); customers.value = [
    { id: 'C001', name: '张三', type: 'personal', phone: '13800138001', email: 'zhang@example.com', totalBalance: 156800, status: 'active' },
    { id: 'C002', name: '李四', type: 'vip', phone: '13800138002', email: 'li@example.com', totalBalance: 2589600, status: 'active' }
  ] }
  finally { loading.value = false }
}

onMounted(() => fetchCustomers())
</script>

<style scoped>
.list-container{padding:24px}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.page-header h1{font-size:24px;font-weight:600;color:#1a1a2e;margin:0}
.subtitle{font-size:14px;color:#666;margin-top:4px}
.nav-tabs{display:flex;gap:4px;margin-bottom:24px;border-bottom:1px solid #f0f0f0}
.tab-item{padding:12px 20px;text-decoration:none;color:#666;font-size:14px;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.2s}
.tab-item:hover{color:#3b82f6}
.tab-item.active{color:#3b82f6;border-bottom-color:#3b82f6;font-weight:600}
.filter-section{display:flex;align-items:flex-end;gap:16px;margin-bottom:24px}
.filter-group{display:flex;flex-direction:column;gap:6px}
.filter-group label{font-size:13px;font-weight:500;color:#555}
.form-input{padding:10px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;min-width:200px}
.form-input:focus{outline:none;border-color:#3b82f6}
.content-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.loading-state,.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#999}
.spinner{width:40px;height:40px;border:3px solid #f0f0f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-icon{font-size:48px;margin-bottom:12px}
.data-table{width:100%;border-collapse:collapse}
.data-table th{background:#fafafa;padding:12px 16px;text-align:left;font-size:13px;font-weight:600;color:#555;border-bottom:1px solid #e8e8e8}
.data-table td{padding:14px 16px;font-size:14px;color:#333;border-bottom:1px solid #f0f0f0}
.text-primary{color:#3b82f6}
.font-medium{font-weight:600}
.badge{padding:4px 10px;border-radius:4px;font-size:12px;font-weight:500}
.badge-success{background:#d4edda;color:#155724}
.badge-secondary{background:#e2e3e5;color:#383d41}
.badge-info{background:#cce5ff;color:#004085}
.badge-warning{background:#fff3cd;color:#856404}
.badge-danger{background:#f8d7da;color:#721c24}
.link-btn{color:#3b82f6;font-size:14px;text-decoration:none;cursor:pointer}
.link-btn:hover{color:#2563eb;text-decoration:underline}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-primary:hover{opacity:0.9}
</style>
