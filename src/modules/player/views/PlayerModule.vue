<template>
  <el-card class="player-module">
    <template #header>
      <div class="card-header">
        <span>▶️ 播放控制</span>
        <el-tag v-if="currentRecording" type="primary" size="small">
          {{ currentRecording.name }}
        </el-tag>
      </div>
    </template>

    <div v-if="!currentRecording && !isLoading" class="no-video-container">
      <el-empty description="请从下方存储列表选择一个录制进行播放">
        <template #image>
          <el-icon class="no-video-icon"><VideoPause /></el-icon>
        </template>
      </el-empty>
    </div>

    <div v-else-if="isLoading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <el-alert
      v-else-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      class="error-alert"
    />

    <div v-else class="player-container">
      <video
        ref="videoElement"
        class="video-player"
        :class="{ 'video-hidden': !currentRecording }"
        @click="togglePlay"
        playsinline
      >
        您的浏览器不支持视频播放
      </video>

      <div class="controls-overlay" v-if="currentRecording">
        <div class="play-overlay" v-if="!state.isPlaying" @click="togglePlay">
          <el-icon class="play-icon"><VideoPlay /></el-icon>
        </div>

        <div class="controls-bar">
          <div class="timeline-container">
            <el-slider
              v-model="sliderValue"
              :max="state.duration || 100"
              :format-tooltip="formatTime"
              @change="handleSeek"
              :disabled="!currentRecording"
            />
            <div class="time-display">
              <span>{{ formatTime(state.currentTime) }}</span>
              <span>/</span>
              <span>{{ formatTime(state.duration) }}</span>
            </div>
          </div>

          <div class="control-buttons">
            <el-button
              circle
              :icon="state.isPlaying ? VideoPause : VideoPlay"
              @click="togglePlay"
              :disabled="!currentRecording"
              size="large"
              type="primary"
            />

            <el-button
              circle
              :icon="Refresh"
              @click="handleReplay"
              :disabled="!currentRecording"
              size="default"
            />

            <div class="volume-control">
              <el-button
                circle
                :icon="state.volume > 0 ? Microphone : Mute"
                @click="toggleMute"
                :disabled="!currentRecording"
                size="default"
              />
              <el-slider
                v-model="volumeSlider"
                :min="0"
                :max="1"
                :step="0.1"
                :format-tooltip="(v) => `${Math.round(v * 100)}%`"
                @change="handleVolumeChange"
                :disabled="!currentRecording"
                class="volume-slider"
              />
            </div>

            <el-button
              circle
              :icon="Close"
              @click="handleUnload"
              :disabled="!currentRecording"
              size="default"
              type="danger"
            />
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import {
  VideoPause,
  Loading,
  VideoPlay,
  Refresh,
  Mute,
  Close,
  Microphone
} from '@element-plus/icons-vue'
import type { RecordingInfo } from '@/types'
import { usePlayer } from '../composables/usePlayer'

const {
  state,
  videoElement,
  currentRecording,
  isLoading,
  errorMessage,
  loadRecording,
  togglePlay,
  seek,
  setVolume,
  toggleMute,
  formatTime,
  unload
} = usePlayer()

const volumeSlider = ref(1)

const sliderValue = computed({
  get: () => state.value.currentTime,
  set: (val) => {
    state.value.currentTime = val
  }
})

const handleSeek = (value: number) => {
  seek(value)
}

const handleVolumeChange = (value: number) => {
  setVolume(value)
}

const handleReplay = () => {
  seek(0)
  if (!state.value.isPlaying) {
    togglePlay()
  }
}

const handleUnload = () => {
  unload()
}

watch(
  () => state.value.volume,
  (newVal) => {
    volumeSlider.value = newVal
  }
)

const props = defineProps<{
  recording?: RecordingInfo | null
}>()

watch(
  () => props.recording,
  async (newRecording) => {
    if (newRecording && newRecording.id !== state.value.currentRecordingId) {
      await nextTick()
      await loadRecording(newRecording)
    }
  }
)
</script>

<style scoped>
.player-module {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.no-video-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-video-icon {
  font-size: 80px;
  color: #909399;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #909399;
}

.loading-container .is-loading {
  font-size: 32px;
  margin-bottom: 16px;
}

.error-alert {
  margin: 20px 0;
}

.player-container {
  position: relative;
  width: 100%;
  min-height: 400px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  min-height: 400px;
  object-fit: contain;
  background-color: #000;
}

.video-player.video-hidden {
  display: none;
}

.controls-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-overlay:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: translate(-50%, -50%) scale(1.1);
}

.play-icon {
  font-size: 40px;
  color: #409eff;
  margin-left: 8px;
}

.timeline-container {
  margin-bottom: 16px;
}

.time-display {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #fff;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider {
  width: 120px;
}

.controls-bar {
  display: flex;
  flex-direction: column;
}
</style>
