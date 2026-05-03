import { ref, type Ref, onUnmounted } from 'vue'
import type { PlayerState, RecordingInfo } from '@/types'
import { useStorage } from '@/modules/storage/composables/useStorage'

export function usePlayer() {
  const state: Ref<PlayerState> = ref({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    currentRecordingId: null
  })

  const videoElement = ref<HTMLVideoElement | null>(null)
  const currentRecording = ref<RecordingInfo | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  const { getRecording, formatDuration } = useStorage()

  let objectUrl: string | null = null

  const setupVideoEvents = () => {
    if (!videoElement.value) return

    const video = videoElement.value

    video.onloadedmetadata = () => {
      console.log('Video metadata loaded, duration:', video.duration)
      state.value.duration = video.duration * 1000
    }

    video.ontimeupdate = () => {
      state.value.currentTime = video.currentTime * 1000
    }

    video.onended = () => {
      console.log('Video ended')
      state.value.isPlaying = false
      state.value.isPaused = false
    }

    video.onplay = () => {
      console.log('Video started playing')
      state.value.isPlaying = true
      state.value.isPaused = false
    }

    video.onpause = () => {
      console.log('Video paused')
      state.value.isPlaying = false
      state.value.isPaused = true
    }

    video.onerror = () => {
      const error = video.error
      console.error('Video element error:', error)
      if (error) {
        errorMessage.value = `视频错误: ${error.message || `代码 ${error.code}`}`
      } else {
        errorMessage.value = '视频加载失败'
      }
    }

    video.onwaiting = () => {
      console.log('Video waiting for data...')
    }

    video.oncanplay = () => {
      console.log('Video can play now')
    }

    video.onloadeddata = () => {
      console.log('Video data loaded')
    }
  }

  const loadRecording = async (recording: RecordingInfo): Promise<void> => {
    isLoading.value = true
    errorMessage.value = null
    state.value.currentRecordingId = recording.id
    currentRecording.value = recording

    try {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }

      const { info, chunks } = await getRecording(recording.id)

      console.log('Loaded recording info:', info)
      console.log('Number of chunks:', chunks.length)
      console.log('Recording MIME type:', recording.mimeType)

      if (chunks.length === 0) {
        throw new Error('没有找到视频数据')
      }

      chunks.forEach((chunk, index) => {
        console.log(`Chunk ${index}: size=${chunk.size}, type=${chunk.type}`)
      })

      const mimeType = recording.mimeType || 'video/webm'
      const blob = new Blob(chunks, { type: mimeType })
      
      console.log('Created blob:', blob.size, 'bytes, type:', blob.type)

      objectUrl = URL.createObjectURL(blob)
      console.log('Created object URL:', objectUrl)

      if (videoElement.value) {
        setupVideoEvents()

        videoElement.value.src = objectUrl
        videoElement.value.load()

        console.log('Video src set and load() called')
      } else {
        console.warn('videoElement is null')
      }

      state.value.currentTime = 0
      state.value.isPlaying = false
      state.value.isPaused = false
    } catch (error) {
      console.error('Failed to load recording:', error)
      errorMessage.value = (error as Error).message
    } finally {
      isLoading.value = false
    }
  }

  const play = (): void => {
    if (!videoElement.value || !objectUrl) {
      console.warn('Cannot play: videoElement or objectUrl is null')
      return
    }

    videoElement.value.play().catch(err => {
      console.error('Play failed:', err)
      errorMessage.value = `播放失败: ${err.message}`
    })
  }

  const pause = (): void => {
    if (!videoElement.value) return

    videoElement.value.pause()
  }

  const togglePlay = (): void => {
    if (state.value.isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const seek = (timeMs: number): void => {
    if (!videoElement.value) return

    const timeSec = timeMs / 1000
    console.log('Seeking to:', timeSec, 'seconds')
    videoElement.value.currentTime = timeSec
    state.value.currentTime = timeMs
  }

  const setVolume = (volume: number): void => {
    if (!videoElement.value) return

    const clampedVolume = Math.max(0, Math.min(1, volume))
    videoElement.value.volume = clampedVolume
    state.value.volume = clampedVolume
  }

  const toggleMute = (): void => {
    if (!videoElement.value) return

    if (videoElement.value.muted) {
      videoElement.value.muted = false
      state.value.volume = 1
    } else {
      videoElement.value.muted = true
      state.value.volume = 0
    }
  }

  const formatTime = (ms: number): string => {
    return formatDuration(ms)
  }

  const getProgress = (): number => {
    if (state.value.duration === 0) return 0
    return (state.value.currentTime / state.value.duration) * 100
  }

  const unload = (): void => {
    pause()

    if (videoElement.value) {
      videoElement.value.src = ''
      videoElement.value.load()
      videoElement.value.onloadedmetadata = null
      videoElement.value.ontimeupdate = null
      videoElement.value.onended = null
      videoElement.value.onerror = null
      videoElement.value.onplay = null
      videoElement.value.onpause = null
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }

    state.value = {
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      currentRecordingId: null
    }

    currentRecording.value = null
    errorMessage.value = null
  }

  onUnmounted(() => {
    unload()
  })

  return {
    state,
    videoElement,
    currentRecording,
    isLoading,
    errorMessage,
    loadRecording,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    formatTime,
    getProgress,
    unload
  }
}
