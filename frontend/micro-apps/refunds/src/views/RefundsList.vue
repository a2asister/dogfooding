<template>
  <div class="refunds-list">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="退款单号">
          <el-input v-model="searchForm.refundNo" placeholder="请输入退款单号" clearable />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="退款类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="仅退款" value="only_refund" />
            <el-option label="退货退款" value="return_refund" />
          </el-select>
        </el-form-item>
        <el-form-item label="退款状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已同意" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
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
          <span>退款列表</span>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="refundNo" label="退款单号" width="180" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="customerName" label="买家" width="100" />
        <el-table-column prop="type" label="退款类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeType(scope.row.type)" size="small">
              {{ getTypeLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="refundAmount" label="退款金额" width="120">
          <template #default="scope">
            <span class="refund-amount">¥{{ scope.row.refundAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="退款原因" min-width="150">
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
              @click="handleApprove(scope.row)"
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

    <el-dialog
      v-model="processDialogVisible"
      title="处理退款"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="processForm.result">
            <el-radio value="approve">同意退款</el-radio>
            <el-radio value="reject">拒绝退款</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明" v-if="processForm.result === 'reject'">
          <el-input
            v-model="processForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitProcess">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const processDialogVisible = ref(false)
const currentRefund = ref(null)

const searchForm = reactive({
  refundNo: '',
  orderNo: '',
  type: '',
  status: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const processForm = reactive({
  result: 'approve',
  reason: ''
})

const tableData = ref([])

const mockRefunds = [
  {
    id: 1,
    refundNo: 'RF202405040001',
    orderNo: 'ORD202405040001',
    customerName: '张三',
    customerPhone: '13800138001',
    type: 'only_refund',
    refundAmount: 100,
    orderAmount: 11798,
    reason: '商品价格有误，申请退还优惠券差额',
    status: 'pending',
    createTime: '2024-05-04 14:30:00',
    updateTime: '2024-05-04 14:30:00'
  },
  {
    id: 2,
    refundNo: 'RF202405040002',
    orderNo: 'ORD202405030002',
    customerName: '李四',
    customerPhone: '13800138002',
    type: 'return_refund',
    refundAmount: 198,
    orderAmount: 198,
    reason: '商品有质量问题，申请退货退款',
    status: 'processing',
    createTime: '2024-05-03 16:20:00',
    updateTime: '2024-05-04 09:15:00'
  },
  {
    id: 3,
    refundNo: 'RF202405040003',
    orderNo: 'ORD202405020005',
    customerName: '王五',
    customerPhone: '13800138003',
    type: 'only_refund',
    refundAmount: 50,
    orderAmount: 259,
    reason: '商品已使用，但存在瑕疵，申请部分退款',
    status: 'approved',
    createTime: '2024-05-02 18:45:00',
    updateTime: '2024-05-03 10:30:00'
  },
  {
    id: 4,
    refundNo: 'RF202405040004',
    orderNo: 'ORD202405010008',
    customerName: '赵六',
    customerPhone: '13800138004',
    type: 'return_refund',
    refundAmount: 2999,
    orderAmount: 2999,
    reason: '商品与描述不符，申请退货退款',
    status: 'rejected',
    createTime: '2024-05-01 11:30:00',
    updateTime: '2024-05-01 16:00:00',
    rejectReason: '商品已使用超过7天，不符合退货条件'
  },
  {
    id: 5,
    refundNo: 'RF202405040005',
    orderNo: 'ORD202404280012',
    customerName: '孙七',
    customerPhone: '13800138005',
    type: 'only_refund',
    refundAmount: 168,
    orderAmount: 454,
    reason: '多买了一件，申请退款其中一件',
    status: 'completed',
    createTime: '2024-04-29 09:15:00',
    updateTime: '2024-04-29 15:30:00'
  }
]

const typeMap = {
  only_refund: { label: '仅退款', type: 'primary' },
  return_refund: { label: '退货退款', type: 'warning' }
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

const fetchRefunds = async () => {
  loading.value = true
  try {
    tableData.value = mockRefunds
    pagination.total = mockRefunds.length
  } catch (error) {
    ElMessage.error('获取退款列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  ElMessage.success('搜索成功')
}

const handleReset = () => {
  searchForm.refundNo = ''
  searchForm.orderNo = ''
  searchForm.type = ''
  searchForm.status = ''
  searchForm.dateRange = []
  fetchRefunds()
}

const handleView = (row) => {
  router.push(`/refunds/detail/${row.id}`)
}

const handleApprove = (row) => {
  currentRefund.value = row
  processForm.result = 'approve'
  processForm.reason = ''
  processDialogVisible.value = true
}

const handleSubmitProcess = async () => {
  try {
    if (processForm.result === 'reject' && !processForm.reason.trim()) {
      ElMessage.warning('请输入拒绝原因')
      return
    }

    await ElMessageBox.confirm(
      `确定要${processForm.result === 'approve' ? '同意' : '拒绝'}该退款申请吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (currentRefund.value) {
      currentRefund.value.status = processForm.result === 'approve' ? 'approved' : 'rejected'
      if (processForm.result === 'reject') {
        currentRefund.value.rejectReason = processForm.reason
      }
    }

    processDialogVisible.value = false
    ElMessage.success(processForm.result === 'approve' ? '已同意退款' : '已拒绝退款')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleExport = () => {
  ElMessage.success('退款记录导出中，请稍候...')
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchRefunds()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchRefunds()
}

onMounted(() => {
  fetchRefunds()
})
</script>

<style lang="scss" scoped>
.refunds-list {
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
