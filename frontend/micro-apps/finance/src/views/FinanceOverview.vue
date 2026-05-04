<template>
  <div class="finance-overview">
    <el-card class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="账户余额" :value="125860.50" value-style="color: #409EFF" :precision="2">
            <template #prefix>
              <el-icon><Money /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="今日收入" :value="15680.00" value-style="color: #67C23A" :precision="2">
            <template #prefix>
              <el-icon><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="今日支出" :value="2580.00" value-style="color: #F56C6C" :precision="2">
            <template #prefix>
              <el-icon><Minus /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="待提现金额" :value="25860.00" value-style="color: #E6A23C" :precision="2">
            <template #prefix>
              <el-icon><Wallet /></el-icon>
            </template>
          </el-statistic>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="action-card">
      <el-button type="primary" @click="handleWithdraw">
        <el-icon><Wallet /></el-icon>
        申请提现
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出账单
      </el-button>
    </el-card>

    <el-card class="table-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="交易明细" name="transactions">
          <el-table :data="transactionsData" v-loading="loading" stripe border>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="getTransactionType(scope.row.type)" size="small">
                  {{ getTransactionLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="orderNo" label="关联单号" width="180" />
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="scope">
                <span :class="scope.row.type === 'income' ? 'income' : 'expense'">
                  {{ scope.row.type === 'income' ? '+' : '-' }}¥{{ scope.row.amount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="balance" label="账户余额" width="120">
              <template #default="scope">
                <span class="balance">¥{{ scope.row.balance }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="交易说明" min-width="200" />
            <el-table-column prop="createTime" label="交易时间" width="160" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="提现记录" name="withdrawals">
          <el-table :data="withdrawalsData" v-loading="loading" stripe border>
            <el-table-column prop="withdrawNo" label="提现单号" width="180" />
            <el-table-column prop="amount" label="提现金额" width="120">
              <template #default="scope">
                <span class="amount">¥{{ scope.row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="bankName" label="银行" width="150" />
            <el-table-column prop="bankAccount" label="银行卡号" width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getWithdrawStatusType(scope.row.status)" size="small">
                  {{ getWithdrawStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="申请时间" width="160" />
            <el-table-column prop="completeTime" label="完成时间" width="160">
              <template #default="scope">
                {{ scope.row.completeTime || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Money, TrendCharts, Minus, Wallet, Download } from '@element-plus/icons-vue'

const loading = ref(false)
const activeTab = ref('transactions')

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const transactionsData = ref([
  {
    id: 1,
    type: 'income',
    orderNo: 'ORD202405040001',
    amount: 11798,
    balance: 125860.50,
    description: '订单支付收入 - iPhone 15 Pro Max',
    createTime: '2024-05-04 10:35:00'
  },
  {
    id: 2,
    type: 'income',
    orderNo: 'ORD202405040003',
    amount: 14499,
    balance: 114062.50,
    description: '订单支付收入 - MacBook Pro 14英寸',
    createTime: '2024-05-03 14:20:00'
  },
  {
    id: 3,
    type: 'expense',
    orderNo: 'RF202405040001',
    amount: 100,
    balance: 99563.50,
    description: '退款支出 - 优惠券差额',
    createTime: '2024-05-04 15:30:00'
  },
  {
    id: 4,
    type: 'income',
    orderNo: 'ORD202405020004',
    amount: 454,
    balance: 99663.50,
    description: '订单支付收入 - 坚果礼盒',
    createTime: '2024-05-02 10:00:00'
  }
])

const withdrawalsData = ref([
  {
    id: 1,
    withdrawNo: 'WD202405040001',
    amount: 50000,
    bankName: '中国工商银行',
    bankAccount: '**** **** **** 8888',
    status: 'processing',
    createTime: '2024-05-04 09:30:00',
    completeTime: null
  },
  {
    id: 2,
    withdrawNo: 'WD202404280001',
    amount: 30000,
    bankName: '中国建设银行',
    bankAccount: '**** **** **** 6666',
    status: 'completed',
    createTime: '2024-04-28 14:20:00',
    completeTime: '2024-04-29 10:15:00'
  },
  {
    id: 3,
    withdrawNo: 'WD202404150001',
    amount: 25000,
    bankName: '招商银行',
    bankAccount: '**** **** **** 9999',
    status: 'rejected',
    createTime: '2024-04-15 11:30:00',
    completeTime: '2024-04-15 16:00:00'
  }
])

const transactionTypeMap = {
  income: { label: '收入', type: 'success' },
  expense: { label: '支出', type: 'danger' }
}

const withdrawStatusMap = {
  processing: { label: '处理中', type: 'primary' },
  completed: { label: '已完成', type: 'success' },
  rejected: { label: '已拒绝', type: 'danger' }
}

const getTransactionLabel = (type) => transactionTypeMap[type]?.label || type
const getTransactionType = (type) => transactionTypeMap[type]?.type || 'info'
const getWithdrawStatusLabel = (status) => withdrawStatusMap[status]?.label || status
const getWithdrawStatusType = (status) => withdrawStatusMap[status]?.type || 'info'

const handleWithdraw = () => {
  ElMessage.info('申请提现功能开发中...')
}

const handleExport = () => {
  ElMessage.success('账单导出中，请稍候...')
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
}

const handleCurrentChange = (val) => {
  pagination.page = val
}

onMounted(() => {
  loading.value = false
  pagination.total = transactionsData.value.length
})
</script>

<style lang="scss" scoped>
.finance-overview {
  .stats-card {
    margin-bottom: 20px;
  }

  .action-card {
    margin-bottom: 20px;

    .el-button {
      margin-right: 10px;
    }
  }

  .table-card {
    .el-tabs__header {
      margin-bottom: 20px;
    }
  }

  .income {
    color: #67C23A;
    font-weight: bold;
  }

  .expense {
    color: #F56C6C;
    font-weight: bold;
  }

  .balance {
    color: #409EFF;
    font-weight: bold;
  }

  .amount {
    color: #F56C6C;
    font-weight: bold;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
