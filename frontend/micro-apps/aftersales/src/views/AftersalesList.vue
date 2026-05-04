<template>
  <div class="aftersales-list">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="售后单号">
          <el-input v-model="searchForm.aftersalesNo" placeholder="请输入售后单号" clearable />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="售后类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="退货退款" value="return_refund" />
            <el-option label="换货" value="exchange" />
            <el-option label="维修" value="repair" />
          </el-select>
        </el-form-item>
        <el-form-item label="售后状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已同意" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>售后列表</span>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="aftersalesNo" label="售后单号" width="180" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="customerName" label="买家" width="100" />
        <el-table-column prop="type" label="售后类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeType(scope.row.type)" size="small">
              {{ getTypeLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="退款金额" width="120">
          <template #default="scope">
            <span class="refund-amount">¥{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="售后原因" min-width="150">
          <template #default="scope">
            <el-tooltip :content="scope.row.reason" placement="top">
              <span>{{ scope.row.reason }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="success"
              link
              @click="handleProcess(scope.row)"
            >
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)

const searchForm = reactive({
  aftersalesNo: '',
  orderNo: '',
  type: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const mockAftersales = [
  {
    id: 1,
    aftersalesNo: 'AS202405040001',
    orderNo: 'ORD202405030005',
    customerName: '张三',
    type: 'return_refund',
    amount: 2999,
    reason: '商品质量问题，申请退货退款',
    status: 'pending',
    createTime: '2024-05-04 14:30:00'
  },
  {
    id: 2,
    aftersalesNo: 'AS202405040002',
    orderNo: 'ORD202405020008',
    customerName: '李四',
    type: 'exchange',
    amount: 199,
    reason: '商品颜色发错，申请换货',
    status: 'processing',
    createTime: '2024-05-03 11:20:00'
  },
  {
    id: 3,
    aftersalesNo: 'AS202405040003',
    orderNo: 'ORD202405010012',
    customerName: '王五',
    type: 'repair',
    amount: 0,
    reason: '手机屏幕故障，申请维修',
    status: 'approved',
    createTime: '2024-05-02 09:15:00'
  },
  {
    id: 4,
    aftersalesNo: 'AS202405040004',
    orderNo: 'ORD202404280015',
    customerName: '赵六',
    type: 'return_refund',
    amount: 599,
    reason: '商品与描述不符，申请退货退款',
    status: 'rejected',
    createTime: '2024-04-30 16:45:00'
  },
  {
    id: 5,
    aftersalesNo: 'AS202405040005',
    orderNo: 'ORD202404250020',
    customerName: '孙七',
    type: 'return_refund',
    amount: 1299,
    reason: '商品收到后发现损坏，申请退货退款',
    status: 'completed',
    createTime: '2024-04-26 10:30:00'
  }
]

const typeMap = {
  return_refund: { label: '退货退款', type: 'warning' },
  exchange: { label: '换货', type: 'primary' },
  repair: { label: '维修', type: 'info' }
}

const statusMap = {
  pending: { label: '待处理', type: 'warning' },
  processing: { label: '处理中', type: 'primary' },
  approved: { label: '已同意', type: 'success' },
  rejected: { label: '已拒绝', type: 'danger' },
  completed: { label: '已完成', type: 'info' }
}

const getTypeLabel = (type) => typeMap[type]?.label || type
const getTypeType = (type) => typeMap[type]?.type || 'info'
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

const fetchAftersales = async () => {
  loading.value = true
  try {
    tableData.value = mockAftersales
    pagination.total = mockAftersales.length
  } catch (error) {
    ElMessage.error('获取售后列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  ElMessage.success('搜索成功')
}

const handleReset = () => {
  searchForm.aftersalesNo = ''
  searchForm.orderNo = ''
  searchForm.type = ''
  searchForm.status = ''
  fetchAftersales()
}

const handleView = (row) => {
  router.push(`/aftersales/detail/${row.id}`)
}

const handleProcess = (row) => {
  router.push(`/aftersales/detail/${row.id}`)
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchAftersales()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchAftersales()
}

onMounted(() => {
  fetchAftersales()
})
</script>

<style lang="scss" scoped>
.aftersales-list {
  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .refund-amount {
    color: #f56c6c;
    font-weight: bold;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
