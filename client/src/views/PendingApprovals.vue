<template>
  <div>
    <el-card>
      <el-table :data="approvals" v-loading="loading" stripe>
        <el-table-column label="表单名称" prop="formId.name" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', `status-${row.status}`]">
              {{ statusMap[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="当前步骤" prop="currentWorkflowStep" width="150" />
        <el-table-column prop="createdAt" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="approvals.length === 0 && !loading" description="暂无待审批事项" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPendingApprovals } from '@/api/workflow'

const router = useRouter()
const loading = ref(false)
const approvals = ref([])

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

const loadApprovals = async () => {
  loading.value = true
  try {
    const data = await getPendingApprovals('default')
    approvals.value = data || []
  } catch (error) {
    console.error('加载审批失败:', error)
  } finally {
    loading.value = false
  }
}

const viewDetail = (row) => {
  router.push(`/submissions/${row._id}`)
}

onMounted(() => {
  loadApprovals()
})
</script>
