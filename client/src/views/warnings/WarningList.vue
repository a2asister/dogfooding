<template>
  <div class="page-container">
    <div class="card-container">
      <div class="page-header">
        <span class="page-title">到期预警</span>
        <div>
          <el-select v-model="daysFilter" placeholder="预警天数" style="width: 150px" @change="fetchData">
            <el-option :label="7天内" :value="7" />
            <el-option :label="15天内" :value="15" />
            <el-option :label="30天内" :value="30" />
            <el-option :label="60天内" :value="60" />
          </el-select>
        </div>
      </div>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="8">
          <el-card class="warning-stat-card critical">
            <div class="stat-content">
              <el-icon size="40"><Warning /></el-icon>
              <div class="stat-info">
                <div class="stat-number">{{ urgentCount }}</div>
                <div class="stat-label">7天内到期</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="warning-stat-card warning">
            <div class="stat-content">
              <el-icon size="40"><Clock /></el-icon>
              <div class="stat-info">
                <div class="stat-number">{{ mediumCount }}</div>
                <div class="stat-label">30天内到期</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="warning-stat-card normal">
            <div class="stat-content">
              <el-icon size="40"><Calendar /></el-icon>
              <div class="stat-info">
                <div class="stat-number">{{ normalCount }}</div>
                <div class="stat-label">60天内到期</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-table :data="warningContracts" v-loading="loading" style="width: 100%" stripe row-key="id">
        <el-table-column prop="urgency" label="紧急程度" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getUrgencyType(row.daysLeft)" effect="dark">
              {{ getUrgencyLabel(row.daysLeft) }}
            </el-tag>
          </template>
        </el-table-column>
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
        <el-table-column prop="endDate" label="到期日期" width="110">
          <template #default="{ row }">
            <span :style="{ color: getDaysColor(row.daysLeft) }">
              {{ formatDate(row.endDate) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="daysLeft" label="剩余天数" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getDaysTagType(row.daysLeft)" effect="light">
              {{ row.daysLeft }} 天
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button type="primary" link size="small" @click="viewContract(row.id)">
                查看详情
              </el-button>
              <el-button
                v-if="row.status === 'performance'"
                type="success"
                link
                size="small"
                @click="handleArchive(row)"
              >
                归档
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="warningContracts.length === 0 && !loading" description="暂无到期预警合同" />
    </div>

    <el-dialog
      v-model="archiveVisible"
      title="合同归档"
      width="500px"
    >
      <el-form :model="archiveForm" label-width="100px">
        <el-form-item label="合同名称">
          <el-input :value="selectedContract ? selectedContract.title : ''" disabled />
        </el-form-item>
        <el-form-item label="关键词">
          <el-select
            v-model="archiveForm.keywords"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入关键词，按回车确认"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="访问级别">
          <el-select v-model="archiveForm.accessLevel" placeholder="请选择访问级别" style="width: 100%">
            <el-option label="公开" value="public" />
            <el-option label="内部" value="internal" />
            <el-option label="机密" value="confidential" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="archiveVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmArchive">确认归档</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { contractApi } from '@/api/contracts'
import type { Contract } from '@/types'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const warningContracts = ref<(Contract & { daysLeft: number })[]>([])
const daysFilter = ref(30)
const archiveVisible = ref(false)
const selectedContract = ref<Contract | null>(null)

const archiveForm = reactive({
  keywords: [] as string[],
  accessLevel: 'internal' as 'public' | 'internal' | 'confidential'
})

const contractTypeMap: Record<string, string> = {
  sales: '买卖合同',
  lease: '租赁合同',
  service: '服务合同',
  cooperation: '合作协议',
  loan: '借款合同',
  other: '其他合同'
}

const urgentCount = computed(() => warningContracts.value.filter(c => c.daysLeft <= 7).length)
const mediumCount = computed(() => warningContracts.value.filter(c => c.daysLeft > 7 && c.daysLeft <= 30).length)
const normalCount = computed(() => warningContracts.value.filter(c => c.daysLeft > 30 && c.daysLeft <= 60).length)

const formatDate = (date?: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-'
}

const getUrgencyType = (daysLeft: number) => {
  if (daysLeft <= 7) return 'danger'
  if (daysLeft <= 30) return 'warning'
  return 'info'
}

const getUrgencyLabel = (daysLeft: number) => {
  if (daysLeft <= 7) return '紧急'
  if (daysLeft <= 30) return '一般'
  return '正常'
}

const getDaysTagType = (daysLeft: number) => {
  if (daysLeft <= 7) return 'danger'
  if (daysLeft <= 30) return 'warning'
  return ''
}

const getDaysColor = (daysLeft: number) => {
  if (daysLeft <= 7) return '#f56c6c'
  if (daysLeft <= 30) return '#e6a23c'
  return ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await contractApi.getExpiring(daysFilter.value)
    warningContracts.value = res.data.map(c => ({
      ...c,
      daysLeft: Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    })).sort((a, b) => a.daysLeft - b.daysLeft)
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

const viewContract = (id: string) => {
  router.push(`/contracts/detail/${id}`)
}

const handleArchive = (row: Contract) => {
  selectedContract.value = row
  archiveForm.keywords = [row.title, row.type]
  archiveForm.accessLevel = 'internal'
  archiveVisible.value = true
}

const confirmArchive = async () => {
  if (!selectedContract.value) return

  try {
    await ElMessageBox.confirm(
      '归档后合同状态将变更为已归档，确定要继续吗？',
      '确认归档',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await contractApi.update(selectedContract.value.id, {
      status: 'expired'
    })

    await contractApi.archive(selectedContract.value.id, {
      keywords: archiveForm.keywords,
      accessLevel: archiveForm.accessLevel,
      archiveBy: userStore.currentUser.name
    })

    ElMessage.success('归档成功')
    archiveVisible.value = false
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('归档失败')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.warning-stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .stat-info {
    .stat-number {
      font-size: 32px;
      font-weight: bold;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

.warning-stat-card.critical {
  :deep(.el-card__body) {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
    color: #fff;
  }

  .stat-label {
    color: rgba(255, 255, 255, 0.8) !important;
  }
}

.warning-stat-card.warning {
  :deep(.el-card__body) {
    background: linear-gradient(135deg, #ffd93d 0%, #f5a623 100%);
    color: #fff;
  }

  .stat-label {
    color: rgba(255, 255, 255, 0.8) !important;
  }
}

.warning-stat-card.normal {
  :deep(.el-card__body) {
    background: linear-gradient(135deg, #6bcb77 0%, #4dd599 100%);
    color: #fff;
  }

  .stat-label {
    color: rgba(255, 255, 255, 0.8) !important;
  }
}
</style>
