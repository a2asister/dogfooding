<template>
  <div class="marketing-list">
    <el-card class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="进行中活动" :value="5" value-style="color: #409EFF">
            <template #prefix>
              <el-icon><Promotion /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="已结束活动" :value="23" value-style="color: #909399">
            <template #prefix>
              <el-icon><Clock /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="优惠券数量" :value="156" value-style="color: #67C23A">
            <template #prefix>
              <el-icon><Ticket /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="累计发放金额" :value="125800" value-style="color: #F56C6C" :precision="2">
            <template #prefix>
              <el-icon><Money /></el-icon>
            </template>
          </el-statistic>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="action-card">
      <el-button type="primary" @click="handleAddActivity">
        <el-icon><Plus /></el-icon>
        新建活动
      </el-button>
      <el-button type="success" @click="handleAddCoupon">
        <el-icon><Plus /></el-icon>
        新建优惠券
      </el-button>
    </el-card>

    <el-card class="table-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="活动列表" name="activities">
          <el-table :data="activitiesData" v-loading="loading" stripe border>
            <el-table-column prop="name" label="活动名称" min-width="200" />
            <el-table-column prop="type" label="活动类型" width="120">
              <template #default="scope">
                <el-tag :type="getActivityType(scope.row.type)" size="small">
                  {{ getActivityLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="discount" label="优惠力度" width="120">
              <template #default="scope">
                <span class="discount">{{ scope.row.discount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="160" />
            <el-table-column prop="endTime" label="结束时间" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" link>查看</el-button>
                <el-button type="primary" link>编辑</el-button>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="优惠券列表" name="coupons">
          <el-table :data="couponsData" v-loading="loading" stripe border>
            <el-table-column prop="name" label="优惠券名称" min-width="200" />
            <el-table-column prop="type" label="优惠券类型" width="120">
              <template #default="scope">
                <el-tag :type="getCouponType(scope.row.type)" size="small">
                  {{ getCouponLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="面值" width="100">
              <template #default="scope">
                <span class="amount">¥{{ scope.row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="minAmount" label="满减条件" width="120">
              <template #default="scope">
                满¥{{ scope.row.minAmount }}可用
              </template>
            </el-table-column>
            <el-table-column prop="total" label="发放数量" width="100" />
            <el-table-column prop="used" label="已使用" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getCouponStatusType(scope.row.status)" size="small">
                  {{ getCouponStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" link>查看</el-button>
                <el-button type="primary" link>编辑</el-button>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Promotion, Clock, Ticket, Money, Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const activeTab = ref('activities')

const activitiesData = ref([
  {
    id: 1,
    name: '五一劳动节大促销',
    type: 'full_reduction',
    discount: '满200减50',
    startTime: '2024-05-01 00:00:00',
    endTime: '2024-05-05 23:59:59',
    status: 'active'
  },
  {
    id: 2,
    name: '新品首发限时折扣',
    type: 'discount',
    discount: '8折优惠',
    startTime: '2024-05-03 10:00:00',
    endTime: '2024-05-10 23:59:59',
    status: 'active'
  },
  {
    id: 3,
    name: '母亲节感恩回馈',
    type: 'flash_sale',
    discount: '限时秒杀',
    startTime: '2024-05-12 00:00:00',
    endTime: '2024-05-12 23:59:59',
    status: 'pending'
  }
])

const couponsData = ref([
  {
    id: 1,
    name: '新人专享优惠券',
    type: 'cash',
    amount: 50,
    minAmount: 200,
    total: 1000,
    used: 456,
    status: 'active'
  },
  {
    id: 2,
    name: '会员日专属优惠券',
    type: 'discount',
    amount: 0,
    discount: 0.85,
    minAmount: 0,
    total: 500,
    used: 234,
    status: 'active'
  },
  {
    id: 3,
    name: '618预热优惠券',
    type: 'cash',
    amount: 100,
    minAmount: 500,
    total: 2000,
    used: 0,
    status: 'pending'
  }
])

const activityTypeMap = {
  full_reduction: { label: '满减活动', type: 'primary' },
  discount: { label: '折扣活动', type: 'success' },
  flash_sale: { label: '限时秒杀', type: 'warning' },
  buy_gift: { label: '买赠活动', type: 'info' }
}

const statusMap = {
  pending: { label: '未开始', type: 'info' },
  active: { label: '进行中', type: 'success' },
  ended: { label: '已结束', type: 'info' }
}

const couponTypeMap = {
  cash: { label: '现金券', type: 'danger' },
  discount: { label: '折扣券', type: 'primary' },
  gift: { label: '赠品券', type: 'success' }
}

const couponStatusMap = {
  pending: { label: '未开始', type: 'info' },
  active: { label: '进行中', type: 'success' },
  ended: { label: '已结束', type: 'info' }
}

const getActivityLabel = (type) => activityTypeMap[type]?.label || type
const getActivityType = (type) => activityTypeMap[type]?.type || 'info'
const getStatusLabel = (status) => statusMap[status]?.label || status
const getStatusType = (status) => statusMap[status]?.type || 'info'
const getCouponLabel = (type) => couponTypeMap[type]?.label || type
const getCouponType = (type) => couponTypeMap[type]?.type || 'info'
const getCouponStatusLabel = (status) => couponStatusMap[status]?.label || status
const getCouponStatusType = (status) => couponStatusMap[status]?.type || 'info'

const handleAddActivity = () => {
  ElMessage.info('新建活动功能开发中...')
}

const handleAddCoupon = () => {
  ElMessage.info('新建优惠券功能开发中...')
}

onMounted(() => {
  loading.value = false
})
</script>

<style lang="scss" scoped>
.marketing-list {
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

  .discount {
    color: #f56c6c;
    font-weight: bold;
  }

  .amount {
    color: #f56c6c;
    font-weight: bold;
  }
}
</style>
