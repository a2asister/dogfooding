<template>
  <div class="content-container">
    <div class="content-card">
      <div class="card-body">
        <div class="breadcrumb">
          <div class="breadcrumb-item" @click="navigateTo('/')">
            <el-icon><FolderOpened /></el-icon>
            <span>根目录</span>
          </div>
        </div>

        <div class="toolbar">
          <div class="toolbar-left">
            <el-button type="primary" @click="handleUploadClick">
              <el-icon><Upload /></el-icon>
              上传文件
            </el-button>
            <el-button :disabled="filesStore.selectedFiles.length === 0" @click="handleDeleteSelected">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button :disabled="filesStore.selectedFiles.length !== 1" @click="showRenameDialog">
              <el-icon><Edit /></el-icon>
              重命名
            </el-button>
          </div>
          <div class="toolbar-right">
            <div class="search-box">
              <el-icon class="search-icon"><Search /></el-icon>
              <el-input
                v-model="searchQuery"
                placeholder="搜索文件..."
                size="default"
                style="width: 240px;"
                @input="handleSearch"
                clearable
              />
            </div>
            <div class="view-toggle">
              <button :class="{ active: filesStore.viewMode === 'grid' }" @click="filesStore.viewMode = 'grid'">
                <el-icon><Grid /></el-icon>
              </button>
              <button :class="{ active: filesStore.viewMode === 'list' }" @click="filesStore.viewMode = 'list'">
                <el-icon><List /></el-icon>
              </button>
            </div>
          </div>
        </div>

        <div
          class="upload-area"
          :class="{ dragover: isDragover }"
          @dragover.prevent="isDragover = true"
          @dragleave.prevent="isDragover = false"
          @drop.prevent="handleDrop"
          @click="handleUploadClick"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            style="display: none;"
            @change="handleFileSelect"
          />
          <el-icon class="upload-icon"><Upload /></el-icon>
          <p class="upload-text">拖拽文件到这里或点击上传</p>
          <p class="upload-hint">支持所有常见文件格式</p>
        </div>

        <div v-if="filesStore.loading" style="text-align: center; padding: 40px;">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p style="margin-top: 12px; color: #64748b;">加载中...</p>
        </div>

        <template v-else-if="filesStore.filesInCurrentPath.length > 0">
          <template v-if="filesStore.viewMode === 'grid'">
            <div class="file-grid">
              <div
                v-for="file in filesStore.filesInCurrentPath"
                :key="file.id"
                class="file-card"
                :class="{ selected: filesStore.selectedFiles.includes(file.id) }"
                @click="handleFileClick(file)"
                @contextmenu.prevent="handleContextMenu($event, file)"
              >
                <el-icon class="file-icon" :class="filesStore.getFileIconClass(file)">
                  <component :is="filesStore.getFileIcon(file)" />
                </el-icon>
                <div class="file-info">
                  <p class="file-name">{{ file.name }}</p>
                  <p class="file-meta">{{ formatFileSize(file.size) }}</p>
                </div>
                <div class="file-badges">
                  <span v-if="file.isEncrypted" class="badge encrypted">加密</span>
                  <span v-if="file.isSensitive" class="badge sensitive">敏感</span>
                  <span v-if="file.isCached" class="badge cached">已缓存</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <table class="file-list">
              <thead>
                <tr>
                  <th style="width: 40px;">
                    <el-checkbox
                      :model-value="filesStore.selectedFiles.length === filesStore.filesInCurrentPath.length && filesStore.filesInCurrentPath.length > 0"
                      :indeterminate="filesStore.selectedFiles.length > 0 && filesStore.selectedFiles.length < filesStore.filesInCurrentPath.length"
                      @change="toggleSelectAll"
                    />
                  </th>
                  <th>文件名</th>
                  <th style="width: 120px;">大小</th>
                  <th style="width: 160px;">修改时间</th>
                  <th style="width: 120px;">状态</th>
                  <th style="width: 100px;">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="file in filesStore.filesInCurrentPath"
                  :key="file.id"
                  :class="{ selected: filesStore.selectedFiles.includes(file.id) }"
                  @contextmenu.prevent="handleContextMenu($event, file)"
                >
                  <td>
                    <el-checkbox
                      :model-value="filesStore.selectedFiles.includes(file.id)"
                      @change="() => filesStore.toggleFileSelection(file.id)"
                    />
                  </td>
                  <td>
                    <div class="file-name-cell">
                      <el-icon class="file-icon" :class="filesStore.getFileIconClass(file)">
                        <component :is="filesStore.getFileIcon(file)" />
                      </el-icon>
                      <div>
                        <div style="font-weight: 500; color: #1e293b;">{{ file.name }}</div>
                        <div style="font-size: 12px; color: #94a3b8;">{{ file.hash.substring(0, 8) }}...</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ formatFileSize(file.size) }}</td>
                  <td>{{ formatDate(file.updatedAt) }}</td>
                  <td>
                    <div style="display: flex; gap: 4px;">
                      <el-tag v-if="file.isEncrypted" size="small" type="info">加密</el-tag>
                      <el-tag v-if="file.isSensitive" size="small" type="danger">敏感</el-tag>
                    </div>
                  </td>
                  <td>
                    <el-button type="text" size="small" @click="downloadFile(file)">下载</el-button>
                    <el-button type="text" size="small" @click="showShareDialog(file)">分享</el-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </template>

        <div v-else class="empty-state">
          <el-icon class="empty-icon"><FolderOpened /></el-icon>
          <p class="empty-text">暂无文件</p>
          <p class="empty-hint">点击上方按钮或拖拽文件到这里上传</p>
        </div>
      </div>
    </div>

    <el-dialog v-model="renameDialogVisible" title="重命名文件" width="400px">
      <el-form label-position="top">
        <el-form-item label="文件名">
          <el-input v-model="renameFileName" placeholder="请输入新文件名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRename">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="shareDialogVisible" title="分享文件" width="500px">
      <div style="margin-bottom: 16px;">
        <p style="margin-bottom: 8px; font-weight: 500;">当前文件：{{ shareFile?.name }}</p>
      </div>
      <el-form label-position="top">
        <el-form-item label="分享给用户">
          <el-input v-model="shareUsername" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="权限设置">
          <el-radio-group v-model="sharePermission">
            <el-radio value="read">只读</el-radio>
            <el-radio value="write">可编辑</el-radio>
            <el-radio value="readwrite">读写</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="有效期">
          <el-radio-group v-model="shareExpiresIn">
            <el-radio :value="0">永久有效</el-radio>
            <el-radio :value="24">24小时</el-radio>
            <el-radio :value="168">7天</el-radio>
            <el-radio :value="720">30天</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shareDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleShare">创建分享</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  Delete,
  Edit,
  Search,
  Grid,
  List,
  Loading,
  FolderOpened,
} from '@element-plus/icons-vue'
import { useFilesStore } from '@/stores/files'
import { api } from '@/utils/api'
import type { FileRecord } from '@/stores/files'

