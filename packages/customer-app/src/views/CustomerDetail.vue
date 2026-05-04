<template>
  <div class="detail-container">
    <div class="page-header">
      <div class="header-left">
        <button @click="$router.back()" class="btn btn-text">← 返回</button>
        <h1>客户详情</h1>
      </div>
      <div class="header-actions"><button @click="showEdit = true" class="btn btn-primary">编辑信息</button></div>
    </div>
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>加载中...</p></div>
    <div v-else>
      <div class="info-card">
        <div class="info-header">
          <div class="customer-avatar" :style="{background:getAvatarBg(customer.type)}"><span class="avatar-text">{{ customer.name?.charAt(0) || '?' }}</span></div>
          <div class="customer-info">
            <div class="customer-name">{{ customer.name }}<span :class="'badge ' + getTypeBadgeClass(customer.type)">{{ getTypeLabel(customer.type) }}</span></div>
            <div class="customer-id">客户ID: {{ customer.id }}</div>
          </div>
          <div class="customer-status"><span :class="'badge status-' + customer.status">{{ getStatusLabel(customer.status) }}</span></div>
        </div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">手机号</span><span class="info-value">{{ customer.phone || '-' }}</span></div>
          <div class="info-item"><span class="info-label">邮箱</span><span class="info-value">{{ customer.email || '-' }}</span></div>
          <div class="info-item"><span class="info-label">性别</span><span class="info-value">{{ customer.gender || '-' }}</span></div>
          <div class="info-item"><span class="info-label">出生日期</span><span class="info-value">{{ formatDate(customer.birthDate) }}</span></div>
          <div class="info-item"><span class="info-label">身份证号</span><span class="info-value">{{ customer.idCard || '-' }}</span></div>
          <div class="info-item"><span class="info-label">注册日期</span><span class="info-value">{{ formatDate(customer.createdAt) }}</span></div>
          <div class="info-item" style="grid-column:span 2"><span class="info-label">地址</span><span class="info-value">{{ customer.address || '-' }}</span></div>
        </div>
      </div>
      <div class="stats-row">
        <div class="stat-box"><div class="stat-label">总余额</div><div class="stat-value">¥{{ formatMoney(customer.totalBalance || 0) }}</div></div>
        <div class="stat-box"><div class="stat-label">账户数量</div><div class="stat-value">{{ customer.accountCount || 0 }}</div></div>
        <div class="stat-box"><div class="stat-label">累计交易</div><div class="stat-value">{{ customer.transactionCount || 0 }}笔</div></div>
        <div class="stat-box"><div class="stat-label">风险等级</div><div class="stat-value" :style="{color:getRiskColor(customer.riskLevel)}">{{ getRiskLabel(customer.riskLevel) }}</div></div>
      </div>
    </div>
    <div v-if="showEdit" class="edit-modal">
      <div class="modal-overlay" @click="showEdit = false"></div>
      <div class="modal-content">
        <h3>编辑客户信息</h3>
        <form @submit.prevent="handleEdit">
          <div class="form-group"><label>手机号</label><input v-model="editForm.phone" type="text" class="form-input" /></div>
          <div class="form-group"><label>邮箱</label><input v-model="editForm.email" type="email" class="form-input" /></div>
          <div class="form-group"><label>地址</label><input v-model="editForm.address" type="text" class="form-input" /></div>
          <div class="form-actions"><button type="button" @click="showEdit = false" class="btn btn-secondary">取消</button><button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button></div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { getCustomerById, updateCustomer } from '../api/customer'

const route = useRoute()
const loading = ref(false)
const showEdit = ref(false)
const saving = ref(false)
const customer = ref({ id: route.params.id, name: '张三', type: 'personal', phone: '13800138001', email: 'zhang@example.com', gender: '男', birthDate: '1990-01-15', idCard: '110101********1234', address: '北京市朝阳区xxx路xxx号', status: 'active', createdAt: '2024-01-15', totalBalance: 156800, accountCount: 2, transactionCount: 156, riskLevel: 'A' })

const editForm = reactive({ phone: '', email: '', address: '' })

