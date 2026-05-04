<template>
  <div class="logistics-list">
    <el-card class="action-card">
      <el-button type="primary" @click="handleAddCompany">
        <el-icon><Plus /></el-icon>
        添加物流公司
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出物流记录
      </el-button>
    </el-card>

    <el-card class="table-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="发货管理" name="shipments">
          <el-table :data="shipmentsData" v-loading="loading" stripe border>
            <el-table-column prop="shipNo" label="发货单号" width="180" />
            <el-table-column prop="orderNo" label="订单号" width="180" />
            <el-table-column prop="customerName" label="收货人" width="100" />
            <el-table-column prop="customerPhone" label="联系电话" width="130" />
            <el-table-column prop="shippingAddress" label="收货地址" min-width="200">
              <template #default="scope">
                <el-tooltip :content="scope.row.shippingAddress" placement="top">
                  <span>{{ scope.row.shippingAddress }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="logisticsCompany" label="物流公司" width="120" />
            <el-table-column prop="logisticsNo" label="物流单号" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getShipmentStatusType(scope.row.status)" size="small">
                  {{ getShipmentStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="shipTime" label="发货时间" width="160" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" link>查看轨迹</el-button>
                <el-button type="primary" link>编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="物流公司" name="companies">
          <el-table :data="companiesData" v-loading="loading" stripe border>
            <el-table-column prop="name" label="公司名称" width="200" />
            <el-table-column prop="code" label="公司代码" width="150" />
            <el-table-column prop="contactPerson" label="联系人" width="100" />
            <el-table-column prop="contactPhone" label="联系电话" width="130" />
            <el-table-column prop="isDefault" label="是否默认" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.isDefault ? 'success' : 'info'" size="small">
                  {{ scope.row.isDefault ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'" size="small">
                  {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" link>编辑</el-button>
                <el-button v-if="!scope.row.isDefault" type="warning" link>设为默认</el-button>
                <el-button :type="scope.row.status === 'active' ? 'danger' : 'success'" link>
                  {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
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
import { Plus, Download } from '@element-plus/icons-vue'

const loading = ref(false)
const activeTab = ref('shipments')

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const shipmentsData = ref([
  {
    id: 1,
    shipNo: 'SH202405040001',
    orderNo: 'ORD202405030003',
    customerName: '王五',
    customerPhone: '13800138003',
    shippingAddress: '广州市天河区XX街道XX小区XX栋XX房',
    logisticsCompany: '顺丰速运',
    logisticsNo: 'SF1234567890123',
    status: 'in_transit',
    shipTime: '2024-05-03 16:00:00'
  },
  {
    id: 2,
    shipNo: 'SH202405040002',
    orderNo: 'ORD202405020004',
    customerName: '赵六',
    customerPhone: '13800138004',
    shippingAddress: '深圳市南山区XX科技园XX栋XX层',
    logisticsCompany: '圆通速递',
    logisticsNo: 'YT9876543210987',
    status: 'delivered',
    shipTime: '2024-05-02 14:30:00'
  },
  {
    id: 3,
    shipNo: 'SH202405040003',
    orderNo: 'ORD202405010006',
    customerName: '孙七',
    customerPhone: '13800138005',
    shippingAddress: '杭州市西湖区XX路XX号XX小区XX单元',
    logisticsCompany: '中通快递',
    logisticsNo: 'ZT6543210987654',
    status: 'pending_shipment',
    shipTime: '-'
  }
])

const companiesData = ref([
  {
    id: 1,
    name: '顺丰速运',
    code: 'SF',
    contactPerson: '张经理',
    contactPhone: '400-811-1111',
    isDefault: true,
    status: 'active'
  },
  {
    id: 2,
    name: '圆通速递',
    code: 'YTO',
    contactPerson: '李经理',
    contactPhone: '021-69777888',
    isDefault: false,
    status: 'active'
  },
  {
    id: 3,
    name: '中通快递',
    code: 'ZTO',
    contactPerson: '王经理',
    contactPhone: '95311',
    isDefault: false,
    status: 'active'
  },
  {
    id: 4,
    name: '申通快递',
    code: 'STO',
    contactPerson: '赵经理',
    contactPhone: '95543',
    isDefault: false,
    status: 'inactive'
  }
])

const shipmentStatusMap = {
  pending_shipment: { label: '待发货', type: 'warning' },
  in_transit: { label: '运输中', type: 'primary' },
  delivered: { label: '已送达', type: 'success' },
  returned: { label: '已退回', type: 'danger' }
}

const getShipmentStatusLabel = (status) => shipmentStatusMap[status]?.label || status
const getShipmentStatusType = (status) => shipmentStatusMap[status]?.type || 'info'

const handleAddCompany = () => {
  ElMessage.info('添加物流公司功能开发中...')
}

const handleExport = () => {
  ElMessage.success('物流记录导出中，请稍候...')
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
}

const handleCurrentChange = (val) => {
  pagination.page = val
}

onMounted(() => {
  loading.value = false
  pagination.total = shipmentsData.value.length
})
</script>

<style lang="scss" scoped>
.logistics-list {
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

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
