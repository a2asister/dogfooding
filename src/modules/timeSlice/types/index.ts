export interface TimeSliceConfig {
  interval: number
  maxChunks?: number
}

export interface SliceEvent {
  index: number
  timestamp: number
  data: Blob
  size: number
}

export interface TimeSliceState {
  isActive: boolean
  currentIndex: number
  config: TimeSliceConfig
  startTime: number | null
}
