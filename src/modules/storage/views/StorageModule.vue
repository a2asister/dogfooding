<template>
  <el-card class="storage-module">
    <template #header>
      <div class="card-header">
        <span>📁 录制存储</span>
        <el-tag :type="usedStorage > 100 * 1024 * 1024 ? 'warning' : 'info'">
          已使用: {{ formatSize(usedStorage) }}
        </el-tag>
      </div>
    </template>

    <div v-if="state.isLoading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <el-empty v-else-if="state.recordings.length === 0" description="暂无录制文件" />

    <el-table v-else :data="state.recordings" style="width: 100%" stripe>
      <el-table-column label="名称" prop="name" min-width="200" />
      <el-table-column label="模式" width="120">
        <template #default="{ row }">
          <el-tag :type="getModeTagType(row.mode)">
            {{ getModeLabel(row.mode) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时长" width="100">
        <template #default="{ row }">
          {{ formatDuration(row.duration) }}
        </template>
      </el-table-column>
      <el-table-column label="大小" width="100">
        <template #default="{ row }">
          {{ formatSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="分片数" width="80" prop="chunkCount" />
      <el-table-column label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="onPlay(row)">
            播放
          </el-button>
          <el-button type="primary" link @click="onDownload(row)">
            下载
          </el-button>
          <el-button type="danger" link @click="onDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import type { RecordingInfo, RecordingMode } from '@/types'
import { useStorage } from '../composables/useStorage'

const { state, usedStorage, formatSize, formatDuration, formatDate, getRecording, deleteRecording } = useStorage()

const emit = defineEmits<{
  (e: 'play', recording: RecordingInfo): void
}>()

const modeLabels: Record<RecordingMode, string> = {
  'screen': '仅屏幕',
  'screen-audio': '屏幕+音频',
  'camera': '仅摄像头',
  'camera-audio': '摄像头+音频'
}

const modeTagTypes: Record<RecordingMode, string> = {
  'screen': 'info',
  'screen-audio': 'primary',
  'camera': 'warning',
  'camera-audio': 'success'
}

const getModeLabel = (mode: RecordingMode): string => modeLabels[mode]
const getModeTagType = (mode: RecordingMode): string => modeTagTypes[mode]

const onPlay = (recording: RecordingInfo) => {
  emit('play', recording)
}

const onDownload = async (recording: RecordingInfo) => {
  try {
    const { chunks } = await getRecording(recording.id)
    if (chunks.length === 0) {
      ElMessage.warning('该录制没有可用的数据')
      return
    }

    const blob = new Blob(chunks, { type: recording.mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${recording.name}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('下载已开始')
  } catch (error) {
    ElMessage.error('下载失败: ' + (error as Error).message)
  }
}

const onDelete = async (recording: RecordingInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除录制 "${recording.name}" 吗？此操作无法撤销。`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteRecording(recording.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error as Error).message)
    }
  }
}
</script>

<style scoped>
.storage-module {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.loading-container .is-loading {
  font-size: 24px;
  margin-bottom: 10px;
}
</style>
