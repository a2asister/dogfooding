<template>
  <div>
    <el-card class="mb-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">提交记录详情</h3>
        <div class="flex gap-2">
          <el-button @click="goBack">返回</el-button>
          <template v-if="canApprove">
            <el-button type="warning" @click="showReturnDialog">
              <el-icon><RefreshLeft /></el-icon>
              退回
            </el-button>
            <el-button type="danger" @click="showRejectDialog">
              <el-icon><Close /></el-icon>
              拒绝
            </el-button>
            <el-button type="success" @click="showApproveDialog">
              <el-icon><Check /></el-icon>
              通过
            </el-button>
          </template>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span class="font-medium">表单数据</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="表单名称">
              {{ submission?.formId?.name }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <span :class="['status-tag', `status-${submission?.status}`]">
                {{ statusMap[submission?.status] }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">
              {{ formatDate(submission?.createdAt) }}
            </el-descriptions-item>
            <template v-for="field in form?.fields || []" :key="field.id">
              <el-descriptions-item v-if="!field.hidden" :label="field.label">
                {{ formatValue(submission?.data?.[field.name], field) }}
              </el-descriptions-item>
            </template>
          </el-descriptions>
        </el-card>

        <el-card class="mt-4">
          <template #header>
            <span class="font-medium">审核流程</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in submission?.workflowHistory || []"
              :key="index"
              :timestamp="formatDate(item.timestamp)"
              :type="getTimelineType(item.action)"
            >
              <h4 class="font-medium">{{ item.step }}</h4>
              <p class="text-sm text-gray-500">{{ getActionText(item.action) }}</p>
              <p v-if="item.comment" class="text-sm mt-1">{{ item.comment }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span class="font-medium">基本信息</span>
          </template>
          <el-form label-position="top">
            <el-form-item label="当前步骤">
              <el-text>{{ submission?.currentWorkflowStep || '-' }}</el-text>
            </el-form-item>
            <el-form-item label="版本">
              <el-text>v{{ submission?.formVersion || 1 }}</el-text>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="actionDialogVisible"
      :title="actionDialogTitle"
      width="500px"
    >
      <el-input
        v-model="actionComment"
        type="textarea"
        :rows="4"
        placeholder="请输入审批意见"
      />
      <template #footer>
        <el-button @click="actionDialogVisible = false">取消</el-button>
        <el-button
          :type="actionDialogType === 'approve' ? 'success' : actionDialogType === 'reject' ? 'danger' : 'warning'"
          @click="executeAction"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RefreshLeft, Close, Check } from '@element-plus/icons-vue'
import { getSubmission } from '@/api/submission'
import { getForm } from '@/api/form'
import { approveSubmission, rejectSubmission, returnSubmission } from '@/api/workflow'

const route = useRoute()
const router = useRouter()

const submission = ref(null)
const form = ref(null)
const actionDialogVisible = ref(false)
const actionDialogTitle = ref('')
const actionDialogType = ref('')
const actionComment = ref('')

const statusMap = {
  draft: '草稿',
  submitted: '已提交',
  pending: '审批中',
  approved: '已通过',
  rejected: '已拒绝',
  imported: '已导入'
}

const canApprove = computed(() => {
  return submission.value?.status === 'pending'
})

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

const getTimelineType = (action) => {
  switch (action) {
    case 'approve': return 'success'
    case 'reject': return 'danger'
    case 'return': return 'warning'
    default: return 'primary'
  }
}

const getActionText = (action) => {
  switch (action) {
    case 'approve': return '已通过'
    case 'reject': return '已拒绝'
    case 'return': return '已退回'
    default: return '提交'
  }
}

const loadData = async () => {
  try {
    const submissionData = await getSubmission(route.params.id)
    submission.value = submissionData
    
    if (submissionData.formId) {
      form.value = submissionData.formId
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const showApproveDialog = () => {
  actionDialogTitle.value = '审批通过'
  actionDialogType.value = 'approve'
  actionComment.value = ''
  actionDialogVisible.value = true
}

const showRejectDialog = () => {
  actionDialogTitle.value = '拒绝审批'
  actionDialogType.value = 'reject'
  actionComment.value = ''
  actionDialogVisible.value = true
}

const showReturnDialog = () => {
  actionDialogTitle.value = '退回修改'
  actionDialogType.value = 'return'
  actionComment.value = ''
  actionDialogVisible.value = true
}

const executeAction = async () => {
  try {
    const data = { comment: actionComment.value }
    
    switch (actionDialogType.value) {
      case 'approve':
        await approveSubmission(route.params.id, data)
        break
      case 'reject':
        await rejectSubmission(route.params.id, data)
        break
      case 'return':
        await returnSubmission(route.params.id, data)
        break
    }
    
    actionDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadData()
})
</script>
