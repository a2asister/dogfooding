export interface RecordingInfo {
  id: string
  name: string
  createdAt: number
  duration: number
  size: number
  chunkCount: number
  mimeType: string
  mode: RecordingMode
}

export type RecordingMode = 'screen' | 'screen-audio' | 'camera' | 'camera-audio'

export interface RecordingChunk {
  id: string
  recordingId: string
  index: number
  timestamp: number
  data: Blob
  size: number
}

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  startTime: number | null
  pauseTime: number | null
  elapsedTime: number
  currentMode: RecordingMode
  mediaStream: MediaStream | null
  mediaRecorder: MediaRecorder | null
  chunks: Blob[]
  currentRecordingId: string | null
}

export interface PlayerState {
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  duration: number
  volume: number
  currentRecordingId: string | null
}

export interface StorageState {
  recordings: RecordingInfo[]
  isLoading: boolean
}