const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '-'
const getTypeLabel = (t) => ({ personal: '个人客户', enterprise: '企业客户', vip: 'VIP客户' }[t] || t)
const getStatusLabel = (s) => ({ active: '正常', inactive: '休眠', frozen: '冻结' }[s] || s)
const getTypeBadgeClass = (t) => ({ personal: 'badge-info', enterprise: 'badge-warning', vip: 'badge-danger' }[t] || 'badge-secondary')
const getRiskLabel = (l) => ({ A: '低风险', B: '中低风险', C: '中等风险', D: '中高风险', E: '高风险' }[l] || l)
const getRiskColor = (l) => ({ A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#ef4444', E: '#7c3aed' }[l] || '#666')
const getAvatarBg = (t) => ({ personal: 'linear-gradient(135deg,#60a5fa,#3b82f6)', enterprise: 'linear-gradient(135deg,#fbbf24,#f59e0b)', vip: 'linear-gradient(135deg,#a78bfa,#8b5cf6)' }[t] || 'linear-gradient(135deg,#94a3b8,#64748b)')
const formatMoney = (n) => n.toLocaleString('zh-CN')

const fetchCustomer = async () => {
  loading.value = true
  try {
    const res = await getCustomerById(route.params.id)
    if (res.data?.success) customer.value = res.data.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const openEdit = () => {
  editForm.phone = customer.value.phone || ''
  editForm.email = customer.value.email || ''
  editForm.address = customer.value.address || ''
  showEdit.value = true
}

const handleEdit = async () => {
  saving.value = true
  try {
    const res = await updateCustomer(route.params.id, editForm)
    if (res.data?.success) {
      customer.value = { ...customer.value, ...editForm }
      showEdit.value = false
      alert('保存成功')
    }
  } catch (e) { console.error(e); alert('保存失败') }
  finally { saving.value = false }
}

onMounted(() => fetchCustomer())
</script>

<style scoped>
.detail-container{padding:24px}
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
.page-header .header-left{display:flex;align-items:center;gap:16px}
.page-header h1{font-size:24px;font-weight:600;color:#1a1a2e;margin:0}
.info-card{background:#fff;border-radius:12px;padding:24px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.info-header{display:flex;align-items:center;gap:20px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid #f0f0f0}
.customer-avatar{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.avatar-text{font-size:28px;font-weight:700;color:#fff}
.customer-info{flex:1}
.customer-name{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:700;color:#1a1a2e;margin-bottom:6px}
.customer-id{font-size:14px;color:#666}
.customer-status{margin-left:auto}
.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.info-item{display:flex;flex-direction:column;gap:6px}
.info-label{font-size:13px;color:#666}
.info-value{font-size:14px;font-weight:500;color:#333}
.loading-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#999}
.spinner{width:40px;height:40px;border:3px solid #f0f0f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.stat-box{background:#fff;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.stat-box .stat-label{font-size:13px;color:#666;margin-bottom:8px}
.stat-box .stat-value{font-size:22px;font-weight:700;color:#1a1a2e}
.edit-modal{position:fixed;top:0;left:0;right:0;bottom:0;z-index:1000;display:flex;align-items:center;justify-content:center}
.modal-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5)}
.modal-content{position:relative;background:#fff;border-radius:12px;padding:24px;width:450px;max-width:90%;box-shadow:0 4px 20px rgba(0,0,0,0.15)}
.modal-content h3{font-size:18px;font-weight:600;color:#1a1a2e;margin:0 0 20px 0}
.form-group{margin-bottom:16px}
.form-group label{display:block;font-size:14px;font-weight:500;color:#333;margin-bottom:6px}
.form-input{width:100%;padding:10px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;box-sizing:border-box}
.form-input:focus{outline:none;border-color:#3b82f6}
.form-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:24px}
.badge{padding:4px 10px;border-radius:4px;font-size:12px;font-weight:500}
.badge-info{background:#cce5ff;color:#004085}
.badge-warning{background:#fff3cd;color:#856404}
.badge-danger{background:#f8d7da;color:#721c24}
.status-active{background:#d4edda;color:#155724}
.status-inactive{background:#e2e3e5;color:#383d41}
.status-frozen{background:#f8d7da;color:#721c24}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-primary:hover:not(:disabled){opacity:0.9}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed}
.btn-secondary{background:#f5f5f5;color:#333}
.btn-secondary:hover{background:#e8e8e8}
.btn-text{background:transparent;color:#3b82f6;padding:0}
.btn-text:hover{color:#2563eb}
</style>
