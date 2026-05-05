<template>
  <div class="underwriting">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="需补充信息" value="needs_more_info" />
          </el-select>
        </el-form-item>
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

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>核保记录列表</span>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="核保编号" width="120" />
        <el-table-column prop="applicationId" label="投保申请" width="120" />
        <el-table-column prop="underwriterName" label="核保员" width="120" />
        <el-table-column label="风险等级" width="100">
          <template #default="scope">
            <el-tag :type="getRiskLevelType(scope.row.riskAssessment?.riskLevel)">
              {{ getRiskLevelText(scope.row.riskAssessment?.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="风险评分" width="100">
          <template #default="scope">
            <el-progress :percentage="scope.row.riskAssessment?.score || 0" :color="getProgressColor(scope.row.riskAssessment?.riskLevel)" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recommendation" label="核保建议" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link>查看详情</el-button>
            <el-button type="success" link v-if="scope.row.status === 'pending'">通过</el-button>
            <el-button type="danger" link v-if="scope.row.status === 'pending'">拒绝</el-button>
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
import { underwritingRecordApi } from '../api'

const loading = ref(false)
const tableData = ref<any[]>([])

const filterForm = reactive({
  status: '',
  riskLevel: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'approved': 'success',
    'rejected': 'danger',
    'pending': 'warning',
    'needs_more_info': 'primary'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'pending': '待处理',
    'approved': '已通过',
    'rejected': '已拒绝',
    'needs_more_info': '需补充信息'
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
    const res = await underwritingRecordApi.getAll()
    let data = res.data || []
    
    if (filterForm.status) {
      data = data.filter((item: any) => item.status === filterForm.status)
    }
    if (filterForm.riskLevel) {
      data = data.filter((item: any) => item.riskAssessment?.riskLevel === filterForm.riskLevel)
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
  filterForm.status = ''
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
.underwriting {
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
