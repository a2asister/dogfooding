<template>
  <div class="create-container">
    <div class="page-header">
      <button @click="goBack" class="btn btn-text">← 返回列表</button>
      <h1>申请贷款</h1>
      <p class="subtitle">填写贷款申请信息</p>
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
              <label>贷款类型 <span class="required">*</span></label>
              <select v-model="form.loanType" class="form-input" required>
                <option value="">请选择</option>
                <option value="personal">个人消费贷 (年利率6.5%)</option>
                <option value="mortgage">房屋抵押贷款 (年利率4.2%)</option>
                <option value="business">企业经营贷 (年利率5.8%)</option>
                <option value="auto">汽车贷款 (年利率5.5%)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>贷款详情</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>贷款金额 <span class="required">*</span></label>
              <div class="input-group">
                <span class="input-prefix">¥</span>
                <input 
                  v-model.number="form.loanAmount" 
                  type="number" 
                  class="form-input" 
                  placeholder="请输入贷款金额"
                  min="1000"
                  required 
                />
              </div>
            </div>
            <div class="form-group">
              <label>贷款期限 <span class="required">*</span></label>
              <select v-model.number="form.term" class="form-input" required>
                <option :value="6">6个月</option>
                <option :value="12">12个月</option>
                <option :value="24">24个月</option>
                <option :value="36">36个月</option>
                <option :value="60">60个月</option>
                <option :value="120">120个月</option>
                <option :value="240">240个月</option>
                <option :value="360">360个月</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>其他信息</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>贷款用途</label>
              <input v-model="form.purpose" type="text" class="form-input" placeholder="请输入贷款用途" />
            </div>
            <div class="form-group">
              <label>抵押物信息</label>
              <input v-model="form.collateral" type="text" class="form-input" placeholder="如有抵押物请说明" />
            </div>
          </div>
        </div>

        <div v-if="form.loanAmount && form.term && form.loanType" class="summary-section">
          <h3>贷款概算</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">年利率</span>
              <span class="value text-danger">{{ (interestRate * 100).toFixed(2) }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">月供金额</span>
              <span class="value highlight">¥{{ monthlyPayment.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">总利息</span>
              <span class="value">¥{{ totalInterest.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">还款总额</span>
              <span class="value">¥{{ totalPayment.toFixed(2) }}</span>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createLoan } from '../api/loan'

const router = useRouter()
const submitting = ref(false)
const form = ref({
  customerId: '',
  loanType: '',
  loanAmount: null,
  term: 12,
  purpose: '',
  collateral: ''
})

const loanRates = {
  personal: 0.065,
  mortgage: 0.042,
  business: 0.058,
  auto: 0.055
}

const interestRate = computed(() => loanRates[form.value.loanType] || 0)

const monthlyPayment = computed(() => {
  if (!form.value.loanAmount || !form.value.term || !interestRate.value) return 0
  const principal = form.value.loanAmount
  const monthlyRate = interestRate.value / 12
  const n = form.value.term
  if (monthlyRate === 0) return principal / n
  return principal * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1)
})

const totalPayment = computed(() => monthlyPayment.value * form.value.term)
const totalInterest = computed(() => totalPayment.value - (form.value.loanAmount || 0))

const goBack = () => {
  router.push('/loan/')
}

const handleSubmit = async () => {
  if (!form.value.customerId || !form.value.loanType || !form.value.loanAmount) {
    alert('请填写必填项')
    return
  }

  submitting.value = true
  try {
    const res = await createLoan({
      customerId: form.value.customerId,
      loanType: form.value.loanType,
      loanAmount: form.value.loanAmount,
      term: form.value.term,
      purpose: form.value.purpose,
      collateral: form.value.collateral
    })
    if (res.data?.success) {
      alert('贷款申请提交成功！')
      router.push('/loan/')
    } else {
      alert(res.data?.error || '提交失败')
    }
  } catch (err) {
    console.error('Submit error:', err)
    alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-container {
  padding: 24px;
  max-width: 800px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 12px 0 4px 0;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 16px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group .required {
  color: #ff4d4f;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-group {
  display: flex;
  align-items: center;
  position: relative;
}

.input-prefix {
  position: absolute;
  left: 12px;
  color: #999;
}

.input-group .form-input {
  padding-left: 28px;
}

.summary-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.summary-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 16px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  border-radius: 8px;
  padding: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.summary-item .label {
  font-size: 13px;
  color: #666;
}

.summary-item .value {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
}

.summary-item .value.highlight {
  color: #667eea;
  font-size: 22px;
}

.summary-item .value.text-danger {
  color: #e74c3c;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-text {
  background: transparent;
  color: #3b82f6;
  padding: 0;
  margin-bottom: 12px;
}

.btn-text:hover {
  color: #2563eb;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
