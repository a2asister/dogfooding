import { ref, type Ref } from 'vue'
import type { TimeSliceConfig, SliceEvent, TimeSliceState } from '../types'

export function useTimeSlice() {
  const state: Ref<TimeSliceState> = ref({
    isActive: false,
    currentIndex: 0,
    config: {
      interval: 5000
    },
    startTime: null
  })

  let timer: number | null = null
  let onSliceCallback: ((event: SliceEvent) => void) | null = null

  const startSlicing = (config: Partial<TimeSliceConfig> = {}) => {
    state.value.config = {
      interval: config.interval || 5000,
      maxChunks: config.maxChunks
    }
    state.value.isActive = true
    state.value.currentIndex = 0
    state.value.startTime = Date.now()
  }

  const stopSlicing = () => {
    state.value.isActive = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    state.value.startTime = null
  }

  const processChunk = (data: Blob): SliceEvent | null => {
    if (!state.value.isActive) {
      return null
    }

    const event: SliceEvent = {
      index: state.value.currentIndex,
      timestamp: Date.now(),
      data: data,
      size: data.size
    }

    state.value.currentIndex++

    if (onSliceCallback) {
      onSliceCallback(event)
    }

    return event
  }

  const onSlice = (callback: (event: SliceEvent) => void) => {
    onSliceCallback = callback
  }

  const reset = () => {
    stopSlicing()
    state.value.currentIndex = 0
  }

  return {
    state,
    startSlicing,
    stopSlicing,
    processChunk,
    onSlice,
    reset
  }
}
