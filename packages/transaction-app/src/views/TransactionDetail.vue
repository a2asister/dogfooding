<template>
  <div class="transaction-detail">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>
    <div v-else-if="!transaction.id" class="error-container">
      <div class="error-text">交易不存在</div>
      <router-link to="/transaction/list" class="btn btn-primary mt-3">返回列表</router-link>
    </div>
    <div v-else class="detail-content">
      <div class="card mb-4">
        <div class="card-header">交易信息</div>
        <div class="card-body">
          <div class="info-grid grid grid-2">
            <div class="info-item">
              <span class="info-label">交易号</span>
              <span class="info-value">{{ transaction.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">交易类型</span>
              <span class="info-value">{{ transaction.transactionTypeName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">交易金额</span>
              <span class="info-value">¥{{ transaction.amount?.toLocaleString() || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">状态</span>
              <span class="info-value">
                <span :class="['badge', getStatusBadge(transaction.status)]">{{ getStatusText(transaction.status) }}</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">转出账户</span>
              <span class="info-value">{{ transaction.fromAccountNumber || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">转入账户</span>
              <span class="info-value">{{ transaction.toAccountNumber || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">交易时间</span>
              <span class="info-value">{{ formatDate(transaction.createTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">交易渠道</span>
              <span class="info-value">{{ getChannelName(transaction.channel) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">手续费</span>
              <span class="info-value">¥{{ (transaction.fee || 0).toLocaleString() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">描述</span>
              <span class="info-value">{{ transaction.description || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import transactionApi from '../api/transaction'

const route = useRoute()
const transaction = ref({})
const loading = ref(true)

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await transactionApi.getTransactionById(route.params.id)
    if (res.success) transaction.value = res.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-'
const getStatusText = (s) => ({ success: '成功', pending: '处理中', failed: '失败' }[s] || s)
const getStatusBadge = (s) => ({ success: 'badge-success', pending: 'badge-warning', failed: 'badge-danger' }[s] || 'badge-info')
const getChannelName = (c) => ({ mobile: '手机银行', web: '网上银行', atm: 'ATM', counter: '柜台' }[c] || c || '-')

onMounted(fetchDetail)
</script>

<style scoped>
.loading-container, .error-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; }
.loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border-color); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; }
.loading-text, .error-text { margin-top: 16px; font-size: 14px; color: var(--text-secondary); }
@keyframes spin { to { transform: rotate(360deg); } }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.info-item { display: flex; flex-direction: column; gap: 4px; padding: 12px; background: var(--bg-color); border-radius: var(--radius-sm); }
.info-label { font-size: 12px; color: var(--text-secondary); }
.info-value { font-size: 14px; font-weight: 500; color: var(--text-primary); }
</style>
