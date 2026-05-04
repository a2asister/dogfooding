<template>
  <div class="orders-list">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待付款" value="pending_payment" />
            <el-option label="待发货" value="pending_shipment" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
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
          <span>订单列表</span>
          <div class="header-actions">
            <el-button type="primary" link @click="exportOrders">
              <el-icon><Download /></el-icon>
              导出订单
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="customer" label="买家信息" width="150">
          <template #default="scope">
            <div>
              <div>{{ scope.row.customerName }}</div>
              <div class="text-muted">{{ scope.row.customerPhone }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="products" label="商品信息" min-width="200">
          <template #default="scope">
            <div v-for="(item, index) in scope.row.products.slice(0, 2)" :key="index" class="product-item">
              <span class="product-name">{{ item.name }}</span>
              <span class="text-muted">x{{ item.quantity }}</span>
            </div>
            <div v-if="scope.row.products.length > 2" class="text-muted">
              等{{ scope.row.products.length }}件商品
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="scope">
            <span class="price">¥{{ scope.row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payMethod" label="支付方式" width="100">
          <template #default="scope">
            <el-tag size="small">{{ getPayMethodLabel(scope.row.payMethod) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="160">
          <template #default="scope">
            {{ scope.row.createTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
            <el-button
              v-if="scope.row.status === 'pending_shipment'"
              type="success"
              link
              @click="handleShip(scope.row)"
            >
              发货
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending_payment'"
              type="warning"
              link
              @click="handleRemind(scope.row)"
            >
              催付
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

const searchForm = reactive({
  orderNo: '',
  status: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const mockOrders = [
  {
    id: 1,
    orderNo: 'ORD202405040001',
    customerName: '张三',
    customerPhone: '13800138001',
    products: [
      { name: 'iPhone 15 Pro Max 256GB', quantity: 1, price: 9999 },
      { name: 'AirPods Pro 2', quantity: 1, price: 1899 }
    ],
    totalAmount: 11898,
    payMethod: 'alipay',
    status: 'pending_shipment',
    createTime: '2024-05-04 10:30:00'
  },
  {
    id: 2,
    orderNo: 'ORD202405040002',
    customerName: '李四',
    customerPhone: '13800138002',
    products: [
      { name: '夏季新款男士休闲T恤', quantity: 2, price: 99 }
    ],
    totalAmount: 198,
    payMethod: 'wechat',
    status: 'pending_payment',
    createTime: '2024-05-04 11:20:00'
  },
  {
    id: 3,
    orderNo: 'ORD202405040003',
    customerName: '王五',
    customerPhone: '13800138003',
    products: [
      { name: 'MacBook Pro 14英寸 M3 Pro', quantity: 1, price: 14999 }
    ],
    totalAmount: 14999,
    payMethod: 'alipay',
    status: 'shipped',
    createTime: '2024-05-03 14:15:00'
  },
  {
    id: 4,
    orderNo: 'ORD202405040004',
    customerName: '赵六',
    customerPhone: '13800138004',
    products: [
      { name: '进口有机坚果礼盒装', quantity: 3, price: 168 }
    ],
    totalAmount: 504,
    payMethod: 'wechat',
    status: 'completed',
    createTime: '2024-05-02 09:45:00'
  },
  {
    id: 5,
    orderNo: 'ORD202405040005',
    customerName: '孙七',
    customerPhone: '13800138005',
    products: [
      { name: '女士夏季连衣裙', quantity: 1, price: 259 }
    ],
    totalAmount: 259,
    payMethod: 'alipay',
    status: 'cancelled',
    createTime: '2024-05-01 16:30:00'
  }
]

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

const fetchOrders = async () => {
  loading.value = true
  try {
    tableData.value = mockOrders
    pagination.total = mockOrders.length
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  ElMessage.success('搜索成功')
}

const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.status = ''
  searchForm.dateRange = []
  fetchOrders()
}

const handleView = (row) => {
  router.push(`/orders/detail/${row.id}`)
}

const handleShip = async (row) => {
  try {
    await ElMessageBox.confirm('确定要发货吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    row.status = 'shipped'
    ElMessage.success('发货成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleRemind = (row) => {
  ElMessage.success('已发送催付提醒')
}

const exportOrders = () => {
  ElMessage.success('订单导出中，请稍候...')
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchOrders()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchOrders()
}

onMounted(() => {
  fetchOrders()
})
</script>

<style lang="scss" scoped>
.orders-list {
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

  .text-muted {
    color: #909399;
    font-size: 12px;
  }

  .product-item {
    display: flex;
    justify-content: space-between;

    .product-name {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .price {
    color: #f56c6c;
    font-weight: bold;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
