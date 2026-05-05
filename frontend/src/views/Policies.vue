<template>
  <div class="policies">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="保单号">
          <el-input v-model="filterForm.policyNumber" placeholder="请输入保单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="有效" value="active" />
            <el-option label="失效" value="lapsed" />
            <el-option label="退保" value="surrendered" />
            <el-option label="满期" value="matured" />
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
          <span>保单列表</span>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="编号" width="100" />
        <el-table-column prop="policyNumber" label="保单号" width="150" />
        <el-table-column prop="insuredPersonId" label="投保人" width="120" />
        <el-table-column prop="productId" label="产品" width="100" />
        <el-table-column prop="coverageAmount" label="保额" width="120">
          <template #default="scope">
            ¥{{ scope.row.coverageAmount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="premiumAmount" label="保费" width="100">
          <template #default="scope">
            ¥{{ scope.row.premiumAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="effectiveDate" label="生效日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.effectiveDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="expiryDate" label="到期日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.expiryDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link>查看详情</el-button>
            <el-button type="warning" link>理赔</el-button>
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
import { insurancePolicyApi } from '../api'

const loading = ref(false)
const tableData = ref<any[]>([])

const filterForm = reactive({
  policyNumber: '',
  status: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'active': 'success',
    'lapsed': 'danger',
    'surrendered': 'warning',
    'matured': 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '有效',
    'lapsed': '失效',
    'surrendered': '退保',
    'matured': '满期'
  }
  return textMap[status] || status
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await insurancePolicyApi.getAll()
    let data = res.data || []
    
    if (filterForm.policyNumber) {
      data = data.filter((item: any) => item.policyNumber.includes(filterForm.policyNumber))
    }
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
  filterForm.policyNumber = ''
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

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.policies {
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
