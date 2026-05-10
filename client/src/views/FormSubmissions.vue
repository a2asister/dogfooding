<template>
  <div>
    <el-card class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h3 class="text-lg font-medium">{{ form?.name }} - 提交记录</h3>
          <el-tag type="info">共 {{ submissions.length }} 条</el-tag>
        </div>
        <div class="flex gap-2">
          <el-button @click="downloadTemplate">
            <el-icon><Download /></el-icon>
            下载模板
          </el-button>
          <el-upload
            :show-file-list="false"
            :before-upload="handleImport"
            accept=".xlsx,.xls"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              批量导入
            </el-button>
          </el-upload>
          <el-button type="success" @click="exportData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card>
      <el-table :data="submissions" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" />
        <template v-for="field in form?.fields || []" :key="field.id">
          <el-table-column
            v-if="!field.hidden"
            :prop="field.name"
            :label="field.label"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ formatValue(row.data?.[field.name], field) }}
            </template>
          </el-table-column>
        </template>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', `status-${row.status}`]">
              {{ statusMap[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button type="danger" link size="small" @click="deleteItem(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload } from '@element-plus/icons-vue'
import { getForm } from '@/api/form'
import { getSubmissionList, deleteSubmission } from '@/api/submission'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const form = ref(null)
const submissions = ref([])

const statusMap = {
  draft: '草稿',
  submitted: '已提交',
  pending: '审批中',
  approved: '已通过',
  rejected: '已拒绝',
  imported: '已导入'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const formatValue = (value, field) => {
  if (value === undefined || value === null || value === '') return '-'
  
  if (field.type === 'select' || field.type === 'radio') {
    const option = field.options?.find(o => o.value === value)
    return option?.label || value
  }
  
  if (field.type === 'checkbox') {
    if (Array.isArray(value)) {
      return value.map(v => {
        const option = field.options?.find(o => o.value === v)
        return option?.label || v
      }).join(', ')
    }
    return value
  }
  
  if (Array.isArray(value)) {
    return JSON.stringify(value)
  }
  
  return String(value)
}

const loadData = async () => {
  loading.value = true
  try {
    const [formData, submissionsData] = await Promise.all([
      getForm(route.params.id),
      getSubmissionList({ formId: route.params.id })
    ])
    
    form.value = formData
    submissions.value = submissionsData || []
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const viewDetail = (row) => {
  router.push(`/submissions/${row._id}`)
}

const deleteItem = (row) => {
  ElMessageBox.confirm('确定要删除该记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteSubmission(row._id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const downloadTemplate = () => {
  window.location.href = `/api/import-export/template/${route.params.id}`
}

const exportData = () => {
  window.location.href = `/api/import-export/export/${route.params.id}`
}

const handleImport = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await fetch(`/api/import-export/import/${route.params.id}`, {
      method: 'POST',
      body: formData
    })
    const result = await response.json()
    
    if (response.ok) {
      ElMessage.success(`导入成功：${result.successCount} 条，失败：${result.errorCount} 条`)
      if (result.errors?.length > 0) {
        console.log('导入错误:', result.errors)
      }
      loadData()
    } else {
      ElMessage.error(result.error || '导入失败')
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  }
  
  return false
}

onMounted(() => {
  loadData()
})
</script>
