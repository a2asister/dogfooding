<template>
  <div class="account-detail">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <div v-else-if="!account.id" class="error-container">
      <div class="error-text">账户不存在</div>
      <router-link to="/account/list" class="btn btn-primary mt-3">
        返回列表
      </router-link>
    </div>

    <div v-else class="detail-content">
      <div class="card mb-4">
        <div class="card-header">
          <div class="d-flex justify-between align-center">
            <span>账户基本信息</span>
            <div class="d-flex gap-2">
              <select v-model="newStatus" class="form-control" style="width: 120px;">
                <option value="active">正常</option>
                <option value="frozen">冻结</option>
                <option value="closed">销户</option>
              </select>
              <button @click="updateStatus" class="btn btn-primary btn-sm">
                更新状态
              </button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="info-grid grid grid-2">
            <div class="info-item">
              <span class="info-label">账户ID</span>
              <span class="info-value">{{ account.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">账户号码</span>
              <span class="info-value">{{ account.accountNumber }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">账户类型</span>
              <span class="info-value">{{ account.accountTypeName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">开户网点</span>
              <span class="info-value">{{ account.branch }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">账户状态</span>
              <span class="info-value">
                <span :class="['badge', getStatusBadge(account.status)]">
                  {{ getStatusText(account.status) }}
                </span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">开户日期</span>
              <span class="info-value">{{ formatDate(account.openDate) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">货币类型</span>
              <span class="info-value">{{ account.currency }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">利率</span>
              <span class="info-value">{{ (account.interestRate * 100).toFixed(2) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-grid grid grid-3 mb-4">
        <div class="stat-card">
          <div class="stat-label">账户余额</div>
          <div class="stat-value">¥{{ account.balance?.toLocaleString() || 0 }}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">可用余额</div>
          <div class="stat-value">¥{{ account.availableBalance?.toLocaleString() || 0 }}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">冻结金额</div>
          <div class="stat-value">¥{{ (account.frozenAmount || 0).toLocaleString() }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span>资金操作</span>
        </div>
        <div class="card-body">
          <div class="operation-form d-flex gap-4 flex-wrap">
            <div class="form-group mb-0">
              <label class="form-label">冻结金额</label>
              <div class="d-flex gap-2">
                <input v-model.number="freezeAmount" type="number" class="form-control" placeholder="输入金额" style="width: 150px;" />
                <button @click="freezeAccount" :disabled="!freezeAmount || freezeAmount <= 0" class="btn btn-warning">
                  冻结
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import accountApi from '../api/account'

const route = useRoute()
const account = ref({})
const loading = ref(true)
const newStatus = ref('active')
const freezeAmount = ref(null)

const fetchAccountDetail = async () => {
  loading.value = true
  try {
    const { id } = route.params
    const res = await accountApi.getAccountById(id)
    if (res.success) {
      account.value = res.data
      newStatus.value = res.data.status
    }
  } catch (error) {
    console.error('获取账户详情失败:', error)
  } finally {
    loading.value = false
  }
}

const updateStatus = async () => {
  try {
    const res = await accountApi.updateAccountStatus(account.value.id, newStatus.value)
    if (res.success) {
      account.value.status = newStatus.value
      alert('状态更新成功')
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    alert('状态更新失败')
  }
}

const freezeAccount = async () => {
  if (!freezeAmount.value || freezeAmount.value <= 0) {
    alert('请输入有效的冻结金额')
    return
  }
  try {
    const res = await accountApi.freezeAccount(account.value.id, freezeAmount.value)
    if (res.success) {
      account.value = res.data
      freezeAmount.value = null
      alert('冻结成功')
    }
  } catch (error) {
    console.error('冻结失败:', error)
    alert(error.response?.data?.error || '冻结失败')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const getStatusText = (status) => {
  const texts = {
    active: '正常',
    frozen: '冻结',
    closed: '销户'
  }
  return texts[status] || status
}

const getStatusBadge = (status) => {
  const badges = {
    active: 'badge-success',
    frozen: 'badge-warning',
    closed: 'badge-danger'
  }
  return badges[status] || 'badge-info'
}

onMounted(() => {
  fetchAccountDetail()
})
</script>

<style scoped>
.account-detail {
  width: 100%;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text,
.error-text {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background-color: var(--bg-color);
  border-radius: var(--radius-sm);
}

.info-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.operation-form {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.justify-between {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}
</style>
