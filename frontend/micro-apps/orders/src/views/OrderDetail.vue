<template>
  <div class="order-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button type="primary" link @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <span>订单详情</span>
        </div>
      </template>

      <div class="detail-content">
        <el-descriptions title="订单信息" :column="2" border>
          <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(order.status)">{{ getStatusLabel(order.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ order.createTime }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ getPayMethodLabel(order.payMethod) }}</el-descriptions-item>
          <el-descriptions-item label="支付时间" :span="2">{{ order.payTime || '待支付' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-descriptions title="买家信息" :column="2" border>
          <el-descriptions-item label="买家昵称">{{ order.customerName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ order.customerPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ order.shippingAddress }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-descriptions title="商品信息" :column="1" border>
          <el-descriptions-item label="商品列表">
            <div v-for="(item, index) in order.products" :key="index" class="product-item">
              <div class="product-info">
                <el-image
                  :src="item.image"
                  fit="cover"
                  style="width: 60px; height: 60px; margin-right: 15px;"
                />
                <div>
                  <div class="product-name">{{ item.name }}</div>
                  <div class="text-muted">单价: ¥{{ item.price }} | 数量: x{{ item.quantity }}</div>
                </div>
              </div>
              <div class="product-total">
                小计: <span class="price">¥{{ item.price * item.quantity }}</span>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-descriptions title="价格明细" :column="2" border>
          <el-descriptions-item label="商品总价">¥{{ order.totalAmount }}</el-descriptions-item>
          <el-descriptions-item label="运费">¥{{ order.shippingFee }}</el-descriptions-item>
          <el-descriptions-item label="优惠券优惠">-¥{{ order.couponDiscount }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">
            <span class="price">¥{{ order.payAmount }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-descriptions title="物流信息" :column="2" border>
          <el-descriptions-item label="物流公司">{{ order.logisticsCompany || '待发货' }}</el-descriptions-item>
          <el-descriptions-item label="物流单号">{{ order.logisticsNo || '待发货' }}</el-descriptions-item>
          <el-descriptions-item label="发货时间" :span="2">{{ order.shipTime || '待发货' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="action-buttons">
          <el-button v-if="order.status === 'pending_shipment'" type="primary" @click="handleShip">
            发货
          </el-button>
          <el-button v-if="order.status === 'pending_payment'" type="warning" @click="handleRemind">
            催付
          </el-button>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const order = reactive({
  id: 1,
  orderNo: 'ORD202405040001',
  customerName: '张三',
  customerPhone: '13800138001',
  shippingAddress: '北京市朝阳区XX街道XX小区XX号楼XX单元XX室',
  products: [
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
  ],
  totalAmount: 11898,
  shippingFee: 0,
  couponDiscount: 100,
  payAmount: 11798,
  payMethod: 'alipay',
  payTime: '2024-05-04 10:35:00',
  status: 'pending_shipment',
  createTime: '2024-05-04 10:30:00',
  logisticsCompany: '',
  logisticsNo: '',
  shipTime: ''
})

const statusMap = {
  pending_payment: { label: '待付款', type: 'warning' },
  pending_shipment: { label: '待发货', type: 'primary' },
  shipped: { label: '已发货', type: 'info' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
}

const payMethodMap = {
  alipay: '支付宝',
  wechat: '微信支付',
  bank: '银行卡'
}

const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'
const getPayMethodLabel = (method) => payMethodMap[method] || method

const handleBack = () => {
  router.push('/orders')
}

const handleShip = async () => {
  try {
    await ElMessageBox.confirm('确定要发货吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    order.status = 'shipped'
    order.logisticsCompany = '顺丰速运'
    order.logisticsNo = 'SF1234567890123'
    order.shipTime = new Date().toLocaleString()
    ElMessage.success('发货成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleRemind = () => {
  ElMessage.success('已发送催付提醒')
}

onMounted(() => {
  console.log('订单ID:', route.params.id)
})
</script>

<style lang="scss" scoped>
.order-detail {
  .card-header {
    display: flex;
    align-items: center;

    .el-button {
      margin-right: 20px;
      padding: 0;
    }
  }

  .detail-content {
    max-width: 1000px;
    margin: 0 auto;
  }

  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }

    .product-info {
      display: flex;
      align-items: center;
    }

    .product-name {
      font-weight: 500;
      margin-bottom: 5px;
    }

    .product-total {
      font-weight: 500;
    }
  }

  .text-muted {
    color: #909399;
    font-size: 12px;
  }

  .price {
    color: #f56c6c;
    font-weight: bold;
    font-size: 16px;
  }

  .action-buttons {
    text-align: center;
    margin-top: 30px;

    .el-button {
      margin: 0 10px;
    }
  }
}
</style>
