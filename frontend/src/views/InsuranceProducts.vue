<template>
  <div class="insurance-products">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="产品名称">
          <el-input v-model="filterForm.name" placeholder="请输入产品名称" clearable />
        </el-form-item>
        <el-form-item label="产品类型">
          <el-select v-model="filterForm.type" placeholder="请选择产品类型" clearable>
            <el-option label="意外险" value="accident" />
            <el-option label="健康险" value="health" />
            <el-option label="寿险" value="life" />
            <el-option label="财产险" value="property" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
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
          <span>保险产品列表</span>
          <el-button type="primary" @click="handleAdd">新增产品</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="产品编号" width="100" />
        <el-table-column prop="name" label="产品名称" min-width="180" />
        <el-table-column prop="type" label="产品类型" width="100">
          <template #default="scope">
            <el-tag :type="getProductTypeTag(scope.row.type)">
              {{ getProductTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="产品描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="minAge" label="投保年龄" width="120">
          <template #default="scope">
            {{ scope.row.minAge }}-{{ scope.row.maxAge }}岁
          </template>
        </el-table-column>
        <el-table-column prop="minPremium" label="最低保费" width="120">
          <template #default="scope">
            ¥{{ scope.row.minPremium }}
          </template>
        </el-table-column>
        <el-table-column prop="maxCoverage" label="最高保额" width="120">
          <template #default="scope">
            ¥{{ scope.row.maxCoverage.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '停用' }}
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
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择产品类型" style="width: 100%">
            <el-option label="意外险" value="accident" />
            <el-option label="健康险" value="health" />
            <el-option label="寿险" value="life" />
            <el-option label="财产险" value="property" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入产品描述"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最小年龄" prop="minAge">
              <el-input-number v-model="formData.minAge" :min="0" :max="120" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大年龄" prop="maxAge">
              <el-input-number v-model="formData.maxAge" :min="0" :max="120" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低保费" prop="minPremium">
              <el-input-number v-model="formData.minPremium" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高保额" prop="maxCoverage">
              <el-input-number v-model="formData.maxCoverage" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="保障期限" prop="coveragePeriod">
          <el-input v-model="formData.coveragePeriod" placeholder="请输入保障期限" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { insuranceProductApi } from '../api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增产品')
const formRef = ref<FormInstance>()
const tableData = ref<any[]>([])

const filterForm = reactive({
  name: '',
  type: '',
  status: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  name: '',
  type: '',
  description: '',
  minAge: 0,
  maxAge: 100,
  minPremium: 0,
  maxCoverage: 0,
  coveragePeriod: '',
  status: 'active'
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入产品描述', trigger: 'blur' }],
  coveragePeriod: [{ required: true, message: '请输入保障期限', trigger: 'blur' }]
}

const getProductTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    'accident': 'primary',
    'health': 'success',
    'life': 'warning',
    'property': 'danger'
  }
  return typeMap[type] || 'info'
}

const getProductTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'accident': '意外险',
    'health': '健康险',
    'life': '寿险',
    'property': '财产险'
  }
  return textMap[type] || type
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await insuranceProductApi.getAll()
    let data = res.data || []
    
    if (filterForm.name) {
      data = data.filter((item: any) => item.name.includes(filterForm.name))
    }
    if (filterForm.type) {
      data = data.filter((item: any) => item.type === filterForm.type)
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
  filterForm.name = ''
  filterForm.type = ''
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
  dialogTitle.value = '新增产品'
  formData.name = ''
  formData.type = ''
  formData.description = ''
  formData.minAge = 0
  formData.maxAge = 100
  formData.minPremium = 0
  formData.maxCoverage = 0
  formData.coveragePeriod = ''
  formData.status = 'active'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑产品'
  formData.name = row.name
  formData.type = row.type
  formData.description = row.description
  formData.minAge = row.minAge
  formData.maxAge = row.maxAge
  formData.minPremium = row.minPremium
  formData.maxCoverage = row.maxCoverage
  formData.coveragePeriod = row.coveragePeriod
  formData.status = row.status
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该产品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await insuranceProductApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (dialogTitle.value === '新增产品') {
          await insuranceProductApi.create(formData)
          ElMessage.success('新增成功')
        } else {
          // 编辑逻辑
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.insurance-products {
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

.filter-form {
  margin: 0;
}
</style>
