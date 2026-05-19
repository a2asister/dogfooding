<template>
  <div class="events-manage">
    <div class="page-header">
      <div class="filter-bar">
        <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 150px" @change="loadEvents">
          <el-option label="全部状态" value="" />
          <el-option label="进行中" value="ongoing" />
          <el-option label="即将开始" value="upcoming" />
          <el-option label="已结束" value="ended" />
        </el-select>
        <el-button type="primary" @click="handleAdd">+ 新增活动</el-button>
      </div>
    </div>

    <div class="table-card card">
      <el-table :data="eventsList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="活动标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <span :class="['status-tag', row.status]">{{ getStatusName(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="is_published" label="发布状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.is_published" type="success">已发布</el-tag>
            <el-tag v-else type="info">未发布</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" width="300">
          <template #default="{ row }">
            {{ formatDate(row.start_time) }} - {{ formatDate(row.end_time) }}
          </template>
        </el-table-column>
        <el-table-column label="定时发布" width="180">
          <template #default="{ row }">
            <span v-if="row.scheduled_publish_time">{{ formatDate(row.scheduled_publish_time) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="定时下架" width="180">
          <template #default="{ row }">
            <span v-if="row.scheduled_offline_time">{{ formatDate(row.scheduled_offline_time) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" link @click="togglePublish(row)">
              {{ row.is_published ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
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
          @size-change="loadEvents"
          @current-change="loadEvents"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑活动' : '新增活动'" width="700px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="活动标题">
          <el-input v-model="form.title" placeholder="请输入活动标题" />
        </el-form-item>
        <el-form-item label="封面图">
          <ImageUploader v-model="form.cover_image" />
        </el-form-item>
        <el-form-item label="活动描述">
          <RichEditor v-model="form.description" placeholder="请输入活动描述" height="200px" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="form.start_time"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="form.end_time"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="form.status">
            <el-option label="进行中" value="ongoing" />
            <el-option label="即将开始" value="upcoming" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="form.link_url" placeholder="请输入活动跳转链接" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="定时发布">
          <el-date-picker
            v-model="form.scheduled_publish_time"
            type="datetime"
            placeholder="选择定时发布时间（不填则立即发布）"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="定时下架">
          <el-date-picker
            v-model="form.scheduled_offline_time"
            type="datetime"
            placeholder="选择定时下架时间（不填则永久有效）"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { eventApi } from '../../api'
import type { Event } from '../../types'
import ImageUploader from '../../components/ImageUploader.vue'
import RichEditor from '../../components/RichEditor.vue'

const filterStatus = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const eventsList = ref<Event[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref<number | null>(null)

const form = reactive({
  title: '',
  description: '',
  cover_image: '',
  start_time: '',
  end_time: '',
  status: 'upcoming',
  is_published: 0,
  link_url: '',
  sort_order: 0,
  scheduled_publish_time: '',
  scheduled_offline_time: ''
})

const getStatusName = (status: string): string => {
  const map: Record<string, string> = {
    ongoing: '进行中',
    upcoming: '即将开始',
    ended: '已结束'
  }
  return map[status] || status
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadEvents = async (): Promise<void> => {
  try {
    const result = await eventApi.getAdminList({
      page: page.value,
      pageSize: pageSize.value
    })
    eventsList.value = result.list
    total.value = result.total
  } catch {
    eventsList.value = []
  }
}

const handleAdd = (): void => {
  isEdit.value = false
  currentId.value = null
  form.title = ''
  form.description = ''
  form.cover_image = ''
  form.start_time = ''
  form.end_time = ''
  form.status = 'upcoming'
  form.is_published = 0
  form.link_url = ''
  form.sort_order = 0
  form.scheduled_publish_time = ''
  form.scheduled_offline_time = ''
  dialogVisible.value = true
}

const handleEdit = (row: Event): void => {
  isEdit.value = true
  currentId.value = row.id
  form.title = row.title
  form.description = row.description || ''
  form.cover_image = row.cover_image || ''
  form.start_time = row.start_time || ''
  form.end_time = row.end_time || ''
  form.status = row.status
  form.is_published = row.is_published
  form.link_url = row.link_url || ''
  form.sort_order = row.sort_order
  form.scheduled_publish_time = row.scheduled_publish_time || ''
  form.scheduled_offline_time = row.scheduled_offline_time || ''
  dialogVisible.value = true
}

const togglePublish = async (row: Event): Promise<void> => {
  try {
    await eventApi.update(row.id, { is_published: row.is_published ? 0 : 1 })
    ElMessage.success(row.is_published ? '已下架' : '已上架')
    loadEvents()
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleDelete = (row: Event): void => {
  ElMessageBox.confirm(`确定要删除活动"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await eventApi.delete(row.id)
      ElMessage.success('删除成功')
      loadEvents()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleSubmit = async (): Promise<void> => {
  if (!form.title) {
    ElMessage.error('请填写活动标题')
    return
  }

  submitting.value = true
  try {
    if (isEdit.value && currentId.value) {
      await eventApi.update(currentId.value, {
        title: form.title,
        description: form.description || null,
        cover_image: form.cover_image || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        status: form.status,
        is_published: form.is_published,
        link_url: form.link_url || null,
        sort_order: form.sort_order,
        scheduled_publish_time: form.scheduled_publish_time || null,
        scheduled_offline_time: form.scheduled_offline_time || null
      })
      ElMessage.success('更新成功')
    } else {
      await eventApi.create({
        title: form.title,
        description: form.description || null,
        cover_image: form.cover_image || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        status: form.status,
        is_published: form.is_published,
        link_url: form.link_url || null,
        sort_order: form.sort_order,
        scheduled_publish_time: form.scheduled_publish_time || null,
        scheduled_offline_time: form.scheduled_offline_time || null
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadEvents()
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped lang="scss">
.events-manage {
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

  &.ongoing {
    background: #d1fae5;
    color: #065f46;
  }

  &.upcoming {
    background: #fef3c7;
    color: #92400e;
  }

  &.ended {
    background: #e5e7eb;
    color: #374151;
  }
}

.text-muted {
  color: var(--text-muted);
}

:deep(.el-input__wrapper), :deep(.el-textarea__inner), :deep(.el-select), :deep(.el-date-editor) {
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
