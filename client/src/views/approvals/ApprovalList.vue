<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <span class="page-title">审批管理</span>
      </div>

      <el-table :data="approvals" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="title" label="合同名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="viewContract(row.id)">
              {{ row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="合同类型" width="120">
          <template #default="{ row }">
            {{ contractTypeMap[row.type] || '其他' }}
          </template>
        </el-table-column>
        <el-table-column prop="partyA" label="甲方" width="140" show-overflow-tooltip />
        <el-table-column prop="partyB" label="乙方" width="140" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额(元)" width="130">
          <template #default="{ row }">
            <span>¥{{ (row.amount || 0).toLocaleString('zh-CN') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="currentApprover" label="当前审批人" width="120" />
        <el-table-column prop="submittedAt" label="提交时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime((row.approvalHistory && row.approvalHistory.length > 0) ? row.approvalHistory[0].timestamp : undefined) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button type="primary" link size="small" @click="viewContract(row.id)">
                查看
              </el-button>
              <el-button type="success" link size="small" @click="handleApprove(row)">
                通过
              </el-button>
              <el-button type="danger" link size="small" @click="handleReject(row)">
                驳回
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="approvals.length === 0 && !loading" description="暂无待审批合同" />
    </div>

    <el-dialog
      v-model="approveVisible"
      title="审批通过"
      width="500px"
    >
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="审批人">
          <el-input v-model="approveForm.approver" :disabled="true" />
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input
            v-model="approveForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见（可选）"
          />
        </el-form-item>
        <el-form-item label="下一级审批人">
          <el-select
            v-model="approveForm.nextApprover"
            placeholder="留空则审批完成"
            style="width: 100%"
            clearable
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
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmApprove">确认通过</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="rejectVisible"
      title="驳回审批"
      width="500px"
    >
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item label="审批人">
          <el-input v-model="rejectForm.approver" :disabled="true" />
        </el-form-item>
        <el-form-item label="驳回原因">
          <el-input
            v-model="rejectForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { contractApi } from '@/api/contracts'
import { approvalApi } from '@/api/approvals'
import { useUserStore } from '@/stores/user'
import type { Contract } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const contracts = ref<Contract[]>([])
const approveVisible = ref(false)
const rejectVisible = ref(false)
const selectedContract = ref<Contract | null>(null)

const approveForm = reactive({
  approver: '',
  comment: '',
  nextApprover: ''
})

const rejectForm = reactive({
  approver: '',
  comment: ''
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

const approvals = computed(() => {
  return contracts.value.filter(c => c.status === 'pending_approval')
})

const formatDateTime = (date?: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

const fetchContracts = async () => {
  loading.value = true
  try {
    const res = await contractApi.getAll()
    contracts.value = res.data
  } catch (error) {
    console.error('Failed to fetch contracts:', error)
  } finally {
    loading.value = false
  }
}

const viewContract = (id: string) => {
  router.push(`/contracts/detail/${id}`)
}

const handleApprove = (row: Contract) => {
  selectedContract.value = row
  approveForm.approver = userStore.currentUser.name
  approveForm.comment = ''
  approveForm.nextApprover = ''
  approveVisible.value = true
}

const confirmApprove = async () => {
  if (!selectedContract.value) return

  try {
    const data: { approver: string; comment?: string; nextApprover?: string } = {
      approver: approveForm.approver
    }
    if (approveForm.comment) {
      data.comment = approveForm.comment
    }
    if (approveForm.nextApprover) {
      data.nextApprover = approveForm.nextApprover
    }

    await approvalApi.approve(selectedContract.value.id, data)
    ElMessage.success('审批成功')
    approveVisible.value = false
    fetchContracts()
  } catch (error) {
    ElMessage.error('审批失败')
  }
}

const handleReject = (row: Contract) => {
  selectedContract.value = row
  rejectForm.approver = userStore.currentUser.name
  rejectForm.comment = ''
  rejectVisible.value = true
}

const confirmReject = async () => {
  if (!selectedContract.value) return
  if (!rejectForm.comment) {
    ElMessage.warning('请输入驳回原因')
    return
  }

  try {
    await approvalApi.reject(selectedContract.value.id, {
      approver: rejectForm.approver,
      comment: rejectForm.comment
    })
    ElMessage.success('已驳回')
    rejectVisible.value = false
    fetchContracts()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchContracts()
})
</script>
