<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <span class="page-title">合同详情</span>
        <div>
          <el-button @click="$router.back()">返回</el-button>
          <el-button v-if="contract?.status === 'draft'" type="primary" @click="handleEdit">
            编辑
          </el-button>
        </div>
      </div>

      <el-descriptions :column="2" border v-loading="loading">
        <el-descriptions-item label="合同名称" :span="2">
          {{ contract?.title }}
        </el-descriptions-item>
        <el-descriptions-item label="合同类型">
          {{ contractTypeLabel }}
        </el-descriptions-item>
        <el-descriptions-item label="合同状态">
          <el-tag :type="getStatusType(contract?.status || 'draft')">
            {{ contractStatusMap[contract?.status || 'draft']?.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="甲方">
          {{ contract?.partyA }}
        </el-descriptions-item>
        <el-descriptions-item label="乙方">
          {{ contract?.partyB }}
        </el-descriptions-item>
        <el-descriptions-item label="合同金额">
          <span style="font-weight: bold; color: #f56c6c">
            ¥{{ contract?.amount?.toLocaleString('zh-CN') }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="风险等级">
          <template v-if="contract?.riskLevel">
            <el-tag :style="{ backgroundColor: riskLevelMap[contract.riskLevel].color + '20', color: riskLevelMap[contract.riskLevel].color }">
              {{ riskLevelMap[contract.riskLevel].label }}
            </el-tag>
            <el-button type="primary" link size="small" @click="showRiskDetail">
              查看详情
            </el-button>
          </template>
          <span v-else class="text-muted">未进行风险评估</span>
          <el-button v-if="!contract?.riskLevel" type="primary" link size="small" @click="handleAiReview">
            立即评估
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="开始日期">
          {{ formatDate(contract?.startDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="结束日期">
          {{ formatDate(contract?.endDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(contract?.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(contract?.updatedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="合同内容" :span="2">
          <div class="contract-content">
            <pre>{{ contract?.content }}</pre>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <div class="action-bar" style="margin-bottom: 20px">
        <el-button
          v-if="contract?.status === 'draft'"
          type="warning"
          @click="handleSubmitApproval"
        >
          <el-icon><Stamp /></el-icon>
          提交审批
        </el-button>
        <el-button
          v-if="contract?.status === 'signed'"
          type="success"
          @click="handleStartPerformance"
        >
          <el-icon><List /></el-icon>
          开始履约
        </el-button>
        <el-button
          v-if="contract?.status === 'approved' || contract?.status === 'pending_signature'"
          type="primary"
          @click="handleSign"
        >
          <el-icon><EditPen /></el-icon>
          签章
        </el-button>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="签章记录" name="signatures">
          <el-table :data="contract?.signatures || []" v-if="contract?.signatures?.length > 0">
            <el-table-column prop="party" label="签署方" width="150" />
            <el-table-column prop="signerName" label="签署人" width="150" />
            <el-table-column prop="signatureDate" label="签署时间">
              <template #default="{ row }">
                {{ formatDateTime(row.signatureDate) }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无签章记录" />
        </el-tab-pane>

        <el-tab-pane label="审批历史" name="approval">
          <el-timeline v-if="contract?.approvalHistory?.length > 0">
            <el-timeline-item
              v-for="(step, index) in contract?.approvalHistory"
              :key="step.id"
              :type="getApprovalStepType(step.status)"
              :timestamp="formatDateTime(step.timestamp)"
              placement="top"
            >
              <el-card>
                <div style="display: flex; justify-content: space-between; align-items: center">
                  <div>
                    <strong>{{ step.approver }}</strong>
                    <el-tag :type="getApprovalStepType(step.status)" size="small" style="margin-left: 10px">
                      {{ step.status === 'approved' ? '已通过' : step.status === 'rejected' ? '已驳回' : '待审批' }}
                    </el-tag>
                  </div>
                </div>
                <p v-if="step.comment" class="text-muted" style="margin: 10px 0 0 0">
                  意见：{{ step.comment }}
                </p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无审批记录" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="submitApprovalVisible"
      title="提交审批"
      width="500px"
    >
      <el-form :model="approvalForm" label-width="100px">
        <el-form-item label="选择审批人">
          <el-select
            v-model="approvalForm.approver"
            placeholder="请选择审批人"
            style="width: 100%"
          >
            <el-option
              v-for="user in approvers"
              :key="user.id"
              :label="`${user.name} (${userStore.roleLabels[user.role]})`"
              :value="user.name"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="submitApprovalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSubmitApproval">确认提交</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="signVisible"
      title="合同签章"
      width="500px"
    >
      <el-form :model="signForm" label-width="100px">
        <el-form-item label="签署方">
          <el-select v-model="signForm.party" placeholder="请选择签署方" style="width: 100%">
            <el-option :label="contract?.partyA" :value="contract?.partyA" />
            <el-option :label="contract?.partyB" :value="contract?.partyB" />
          </el-select>
        </el-form-item>
        <el-form-item label="签署人">
          <el-input v-model="signForm.signerName" placeholder="请输入签署人姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="signVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSign">确认签章</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="riskDetailVisible"
      title="风险评估详情"
      width="800px"
    >
      <div class="risk-detail">
        <pre v-if="contract?.riskAnalysis">{{ contract.riskAnalysis }}</pre>
        <span v-else class="text-muted">暂无风险分析详情</span>
      </div>
      <template #footer>
        <el-button @click="riskDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { contractApi } from '@/api/contracts'
import { aiReviewApi } from '@/api/aiReview'
import { useUserStore } from '@/stores/user'
import type { Contract, ApprovalStep } from '@/types'
import { contractStatusMap, riskLevelMap } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const contractId = ref(route.params.id as string)
const loading = ref(false)
const contract = ref<Contract | null>(null)
const activeTab = ref('signatures')

const submitApprovalVisible = ref(false)
const signVisible = ref(false)
const riskDetailVisible = ref(false)

const approvalForm = reactive({
  approver: ''
})

const signForm = reactive({
  party: '',
  signerName: ''
})

const contractTypeMap: Record<string, string> = {
  sales: '买卖合同',
  lease: '租赁合同',
  service: '服务合同',
  cooperation: '合作协议',
  loan: '借款合同',
  other: '其他合同'
}

const approvers = computed(() => userStore.getApprovers())

const contractTypeLabel = computed(() => {
  return contractTypeMap[contract.value?.type || 'other'] || '其他合同'
})

const formatDate = (date?: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-'
}

const formatDateTime = (date?: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const getStatusType = (status: Contract['status']) => {
  const map: Record<Contract['status'], string> = {
    draft: 'info',
    pending_approval: 'warning',
    approved: 'success',
    rejected: 'danger',
    pending_signature: 'warning',
    signed: 'success',
    performance: 'primary',
    expired: 'info',
    archived: '',
    terminated: 'danger'
  }
  return map[status]
}

const getApprovalStepType = (status: ApprovalStep['status']) => {
  const map: Record<ApprovalStep['status'], 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status]
}

const fetchContract = async () => {
  loading.value = true
  try {
    const res = await contractApi.getById(contractId.value)
    contract.value = res.data
  } catch (error) {
    ElMessage.error('获取合同信息失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  router.push(`/contracts/edit/${contractId.value}`)
}

const handleSubmitApproval = () => {
  approvalForm.approver = ''
  submitApprovalVisible.value = true
}

const confirmSubmitApproval = async () => {
  if (!approvalForm.approver) {
    ElMessage.warning('请选择审批人')
    return
  }

  try {
    await contractApi.submitApproval(contractId.value, approvalForm.approver)
    ElMessage.success('提交审批成功')
    submitApprovalVisible.value = false
    fetchContract()
  } catch (error) {
    ElMessage.error('提交审批失败')
  }
}

const handleStartPerformance = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要开始履约吗？',
      '确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    await contractApi.startPerformance(contractId.value)
    ElMessage.success('已开始履约')
    fetchContract()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleSign = () => {
  signForm.party = ''
  signForm.signerName = ''
  signVisible.value = true
}

const confirmSign = async () => {
  if (!signForm.party || !signForm.signerName) {
    ElMessage.warning('请填写完整的签章信息')
    return
  }

  try {
    await contractApi.sign(contractId.value, {
      party: signForm.party,
      signerName: signForm.signerName
    })
    ElMessage.success('签章成功')
    signVisible.value = false
    fetchContract()
  } catch (error) {
    ElMessage.error('签章失败')
  }
}

const handleAiReview = async () => {
  if (!contract.value?.content) {
    ElMessage.warning('合同内容为空，无法进行风险评估')
    return
  }

  try {
    loading.value = true
    const res = await aiReviewApi.analyzeContract(contractId.value)
    contract.value = res.data.contract
    ElMessage.success('风险评估完成')
  } catch (error) {
    ElMessage.error('风险评估失败')
  } finally {
    loading.value = false
  }
}

const showRiskDetail = () => {
  riskDetailVisible.value = true
}

onMounted(() => {
  fetchContract()
})
</script>

<style scoped>
.contract-content {
  max-height: 400px;
  overflow-y: auto;
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.contract-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.8;
}

.action-bar {
  display: flex;
  gap: 10px;
}

.risk-detail {
  max-height: 500px;
  overflow-y: auto;
}

.risk-detail pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.8;
}
</style>
