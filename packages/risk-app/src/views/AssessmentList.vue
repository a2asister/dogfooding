<template>
  <div class="assessment-container">
    <div class="page-header">
      <div class="header-left"><h1>风险评估</h1><p class="subtitle">客户信用风险评估管理</p></div>
      <div class="header-actions"><button @click="showCreate = true" class="btn btn-primary">+ 新建评估</button></div>
    </div>
    <div class="nav-tabs">
      <router-link to="/risk/" class="tab-item">仪表盘</router-link>
      <router-link to="/risk/assessments" class="tab-item active">风险评估</router-link>
      <router-link to="/risk/alerts" class="tab-item">风险预警</router-link>
      <router-link to="/risk/blacklist" class="tab-item">黑名单</router-link>
    </div>
    <div v-if="showCreate" class="create-modal">
      <div class="modal-overlay" @click="showCreate = false"></div>
      <div class="modal-content">
        <h3>新建风险评估</h3>
        <form @submit.prevent="handleCreate">
          <div class="form-group"><label>客户ID <span class="required">*</span></label><input v-model="createForm.customerId" type="text" class="form-input" placeholder="请输入客户ID" required /></div>
          <div class="form-group"><label>评估类型</label>
            <select v-model="createForm.assessmentType" class="form-input">
              <option value="credit">信用评估</option>
              <option value="loan">贷款评估</option>
              <option value="card">信用卡评估</option>
            </select>
          </div>
          <div class="form-actions"><button type="button" @click="showCreate = false" class="btn btn-secondary">取消</button><button type="submit" class="btn btn-primary" :disabled="creating">{{ creating ? '处理中...' : '开始评估' }}</button></div>
        </form>
      </div>
    </div>
    <div class="content-card">
      <div v-if="loading" class="loading-state"><div class="spinner"></div><p>加载中...</p></div>
      <div v-else-if="assessments.length === 0" class="empty-state"><span class="empty-icon">📭</span><p>暂无评估记录</p></div>
      <div v-else>
        <table class="data-table">
          <thead>
            <tr><th>评估编号</th><th>客户ID</th><th>风险评分</th><th>风险等级</th><th>评估类型</th><th>信用额度</th><th>评估日期</th><th>状态</th></tr>
          </thead>
          <tbody>
            <tr v-for="a in assessments" :key="a.id">
              <td class="text-primary font-medium">{{ a.id }}</td>
              <td>{{ a.customerId }}</td>
              <td><span :class="'risk-score score-' + a.riskLevel">{{ a.riskScore }}分</span></td>
              <td><span :class="'badge risk-' + a.riskLevel">{{ a.riskLevelName }}</span></td>
              <td>{{ a.assessmentType }}</td>
              <td>¥{{ a.creditLimit?.toLocaleString() || '-' }}</td>
              <td>{{ formatDate(a.assessmentDate) }}</td>
              <td><span :class="'badge ' + (a.status === 'active' ? 'badge-active' : 'badge-expired')">{{ a.status === 'active' ? '有效' : '已过期' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAssessments, createAssessment } from '../api/risk'

const loading = ref(false)
const creating = ref(false)
const showCreate = ref(false)
const assessments = ref([])
const createForm = ref({ customerId: '', assessmentType: 'credit' })

const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '-'

const fetchAssessments = async () => {
  loading.value = true
  try {
    const res = await getAssessments()
    if (res.data?.success) assessments.value = res.data.data.assessments || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleCreate = async () => {
  if (!createForm.value.customerId) { alert('请输入客户ID'); return }
  creating.value = true
  try {
    const res = await createAssessment(createForm.value)
    if (res.data?.success) { alert('评估创建成功！'); showCreate.value = false; fetchAssessments() }
  } catch (e) { console.error(e); alert('创建失败') }
  finally { creating.value = false }
}

onMounted(() => fetchAssessments())
</script>

<style scoped>
.assessment-container{padding:24px}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.page-header h1{font-size:24px;font-weight:600;color:#1a1a2e;margin:0}
.subtitle{font-size:14px;color:#666;margin-top:4px}
.nav-tabs{display:flex;gap:4px;margin-bottom:24px;border-bottom:1px solid #f0f0f0}
.tab-item{padding:12px 20px;text-decoration:none;color:#666;font-size:14px;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.2s}
.tab-item:hover{color:#3b82f6}
.tab-item.active{color:#3b82f6;border-bottom-color:#3b82f6;font-weight:600}
.create-modal{position:fixed;top:0;left:0;right:0;bottom:0;z-index:1000;display:flex;align-items:center;justify-content:center}
.modal-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5)}
.modal-content{position:relative;background:#fff;border-radius:12px;padding:24px;width:400px;max-width:90%;box-shadow:0 4px 20px rgba(0,0,0,0.15)}
.modal-content h3{font-size:18px;font-weight:600;color:#1a1a2e;margin:0 0 20px 0}
.form-group{margin-bottom:16px}
.form-group label{display:block;font-size:14px;font-weight:500;color:#333;margin-bottom:6px}
.form-group .required{color:#ff4d4f}
.form-input{width:100%;padding:10px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;box-sizing:border-box}
.form-input:focus{outline:none;border-color:#3b82f6}
.form-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:24px}
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
.risk-score{font-size:16px;font-weight:700;padding:4px 8px;border-radius:4px}
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
.badge-active{background:#d4edda;color:#155724}
.badge-expired{background:#e2e3e5;color:#383d41}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-primary:hover:not(:disabled){opacity:0.9}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed}
.btn-secondary{background:#f5f5f5;color:#333}
.btn-secondary:hover{background:#e8e8e8}
</style>
