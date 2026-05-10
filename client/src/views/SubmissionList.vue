<template>
  <div>
    <el-card class="mb-4">
      <div class="flex gap-4">
        <el-select
          v-model="filter.status"
          placeholder="选择状态"
          clearable
          style="width: 150px"
          @change="loadSubmissions"
        >
          <el-option label="草稿" value="draft" />
          <el-option label="已提交" value="submitted" />
          <el-option label="审批中" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
        <el-button type="primary" @click="loadSubmissions">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </el-card>

    <el-card>
      <el-table :data="submissions" v-loading="loading" stripe>
        <el-table-column label="表单名称" prop="formId.name" />
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
        <el-table-column label="操作" width="150">
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getSubmissionList, deleteSubmission } from '@/api/submission'

const router = useRouter()
const loading = ref(false)
const submissions = ref([])

const filter = reactive({
  status: ''
})

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

const loadSubmissions = async () => {
  loading.value = true
  try {
    const params = {}
    if (filter.status) params.status = filter.status
    
    const data = await getSubmissionList(params)
    submissions.value = data || []
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
      loadSubmissions()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadSubmissions()
})
</script>
