<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: #409eff;">
            <el-icon :size="32"><Ticket /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalProducts }}</div>
            <div class="stat-label">保险产品</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: #67c23a;">
            <el-icon :size="32"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalApplications }}</div>
            <div class="stat-label">投保申请</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: #e6a23c;">
            <el-icon :size="32"><Postcard /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalPolicies }}</div>
            <div class="stat-label">有效保单</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: #f56c6c;">
            <el-icon :size="32"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalClaims }}</div>
            <div class="stat-label">理赔申请</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>最近投保申请</span>
              <el-button type="primary" link @click="$router.push('/insurance-applications')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentApplications" style="width: 100%">
            <el-table-column prop="id" label="申请编号" width="120" />
            <el-table-column prop="insuredPersonId" label="投保人" width="120" />
            <el-table-column prop="coverageAmount" label="保额" width="120">
              <template #default="scope">
                ¥{{ scope.row.coverageAmount.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>最近理赔申请</span>
              <el-button type="primary" link @click="$router.push('/claims')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentClaims" style="width: 100%">
            <el-table-column prop="id" label="理赔编号" width="120" />
            <el-table-column prop="policyNumber" label="保单号" width="150" />
            <el-table-column prop="claimAmount" label="申请金额" width="120">
              <template #default="scope">
                ¥{{ scope.row.claimAmount.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getClaimStatusType(scope.row.status)">
                  {{ getClaimStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <span>待处理核保</span>
          </template>
          <el-table :data="pendingUnderwriting" style="width: 100%">
            <el-table-column prop="id" label="申请编号" width="120" />
            <el-table-column prop="underwriterName" label="核保员" width="120" />
            <el-table-column prop="riskLevel" label="风险等级" width="100">
              <template #default="scope">
                <el-tag :type="getRiskLevelType(scope.row.riskAssessment?.riskLevel)">
                  {{ getRiskLevelText(scope.row.riskAssessment?.riskLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag type="warning">{{ getUnderwritingStatusText(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <span>反欺诈预警</span>
          </template>
          <el-table :data="fraudAlerts" style="width: 100%">
            <el-table-column prop="id" label="预警编号" width="120" />
            <el-table-column prop="relatedType" label="关联类型" width="100">
              <template #default="scope">
                {{ getRelatedTypeText(scope.row.relatedType) }}
              </template>
            </el-table-column>
            <el-table-column prop="riskLevel" label="风险等级" width="100">
              <template #default="scope">
                <el-tag :type="getFraudRiskType(scope.row.riskLevel)">
                  {{ getFraudRiskText(scope.row.riskLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="investigationStatus" label="调查状态" width="100">
              <template #default="scope">
                <el-tag :type="getInvestigationStatusType(scope.row.investigationStatus)">
                  {{ getInvestigationStatusText(scope.row.investigationStatus) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Ticket,
  Document,
  Postcard,
  Money
} from '@element-plus/icons-vue'
import {
  insuranceProductApi,
  insuranceApplicationApi,
  insurancePolicyApi,
  claimApplicationApi,
  underwritingRecordApi,
  antiFraudApi
} from '../api'

const stats = ref({
  totalProducts: 0,
  totalApplications: 0,
  totalPolicies: 0,
  totalClaims: 0
})

const recentApplications = ref<any[]>([])
const recentClaims = ref<any[]>([])
const pendingUnderwriting = ref<any[]>([])
const fraudAlerts = ref<any[]>([])

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'approved': 'success',
    'rejected': 'danger',
    'underwriting': 'warning',
    'submitted': 'primary',
    'draft': 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'draft': '草稿',
    'submitted': '已提交',
    'underwriting': '核保中',
    'approved': '已通过',
    'rejected': '已拒绝',
    'withdrawn': '已撤回'
  }
  return textMap[status] || status
}

const getClaimStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'paid': 'success',
    'approved': 'success',
    'rejected': 'danger',
    'reviewing': 'warning',
    'investigating': 'warning',
    'submitted': 'primary'
  }
  return typeMap[status] || 'info'
}

const getClaimStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'submitted': '已提交',
    'reviewing': '审核中',
    'investigating': '调查中',
    'approved': '已批准',
    'rejected': '已拒绝',
    'paid': '已赔付'
  }
  return textMap[status] || status
}

const getRiskLevelType = (level: string) => {
  const typeMap: Record<string, string> = {
    'low': 'success',
    'medium': 'warning',
    'high': 'danger'
  }
  return typeMap[level] || 'info'
}

const getRiskLevelText = (level: string) => {
  const textMap: Record<string, string> = {
    'low': '低风险',
    'medium': '中风险',
    'high': '高风险'
  }
  return textMap[level] || level
}

const getUnderwritingStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'pending': '待处理',
    'approved': '已通过',
    'rejected': '已拒绝',
    'needs_more_info': '需补充信息'
  }
  return textMap[status] || status
}

const getRelatedTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'application': '投保申请',
    'claim': '理赔申请',
    'policy': '保单'
  }
  return textMap[type] || type
}

const getFraudRiskType = (level: string) => {
  return getRiskLevelType(level)
}

const getFraudRiskText = (level: string) => {
  return getRiskLevelText(level)
}

const getInvestigationStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'completed': 'success',
    'in_progress': 'warning',
    'pending': 'info'
  }
  return typeMap[status] || 'info'
}

const getInvestigationStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'pending': '待调查',
    'in_progress': '调查中',
    'completed': '已完成'
  }
  return textMap[status] || status
}

const loadStats = async () => {
  try {
    const [productsRes, applicationsRes, policiesRes, claimsRes] = await Promise.all([
      insuranceProductApi.getAll(),
      insuranceApplicationApi.getAll(),
      insurancePolicyApi.getAll(),
      claimApplicationApi.getAll()
    ])

    stats.value.totalProducts = productsRes.data?.length || 0
    stats.value.totalApplications = applicationsRes.data?.length || 0
    stats.value.totalPolicies = policiesRes.data?.filter((p: any) => p.status === 'active').length || 0
    stats.value.totalClaims = claimsRes.data?.length || 0

    recentApplications.value = applicationsRes.data?.slice(0, 5) || []
    recentClaims.value = claimsRes.data?.slice(0, 5) || []
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const loadPendingUnderwriting = async () => {
  try {
    const res = await underwritingRecordApi.getAll()
    pendingUnderwriting.value = res.data?.filter((r: any) => r.status === 'pending') || []
  } catch (error) {
    console.error('Failed to load pending underwriting:', error)
  }
}

const loadFraudAlerts = async () => {
  try {
    const res = await antiFraudApi.getAll()
    fraudAlerts.value = res.data?.filter((r: any) => r.riskLevel !== 'low') || []
  } catch (error) {
    console.error('Failed to load fraud alerts:', error)
  }
}

onMounted(() => {
  loadStats()
  loadPendingUnderwriting()
  loadFraudAlerts()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  margin-left: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.content-row {
  margin-bottom: 20px;
}

.content-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
