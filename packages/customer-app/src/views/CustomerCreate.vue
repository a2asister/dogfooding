<template>
  <div class="create-container">
    <div class="page-header">
      <div class="header-left">
        <button @click="$router.back()" class="btn btn-text">← 返回</button>
        <h1>新增客户</h1>
      </div>
    </div>
    <div class="form-card">
      <form @submit.prevent="handleCreate">
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-grid">
            <div class="form-group"><label>客户类型 <span class="required">*</span></label>
              <select v-model="form.type" class="form-input" required>
                <option value="personal">个人客户</option><option value="enterprise">企业客户</option><option value="vip">VIP客户</option>
              </select>
            </div>
            <div class="form-group"><label>姓名/企业名称 <span class="required">*</span></label><input v-model="form.name" type="text" class="form-input" placeholder="请输入姓名或企业名称" required /></div>
            <div class="form-group"><label>手机号 <span class="required">*</span></label><input v-model="form.phone" type="tel" class="form-input" placeholder="请输入手机号" required /></div>
            <div class="form-group"><label>邮箱</label><input v-model="form.email" type="email" class="form-input" placeholder="请输入邮箱" /></div>
            <div class="form-group"><label>性别</label>
              <select v-model="form.gender" class="form-input">
                <option value="">请选择</option><option value="男">男</option><option value="女">女</option>
              </select>
            </div>
            <div class="form-group"><label>出生日期</label><input v-model="form.birthDate" type="date" class="form-input" /></div>
            <div class="form-group" style="grid-column:span 2"><label>身份证号</label><input v-model="form.idCard" type="text" class="form-input" placeholder="请输入身份证号" /></div>
          </div>
        </div>
        <div class="form-section">
          <h3 class="section-title">联系信息</h3>
          <div class="form-grid">
            <div class="form-group" style="grid-column:span 3"><label>地址</label><input v-model="form.address" type="text" class="form-input" placeholder="请输入详细地址" /></div>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" @click="$router.back()" class="btn btn-secondary">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="creating">{{ creating ? '创建中...' : '确认创建' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createCustomer } from '../api/customer'

const router = useRouter()
const creating = ref(false)
const form = reactive({
  type: 'personal', name: '', phone: '', email: '', gender: '', birthDate: '', idCard: '', address: ''
})

const handleCreate = async () => {
  if (!form.name || !form.phone) { alert('请填写必填项'); return }
  creating.value = true
  try {
    const res = await createCustomer(form)
    if (res.data?.success) {
      alert('客户创建成功！')
      router.push('/customer/list')
    }
  } catch (e) { console.error(e); alert('创建失败') }
  finally { creating.value = false }
}
</script>

<style scoped>
.create-container{padding:24px}
.page-header{display:flex;align-items:center;margin-bottom:24px}
.page-header .header-left{display:flex;align-items:center;gap:16px}
.page-header h1{font-size:24px;font-weight:600;color:#1a1a2e;margin:0}
.form-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.form-section{margin-bottom:24px}
.section-title{font-size:16px;font-weight:600;color:#1a1a2e;margin:0 0 20px 0;padding-bottom:12px;border-bottom:1px solid #f0f0f0}
.form-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-group label{font-size:14px;font-weight:500;color:#333}
.form-group .required{color:#ff4d4f}
.form-input{padding:10px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px}
.form-input:focus{outline:none;border-color:#3b82f6}
.form-actions{display:flex;justify-content:flex-end;gap:12px;padding-top:20px;border-top:1px solid #f0f0f0}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-primary:hover:not(:disabled){opacity:0.9}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed}
.btn-secondary{background:#f5f5f5;color:#333}
.btn-secondary:hover{background:#e8e8e8}
.btn-text{background:transparent;color:#3b82f6;padding:0}
.btn-text:hover{color:#2563eb}
</style>
