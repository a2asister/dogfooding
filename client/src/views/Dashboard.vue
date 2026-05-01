<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <div class="stat-card blue flex justify-between items-center">
          <div>
            <div class="stat-label">合同总数</div>
            <div class="stat-number">{{ stats.total }}</div>
          </div>
          <el-icon class="stat-icon"><Document /></el-icon>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card green flex justify-between items-center">
          <div>
            <div class="stat-label">履约中</div>
            <div class="stat-number">{{ stats.performance }}</div>
          </div>
          <el-icon class="stat-icon"><List /></el-icon>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card orange flex justify-between items-center">
          <div>
            <div class="stat-label">待审批</div>
            <div class="stat-number">{{ stats.pendingApproval }}</div>
          </div>
          <el-icon class="stat-icon"><Stamp /></el-icon>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card purple flex justify-between items-center">
          <div>
            <div class="stat-label">即将到期</div>
            <div class="stat-number">{{ stats.expiring }}</div>
          </div>
          <el-icon class="stat-icon"><Warning /></el-icon>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="16">
        <div class="card-container">
          <div class="page-header">
            <span class="page-title">最近合同</span>
            <el-button type="primary" link @click="$router.push('/contracts')">查看全部</el-button>
          </div>
          <el-table :data="recentContracts" v-loading="loading" style="width: 100%">
            <el-table-column prop="title" label="合同名称" min-width="200">
              <template #default="{ row }">
                <el-link type="primary" @click="viewContract(row.id)">
                  {{ row.title }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="合同类型" width="120" />
            <el-table-column prop="partyA" label="甲方" width="140" show-overflow-tooltip />
            <el-table-column prop="amount" label="金额" width="130">
              <template #default="{ row }">
                <span>¥{{ formatAmount(row.amount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ contractStatusMap[row.status].label }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="card-container">
          <div class="page-header">
            <span class="page-title">待办事项</span>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in todos"
              :key="index"
              :type="item.type"
              :timestamp="item.timestamp"
              placement="top"
            >
              <el-card :body-style="{ padding: '10px' }">
                <h4 style="margin-bottom: 5px">{{ item.title }}</h4>
                <p class="text-muted" style="margin: 0; font-size: 12px">{{ item.description }}</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item v-if="todos.length === 0" type="info">
              <el-card :body-style="{ padding: '10px', textAlign: 'center' }">
                <p class="text-muted">暂无待办事项</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <div class="card-container">
          <div class="page-header">
            <span class="page-title">合同状态分布</span>
          </div>
          <div class="chart-placeholder" style="height: 300px; display: flex; align-items: center; justify-content: center;">
            <div v-if="!loading" style="text-align: center;">
              <el-row :gutter="10">
                <el-col :span="12" v-for="(item, index) in statusDistribution" :key="index">
                  <div class="status-stat-item" :class="item.type">
                    <div class="count">{{ item.count }}</div>
                    <div class="label">{{ item.label }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card-container">
          <div class="page-header">
            <span class="page-title">即将到期合同</span>
            <el-button type="primary" link @click="$router.push('/warnings')">查看全部</el-button>
          </div>
          <el-table :data="expiringContracts" v-loading="loading" style="width: 100%">
            <el-table-column prop="title" label="合同名称" min-width="180">
              <template #default="{ row }">
                <el-link type="primary" @click="viewContract(row.id)">
                  {{ row.title }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="endDate" label="到期日期" width="120">
              <template #default="{ row }">
                <span>{{ formatDate(row.endDate) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="daysLeft" label="剩余天数" width="100">
              <template #default="{ row }">
                <el-tag :type="getDaysLeftType(row.daysLeft)">
                  {{ row.daysLeft }} 天
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { contractApi } from '@/api/contracts'
import type { Contract } from '@/types'
import { contractStatusMap } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const contracts = ref<Contract[]>([])
const expiringContracts = ref<Contract[]>([])

const stats = reactive({
  total: 0,
  performance: 0,
  pendingApproval: 0,
  expiring: 0
})

const todos = ref<Array<{
  title: string
  description: string
  timestamp: string
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}>>([])

const statusDistribution = computed(() => {
  const distribution = [
    { status: 'draft', label: '草稿', type: 'info', count: 0 },
    { status: 'pending_approval', label: '待审批', type: 'warning', count: 0 },
    { status: 'approved', label: '已审批', type: 'success', count: 0 },
    { status: 'performance', label: '履约中', type: 'primary', count: 0 },
    { status: 'signed', label: '已签署', type: 'success', count: 0 },
    { status: 'archived', label: '已归档', type: 'info', count: 0 }
  ]

  contracts.value.forEach(c => {
    const item = distribution.find(d => d.status === c.status)
    if (item) item.count++
  })

  return distribution.filter(d => d.count > 0)
})

const recentContracts = computed(() => {
  return [...contracts.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN')
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const getStatusType = (status: Contract['status']) => {
  const map: Record<Contract['status'], string> = {
    draft: 'info',
    pending_approval: 'warning',
    approved: 'success',
    rejected: 'danger',
    pending_signature: 'warning',
    signed: 'success',
    performance: 'primary',
    expired: 'info',
    archived: '',
    terminated: 'danger'
  }
  return map[status]
}

const getDaysLeftType = (days: number) => {
  if (days <= 7) return 'danger'
  if (days <= 30) return 'warning'
  return 'info'
}

const viewContract = (id: string) => {
  router.push(`/contracts/detail/${id}`)
}

const fetchData = async () => {
  loading.value = true
  try {
    const [contractsRes, expiringRes] = await Promise.all([
      contractApi.getAll(),
      contractApi.getExpiring(30)
    ])

    contracts.value = contractsRes.data
    expiringContracts.value = expiringRes.data.map(c => ({
      ...c,
      daysLeft: Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }))

    stats.total = contracts.value.length
    stats.performance = contracts.value.filter(c => c.status === 'performance').length
    stats.pendingApproval = contracts.value.filter(c => c.status === 'pending_approval').length
    stats.expiring = expiringRes.data.length

    generateTodos()
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

const generateTodos = () => {
  const todosList: typeof todos.value = []

  const pendingApprovals = contracts.value.filter(c => c.status === 'pending_approval')
  pendingApprovals.forEach(c => {
    todosList.push({
      title: `合同待审批: ${c.title}`,
      description: `合同金额: ¥${formatAmount(c.amount)}`,
      timestamp: dayjs(c.createdAt).format('YYYY-MM-DD HH:mm'),
      type: 'warning'
    })
  })

  expiringContracts.value.forEach(c => {
    const daysLeft = Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    todosList.push({
      title: `合同即将到期: ${c.title}`,
      description: `剩余 ${daysLeft} 天到期`,
      timestamp: dayjs(c.endDate).format('YYYY-MM-DD'),
      type: daysLeft <= 7 ? 'danger' : 'warning'
    })
  })

  todos.value = todosList.slice(0, 5)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-row {
  margin-bottom: 20px;
}

.content-row {
  margin-bottom: 20px;
}

.status-stat-item {
  padding: 15px;
  margin: 5px 0;
  border-radius: 4px;
  text-align: center;
}

.status-stat-item .count {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.status-stat-item .label {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.status-stat-item.primary .count { color: #409eff; }
.status-stat-item.success .count { color: #67c23a; }
.status-stat-item.warning .count { color: #e6a23c; }
.status-stat-item.info .count { color: #909399; }
</style>
