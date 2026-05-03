import { ref, type Ref } from 'vue'
import type { RecordingInfo, RecordingChunk, StorageState } from '@/types'
import { indexedDBService } from '../utils/indexedDB'

const sharedState: Ref<StorageState> = ref({
  recordings: [],
  isLoading: false
})

const sharedUsedStorage = ref(0)
let isInitialized = false

export function useStorage() {
  const state = sharedState
  const usedStorage = sharedUsedStorage

  const loadRecordings = async () => {
    state.value.isLoading = true
    try {
      state.value.recordings = await indexedDBService.getAllRecordings()
      usedStorage.value = await indexedDBService.getUsedStorage()
    } catch (error) {
      console.error('Failed to load recordings:', error)
    } finally {
      state.value.isLoading = false
    }
  }

  const ensureInitialized = async () => {
    if (!isInitialized) {
      isInitialized = true
      await loadRecordings()
    }
  }

  const saveRecording = async (info: Omit<RecordingInfo, 'id'>, chunks: Blob[], mimeType: string): Promise<string> => {
    const recordingId = `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)

    const recordingInfo: RecordingInfo = {
      id: recordingId,
      name: info.name,
      createdAt: info.createdAt,
      duration: info.duration,
      size: totalSize,
      chunkCount: chunks.length,
      mimeType: mimeType,
      mode: info.mode
    }

    await indexedDBService.saveRecordingInfo(recordingInfo)

    for (let i = 0; i < chunks.length; i++) {
      await indexedDBService.saveChunk({
        recordingId,
        index: i,
        timestamp: Date.now() + i,
        data: chunks[i],
        size: chunks[i].size
      })
    }

    await loadRecordings()

    return recordingId
  }

  const getRecording = async (id: string): Promise<{ info: RecordingInfo | null; chunks: Blob[] }> => {
    const info = await indexedDBService.getRecordingInfo(id)
    const chunksData = await indexedDBService.getChunks(id)
    const chunks = chunksData.map(c => c.data)

    return { info, chunks }
  }

  const deleteRecording = async (id: string): Promise<void> => {
    await indexedDBService.deleteRecording(id)
    await loadRecordings()
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  ensureInitialized()

  return {
    state,
    usedStorage,
    loadRecordings,
    saveRecording,
    getRecording,
    deleteRecording,
    formatSize,
    formatDuration,
    formatDate
  }
}
