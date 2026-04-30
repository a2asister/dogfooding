<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">文件共享</h1>
      <button @click="openUploadModal" class="btn btn-primary">上传文件</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card">
        <p class="text-sm font-medium text-gray-500">总文件数</p>
        <p class="text-2xl font-bold text-gray-900">{{ stats.fileCount }}</p>
      </div>
      <div class="card">
        <p class="text-sm font-medium text-gray-500">总目录数</p>
        <p class="text-2xl font-bold text-gray-900">{{ stats.dirCount }}</p>
      </div>
      <div class="card">
        <p class="text-sm font-medium text-gray-500">总大小</p>
        <p class="text-2xl font-bold text-gray-900">{{ formatSize(stats.totalSize) }}</p>
      </div>
      <div class="card">
        <p class="text-sm font-medium text-gray-500">总下载次数</p>
        <p class="text-2xl font-bold text-gray-900">{{ stats.totalDownloads || 0 }}</p>
      </div>
    </div>

    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">共享文件列表</h2>
        <button @click="refreshFiles" class="btn btn-secondary text-sm">刷新</button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">大小</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下载次数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上传时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="file in files" :key="file.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center mr-3 text-lg">
                    {{ getFileIcon(file.filename) }}
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-900">{{ file.originalName || file.filename }}</span>
                    <span v-if="file.exists" class="ml-2 px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">存在</span>
                    <span v-else class="ml-2 px-2 py-0.5 text-xs rounded bg-red-100 text-red-800">已丢失</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ file.description || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatSize(file.size) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ file.downloads || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(file.uploadedAt).toLocaleString('zh-CN') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button 
                  v-if="canPreview(file)" 
                  @click="previewFile(file)" 
                  class="text-purple-600 hover:text-purple-900"
                >
                  预览
                </button>
                <button @click="downloadFile(file)" class="text-blue-600 hover:text-blue-900">下载</button>
                <button @click="deleteFile(file)" class="text-red-600 hover:text-red-900">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="files.length === 0" class="text-center py-8 text-gray-500">
          暂无共享文件，点击上方按钮上传文件
        </div>
      </div>
    </div>

    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">上传文件</h2>
        
        <div class="flex space-x-2 mb-4">
          <button 
            @click="uploadMode = 'file'" 
            class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            :class="uploadMode === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            选择文件
          </button>
          <button 
            @click="uploadMode = 'text'" 
            class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            :class="uploadMode === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            文本内容
          </button>
        </div>

        <form @submit.prevent="handleUpload">
          <div class="space-y-4">
            <div v-if="uploadMode === 'file'">
              <label class="label">选择文件（支持多文件上传，最大 100MB/个）</label>
              <div 
                class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                :class="{ 'border-blue-500 bg-blue-50': selectedFiles.length > 0 }"
                @click="triggerFileInput"
                @dragover.prevent
                @drop.prevent="handleFileDrop"
              >
                <input 
                  ref="fileInput"
                  type="file" 
                  multiple 
                  class="hidden"
                  @change="handleFileSelect"
                />
                <div v-if="selectedFiles.length === 0">
                  <div class="text-4xl mb-2">📁</div>
                  <p class="text-gray-600">点击或拖拽文件到此处</p>
                  <p class="text-xs text-gray-400 mt-1">支持多文件选择</p>
                </div>
                <div v-else class="space-y-2">
                  <p class="text-blue-600 font-medium">已选择 {{ selectedFiles.length }} 个文件</p>
                  <div class="max-h-32 overflow-y-auto">
                    <div 
                      v-for="(file, index) in selectedFiles" 
                      :key="index"
                      class="flex items-center justify-between px-3 py-2 bg-white rounded border"
                    >
                      <div class="flex items-center">
                        <span class="mr-2">{{ getFileIcon(file.name) }}</span>
                        <span class="text-sm">{{ file.name }}</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500">{{ formatSize(file.size) }}</span>
                        <button 
                          type="button"
                          @click.stop="removeFile(index)" 
                          class="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="uploadProgress >= 0" class="mt-4">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                  <span>上传进度</span>
                  <span>{{ uploadProgress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <div v-else>
              <div>
                <label class="label">文件名称</label>
                <input 
                  v-model="textUpload.filename" 
                  type="text" 
                  class="input" 
                  required 
                  placeholder="例如: document.txt"
                />
              </div>
              <div>
                <label class="label">文件内容</label>
                <textarea 
                  v-model="textUpload.content" 
                  class="input h-40 resize-none" 
                  placeholder="在此输入文件内容..."
                ></textarea>
              </div>
            </div>

            <div>
              <label class="label">描述（可选）</label>
              <input 
                v-model="uploadDescription" 
                type="text" 
                class="input" 
                placeholder="简短描述这个文件"
              />
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="showUploadModal = false" class="btn btn-secondary">取消</button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="uploadMode === 'file' && selectedFiles.length === 0"
            >
              {{ uploading ? '上传中...' : '上传' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showPreviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">文件预览</h2>
          <button @click="closePreview" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
          <p class="text-sm"><strong>文件名：</strong>{{ previewFileData?.originalName || previewFileData?.filename }}</p>
          <p class="text-sm"><strong>大小：</strong>{{ formatSize(previewFileData?.size) }}</p>
          <p class="text-sm"><strong>类型：</strong>{{ previewFileData?.mimeType }}</p>
        </div>

        <div v-if="previewLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span class="ml-3 text-gray-500">加载中...</span>
        </div>

        <div v-else-if="previewError" class="text-center py-12 text-red-500">
          {{ previewError }}
        </div>

        <div v-else-if="previewFileData?.isText" class="bg-gray-50 rounded-lg p-4">
          <pre class="text-sm text-gray-700 whitespace-pre-wrap break-all max-h-96 overflow-auto">{{ previewContent }}</pre>
        </div>

        <div v-else-if="previewFileData?.isImage" class="flex justify-center">
          <img 
            :src="`data:${previewFileData?.mimeType};base64,${previewImageBase64}`" 
            :alt="previewFileData?.filename"
            class="max-w-full max-h-96 object-contain rounded-lg shadow"
          />
        </div>

        <div v-else class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-2">{{ getFileIcon(previewFileData?.filename) }}</div>
          <p>此文件类型不支持预览</p>
          <p class="text-sm mt-1">请下载后查看</p>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button 
            v-if="previewFileData"
            @click="downloadFile(previewFileData)" 
            class="btn btn-primary"
          >
            下载文件
          </button>
          <button @click="closePreview" class="btn btn-secondary">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const files = ref([])
const stats = ref({
  fileCount: 0,
  dirCount: 0,
  totalSize: 0,
  totalDownloads: 0
})

const showUploadModal = ref(false)
const uploadMode = ref('file')
const selectedFiles = ref([])
const fileInput = ref(null)
const uploading = ref(false)
const uploadProgress = ref(-1)
const uploadDescription = ref('')

const textUpload = ref({
  filename: '',
  content: ''
})

const showPreviewModal = ref(false)
const previewFileData = ref(null)
const previewLoading = ref(false)
const previewError = ref('')
const previewContent = ref('')
const previewImageBase64 = ref('')

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (filename) => {
  if (!filename) return '📄'
  const ext = filename.split('.').pop()?.toLowerCase()
  const icons = {
    'txt': '📄',
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'xls': '📗',
    'xlsx': '📗',
    'ppt': '📙',
    'pptx': '📙',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'webp': '🖼️',
    'bmp': '🖼️',
    'zip': '📦',
    'rar': '📦',
    '7z': '📦',
    'tar': '📦',
    'gz': '📦',
    'mp4': '🎥',
    'avi': '🎥',
    'mkv': '🎥',
    'mov': '🎥',
    'wmv': '🎥',
    'mp3': '🎵',
    'wav': '🎵',
    'flac': '🎵',
    'aac': '🎵',
    'json': '📋',
    'js': '⚡',
    'ts': '⚡',
    'html': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'less': '🎨',
    'vue': '💚',
    'jsx': '⚛️',
    'tsx': '⚛️',
    'py': '🐍',
    'java': '☕',
    'go': '🐹',
    'rs': '🦀',
    'c': '⚙️',
    'cpp': '⚙️',
    'h': '⚙️',
    'sh': '💻',
    'bat': '💻',
    'cmd': '💻',
    'md': '📝',
    'markdown': '📝',
    'log': '📋',
    'csv': '📊',
    'xml': '📰',
    'yaml': '⚙️',
    'yml': '⚙️',
    'toml': '⚙️',
    'ini': '⚙️',
    'conf': '⚙️',
    'config': '⚙️',
    'sql': '🗃️',
    'db': '🗃️',
    'sqlite': '🗃️',
    'apk': '📱',
    'ipa': '📱',
    'exe': '⚙️',
    'msi': '⚙️',
    'dmg': '💿',
    'iso': '💿'
  }
  return icons[ext] || '📄'
}

const canPreview = (file) => {
  if (!file || !file.mimeType) return false
  const mimeType = file.mimeType
  return mimeType.startsWith('text/') || 
         mimeType.startsWith('image/') ||
         mimeType === 'application/json' ||
         mimeType === 'application/javascript' ||
         mimeType === 'image/svg+xml'
}

const fetchFiles = async () => {
  try {
    const response = await axios.get('/api/file-share')
    if (response.data.success) {
      files.value = response.data.data
    }
  } catch (error) {
    console.error('获取文件列表失败:', error)
  }
}

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/file-share/stats')
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

const refreshFiles = () => {
  fetchFiles()
  fetchStats()
}

const openUploadModal = () => {
  uploadMode.value = 'file'
  selectedFiles.value = []
  uploadDescription.value = ''
  uploadProgress.value = -1
  uploading.value = false
  textUpload.value = { filename: '', content: '' }
  showUploadModal.value = true
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileSelect = (event) => {
  const fileList = event.target.files
  if (fileList && fileList.length > 0) {
    for (let i = 0; i < fileList.length; i++) {
      selectedFiles.value.push(fileList[i])
    }
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleFileDrop = (event) => {
  const fileList = event.dataTransfer.files
  if (fileList && fileList.length > 0) {
    for (let i = 0; i < fileList.length; i++) {
      selectedFiles.value.push(fileList[i])
    }
  }
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const handleUpload = async () => {
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    if (uploadMode.value === 'file' && selectedFiles.value.length > 0) {
      const formData = new FormData()
      
      for (const file of selectedFiles.value) {
        formData.append('file', file)
      }
      
      if (uploadDescription.value) {
        formData.append('description', uploadDescription.value)
      }
      
      const response = await axios.post('/api/file-share/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        }
      })
      
      if (response.data.success) {
        alert('上传成功！')
        showUploadModal.value = false
        refreshFiles()
      }
    } else if (uploadMode.value === 'text' && textUpload.value.filename) {
      const response = await axios.post('/api/file-share/upload', {
        filename: textUpload.value.filename,
        content: textUpload.value.content,
        description: uploadDescription.value
      })
      
      if (response.data.success) {
        alert('上传成功！')
        showUploadModal.value = false
        refreshFiles()
      }
    }
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败: ' + (error.response?.data?.message || error.message))
  } finally {
    uploading.value = false
    uploadProgress.value = -1
  }
}

const downloadFile = (file) => {
  const downloadUrl = `/api/file-share/download/${file.id}`
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = file.originalName || file.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  setTimeout(() => {
    fetchFiles()
    fetchStats()
  }, 1000)
}

const previewFile = async (file) => {
  previewFileData.value = file
  previewLoading.value = true
  previewError.value = ''
  previewContent.value = ''
  previewImageBase64.value = ''
  showPreviewModal.value = true
  
  try {
    const response = await axios.get(`/api/file-share/preview/${file.id}`)
    
    if (response.data.success) {
      const data = response.data.data
      previewFileData.value = { ...file, ...data }
      
      if (data.isText) {
        previewContent.value = data.content
      } else if (data.isImage) {
        previewImageBase64.value = data.base64
      }
    }
  } catch (error) {
    console.error('预览失败:', error)
    previewError.value = '预览加载失败: ' + (error.response?.data?.message || error.message)
  } finally {
    previewLoading.value = false
  }
}

const closePreview = () => {
  showPreviewModal.value = false
  previewFileData.value = null
  previewLoading.value = false
  previewError.value = ''
}

const deleteFile = async (file) => {
  if (confirm(`确定要删除文件 "${file.originalName || file.filename}" 吗？`)) {
    try {
      await axios.delete(`/api/file-share/${file.id}`)
      refreshFiles()
    } catch (error) {
      console.error('删除文件失败:', error)
      alert('删除失败')
    }
  }
}

onMounted(() => {
  refreshFiles()
})
</script>
