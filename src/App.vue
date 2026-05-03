<template>
  <div class="app-container">
    <el-card class="header-card">
      <h1 class="title">Web 录屏回放工具</h1>
      <p class="subtitle">支持屏幕录制、时间切片、本地存储和回放功能</p>
    </el-card>

    <div class="main-content">
      <RecorderModule />
      <PlayerModule :recording="currentRecording" />
    </div>

    <StorageModule @play="handlePlayRecording" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RecordingInfo } from '@/types'
import RecorderModule from '@/modules/recorder/views/RecorderModule.vue'
import PlayerModule from '@/modules/player/views/PlayerModule.vue'
import StorageModule from '@/modules/storage/views/StorageModule.vue'

const currentRecording = ref<RecordingInfo | null>(null)

const handlePlayRecording = (recording: RecordingInfo) => {
  currentRecording.value = recording
}
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100%;
  padding: 20px;
  background-color: #f5f7fa;
}

.header-card {
  margin-bottom: 20px;
  text-align: center;
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}
</style>
