import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'
import type { User } from './user'

export interface FileRecord {
  id: string
  name: string
  path: string
  size: number
  hash: string
  mimeType: string
  ownerId: string
  createdAt: string
  updatedAt: string
  isEncrypted: boolean
  isSensitive: boolean
  isCached: boolean
  localPath: string
  lastSyncAt: string
  deleted: boolean
}

export interface StorageStats {
  total: number
  used: number
  free: number
  fileCount: number
}

export const useFilesStore = defineStore('files', () => {
  const files = ref<FileRecord[]>([])
  const currentPath = ref('/')
  const viewMode = ref<'grid' | 'list'>('grid')
  const selectedFiles = ref<string[]>([])
  const stats = ref<StorageStats | null>(null)
  const loading = ref(false)
  const searchQuery = ref('')

  const filesInCurrentPath = computed(() => {
    return files.value.filter((f) => f.path === currentPath.value && !f.deleted)
  })

  const selectedFilesList = computed(() => {
    return files.value.filter((f) => selectedFiles.value.includes(f.id))
  })

  async function loadFiles(path?: string) {
    loading.value = true
    try {
      const response = await api.get('/files', {
        params: { path: path || currentPath.value },
      })
      files.value = response.data.data
      if (path) {
        currentPath.value = path
      }
    } catch (error) {
      console.error('Failed to load files:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function loadStats() {
    try {
      const response = await api.get('/files/stats')
      stats.value = response.data.data
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  async function uploadFile(file: File, path?: string) {
    const formData = new FormData()
    formData.append('file', file)
    if (path) {
      formData.append('path', path)
    }

    loading.value = true
    try {
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      await loadFiles()
      return response.data
    } catch (error) {
      console.error('Failed to upload file:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteFile(fileId: string) {
    try {
      await api.delete(`/files/${fileId}`)
      await loadFiles()
      selectedFiles.value = selectedFiles.value.filter((id) => id !== fileId)
    } catch (error) {
      console.error('Failed to delete file:', error)
      throw error
    }
  }

  async function renameFile(fileId: string, newName: string) {
    try {
      await api.put(`/files/${fileId}/rename`, { name: newName })
      await loadFiles()
    } catch (error) {
      console.error('Failed to rename file:', error)
      throw error
    }
  }

  async function moveFile(fileId: string, newPath: string) {
    try {
      await api.put(`/files/${fileId}/move`, { path: newPath })
      await loadFiles()
    } catch (error) {
      console.error('Failed to move file:', error)
      throw error
    }
  }

  async function searchFiles(query: string) {
    if (!query) {
      await loadFiles()
      return
    }
    loading.value = true
    try {
      const response = await api.get('/files/search', {
        params: { q: query },
      })
      files.value = response.data.data
    } catch (error) {
      console.error('Failed to search files:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function toggleFileSelection(fileId: string) {
    const index = selectedFiles.value.indexOf(fileId)
    if (index > -1) {
      selectedFiles.value.splice(index, 1)
    } else {
      selectedFiles.value.push(fileId)
    }
  }

  function clearSelection() {
    selectedFiles.value = []
  }

  function navigateTo(path: string) {
    currentPath.value = path
    loadFiles(path)
  }

  function getFileIcon(file: FileRecord): string {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
      return 'Picture'
    }
    if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'].includes(ext)) {
      return 'VideoCamera'
    }
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) {
      return 'Headset'
    }
    if (['doc', 'docx', 'pdf', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
      return 'Document'
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return 'FolderOpened'
    }
    return 'Document'
  }

  function getFileIconClass(file: FileRecord): string {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
      return 'image'
    }
    if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'].includes(ext)) {
      return 'video'
    }
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) {
      return 'audio'
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return 'archive'
    }
    return 'document'
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    files,
    currentPath,
    viewMode,
    selectedFiles,
    stats,
    loading,
    searchQuery,
    filesInCurrentPath,
    selectedFilesList,
    loadFiles,
    loadStats,
    uploadFile,
    deleteFile,
    renameFile,
    moveFile,
    searchFiles,
    toggleFileSelection,
    clearSelection,
    navigateTo,
    getFileIcon,
    getFileIconClass,
    formatFileSize,
  }
})