const filesStore = useFilesStore()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const searchQuery = ref('')
const renameDialogVisible = ref(false)
const renameFileName = ref('')
const renameFileId = ref('')
const shareDialogVisible = ref(false)
const shareFile = ref<FileRecord | null>(null)
const shareUsername = ref('')
const sharePermission = ref<'read' | 'write' | 'readwrite'>('read')
const shareExpiresIn = ref(0)

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const handleUploadClick = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    uploadFiles(Array.from(files))
  }
  target.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragover.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    uploadFiles(Array.from(files))
  }
}

const uploadFiles = async (files: File[]) => {
  for (const file of files) {
    try {
      await filesStore.uploadFile(file)
      ElMessage.success(`文件 "${file.name}" 上传成功`)
    } catch (error) {
      ElMessage.error(`文件 "${file.name}" 上传失败`)
    }
  }
}

const handleFileClick = (file: FileRecord) => {
  filesStore.toggleFileSelection(file.id)
}

const toggleSelectAll = (val: boolean) => {
  if (val) {
    filesStore.selectedFiles = filesStore.filesInCurrentPath.map((f) => f.id)
  } else {
    filesStore.clearSelection()
  }
}

const handleSearch = () => {
  filesStore.searchFiles(searchQuery.value)
}

const handleDeleteSelected = async () => {
  const count = filesStore.selectedFiles.length
  if (count === 0) return

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${count} 个文件吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    for (const fileId of filesStore.selectedFiles) {
      await filesStore.deleteFile(fileId)
    }

    ElMessage.success(`已删除 ${count} 个文件`)
    filesStore.clearSelection()
  } catch (error) {
    // 用户取消
  }
}

const showRenameDialog = () => {
  if (filesStore.selectedFiles.length !== 1) return
  const fileId = filesStore.selectedFiles[0]
  const file = filesStore.files.find((f) => f.id === fileId)
  if (file) {
    renameFileId.value = fileId
    renameFileName.value = file.name
    renameDialogVisible.value = true
  }
}

const handleRename = async () => {
  if (!renameFileName.value.trim()) {
    ElMessage.warning('请输入文件名')
    return
  }
  try {
    await filesStore.renameFile(renameFileId.value, renameFileName.value.trim())
    ElMessage.success('重命名成功')
    renameDialogVisible.value = false
  } catch (error) {
    ElMessage.error('重命名失败')
  }
}

const showShareDialog = (file: FileRecord) => {
  shareFile.value = file
  shareUsername.value = ''
  sharePermission.value = 'read'
  shareExpiresIn.value = 0
  shareDialogVisible.value = true
}

const handleShare = async () => {
  if (!shareUsername.value.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  try {
    await api.post('/share', {
      fileId: shareFile.value?.id,
      sharedWithUsername: shareUsername.value.trim(),
      permission: sharePermission.value,
      expiresInHours: shareExpiresIn.value || undefined,
    })
    ElMessage.success('分享创建成功')
    shareDialogVisible.value = false
  } catch (error) {
    ElMessage.error('分享创建失败')
  }
}

const downloadFile = (file: FileRecord) => {
  const link = document.createElement('a')
  link.href = `/api/files/download/${file.id}`
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const navigateTo = (path: string) => {
  filesStore.navigateTo(path)
}

const handleContextMenu = (event: MouseEvent, file: FileRecord) => {
  console.log('Context menu:', file.name)
}

onMounted(() => {
  filesStore.loadFiles()
})
</script>
