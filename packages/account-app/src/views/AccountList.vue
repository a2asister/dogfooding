<template>
  <div class="account-list">
    <div class="card mb-4">
      <div class="card-body">
        <div class="search-form d-flex gap-3 flex-wrap">
          <div class="form-group mb-0">
            <label class="form-label">客户ID</label>
            <input v-model="searchParams.customerId" type="text" class="form-control" placeholder="输入客户ID" style="width: 180px;" />
          </div>
          <div class="form-group mb-0">
            <label class="form-label">账户类型</label>
            <select v-model="searchParams.accountType" class="form-control" style="width: 150px;">
              <option value="">全部</option>
              <option value="savings">储蓄账户</option>
              <option value="current">活期账户</option>
              <option value="fixed">定期账户</option>
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">状态</label>
            <select v-model="searchParams.status" class="form-control" style="width: 120px;">
              <option value="">全部</option>
              <option value="active">正常</option>
              <option value="frozen">冻结</option>
              <option value="closed">销户</option>
            </select>
          </div>
          <div class="form-group mb-0 d-flex align-end" style="padding-top: 24px;">
            <button @click="search" class="btn btn-primary">
              搜索
            </button>
            <button @click="reset" class="btn ml-2">
              重置
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-grid grid grid-4 mb-4">
      <div class="stat-card">
        <div class="stat-label">总账户数</div>
        <div class="stat-value">{{ stats.totalAccounts }}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">总余额</div>
        <div class="stat-value">¥{{ stats.totalBalance?.toLocaleString() || 0 }}</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">冻结金额</div>
        <div class="stat-value">¥{{ stats.totalFrozen?.toLocaleString() || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">账户类型</div>
        <div class="stat-value text-sm">{{ Object.keys(stats.byType || {}).length }} 种</div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="table">
          <thead>
            <tr>
              <th>账户ID</th>
              <th>账户号码</th>
              <th>账户类型</th>
              <th>余额</th>
              <th>可用余额</th>
              <th>冻结金额</th>
              <th>状态</th>
              <th>开户网点</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody v-if="accounts.length > 0">
            <tr v-for="account in accounts" :key="account.id">
              <td>{{ account.id }}</td>
              <td>{{ maskAccount(account.accountNumber) }}</td>
              <td>{{ account.accountTypeName }}</td>
              <td class="text-right">¥{{ account.balance.toLocaleString() }}</td>
              <td class="text-right">¥{{ account.availableBalance.toLocaleString() }}</td>
              <td class="text-right">¥{{ (account.frozenAmount || 0).toLocaleString() }}</td>
              <td>
                <span :class="['badge', getStatusBadge(account.status)]">
                  {{ getStatusText(account.status) }}
                </span>
              </td>
              <td>{{ account.branch }}</td>
              <td>
                <router-link :to="`/account/detail/${account.id}`" class="btn btn-sm">
                  详情
                </router-link>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="9" class="text-center text-muted">
                暂无数据
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="pagination.totalPages > 1" class="pagination">
          <button @click="changePage(pagination.page - 1)" 
                  :disabled="pagination.page === 1" 
                  class="btn btn-sm">
            上一页
          </button>
          <span class="page-info">
            第 {{ pagination.page }} / {{ pagination.totalPages }} 页，共 {{ pagination.total }} 条
          </span>
          <button @click="changePage(pagination.page + 1)" 
                  :disabled="pagination.page === pagination.totalPages" 
                  class="btn btn-sm">
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import accountApi from '../api/account'

const accounts = ref([])
const stats = ref({})
const loading = ref(false)

const searchParams = reactive({
  customerId: '',
  accountType: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

const fetchAccounts = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (searchParams.customerId) params.customerId = searchParams.customerId
    if (searchParams.accountType) params.accountType = searchParams.accountType
    if (searchParams.status) params.status = searchParams.status

    const res = await accountApi.getAccounts(params)
    if (res.success) {
      accounts.value = res.data.accounts
      pagination.total = res.data.pagination.total
      pagination.totalPages = res.data.pagination.totalPages
    }
  } catch (error) {
    console.error('获取账户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await accountApi.getStats()
    if (res.success) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const search = () => {
  pagination.page = 1
  fetchAccounts()
}

const reset = () => {
  searchParams.customerId = ''
  searchParams.accountType = ''
  searchParams.status = ''
  pagination.page = 1
  fetchAccounts()
}

const changePage = (newPage) => {
  if (newPage < 1 || newPage > pagination.totalPages) return
  pagination.page = newPage
  fetchAccounts()
}

const maskAccount = (accountNumber) => {
  if (!accountNumber) return ''
  if (accountNumber.length <= 8) return accountNumber
  return accountNumber.slice(0, 4) + '****' + accountNumber.slice(-4)
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
  fetchAccounts()
  fetchStats()
})
</script>

<style scoped>
.account-list {
  width: 100%;
}

.stats-grid {
  margin-bottom: 24px;
}

.stat-value.text-sm {
  font-size: 20px;
}

.search-form {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border-color-light);
}

.page-info {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
