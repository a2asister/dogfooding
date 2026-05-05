<template>
  <div class="insured-persons">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="姓名">
          <el-input v-model="filterForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="filterForm.gender" placeholder="请选择性别" clearable>
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
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
          <span>投保人列表</span>
          <el-button type="primary" @click="handleAdd">新增投保人</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
        <el-table-column prop="id" label="编号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.gender === 'male' ? 'primary' : 'danger'">
              {{ scope.row.gender === 'male' ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="occupation" label="职业" width="120" />
        <el-table-column prop="healthStatus" label="健康状况" width="100">
          <template #default="scope">
            <el-tag :type="getHealthStatusType(scope.row.healthStatus)">
              {{ getHealthStatusText(scope.row.healthStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { insuredPersonApi } from '../api'

const loading = ref(false)
const tableData = ref<any[]>([])

const filterForm = reactive({
  name: '',
  gender: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const getHealthStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'healthy': 'success',
    'minor_issue': 'warning',
    'serious_issue': 'danger'
  }
  return typeMap[status] || 'info'
}

const getHealthStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'healthy': '健康',
    'minor_issue': '轻微问题',
    'serious_issue': '严重问题'
  }
  return textMap[status] || status
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await insuredPersonApi.getAll()
    let data = res.data || []
    
    if (filterForm.name) {
      data = data.filter((item: any) => item.name.includes(filterForm.name))
    }
    if (filterForm.gender) {
      data = data.filter((item: any) => item.gender === filterForm.gender)
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
  filterForm.name = ''
  filterForm.gender = ''
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
  ElMessage.info('新增投保人功能')
}

const handleEdit = (row: any) => {
  ElMessage.info(`编辑投保人: ${row.name}`)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该投保人吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await insuredPersonApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.insured-persons {
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
