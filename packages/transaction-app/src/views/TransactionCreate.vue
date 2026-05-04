<template>
  <div class="transaction-create">
    <div class="card">
      <div class="card-header">新建交易</div>
      <div class="card-body">
        <form @submit.prevent="createTransaction" class="create-form">
          <div class="form-group">
            <label class="form-label">交易类型 <span class="text-danger">*</span></label>
            <select v-model="form.transactionType" class="form-control" required style="max-width: 400px;">
              <option value="">请选择交易类型</option>
              <option value="transfer">转账</option>
              <option value="deposit">存款</option>
              <option value="withdraw">取款</option>
            </select>
          </div>
          <div v-if="form.transactionType === 'transfer' || form.transactionType === 'withdraw'" class="form-group">
            <label class="form-label">转出账户ID <span class="text-danger">*</span></label>
            <input v-model="form.fromAccountId" type="text" class="form-control" placeholder="如：ACC001、ACC002" style="max-width: 400px;" />
            <div class="form-hint">示例：ACC001、ACC002、ACC003、ACC004</div>
          </div>
          <div v-if="form.transactionType === 'transfer' || form.transactionType === 'deposit'" class="form-group">
            <label class="form-label">转入账户ID <span class="text-danger">*</span></label>
            <input v-model="form.toAccountId" type="text" class="form-control" placeholder="如：ACC001、ACC002" style="max-width: 400px;" />
          </div>
          <div class="form-group">
            <label class="form-label">交易金额 <span class="text-danger">*</span></label>
            <input v-model.number="form.amount" type="number" class="form-control" placeholder="请输入金额" style="max-width: 400px;" step="0.01" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">交易渠道</label>
            <select v-model="form.channel" class="form-control" style="max-width: 400px;">
              <option value="web">网上银行</option>
              <option value="mobile">手机银行</option>
              <option value="atm">ATM</option>
              <option value="counter">柜台</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">描述</label>
            <input v-model="form.description" type="text" class="form-control" placeholder="交易描述（可选）" style="max-width: 400px;" />
          </div>
          <div class="form-group">
            <div class="form-actions">
              <button type="submit" :disabled="submitting" class="btn btn-primary btn-lg">{{ submitting ? '提交中...' : '确认交易' }}</button>
              <router-link to="/transaction/list" class="btn btn-lg">取消</router-link>
            </div>
          </div>
        </form>
        <div v-if="success" class="success-box">
          <div class="success-icon">✓</div>
          <h3 class="success-title">交易成功</h3>
          <p class="success-message">交易号：{{ newTransaction?.id }}</p>
          <div class="success-actions">
            <router-link :to="`/transaction/detail/${newTransaction?.id}`" class="btn btn-primary">查看详情</router-link>
            <router-link to="/transaction/list" class="btn">返回列表</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import transactionApi from '../api/transaction'

const form = reactive({
  transactionType: '',
  fromAccountId: '',
  toAccountId: '',
  amount: null,
  channel: 'web',
  description: ''
})
const submitting = ref(false)
const success = ref(false)
const newTransaction = ref(null)

const createTransaction = async () => {
  if (!form.transactionType || !form.amount || form.amount <= 0) {
    alert('请填写完整信息')
    return
  }
  if ((form.transactionType === 'transfer' || form.transactionType === 'withdraw') && !form.fromAccountId) {
    alert('请填写转出账户ID')
    return
  }
  if ((form.transactionType === 'transfer' || form.transactionType === 'deposit') && !form.toAccountId) {
    alert('请填写转入账户ID')
    return
  }

  submitting.value = true
  try {
    const data = {
      transactionType: form.transactionType,
      amount: form.amount,
      channel: form.channel,
      description: form.description
    }
    if (form.fromAccountId) data.fromAccountId = form.fromAccountId
    if (form.toAccountId) data.toAccountId = form.toAccountId

    const res = await transactionApi.createTransaction(data)
    if (res.success) {
      success.value = true
      newTransaction.value = res.data
    } else {
      alert('交易失败：' + (res.error || '未知错误'))
    }
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.error || '交易失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-form { max-width: 600px; }
.form-hint { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
.text-danger { color: var(--danger-color); }
.form-actions { display: flex; gap: 12px; padding-top: 16px; }
.success-box { margin-top: 24px; padding: 32px; text-align: center; border: 1px solid var(--success-color); border-radius: var(--radius-md); background: #f6ffed; }
.success-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--success-color); color: #fff; font-size: 32px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.success-title { font-size: 20px; font-weight: 600; margin: 0 0 8px; color: var(--text-primary); }
.success-message { font-size: 14px; color: var(--text-secondary); margin: 4px 0; }
.success-actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }
</style>
