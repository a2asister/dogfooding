<template>
  <div class="insurance-applications">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="已提交" value="submitted" />
            <el-option label="核保中" value="underwriting" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
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
          <span>投保申请列表</span>
          <el-button type="primary" @click="handleAdd">新增投保</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="申请编号" width="120" />
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
        <el-table-column prop="paymentMethod" label="缴费方式" width="100">
          <template #default="scope">
            {{ getPaymentMethodText(scope.row.paymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link>查看</el-button>
            <el-button type="success" link v-if="scope.row.status === 'submitted'">提交核保</el-button>
            <el-button type="danger" link>删除</el-button>
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
import { insuranceApplicationApi } from '../api'

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
    'rejected': '已拒绝'
  }
  return textMap[status] || status
}

const getPaymentMethodText = (method: string) => {
  const textMap: Record<string, string> = {
    'annual': '年缴',
    'semi-annual': '半年缴',
    'quarterly': '季缴',
    'monthly': '月缴'
  }
  return textMap[method] || method
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await insuranceApplicationApi.getAll()
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
  ElMessage.info('新增投保功能')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.insurance-applications {
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
