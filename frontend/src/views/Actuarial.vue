<template>
  <div class="actuarial">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="风险等级">
          <el-select v-model="filterForm.riskLevel" placeholder="请选择风险等级" clearable>
            <el-option label="低风险" value="low" />
            <el-option label="中风险" value="medium" />
            <el-option label="高风险" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: #409eff;">
            <el-icon :size="32"><DataLine /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalPremium }}</div>
            <div class="stat-label">总保费(万元)</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: #67c23a;">
            <el-icon :size="32"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalClaimAmount }}</div>
            <div class="stat-label">总赔付(万元)</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: #e6a23c;">
            <el-icon :size="32"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.avgLossRatio }}%</div>
            <div class="stat-label">平均赔付率</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background-color: #f56c6c;">
            <el-icon :size="32"><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.highRiskCount }}</div>
            <div class="stat-label">高风险产品</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>精算分析列表</span>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="分析编号" width="100" />
        <el-table-column prop="productName" label="产品名称" min-width="180" />
        <el-table-column label="分析期间" width="200">
          <template #default="scope">
            {{ formatDate(scope.row.analysisPeriod?.startDate) }} - {{ formatDate(scope.row.analysisPeriod?.endDate) }}
          </template>
        </el-table-column>
        <el-table-column label="总保费" width="120">
          <template #default="scope">
            ¥{{ (scope.row.premiumStatistics?.totalPremium / 10000).toFixed(0) }}万
          </template>
        </el-table-column>
        <el-table-column label="总赔付" width="120">
          <template #default="scope">
            ¥{{ (scope.row.claimStatistics?.totalClaimAmount / 10000).toFixed(0) }}万
          </template>
        </el-table-column>
        <el-table-column prop="lossRatio" label="赔付率" width="100">
          <template #default="scope">
            <el-tag :type="getLossRatioType(scope.row.lossRatio)">
              {{ (scope.row.lossRatio * 100).toFixed(0) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="整体风险" width="100">
          <template #default="scope">
            <el-tag :type="getRiskLevelType(scope.row.riskAssessment?.overallRiskLevel)">
              {{ getRiskLevelText(scope.row.riskAssessment?.overallRiskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="利润率" width="100">
          <template #default="scope">
            <el-tag :type="getProfitMarginType(scope.row.profitability?.profitMargin)">
              {{ (scope.row.profitability?.profitMargin * 100).toFixed(0) }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link>查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DataLine,
  Money,
  TrendCharts,
  Warning
} from '@element-plus/icons-vue'
import { actuarialApi } from '../api'

const loading = ref(false)
const tableData = ref<any[]>([])

const filterForm = reactive({
  riskLevel: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const stats = computed(() => {
  let totalPremium = 0
  let totalClaimAmount = 0
  let totalLossRatio = 0
  let highRiskCount = 0

  tableData.value.forEach(item => {
    totalPremium += item.premiumStatistics?.totalPremium || 0
    totalClaimAmount += item.claimStatistics?.totalClaimAmount || 0
    totalLossRatio += item.lossRatio || 0
    if (item.riskAssessment?.overallRiskLevel === 'high') {
      highRiskCount++
    }
  })

  return {
    totalPremium: (totalPremium / 10000).toFixed(0),
    totalClaimAmount: (totalClaimAmount / 10000).toFixed(0),
    avgLossRatio: tableData.value.length > 0 ? ((totalLossRatio / tableData.value.length) * 100).toFixed(0) : '0',
    highRiskCount
  }
})

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

const getLossRatioType = (ratio: number) => {
  if (ratio < 0.7) return 'success'
  if (ratio < 1.0) return 'warning'
  return 'danger'
}

const getProfitMarginType = (margin: number) => {
  if (margin > 0.1) return 'success'
  if (margin > 0) return 'warning'
  return 'danger'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await actuarialApi.getAll()
    let data = res.data || []
    
    if (filterForm.riskLevel) {
      data = data.filter((item: any) => item.riskAssessment?.overallRiskLevel === filterForm.riskLevel)
    }
    
    pagination.total = data.length
    const start = (pagination.currentPage - 1) * pagination.pageSize
    tableData.value = data.slice(start, start + pagination.pageSize)
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  filterForm.riskLevel = ''
  pagination.currentPage = 1
  loadData()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.actuarial {
  padding: 0;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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

.table-card {
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
