<template>
  <div class="news-manage">
    <div class="page-header">
      <div class="filter-bar">
        <el-select v-model="filterCategory" placeholder="分类筛选" style="width: 150px" @change="loadNews">
          <el-option label="全部分类" value="" />
          <el-option label="公告" value="announcement" />
          <el-option label="版本更新" value="version" />
          <el-option label="活动" value="event" />
        </el-select>
        <el-input v-model="searchKeyword" placeholder="搜索标题" style="width: 250px" @keyup.enter="loadNews" clearable />
        <el-button type="primary" @click="handleAdd">+ 新增资讯</el-button>
      </div>
    </div>

    <div class="table-card card">
      <el-table :data="newsList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <span :class="['category-tag', row.category]">{{ getCategoryName(row.category) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="is_top" label="置顶" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.is_top" type="danger">置顶</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="浏览量" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
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
          @size-change="loadNews"
          @current-change="loadNews"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑资讯' : '新增资讯'" width="800px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入资讯标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category">
            <el-option label="公告" value="announcement" />
            <el-option label="版本更新" value="version" />
            <el-option label="活动" value="event" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面图">
          <ImageUploader v-model="form.cover_image" />
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch v-model="form.is_top" />
        </el-form-item>
        <el-form-item label="内容">
          <RichEditor v-model="form.content" placeholder="请输入资讯内容" height="400px" />
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
import { newsApi } from '../../api'
import type { News } from '../../types'
import RichEditor from '../../components/RichEditor.vue'
import ImageUploader from '../../components/ImageUploader.vue'

const filterCategory = ref('')
const searchKeyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const newsList = ref<News[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref<number | null>(null)

const form = reactive({
  title: '',
  category: 'announcement',
  cover_image: '',
  is_top: 0,
  content: ''
})

const getCategoryName = (category: string): string => {
  const map: Record<string, string> = {
    announcement: '公告',
    version: '版本更新',
    event: '活动'
  }
  return map[category] || category
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadNews = async (): Promise<void> => {
  try {
    const result = await newsApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      category: filterCategory.value || undefined,
      keyword: searchKeyword.value || undefined
    })
    newsList.value = result.list
    total.value = result.total
  } catch {
    newsList.value = []
  }
}

const handleAdd = (): void => {
  isEdit.value = false
  currentId.value = null
  form.title = ''
  form.category = 'announcement'
  form.cover_image = ''
  form.is_top = 0
  form.content = ''
  dialogVisible.value = true
}

const handleEdit = (row: News): void => {
  isEdit.value = true
  currentId.value = row.id
  form.title = row.title
  form.category = row.category
  form.cover_image = row.cover_image || ''
  form.is_top = row.is_top
  form.content = row.content
  dialogVisible.value = true
}

const handleDelete = (row: News): void => {
  ElMessageBox.confirm(`确定要删除资讯"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await newsApi.delete(row.id)
      ElMessage.success('删除成功')
      loadNews()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleSubmit = async (): Promise<void> => {
  if (!form.title || !form.content) {
    ElMessage.error('请填写标题和内容')
    return
  }

  submitting.value = true
  try {
    if (isEdit.value && currentId.value) {
      await newsApi.update(currentId.value, {
        title: form.title,
        category: form.category,
        cover_image: form.cover_image || null,
        is_top: form.is_top,
        content: form.content
      })
      ElMessage.success('更新成功')
    } else {
      await newsApi.create({
        title: form.title,
        category: form.category,
        cover_image: form.cover_image || null,
        is_top: form.is_top,
        content: form.content
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadNews()
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadNews()
})
</script>

<style scoped lang="scss">
.news-manage {
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

.category-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;

  &.announcement {
    background: #dbeafe;
    color: #1e40af;
  }

  &.version {
    background: #dcfce7;
    color: #166534;
  }

  &.event {
    background: #fef3c7;
    color: #92400e;
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
