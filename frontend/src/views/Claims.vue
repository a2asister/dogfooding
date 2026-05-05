<template>
  <div class="claims">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="已提交" value="submitted" />
            <el-option label="审核中" value="reviewing" />
            <el-option label="调查中" value="investigating" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已赔付" value="paid" />
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
          <span>理赔申请列表</span>
          <el-button type="primary" @click="handleAdd">新增理赔</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="理赔编号" width="120" />
        <el-table-column prop="policyNumber" label="保单号" width="150" />
        <el-table-column prop="claimType" label="理赔类型" width="120">
          <template #default="scope">
            {{ getClaimTypeText(scope.row.claimType) }}
          </template>
        </el-table-column>
        <el-table-column prop="claimAmount" label="申请金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.claimAmount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link>查看详情</el-button>
            <el-button type="success" link v-if="scope.row.status === 'reviewing'">审核</el-button>
            <el-button type="warning" link v-if="scope.row.status === 'approved'">赔付</el-button>
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
import { claimApplicationApi } from '../api'

const loading = ref(false)
const tableData = ref<any[]>([])

const filterForm = reactive({
  status: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const getStatusType = (status: string) => {
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

const getStatusText = (status: string) => {
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

const getClaimTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'accident_death': '意外身故',
    'accident_disability': '意外伤残',
    'medical_expense': '医疗费用',
    'serious_illness': '重大疾病',
    'life_death': '身故理赔'
  }
  return textMap[type] || type
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

const loadData = async () => {
  loading.value = true
  try {
    const res = await claimApplicationApi.getAll()
    let data = res.data || []
    
    if (filterForm.status) {
      data = data.filter((item: any) => item.status === filterForm.status)
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

const handleAdd = () => {
  ElMessage.info('新增理赔功能')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.claims {
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
