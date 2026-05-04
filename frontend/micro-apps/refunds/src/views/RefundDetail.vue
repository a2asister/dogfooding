<template>
  <div class="refund-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button type="primary" link @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <span>退款详情</span>
          <div class="header-actions">
            <el-button
              v-if="refund.status === 'pending'"
              type="primary"
              @click="handleApprove"
            >
              同意退款
            </el-button>
            <el-button
              v-if="refund.status === 'pending'"
              type="danger"
              @click="handleReject"
            >
              拒绝退款
            </el-button>
          </div>
        </div>
      </template>

      <el-steps :active="getStepActive()" finish-status="success" simple>
        <el-step title="申请退款" />
        <el-step title="商家处理" />
        <el-step title="退款完成" />
      </el-steps>

      <el-divider />

      <el-descriptions title="退款信息" :column="2" border>
        <el-descriptions-item label="退款单号">{{ refund.refundNo }}</el-descriptions-item>
        <el-descriptions-item label="退款类型">
          <el-tag :type="getTypeType(refund.type)">{{ getTypeLabel(refund.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单号">
          <el-link type="primary">{{ refund.orderNo }}</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="退款状态">
          <el-tag :type="getStatusType(refund.status)" size="large">
            {{ getStatusLabel(refund.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ refund.createTime }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ refund.updateTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="退款金额">
          <span class="refund-amount">¥{{ refund.refundAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ refund.orderAmount }}</el-descriptions-item>
        <el-descriptions-item label="退款原因" :span="2">{{ refund.reason }}</el-descriptions-item>
        <el-descriptions-item v-if="refund.rejectReason" label="拒绝原因" :span="2">
          <span class="text-danger">{{ refund.rejectReason }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-descriptions title="买家信息" :column="2" border>
        <el-descriptions-item label="买家昵称">{{ refund.customerName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ refund.customerPhone }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-descriptions title="退款商品" :column="1" border>
        <el-descriptions-item label="商品列表">
          <div v-for="(item, index) in refundProducts" :key="index" class="product-item">
            <el-image
              :src="item.image"
              fit="cover"
              style="width: 80px; height: 80px; margin-right: 15px;"
            />
            <div class="product-info">
              <div class="product-name">{{ item.name }}</div>
              <div class="text-muted">单价: ¥{{ item.price }} | 数量: x{{ item.quantity }}</div>
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-descriptions title="处理记录" :column="1" border>
        <el-descriptions-item label="操作日志">
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in processLogs"
              :key="index"
              :timestamp="log.time"
              :type="log.type"
              placement="top"
            >
              <h4>{{ log.title }}</h4>
              <p>{{ log.description }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝退款"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleSubmitReject">确定拒绝</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const rejectDialogVisible = ref(false)

const rejectForm = reactive({
  reason: ''
})

const refund = reactive({
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
  updateTime: '',
  rejectReason: ''
})

const refundProducts = ref([
  {
    name: 'iPhone 15 Pro Max 256GB 黑色钛金属',
    price: 9999,
    quantity: 1,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20smartphone%20product%20photo%20on%20white%20background&image_size=square'
  },
  {
    name: 'AirPods Pro 2 主动降噪耳机',
    price: 1899,
    quantity: 1,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20earbuds%20product%20photo%20on%20white%20background&image_size=square'
  }
])

const processLogs = ref([
  {
    title: '用户提交退款申请',
    description: '用户申请退还优惠券差额100元',
    time: '2024-05-04 14:30:00',
    type: 'primary'
  }
])

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

const getStepActive = computed(() => {
  switch (refund.status) {
    case 'pending':
    case 'processing':
      return 1
    case 'approved':
    case 'rejected':
      return 2
    case 'completed':
      return 3
    default:
      return 1
  }
})

const handleBack = () => {
  router.push('/refunds')
}

const handleApprove = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要同意该退款申请吗？同意后将自动退款给用户。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    refund.status = 'approved'
    refund.updateTime = new Date().toLocaleString()
    processLogs.value.push({
      title: '商家同意退款',
      description: '商家已同意退款申请，退款金额将在1-3个工作日内原路返回',
      time: new Date().toLocaleString(),
      type: 'success'
    })
    ElMessage.success('已同意退款')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleReject = () => {
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const handleSubmitReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要拒绝该退款申请吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    refund.status = 'rejected'
    refund.rejectReason = rejectForm.reason
    refund.updateTime = new Date().toLocaleString()
    processLogs.value.push({
      title: '商家拒绝退款',
      description: `拒绝原因：${rejectForm.reason}`,
      time: new Date().toLocaleString(),
      type: 'danger'
    })
    rejectDialogVisible.value = false
    ElMessage.success('已拒绝退款')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  console.log('退款ID:', route.params.id)
})
</script>

<style lang="scss" scoped>
.refund-detail {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .el-button {
      margin-right: 20px;
      padding: 0;
    }

    .header-actions {
      .el-button {
        margin-right: 0;
        margin-left: 10px;
      }
    }
  }

  .refund-amount {
    color: #f56c6c;
    font-weight: bold;
    font-size: 18px;
  }

  .text-danger {
    color: #f56c6c;
  }

  .text-muted {
    color: #909399;
    font-size: 12px;
  }

  .product-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }

    .product-name {
      font-weight: 500;
      margin-bottom: 5px;
    }
  }

  .dialog-footer {
    text-align: right;
  }
}
</style>
