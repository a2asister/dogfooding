<template>
  <div class="tickets-manage">
    <div class="page-header">
      <div class="filter-bar">
        <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 150px" @change="loadTickets">
          <el-option label="全部状态" value="" />
          <el-option label="待处理" value="pending" />
          <el-option label="已回复" value="replied" />
          <el-option label="已归档" value="archived" />
        </el-select>
      </div>
    </div>

    <div class="table-card card">
      <el-table :data="ticketsList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="contact" label="联系方式" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', row.status]">{{ getStatusName(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="提交时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
            <el-button size="small" type="success" link @click="handleArchive(row)">归档</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50]"
          @size-change="loadTickets"
          @current-change="loadTickets"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="工单详情" width="700px">
      <div v-if="currentTicket" class="ticket-detail">
        <div class="detail-header">
          <h3>{{ currentTicket.title }}</h3>
          <span :class="['status-tag', currentTicket.status]">{{ getStatusName(currentTicket.status) }}</span>
        </div>
        <div class="detail-meta">
          <span>提交人：{{ currentTicket.user_name || '匿名' }}</span>
          <span>联系方式：{{ currentTicket.contact }}</span>
          <span>提交时间：{{ formatDate(currentTicket.created_at) }}</span>
        </div>
        <div class="detail-content">
          <h4>问题描述</h4>
          <p>{{ currentTicket.content }}</p>
        </div>
        <div v-if="currentTicket.reply" class="detail-reply">
          <h4>管理员回复</h4>
          <p>{{ currentTicket.reply }}</p>
          <p class="reply-time">回复时间：{{ formatDate(currentTicket.replied_at || '') }}</p>
        </div>
        <div v-if="currentTicket.status === 'pending'" class="reply-form">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容"
          />
          <el-button type="primary" class="reply-btn" @click="submitReply" :loading="submitting">
            提交回复
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ticketApi } from '../../api'
import type { Ticket } from '../../types'

const filterStatus = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const ticketsList = ref<Ticket[]>([])
const dialogVisible = ref(false)
const currentTicket = ref<Ticket | null>(null)
const replyContent = ref('')
const submitting = ref(false)

const getStatusName = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    replied: '已回复',
    archived: '已归档'
  }
  return map[status] || status
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadTickets = async (): Promise<void> => {
  try {
    const result = await ticketApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      status: filterStatus.value || undefined
    })
    ticketsList.value = result.list
    total.value = result.total
  } catch {
    ticketsList.value = []
  }
}

const handleView = async (row: Ticket): Promise<void> => {
  try {
    const result = await ticketApi.getDetail(row.id)
    currentTicket.value = result
    replyContent.value = ''
    dialogVisible.value = true
  } catch {
    ElMessage.error('获取详情失败')
  }
}

const handleArchive = (row: Ticket): void => {
  ElMessageBox.confirm('确定要归档该工单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await ticketApi.updateStatus(row.id, 'archived')
      ElMessage.success('归档成功')
      loadTickets()
    } catch {
      ElMessage.error('归档失败')
    }
  }).catch(() => {})
}

const submitReply = async (): Promise<void> => {
  if (!replyContent.value.trim()) {
    ElMessage.error('请输入回复内容')
    return
  }

  if (!currentTicket.value) return

  submitting.value = true
  try {
    await ticketApi.reply(currentTicket.value.id, replyContent.value)
    ElMessage.success('回复成功')
    dialogVisible.value = false
    loadTickets()
  } catch {
    ElMessage.error('回复失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadTickets()
})
</script>

<style scoped lang="scss">
.tickets-manage {
  .page-header {
    margin-bottom: 20px;
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.table-card {
  padding: 20px;

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}

.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;

  &.pending {
    background: #fef3c7;
    color: #92400e;
  }

  &.replied {
    background: #d1fae5;
    color: #065f46;
  }

  &.archived {
    background: #e5e7eb;
    color: #374151;
  }
}

.ticket-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 20px;
      color: var(--text-primary);
    }
  }

  .detail-meta {
    display: flex;
    gap: 20px;
    color: var(--text-secondary);
    font-size: 13px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .detail-content, .detail-reply {
    margin-bottom: 20px;

    h4 {
      font-size: 15px;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    p {
      color: var(--text-secondary);
      line-height: 1.8;
      margin: 0;
    }
  }

  .detail-reply {
    background: var(--bg-dark);
    padding: 16px;
    border-radius: 8px;

    .reply-time {
      margin-top: 12px;
      font-size: 12px;
      color: var(--text-secondary);
    }
  }

  .reply-form {
    .reply-btn {
      margin-top: 12px;
    }
  }
}

:deep(.el-input__wrapper), :deep(.el-textarea__inner), :deep(.el-select) {
  background: var(--bg-dark);
  box-shadow: 0 0 0 1px var(--border-color) inset;
  color: var(--text-primary);

  &:hover, &.is-focus {
    box-shadow: 0 0 0 1px var(--secondary-color) inset;
  }
}

:deep(.el-table) {
  --el-table-bg-color: var(--bg-card);
  --el-table-tr-bg-color: var(--bg-card);
  --el-table-header-bg-color: var(--bg-dark);
  --el-table-text-color: var(--text-primary);
  --el-table-header-text-color: var(--text-secondary);
  --el-table-border-color: var(--border-color);
  --el-table-row-hover-bg-color: var(--bg-dark);
}

:deep(.el-dialog) {
  --el-dialog-bg-color: var(--bg-card);
  --el-dialog-title-color: var(--text-primary);
}
</style>
