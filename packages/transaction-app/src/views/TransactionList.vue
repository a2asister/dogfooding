<template>
  <div class="transaction-list">
    <div class="card mb-4">
      <div class="card-body">
        <div class="search-form d-flex gap-3 flex-wrap">
          <div class="form-group mb-0">
            <label class="form-label">交易类型</label>
            <select v-model="searchParams.transactionType" class="form-control" style="width: 120px;">
              <option value="">全部</option>
              <option value="transfer">转账</option>
              <option value="deposit">存款</option>
              <option value="withdraw">取款</option>
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">状态</label>
            <select v-model="searchParams.status" class="form-control" style="width: 100px;">
              <option value="">全部</option>
              <option value="success">成功</option>
              <option value="pending">处理中</option>
              <option value="failed">失败</option>
            </select>
          </div>
          <div class="form-group mb-0" style="padding-top: 24px;">
            <button @click="search" class="btn btn-primary">搜索</button>
            <button @click="reset" class="btn ml-2">重置</button>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-grid grid grid-4 mb-4">
      <div class="stat-card">
        <div class="stat-label">交易总数</div>
        <div class="stat-value">{{ stats.totalTransactions || 0 }}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">交易总额</div>
        <div class="stat-value">¥{{ (stats.totalAmount || 0).toLocaleString() }}</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">处理中</div>
        <div class="stat-value">{{ stats.byStatus?.pending || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">转账次数</div>
        <div class="stat-value">{{ stats.byType?.transfer || 0 }}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="table">
          <thead>
            <tr>
              <th>交易号</th>
              <th>类型</th>
              <th>金额</th>
              <th>转出账户</th>
              <th>转入账户</th>
              <th>状态</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody v-if="transactions.length > 0">
            <tr v-for="txn in transactions" :key="txn.id">
              <td>{{ txn.id }}</td>
              <td>{{ txn.transactionTypeName }}</td>
              <td class="text-right">¥{{ txn.amount.toLocaleString() }}</td>
              <td>{{ txn.fromAccountNumber || '-' }}</td>
              <td>{{ txn.toAccountNumber || '-' }}</td>
              <td><span :class="['badge', getStatusBadge(txn.status)]">{{ getStatusText(txn.status) }}</span></td>
              <td>{{ formatDate(txn.createTime) }}</td>
              <td><router-link :to="`/transaction/detail/${txn.id}`" class="btn btn-sm">详情</router-link></td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr><td colspan="8" class="text-center text-muted">暂无数据</td></tr>
          </tbody>
        </table>
        <div v-if="pagination.totalPages > 1" class="pagination">
          <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1" class="btn btn-sm">上一页</button>
          <span class="page-info">第 {{ pagination.page }} / {{ pagination.totalPages }} 页</span>
          <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages" class="btn btn-sm">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import transactionApi from '../api/transaction'

const transactions = ref([])
const stats = ref({})
const searchParams = reactive({ transactionType: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

const fetchTransactions = async () => {
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchParams.transactionType) params.transactionType = searchParams.transactionType
    if (searchParams.status) params.status = searchParams.status
    
    const res = await transactionApi.getTransactions(params)
    if (res.success) {
      transactions.value = res.data.transactions
      pagination.total = res.data.pagination.total
      pagination.totalPages = res.data.pagination.totalPages
    }
  } catch (e) { console.error(e) }
}

const fetchStats = async () => {
  try {
    const res = await transactionApi.getStats()
    if (res.success) stats.value = res.data
  } catch (e) { console.error(e) }
}

const search = () => { pagination.page = 1; fetchTransactions() }
const reset = () => { searchParams.transactionType = ''; searchParams.status = ''; pagination.page = 1; fetchTransactions() }
const changePage = (p) => { if (p < 1 || p > pagination.totalPages) return; pagination.page = p; fetchTransactions() }
const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-'
const getStatusText = (s) => ({ success: '成功', pending: '处理中', failed: '失败' }[s] || s)
const getStatusBadge = (s) => ({ success: 'badge-success', pending: 'badge-warning', failed: 'badge-danger' }[s] || 'badge-info')

onMounted(() => { fetchTransactions(); fetchStats() })
</script>

<style scoped>
.transaction-list { width: 100%; }
.search-form { display: flex; gap: 16px; flex-wrap: wrap; }
.stats-grid { margin-bottom: 24px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; border-top: 1px solid var(--border-color-light); }
.page-info { font-size: 14px; color: var(--text-secondary); }
.text-right { text-align: right; }
.text-center { text-align: center; }
.text-muted { color: var(--text-secondary); }
</style>
