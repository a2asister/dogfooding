<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <span class="page-title">履约跟进</span>
      </div>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <div style="text-align: center">
              <div style="font-size: 28px; font-weight: bold; color: #409eff">{{ stats.total }}</div>
              <div style="color: #909399; margin-top: 5px">履约中合同</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div style="text-align: center">
              <div style="font-size: 28px; font-weight: bold; color: #67c23a">{{ stats.completed }}</div>
              <div style="color: #909399; margin-top: 5px">已完成节点</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div style="text-align: center">
              <div style="font-size: 28px; font-weight: bold; color: #e6a23c">{{ stats.pending }}</div>
              <div style="color: #909399; margin-top: 5px">待完成节点</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div style="text-align: center">
              <div style="font-size: 28px; font-weight: bold; color: #f56c6c">{{ stats.overdue }}</div>
              <div style="color: #909399; margin-top: 5px">逾期节点</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-table :data="performanceContracts" v-loading="loading" style="width: 100%" stripe row-key="id">
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
        <el-table-column prop="amount" label="合同金额" width="130">
          <template #default="{ row }">
            <span>¥{{ (row.amount || 0).toLocaleString('zh-CN') }}</span>
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
        <el-table-column label="履约进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="getProgress(row)" :stroke-width="10" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button type="primary" link size="small" @click="viewContract(row.id)">
                查看
              </el-button>
              <el-button type="success" link size="small" @click="handleAddRecord(row)">
                添加节点
              </el-button>
              <el-button type="info" link size="small" @click="handleViewRecords(row)">
                履约记录
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="performanceContracts.length === 0 && !loading" description="暂无履约中合同" />
    </div>

    <el-dialog
      v-model="addRecordVisible"
      title="添加履约节点"
      width="500px"
    >
      <el-form :model="recordForm" label-width="100px">
        <el-form-item label="合同名称">
          <el-input :value="selectedContract ? selectedContract.title : ''" disabled />
        </el-form-item>
        <el-form-item label="节点类型">
          <el-select v-model="recordForm.type" placeholder="请选择节点类型" style="width: 100%">
            <el-option label="付款节点" value="payment" />
            <el-option label="交付节点" value="delivery" />
            <el-option label="里程碑节点" value="milestone" />
          </el-select>
        </el-form-item>
        <el-form-item label="节点描述">
          <el-input
            v-model="recordForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入节点描述"
          />
        </el-form-item>
        <el-form-item label="金额" v-if="recordForm.type === 'payment'">
          <el-input-number
            v-model="recordForm.amount"
            :min="0"
            :precision="2"
            placeholder="请输入金额"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="计划完成日期">
          <el-date-picker
            v-model="recordForm.dueDate"
            type="date"
            placeholder="请选择计划完成日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="recordForm.notes"
            type="textarea"
            :rows="2"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addRecordVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddRecord">确认添加</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="recordsVisible"
      title="履约记录"
      width="800px"
    >
      <div v-if="currentRecords.length > 0">
        <el-table :data="currentRecords" style="width: 100%" stripe>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getRecordTypeTag(row.type)">
                {{ typeLabelMap[row.type] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">
              <span v-if="row.amount">¥{{ row.amount.toLocaleString('zh-CN') }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="dueDate" label="计划日期" width="120">
            <template #default="{ row }">
              {{ formatDate(row.dueDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="completedDate" label="完成日期" width="120">
            <template #default="{ row }">
              {{ row.completedDate ? formatDate(row.completedDate) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)">
                {{ statusLabelMap[row.status] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button
                  v-if="row.status === 'pending'"
                  type="success"
                  link
                  size="small"
                  @click="handleCompleteRecord(row)"
                >
                  标记完成
                </el-button>
                <el-button
                  v-if="row.status === 'pending'"
                  type="danger"
                  link
                  size="small"
                  @click="handleCancelRecord(row)"
                >
                  取消
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-empty v-else description="暂无履约记录" />
      <template #footer>
        <el-button @click="recordsVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { contractApi } from '@/api/contracts'
import { performanceApi } from '@/api/performance'
import type { Contract, PerformanceRecord } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()

const loading = ref(false)
const contracts = ref<Contract[]>([])
const allRecords = ref<PerformanceRecord[]>([])

const addRecordVisible = ref(false)
const recordsVisible = ref(false)
const selectedContract = ref<Contract | null>(null)
const currentRecords = ref<PerformanceRecord[]>([])

const stats = reactive({
  total: 0,
  completed: 0,
  pending: 0,
  overdue: 0
})

const recordForm = reactive({
  type: 'milestone' as 'payment' | 'delivery' | 'milestone',
  description: '',
  amount: 0,
  dueDate: '',
  notes: ''
})

const contractTypeMap: Record<string, string> = {
  sales: '买卖合同',
  lease: '租赁合同',
  service: '服务合同',
  cooperation: '合作协议',
  loan: '借款合同',
  other: '其他合同'
}

const typeLabelMap: Record<string, string> = {
  payment: '付款',
  delivery: '交付',
  milestone: '里程碑'
}

const statusLabelMap: Record<string, string> = {
  pending: '待完成',
  completed: '已完成',
  overdue: '逾期',
  cancelled: '已取消'
}

const performanceContracts = computed(() => {
  return contracts.value.filter(c => c.status === 'performance')
})

const formatDate = (date?: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-'
}

const getProgress = (contract: Contract) => {
  const records = allRecords.value.filter(r => r.contractId === contract.id)
  if (records.length === 0) return 0
  const completed = records.filter(r => r.status === 'completed').length
  return Math.round((completed / records.length) * 100)
}

const getRecordTypeTag = (type: string) => {
  const map: Record<string, string> = {
    payment: 'danger',
    delivery: 'primary',
    milestone: 'success'
  }
  return map[type] || ''
}

const getStatusTag = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    completed: 'success',
    overdue: 'danger',
    cancelled: 'info'
  }
  return map[status] || ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const [contractsRes, recordsRes] = await Promise.all([
      contractApi.getAll(),
      performanceApi.getAll()
    ])

    contracts.value = contractsRes.data
    allRecords.value = recordsRes.data

    stats.total = performanceContracts.value.length
    stats.completed = allRecords.value.filter(r => r.status === 'completed').length
    stats.pending = allRecords.value.filter(r => r.status === 'pending').length
    stats.overdue = allRecords.value.filter(r => r.status === 'overdue').length
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

const viewContract = (id: string) => {
  router.push(`/contracts/detail/${id}`)
}

const handleAddRecord = (row: Contract) => {
  selectedContract.value = row
  recordForm.type = 'milestone'
  recordForm.description = ''
  recordForm.amount = 0
  recordForm.dueDate = dayjs().format('YYYY-MM-DD')
  recordForm.notes = ''
  addRecordVisible.value = true
}

const confirmAddRecord = async () => {
  if (!selectedContract.value) return
  if (!recordForm.description || !recordForm.dueDate) {
    ElMessage.warning('请填写完整的信息')
    return
  }

  try {
    const data: Partial<PerformanceRecord> = {
      contractId: selectedContract.value.id,
      type: recordForm.type,
      description: recordForm.description,
      dueDate: recordForm.dueDate
    }
    if (recordForm.type === 'payment' && recordForm.amount > 0) {
      data.amount = recordForm.amount
    }
    if (recordForm.notes) {
      data.notes = recordForm.notes
    }

    await performanceApi.create(data)
    ElMessage.success('添加成功')
    addRecordVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

const handleViewRecords = (row: Contract) => {
  currentRecords.value = allRecords.value.filter(r => r.contractId === row.id)
  recordsVisible.value = true
}

const handleCompleteRecord = async (record: PerformanceRecord) => {
  const contractId = record.contractId
  try {
    await ElMessageBox.confirm(
      '确定要标记该节点为完成吗？',
      '确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    await performanceApi.complete(record.id)
    ElMessage.success('已标记完成')
    await fetchData()
    currentRecords.value = allRecords.value.filter(r => r.contractId === contractId)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleCancelRecord = async (record: PerformanceRecord) => {
  const contractId = record.contractId
  try {
    await ElMessageBox.confirm(
      '确定要取消该节点吗？',
      '确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await performanceApi.cancel(record.id)
    ElMessage.success('已取消')
    await fetchData()
    currentRecords.value = allRecords.value.filter(r => r.contractId === contractId)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>
