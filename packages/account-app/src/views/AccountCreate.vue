<template>
  <div class="account-create">
    <div class="card">
      <div class="card-header">
        <span>新开账户</span>
      </div>
      <div class="card-body">
        <form @submit.prevent="createAccount" class="create-form">
          <div class="form-group">
            <label class="form-label">客户ID <span class="text-danger">*</span></label>
            <input v-model="form.customerId" 
                   type="text" 
                   class="form-control" 
                   placeholder="请输入客户ID，如：CUST001"
                   required
                   style="max-width: 400px;" />
            <div class="form-hint">示例客户ID：CUST001、CUST002、CUST003</div>
          </div>

          <div class="form-group">
            <label class="form-label">账户类型 <span class="text-danger">*</span></label>
            <select v-model="form.accountType" 
                    class="form-control" 
                    required
                    style="max-width: 400px;">
              <option value="">请选择账户类型</option>
              <option value="savings">储蓄账户</option>
              <option value="current">活期账户</option>
              <option value="fixed">定期账户</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">开户网点</label>
            <input v-model="form.branch" 
                   type="text" 
                   class="form-control" 
                   placeholder="请输入开户网点名称"
                   style="max-width: 400px;" />
          </div>

          <div class="form-group">
            <div class="form-actions">
              <button type="submit" 
                      :disabled="submitting" 
                      class="btn btn-primary btn-lg">
                {{ submitting ? '提交中...' : '确认开户' }}
              </button>
              <router-link to="/account/list" class="btn btn-lg">
                取消
              </router-link>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-if="success" class="card mt-4">
      <div class="card-body text-center p-4">
        <div class="success-icon">✓</div>
        <h3 class="success-title">开户成功</h3>
        <p class="success-message">账户号：{{ newAccount.accountNumber }}</p>
        <p class="success-message">账户ID：{{ newAccount.id }}</p>
        <div class="success-actions">
          <router-link :to="`/account/detail/${newAccount.id}`" class="btn btn-primary">
            查看详情
          </router-link>
          <router-link to="/account/list" class="btn">
            返回列表
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import accountApi from '../api/account'

const form = reactive({
  customerId: '',
  accountType: '',
  branch: ''
})

const submitting = ref(false)
const success = ref(false)
const newAccount = ref({})

const createAccount = async () => {
  if (!form.customerId || !form.accountType) {
    alert('请填写必填项')
    return
  }

  submitting.value = true
  try {
    const res = await accountApi.createAccount({
      customerId: form.customerId,
      accountType: form.accountType,
      branch: form.branch || '默认网点'
    })

    if (res.success) {
      success.value = true
      newAccount.value = res.data
    } else {
      alert('开户失败：' + (res.error || '未知错误'))
    }
  } catch (error) {
    console.error('开户失败:', error)
    alert(error.response?.data?.error || '开户失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.account-create {
  width: 100%;
}

.create-form {
  max-width: 600px;
}

.form-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.text-danger {
  color: var(--danger-color);
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--success-color);
  color: #fff;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.success-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.success-message {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0;
}

.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}
</style>
