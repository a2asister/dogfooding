<template>
  <div>
    <el-card class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex gap-4">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索表单名称"
            style="width: 300px"
            clearable
            @keyup.enter="loadForms"
          />
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            style="width: 150px"
            @change="loadForms"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
          <el-select
            v-model="searchForm.category"
            placeholder="选择分类"
            clearable
            style="width: 150px"
            @change="loadForms"
          >
            <el-option label="通用" value="通用" />
            <el-option label="人事管理" value="人事管理" />
            <el-option label="财务管理" value="财务管理" />
            <el-option label="项目管理" value="项目管理" />
            <el-option label="客户管理" value="客户管理" />
          </el-select>
          <el-button type="primary" @click="loadForms">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
        <el-button type="primary" @click="goToCreate">
          <el-icon><Plus /></el-icon>
          新建表单
        </el-button>
      </div>
    </el-card>

    <el-card>
      <el-table :data="forms" v-loading="loading" stripe>
        <el-table-column prop="name" label="表单名称" min-width="200">
          <template #default="{ row }">
            <el-text class="cursor-pointer" type="primary" @click="editForm(row)">
              {{ row.name }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="字段数量" width="100">
          <template #default="{ row }">
            {{ row.fields?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', `status-${row.status}`]">
              {{ statusMap[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editForm(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="previewForm(row)">预览</el-button>
            <el-button
              v-if="row.status === 'draft'"
              type="success"
              link
              size="small"
              @click="publishForm(row)"
            >发布</el-button>
            <el-button
              v-if="row.status === 'published'"
              type="warning"
              link
              size="small"
              @click="unpublishForm(row)"
            >取消发布</el-button>
            <el-button type="primary" link size="small" @click="viewSubmissions(row)">数据</el-button>
            <el-button type="primary" link size="small" @click="duplicateForm(row)">复制</el-button>
            <el-button type="danger" link size="small" @click="deleteForm(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { getFormList, deleteForm as deleteFormApi, publishForm as publishFormApi, unpublishForm as unpublishFormApi, duplicateForm as duplicateFormApi } from '@/api/form'

const router = useRouter()
const loading = ref(false)
const forms = ref([])

const searchForm = reactive({
  keyword: '',
  status: '',
  category: ''
})

const statusMap = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const loadForms = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchForm.status) params.status = searchForm.status
    
    const data = await getFormList(params)
    forms.value = data || []
  } catch (error) {
    console.error('加载表单失败:', error)
  } finally {
    loading.value = false
  }
}

const goToCreate = () => {
  router.push('/forms/new')
}

const editForm = (row) => {
  router.push(`/forms/${row._id}/edit`)
}

const previewForm = (row) => {
  router.push(`/forms/${row._id}/preview`)
}

const viewSubmissions = (row) => {
  router.push(`/forms/${row._id}/submissions`)
}

const publishForm = async (row) => {
  try {
    await publishFormApi(row._id)
    ElMessage.success('发布成功')
    loadForms()
  } catch (error) {
    console.error('发布失败:', error)
  }
}

const unpublishForm = async (row) => {
  try {
    await unpublishFormApi(row._id)
    ElMessage.success('已取消发布')
    loadForms()
  } catch (error) {
    console.error('取消发布失败:', error)
  }
}

const duplicateForm = async (row) => {
  try {
    await duplicateFormApi(row._id)
    ElMessage.success('复制成功')
    loadForms()
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const deleteForm = (row) => {
  ElMessageBox.confirm('确定要删除该表单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteFormApi(row._id)
      ElMessage.success('删除成功')
      loadForms()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadForms()
})
</script>
