<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <span class="page-title">线上签章</span>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="待签章合同" name="pending">
          <el-table :data="pendingSignatures" v-loading="loading" style="width: 100%" stripe>
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
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag type="warning">
                  {{ row.status === 'approved' ? '待首次签章' : '待其他方签章' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="signatures" label="已签章" width="120">
              <template #default="{ row }">
                <span>{{ (row.signatures || []).length }} / 2</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button type="primary" link size="small" @click="viewContract(row.id)">
                    查看
                  </el-button>
                  <el-button type="success" link size="small" @click="handleSign(row)">
                    签章
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="pendingSignatures.length === 0 && !loading" description="暂无待签章合同" />
        </el-tab-pane>

        <el-tab-pane label="已签章合同" name="signed">
          <el-table :data="signedContracts" v-loading="loading" style="width: 100%" stripe>
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
            <el-table-column label="签章方" width="200">
              <template #default="{ row }">
                <div>
                  <el-tag v-for="sig in row.signatures" :key="sig.id" style="margin-right: 5px; margin-bottom: 5px">
                    {{ sig.party }} - {{ sig.signerName }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'signed' ? 'success' : 'primary'">
                  {{ row.status === 'signed' ? '已签署' : '履约中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewContract(row.id)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="signedContracts.length === 0 && !loading" description="暂无已签章合同" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="signVisible"
      title="合同签章"
      width="500px"
    >
      <el-form :model="signForm" label-width="100px">
        <el-form-item label="合同名称">
          <el-input :value="selectedContract ? selectedContract.title : ''" disabled />
        </el-form-item>
        <el-form-item label="签署方">
          <el-select v-model="signForm.party" placeholder="请选择签署方" style="width: 100%">
            <el-option 
              v-if="selectedContract" 
              :label="selectedContract.partyA" 
              :value="selectedContract.partyA" 
            />
            <el-option 
              v-if="selectedContract" 
              :label="selectedContract.partyB" 
              :value="selectedContract.partyB" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="签署人">
          <el-input v-model="signForm.signerName" placeholder="请输入签署人姓名" />
        </el-form-item>
        <el-form-item label="签署日期">
          <el-date-picker
            v-model="signForm.signDate"
            type="date"
            placeholder="选择签署日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="signVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSign">确认签章</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { contractApi } from '@/api/contracts'
import type { Contract } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()

const loading = ref(false)
const contracts = ref<Contract[]>([])
const activeTab = ref('pending')
const signVisible = ref(false)
const selectedContract = ref<Contract | null>(null)

const signForm = reactive({
  party: '',
  signerName: '',
  signDate: dayjs().format('YYYY-MM-DD')
})

const contractTypeMap: Record<string, string> = {
  sales: '买卖合同',
  lease: '租赁合同',
  service: '服务合同',
  cooperation: '合作协议',
  loan: '借款合同',
  other: '其他合同'
}

const pendingSignatures = computed(() => {
  return contracts.value.filter(c => c.status === 'approved' || c.status === 'pending_signature')
})

const signedContracts = computed(() => {
  return contracts.value.filter(c => c.status === 'signed' || c.status === 'performance')
})

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

const handleSign = (row: Contract) => {
  selectedContract.value = row
  signForm.party = ''
  signForm.signerName = ''
  signForm.signDate = dayjs().format('YYYY-MM-DD')
  signVisible.value = true
}

const confirmSign = async () => {
  if (!selectedContract.value) return
  if (!signForm.party || !signForm.signerName) {
    ElMessage.warning('请填写完整的签章信息')
    return
  }

  try {
    await contractApi.sign(selectedContract.value.id, {
      party: signForm.party,
      signerName: signForm.signerName
    })
    ElMessage.success('签章成功')
    signVisible.value = false
    fetchContracts()
  } catch (error) {
    ElMessage.error('签章失败')
  }
}

onMounted(() => {
  fetchContracts()
})
</script>
