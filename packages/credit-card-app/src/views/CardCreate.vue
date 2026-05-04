<template>
  <div class="create-container">
    <div class="page-header">
      <button @click="goBack" class="btn btn-text">← 返回列表</button>
      <h1>申请信用卡</h1>
      <p class="subtitle">填写信用卡申请信息</p>
    </div>
    <div class="content-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <h3>基本信息</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>客户ID <span class="required">*</span></label>
              <input v-model="form.customerId" type="text" class="form-input" placeholder="请输入客户ID" required />
            </div>
            <div class="form-group">
              <label>卡片类型 <span class="required">*</span></label>
              <select v-model="form.cardType" class="form-input" required>
                <option value="">请选择</option>
                <option value="classic">普卡 (额度1万起, 年利率20%)</option>
                <option value="gold">金卡 (额度5万起, 年利率18%)</option>
                <option value="platinum">白金卡 (额度15万起, 年利率15%)</option>
                <option value="black">黑卡 (额度50万起, 年利率12%)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="form-section">
          <h3>额度信息</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>申请额度</label>
              <div class="input-group">
                <span class="input-prefix">¥</span>
                <input v-model.number="form.creditLimit" type="number" class="form-input" placeholder="不填则使用默认额度" />
              </div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" @click="goBack" class="btn btn-secondary">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交申请' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createCard } from '../api/creditCard'

const router = useRouter()
const submitting = ref(false)
const form = ref({ customerId: '', cardType: '', creditLimit: null })

const goBack = () => router.push('/credit-card/')

const handleSubmit = async () => {
  if (!form.value.customerId || !form.value.cardType) { alert('请填写必填项'); return }
  submitting.value = true
  try {
    const data = { customerId: form.value.customerId, cardType: form.value.cardType }
    if (form.value.creditLimit) data.creditLimit = form.value.creditLimit
    const res = await createCard(data)
    if (res.data?.success) { alert('信用卡申请成功！'); router.push('/credit-card/') }
    else { alert(res.data?.error || '提交失败') }
  } catch (e) { console.error(e); alert('提交失败，请重试') }
  finally { submitting.value = false }
}
</script>

<style scoped>
.create-container{padding:24px;max-width:800px}
.page-header{margin-bottom:24px}
.page-header h1{font-size:24px;font-weight:600;color:#1a1a2e;margin:12px 0 4px 0}
.subtitle{font-size:14px;color:#666;margin:0}
.content-card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.form-section{margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #f0f0f0}
.form-section:last-of-type{border-bottom:none;margin-bottom:0;padding-bottom:0}
.form-section h3{font-size:16px;font-weight:600;color:#1a1a2e;margin:0 0 16px 0}
.form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-group label{font-size:14px;font-weight:500;color:#333}
.form-group .required{color:#ff4d4f}
.form-input{padding:10px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;transition:border-color 0.2s}
.form-input:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,0.1)}
.input-group{display:flex;align-items:center;position:relative}
.input-prefix{position:absolute;left:12px;color:#999}
.input-group .form-input{padding-left:28px}
.form-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:24px;padding-top:24px;border-top:1px solid #f0f0f0}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none}
.btn-text{background:transparent;color:#3b82f6;padding:0;margin-bottom:12px}
.btn-text:hover{color:#2563eb}
.btn-secondary{background:#f5f5f5;color:#333}
.btn-secondary:hover{background:#e8e8e8}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
.btn-primary:hover:not(:disabled){opacity:0.9}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed}
</style>
