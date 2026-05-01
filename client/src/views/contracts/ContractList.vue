<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <span class="page-title">合同管理</span>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建合同
        </el-button>
      </div>

      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索合同名称、甲方、乙方"
          clearable
          style="width: 300px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="statusFilter"
          placeholder="合同状态"
          clearable
          style="width: 150px"
          @change="handleSearch"
          @clear="handleSearch"
        >
          <el-option
            v-for="(item, key) in contractStatusMap"
            :key="key"
            :label="item.label"
            :value="key"
          />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="title" label="合同名称" min-width="200" fixed="left">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">
              {{ row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="合同类型" width="120" />
        <el-table-column prop="partyA" label="甲方" width="140" show-overflow-tooltip />
        <el-table-column prop="partyB" label="乙方" width="140" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额(元)" width="130">
          <template #default="{ row }">
            <span>{{ row.amount.toLocaleString('zh-CN') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light">
              {{ contractStatusMap[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="风险等级" width="100">
          <template #default="{ row }">
            <el-tag
              v-if="row.riskLevel"
              :style="{ backgroundColor: riskLevelMap[row.riskLevel].color + '20', color: riskLevelMap[row.riskLevel].color, borderColor: riskLevelMap[row.riskLevel].color }"
              effect="light"
            >
              {{ riskLevelMap[row.riskLevel].label }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="110">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="结束日期" width="110">
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button type="primary" link size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button
                v-if="row.status === 'draft'"
                type="primary"
                link
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="row.status === 'draft'"
                type="warning"
                link
                size="small"
                @click="handleSubmitApproval(row)"
              >
                提交审批
              </el-button>
              <el-button
                v-if="row.status === 'signed'"
                type="success"
                link
                size="small"
                @click="handleStartPerformance(row)"
              >
                开始履约
              </el-button>
              <el-button
                v-if="row.status === 'draft'"
                type="danger"
                link
                size="small"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { contractApi } from '@/api/contracts'
import { useUserStore } from '@/stores/user'
import type { Contract, ContractStatus } from '@/types'
import { contractStatusMap, riskLevelMap } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const contracts = ref<Contract[]>([])
const searchQuery = ref('')
const statusFilter = ref<ContractStatus | ''>('')
const submitApprovalVisible = ref(false)
const selectedContract = ref<Contract | null>(null)

const approvalForm = reactive({
  approver: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const approvers = computed(() => userStore.getApprovers())

const tableData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return contracts.value.slice(start, end)
})

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
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

const fetchContracts = async () => {
  loading.value = true
  try {
    const params: { status?: ContractStatus; search?: string } = {}
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const res = await contractApi.getAll(params)
    contracts.value = res.data
    pagination.total = res.data.length
  } catch (error) {
    console.error('Failed to fetch contracts:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchContracts()
}

const resetSearch = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  pagination.page = 1
  fetchContracts()
}

const handlePageChange = () => {
}

const handleCreate = () => {
  router.push('/contracts/create')
}

const handleEdit = (row: Contract) => {
  router.push(`/contracts/edit/${row.id}`)
}

const handleView = (row: Contract) => {
  router.push(`/contracts/detail/${row.id}`)
}

const handleDelete = async (row: Contract) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该合同吗？此操作不可恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await contractApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchContracts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmitApproval = (row: Contract) => {
  selectedContract.value = row
  approvalForm.approver = ''
  submitApprovalVisible.value = true
}

const confirmSubmitApproval = async () => {
  if (!approvalForm.approver) {
    ElMessage.warning('请选择审批人')
    return
  }

  if (selectedContract.value) {
    try {
      await contractApi.submitApproval(selectedContract.value.id, approvalForm.approver)
      ElMessage.success('提交审批成功')
      submitApprovalVisible.value = false
      fetchContracts()
    } catch (error) {
      ElMessage.error('提交审批失败')
    }
  }
}

const handleStartPerformance = async (row: Contract) => {
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
    await contractApi.startPerformance(row.id)
    ElMessage.success('已开始履约')
    fetchContracts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  fetchContracts()
})
</script>
