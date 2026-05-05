<template>
  <div class="anti-fraud">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="风险等级">
          <el-select v-model="filterForm.riskLevel" placeholder="请选择风险等级" clearable>
            <el-option label="低风险" value="low" />
            <el-option label="中风险" value="medium" />
            <el-option label="高风险" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="调查状态">
          <el-select v-model="filterForm.investigationStatus" placeholder="请选择调查状态" clearable>
            <el-option label="待调查" value="pending" />
            <el-option label="调查中" value="in_progress" />
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
          <span>反欺诈记录列表</span>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="记录编号" width="120" />
        <el-table-column prop="relatedType" label="关联类型" width="100">
          <template #default="scope">
            {{ getRelatedTypeText(scope.row.relatedType) }}
          </template>
        </el-table-column>
        <el-table-column prop="relatedId" label="关联编号" width="120" />
        <el-table-column prop="fraudRiskScore" label="风险评分" width="100">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.fraudRiskScore" 
              :color="getProgressColor(scope.row.riskLevel)"
              :stroke-width="10"
            />
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="风险等级" width="100">
          <template #default="scope">
            <el-tag :type="getRiskLevelType(scope.row.riskLevel)">
              {{ getRiskLevelText(scope.row.riskLevel) }}
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
        <el-table-column prop="investigationResult" label="调查结果" width="120">
          <template #default="scope">
            <el-tag :type="getInvestigationResultType(scope.row.investigationResult)">
              {{ getInvestigationResultText(scope.row.investigationResult) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="investigatorName" label="调查员" width="100" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link>查看详情</el-button>
            <el-button type="warning" link v-if="scope.row.investigationStatus === 'pending'">开始调查</el-button>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { antiFraudApi } from '../api'

const loading = ref(false)
const tableData = ref<any[]>([])

const filterForm = reactive({
  riskLevel: '',
  investigationStatus: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const getRelatedTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'application': '投保申请',
    'claim': '理赔申请',
    'policy': '保单'
  }
  return textMap[type] || type
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

const getInvestigationResultType = (result: string) => {
  const typeMap: Record<string, string> = {
    'no_fraud': 'success',
    'suspected_fraud': 'warning',
    'confirmed_fraud': 'danger'
  }
  return typeMap[result] || 'info'
}

const getInvestigationResultText = (result: string) => {
  const textMap: Record<string, string> = {
    'no_fraud': '无欺诈',
    'suspected_fraud': '疑似欺诈',
    'confirmed_fraud': '确认欺诈'
  }
  return textMap[result] || result
}

const getProgressColor = (level: string) => {
  const colorMap: Record<string, string> = {
    'low': '#67c23a',
    'medium': '#e6a23c',
    'high': '#f56c6c'
  }
  return colorMap[level] || '#409eff'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await antiFraudApi.getAll()
    let data = res.data || []
    
    if (filterForm.riskLevel) {
      data = data.filter((item: any) => item.riskLevel === filterForm.riskLevel)
    }
    if (filterForm.investigationStatus) {
      data = data.filter((item: any) => item.investigationStatus === filterForm.investigationStatus)
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
  filterForm.investigationStatus = ''
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
.anti-fraud {
  padding: 0;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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
