<template>
  <div class="results-page">
    <el-card>
      <template #header>
        <div class="header">
          <span>📋 修复结果列表</span>
          <el-button type="primary" @click="$router.push('/editor')">
            ➕ 新建任务
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="results"
        stripe
        style="width: 100%"
      >
        <el-table-column label="预览" width="120">
          <template #default="{ row }">
            <img
              :src="`/api${row.thumbnailPath}`"
              class="thumbnail"
              @click="previewImage(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="originalName" label="文件名" min-width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="处理时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="水印区域" width="100">
          <template #default="{ row }">
            {{ row.marks?.length || 0 }} 处
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              link
              @click="previewImage(row)"
            >
              查看
            </el-button>
            <el-button
              size="small"
              type="success"
              link
              @click="downloadResult(row)"
              :disabled="row.status !== 'completed'"
            >
              下载
            </el-button>
            <el-button
              size="small"
              type="danger"
              link
              @click="deleteResult(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchResults"
          @current-change="fetchResults"
        />
      </div>
    </el-card>

    <el-dialog v-model="previewVisible" title="图片预览" width="900px">
      <div v-if="currentResult" class="preview-dialog">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="原图" name="original">
            <img
              :src="`/api${currentResult.originalPath}`"
              class="preview-image"
            />
          </el-tab-pane>
          <el-tab-pane label="修复后" name="processed">
            <img
              :src="`/api${currentResult.processedPath}`"
              class="preview-image"
            />
          </el-tab-pane>
        </el-tabs>
        <div class="dialog-actions">
          <el-button
            v-if="activeTab === 'processed'"
            type="primary"
            @click="downloadResult(currentResult)"
          >
            💾 下载高清图
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '../services/api'
import type { ProcessResult } from '../types'

const loading = ref(false)
const results = ref<ProcessResult[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const previewVisible = ref(false)
const currentResult = ref<ProcessResult | null>(null)
const activeTab = ref('processed')

const fetchResults = async () => {
  loading.value = true
  try {
    const res = await api.getResults(page.value, pageSize.value)
    results.value = res.list
    total.value = res.total
  } catch (err) {
    ElMessage.error('获取列表失败')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '等待中',
    processing: '处理中',
    completed: '已完成',
    failed: '失败'
  }
  return map[status] || status
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const previewImage = (row: ProcessResult) => {
  currentResult.value = row
  activeTab.value = 'processed'
  previewVisible.value = true
}

const downloadResult = (row: ProcessResult) => {
  api.downloadImage(row.processedPath)
  ElMessage.success('开始下载...')
}

const deleteResult = async (row: ProcessResult) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条记录吗？删除后无法恢复。',
      '确认删除',
      { type: 'warning' }
    )
    await api.deleteResult(row.id)
    ElMessage.success('删除成功')
    fetchResults()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchResults()
})
</script>

<style scoped>
.results-page {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.thumbnail {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ebeef5;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.preview-dialog {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 4px;
}

.dialog-actions {
  margin-top: 20px;
  text-align: center;
}
</style>
