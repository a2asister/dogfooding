<template>
  <div class="blacklist-container">
    <div class="page-header">
      <div class="header-left"><h1>黑名单管理</h1><p class="subtitle">风险客户黑名单管理</p></div>
      <div class="header-actions"><button @click="showAdd = true" class="btn btn-primary">+ 添加黑名单</button></div>
    </div>
    <div class="nav-tabs">
      <router-link to="/risk/" class="tab-item">仪表盘</router-link>
      <router-link to="/risk/assessments" class="tab-item">风险评估</router-link>
      <router-link to="/risk/alerts" class="tab-item">风险预警</router-link>
      <router-link to="/risk/blacklist" class="tab-item active">黑名单</router-link>
    </div>
    <div v-if="showAdd" class="add-modal">
      <div class="modal-overlay" @click="showAdd = false"></div>
      <div class="modal-content">
        <h3>添加至黑名单</h3>
        <form @submit.prevent="handleAdd">
          <div class="form-group"><label>客户ID <span class="required">*</span></label><input v-model="addForm.customerId" type="text" class="form-input" placeholder="请输入客户ID" required /></div>
          <div class="form-group"><label>黑名单类型</label>
            <select v-model="addForm.reasonType" class="form-input">
              <option value="fraud">欺诈</option><option value="overdue">逾期</option><option value="default">违约</option><option value="other">其他</option>
            </select>
          </div>
          <div class="form-group"><label>原因描述</label><textarea v-model="addForm.reason" class="form-input" rows="3" placeholder="请输入原因描述"></textarea></div>
          <div class="form-actions"><button type="button" @click="showAdd = false" class="btn btn-secondary">取消</button><button type="submit" class="btn btn-primary" :disabled="adding">{{ adding ? '处理中...' : '确认添加' }}</button></div>
        </form>
      </div>
    </div>
    <div class="content-card">
      <div v-if="loading" class="loading-state"><div class="spinner"></div><p>加载中...</p></div>
      <div v-else-if="blacklist.length === 0" class="empty-state"><span class="empty-icon">🛡️</span><p>暂无黑名单记录</p></div>
      <div v-else>
        <table class="data-table">
          <thead><tr><th>客户ID</th><th>类型</th><th>原因</th><th>风险等级</th><th>加入时间</th><th>状态</th></tr></thead>
          <tbody>
            <tr v-for="item in blacklist" :key="item.id">
              <td class="font-medium">{{ item.customerId }}</td>
              <td>{{ getTypeLabel(item.reasonType) }}</td>
              <td>{{ item.reason || '-' }}</td>
              <td><span :class="'badge risk-' + (item.riskLevel || 'E')">{{ getRiskLabel(item.riskLevel) }}</span></td>
              <td>{{ formatDate(item.addedAt) }}</td>
              <td><span class="badge badge-danger">{{ item.status || '已拉黑' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBlacklist, addToBlacklist } from '../api/risk'

const loading = ref(false)
const adding = ref(false)
const showAdd = ref(false)
const blacklist = ref([])
const addForm = ref({ customerId: '', reasonType: 'fraud', reason: '' })

const getTypeLabel = (t) => ({ fraud: '欺诈', overdue: '逾期', default: '违约', other: '其他' }[t] || t)
const getRiskLabel = (l) => ({ A: '低风险', B: '中低风险', C: '中等风险', D: '中高风险', E: '高风险' }[l] || '高风险')
const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-'

const fetchBlacklist = async () => {
  loading.value = true
  try {
    const res = await getBlacklist()
    if (res.data?.success) blacklist.value = res.data.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleAdd = async () => {
  if (!addForm.value.customerId) { alert('请输入客户ID'); return }
  adding.value = true
  try {
    const res = await addToBlacklist(addForm.value)
    if (res.data?.success) { alert('添加成功！'); showAdd.value = false; fetchBlacklist() }
  } catch (e) { console.error(e); alert('添加失败') }
  finally { adding.value = false }
}

onMounted(() => fetchBlacklist())
</script>

<style scoped>
.blacklist-container{padding:24px}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.page-header h1{font-size:24px;font-weight:600;color:#1a1a2e;margin:0}
.subtitle{font-size:14px;color:#666;margin-top:4px}
.nav-tabs{display:flex;gap:4px;margin-bottom:24px;border-bottom:1px solid #f0f0f0}
.tab-item{padding:12px 20px;text-decoration:none;color:#666;font-size:14px;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.2s}
.tab-item:hover{color:#3b82f6}
.tab-item.active{color:#3b82f6;border-bottom-color:#3b82f6;font-weight:600}
.add-modal{position:fixed;top:0;left:0;right:0;bottom:0;z-index:1000;display:flex;align-items:center;justify-content:center}
.modal-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5)}
.modal-content{position:relative;background:#fff;border-radius:12px;padding:24px;width:450px;max-width:90%;box-shadow:0 4px 20px rgba(0,0,0,0.15)}
.modal-content h3{font-size:18px;font-weight:600;color:#1a1a2e;margin:0 0 20px 0}
.form-group{margin-bottom:16px}
.form-group label{display:block;font-size:14px;font-weight:500;color:#333;margin-bottom:6px}
.form-group .required{color:#ff4d4f}
.form-input{width:100%;padding:10px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;box-sizing:border-box}
.form-input:focus{outline:none;border-color:#3b82f6}
.form-input textarea{resize:vertical}
.form-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:24px}
.content-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.loading-state,.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#999}
.spinner{width:40px;height:40px;border:3px solid #f0f0f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-icon{font-size:48px;margin-bottom:12px}
.data-table{width:100%;border-collapse:collapse}
.data-table th{background:#fafafa;padding:12px 16px;text-align:left;font-size:13px;font-weight:600;color:#555;border-bottom:1px solid #e8e8e8}
.data-table td{padding:14px 16px;font-size:14px;color:#333;border-bottom:1px solid #f0f0f0}
.font-medium{font-weight:600}
.badge{padding:4px 10px;border-radius:4px;font-size:12px;font-weight:500}
.risk-A{background:#d4edda;color:#155724}
.risk-B{background:#cce5ff;color:#004085}
.risk-C{background:#fff3cd;color:#856404}
.risk-D{background:#ffe5d0;color:#854504}
.risk-E{background:#f8d7da;color:#721c24}
.badge-danger{background:#f8d7da;color:#721c24}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-primary:hover:not(:disabled){opacity:0.9}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed}
.btn-secondary{background:#f5f5f5;color:#333}
.btn-secondary:hover{background:#e8e8e8}
</style>
