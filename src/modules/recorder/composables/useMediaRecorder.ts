import { ref, type Ref, onUnmounted } from 'vue'
import type { RecordingState, RecordingMode } from '@/types'
import { useTimeSlice } from '@/modules/timeSlice/composables/useTimeSlice'

const SUPPORTED_MIME_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4'
]

function getSupportedMimeType(): string {
  for (const type of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return ''
}

export function useMediaRecorder() {
  const state: Ref<RecordingState> = ref({
    isRecording: false,
    isPaused: false,
    startTime: null,
    pauseTime: null,
    elapsedTime: 0,
    currentMode: 'screen',
    mediaStream: null,
    mediaRecorder: null,
    chunks: [],
    currentRecordingId: null
  })

  const mimeType = ref(getSupportedMimeType())
  const recordingName = ref('')

  const {
    state: sliceState,
    startSlicing,
    stopSlicing,
    processChunk,
    onSlice,
    reset: resetTimeSlice
  } = useTimeSlice()

  let timerInterval: number | null = null
  let sliceChunks: Blob[] = []

  const getDisplayMediaConstraints = (withAudio: boolean): DisplayMediaStreamOptions => ({
    video: {
      cursor: 'always' as const,
      displaySurface: 'monitor' as const
    },
    audio: withAudio
  })

  const getUserMediaConstraints = (withAudio: boolean): MediaStreamConstraints => ({
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      facingMode: 'user' as const
    },
    audio: withAudio
  })

  const getMediaStream = async (mode: RecordingMode): Promise<MediaStream> => {
    let stream: MediaStream

    switch (mode) {
      case 'screen':
        stream = await navigator.mediaDevices.getDisplayMedia(
          getDisplayMediaConstraints(false)
        )
        break

      case 'screen-audio':
        stream = await navigator.mediaDevices.getDisplayMedia(
          getDisplayMediaConstraints(true)
        )
        break

      case 'camera':
        stream = await navigator.mediaDevices.getUserMedia(
          getUserMediaConstraints(false)
        )
        break

      case 'camera-audio':
        stream = await navigator.mediaDevices.getUserMedia(
          getUserMediaConstraints(true)
        )
        break

      default:
        throw new Error(`Unsupported recording mode: ${mode}`)
    }

    return stream
  }

  const createMediaRecorder = (stream: MediaStream): MediaRecorder => {
    const options: MediaRecorderOptions = {}

    if (mimeType.value) {
      options.mimeType = mimeType.value
    }

    return new MediaRecorder(stream, options)
  }

  const startTimer = () => {
    state.value.elapsedTime = 0
    timerInterval = window.setInterval(() => {
      state.value.elapsedTime += 1000
    }, 1000)
  }

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const startRecording = async (mode: RecordingMode, sliceInterval: number = 5000): Promise<void> => {
    if (state.value.isRecording) {
      throw new Error('Recording is already in progress')
    }

    if (!recordingName.value.trim()) {
      recordingName.value = `录制_${new Date().toLocaleString('zh-CN').replace(/[/:]/g, '-')}`
    }

    state.value.currentMode = mode
    state.value.mediaStream = await getMediaStream(mode)

    const tracks = state.value.mediaStream.getTracks()
    const hasVideo = tracks.some(t => t.kind === 'video')
    const hasAudio = tracks.some(t => t.kind === 'audio')

    if (!hasVideo) {
      state.value.mediaStream.getTracks().forEach(t => t.stop())
      throw new Error('No video track available')
    }

    state.value.mediaRecorder = createMediaRecorder(state.value.mediaStream)
    state.value.chunks = []
    sliceChunks = []

    state.value.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        state.value.chunks.push(event.data)

        const sliceEvent = processChunk(event.data)
        if (sliceEvent) {
          sliceChunks.push(sliceEvent.data)
        }
      }
    }

    state.value.mediaRecorder.onstop = () => {
      stopTimer()
      stopSlicing()
    }

    startSlicing({ interval: sliceInterval })

    onSlice((event) => {
      console.log(`Slice ${event.index} generated, size: ${event.size} bytes`)
    })

    state.value.mediaRecorder.start(sliceInterval)
    state.value.isRecording = true
    state.value.isPaused = false
    state.value.startTime = Date.now()
    startTimer()

    state.value.mediaStream.getVideoTracks()[0].onended = () => {
      if (state.value.isRecording) {
        stopRecording()
      }
    }
  }

  const pauseRecording = (): void => {
    if (!state.value.isRecording || state.value.isPaused) {
      return
    }

    state.value.mediaRecorder?.pause()
    state.value.isPaused = true
    state.value.pauseTime = Date.now()
    stopTimer()
  }

  const resumeRecording = (): void => {
    if (!state.value.isRecording || !state.value.isPaused) {
      return
    }

    state.value.mediaRecorder?.resume()
    state.value.isPaused = false
    state.value.pauseTime = null
    startTimer()
  }

  const stopRecording = (): void => {
    if (!state.value.isRecording) {
      return
    }

    state.value.mediaRecorder?.stop()
    state.value.mediaStream?.getTracks().forEach(track => track.stop())

    state.value.isRecording = false
    state.value.isPaused = false
    stopTimer()
    stopSlicing()
  }

  const getRecordedBlob = (): Blob => {
    if (state.value.chunks.length === 0) {
      throw new Error('No recorded data available')
    }

    return new Blob(state.value.chunks, { type: mimeType.value || 'video/webm' })
  }

  const getSliceChunks = (): Blob[] => {
    return [...sliceChunks, ...state.value.chunks.slice(sliceChunks.length)]
  }

  const reset = (): void => {
    stopTimer()
    stopSlicing()

    if (state.value.mediaStream) {
      state.value.mediaStream.getTracks().forEach(track => track.stop())
    }

    state.value = {
      isRecording: false,
      isPaused: false,
      startTime: null,
      pauseTime: null,
      elapsedTime: 0,
      currentMode: 'screen',
      mediaStream: null,
      mediaRecorder: null,
      chunks: [],
      currentRecordingId: null
    }

    sliceChunks = []
    recordingName.value = ''
    resetTimeSlice()
  }

  const formatElapsedTime = (): string => {
    const seconds = Math.floor(state.value.elapsedTime / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const checkSupport = (): { supported: boolean; mimeType: string; features: string[] } => {
    const features: string[] = []

    const hasGetDisplayMedia = 'getDisplayMedia' in navigator.mediaDevices
    const hasGetUserMedia = 'getUserMedia' in navigator.mediaDevices
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined'

    if (hasGetDisplayMedia) features.push('屏幕录制')
    if (hasGetUserMedia) features.push('摄像头录制')
    if (hasMediaRecorder) features.push('MediaRecorder API')

    const supported = hasMediaRecorder && (hasGetDisplayMedia || hasGetUserMedia)

    return {
      supported,
      mimeType: mimeType.value,
      features
    }
  }

  onUnmounted(() => {
    reset()
  })

  return {
    state,
    mimeType,
    recordingName,
    sliceState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    getRecordedBlob,
    getSliceChunks,
    reset,
    formatElapsedTime,
    checkSupport
  }
}
