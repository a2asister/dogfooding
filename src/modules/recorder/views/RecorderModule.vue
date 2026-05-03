<template>
  <el-card class="recorder-module">
    <template #header>
      <div class="card-header">
        <span>🎥 录制控制</span>
        <el-tag v-if="supportInfo.supported" type="success">
          支持录制
        </el-tag>
        <el-tag v-else type="danger">
          不支持录制
        </el-tag>
      </div>
    </template>

    <div v-if="!supportInfo.supported" class="unsupported-message">
      <el-alert
        title="浏览器不支持录屏功能"
        type="error"
        :closable="false"
      >
        <template #default>
          <p>请使用最新版本的 Chrome、Edge 或 Firefox 浏览器。</p>
          <p>当前支持的功能: {{ supportInfo.features.join(', ') || '无' }}</p>
        </template>
      </el-alert>
    </div>

    <div v-else>
      <el-form label-position="top" :model="formData" :disabled="state.isRecording">
        <el-form-item label="录制名称">
          <el-input
            v-model="recordingName"
            placeholder="请输入录制名称"
            clearable
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="录制模式">
              <el-radio-group v-model="formData.mode">
                <el-radio-button :value="'screen'">仅屏幕</el-radio-button>
                <el-radio-button :value="'screen-audio'">屏幕+音频</el-radio-button>
                <el-radio-button :value="'camera'">仅摄像头</el-radio-button>
                <el-radio-button :value="'camera-audio'">摄像头+音频</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="时间切片间隔">
              <el-select v-model="formData.sliceInterval" style="width: 100%">
                <el-option label="1 秒" :value="1000" />
                <el-option label="2 秒" :value="2000" />
                <el-option label="5 秒" :value="5000" />
                <el-option label="10 秒" :value="10000" />
                <el-option label="30 秒" :value="30000" />
                <el-option label="60 秒" :value="60000" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="recording-info" v-if="state.isRecording || state.chunks.length > 0">
        <el-divider content-position="left">录制状态</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <span class="label">录制时长:</span>
              <span class="value" :class="{ 'recording-active': state.isRecording }">
                {{ formatElapsedTime() }}
              </span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="label">分片数量:</span>
              <span class="value">{{ state.chunks.length }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="label">数据大小:</span>
              <span class="value">{{ formatTotalSize() }}</span>
            </div>
          </el-col>
        </el-row>

        <div v-if="state.isRecording" class="recording-indicator">
          <span class="pulse-dot"></span>
          <span>正在录制中...</span>
          <el-tag v-if="state.isPaused" type="warning" size="small">已暂停</el-tag>
        </div>
      </div>

      <div class="control-buttons">
        <el-button
          v-if="!state.isRecording"
          type="primary"
          size="large"
          :icon="VideoCamera"
          @click="handleStart"
        >
          开始录制
        </el-button>

        <template v-else>
          <el-button
            v-if="!state.isPaused"
            type="warning"
            size="large"
            :icon="VideoPause"
            @click="handlePause"
          >
            暂停
          </el-button>
          <el-button
            v-else
            type="success"
            size="large"
            :icon="VideoPlay"
            @click="handleResume"
          >
            继续
          </el-button>

          <el-button
            type="danger"
            size="large"
            :icon="CircleCloseFilled"
            @click="handleStop"
          >
            停止录制
          </el-button>
        </template>

        <el-button
          v-if="state.chunks.length > 0 && !state.isRecording"
          type="success"
          size="large"
          :icon="Plus"
          @click="handleSave"
        >
          保存到存储
        </el-button>

        <el-button
          v-if="state.chunks.length > 0 && !state.isRecording"
          type="info"
          size="large"
          :icon="Download"
          @click="handlePreview"
        >
          预览
        </el-button>

        <el-button
          v-if="state.chunks.length > 0 && !state.isRecording"
          type="warning"
          size="large"
          :icon="RefreshRight"
          @click="handleReset"
        >
          重置
        </el-button>
      </div>

      <el-dialog
        v-model="previewVisible"
        title="录制预览"
        width="800px"
        :destroy-on-close="true"
      >
        <video
          ref="previewVideoRef"
          class="preview-video"
          controls
          autoplay
        />
      </el-dialog>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  VideoCamera,
  VideoPause,
  VideoPlay,
  CircleCloseFilled,
  Plus,
  Download,
  RefreshRight
} from '@element-plus/icons-vue'
import type { RecordingMode } from '@/types'
import { useMediaRecorder } from '../composables/useMediaRecorder'
import { useStorage } from '@/modules/storage/composables/useStorage'

const {
  state,
  mimeType,
  recordingName,
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  getRecordedBlob,
  reset,
  formatElapsedTime,
  checkSupport
} = useMediaRecorder()

const { saveRecording, loadRecordings, formatSize } = useStorage()

const supportInfo = ref(checkSupport())

const formData = reactive({
  mode: 'screen' as RecordingMode,
  sliceInterval: 5000
})

const previewVisible = ref(false)
const previewVideoRef = ref<HTMLVideoElement | null>(null)

const formatTotalSize = () => {
  const totalSize = state.value.chunks.reduce((sum, chunk) => sum + chunk.size, 0)
  return formatSize(totalSize)
}

const handleStart = async () => {
  try {
    await startRecording(formData.mode, formData.sliceInterval)
    ElMessage.success('录制已开始')
  } catch (error) {
    ElMessage.error('开始录制失败: ' + (error as Error).message)
  }
}

const handlePause = () => {
  pauseRecording()
  ElMessage.info('录制已暂停')
}

const handleResume = () => {
  resumeRecording()
  ElMessage.success('录制已继续')
}

const handleStop = () => {
  stopRecording()
  ElMessage.success('录制已停止')
}

const handleSave = async () => {
  try {
    if (!recordingName.value.trim()) {
      recordingName.value = `录制_${new Date().toLocaleString('zh-CN').replace(/[/:]/g, '-')}`
    }

    const recordingId = await saveRecording(
      {
        name: recordingName.value,
        createdAt: Date.now(),
        duration: state.value.elapsedTime,
        mode: state.value.currentMode,
        size: 0,
        chunkCount: 0,
        mimeType: mimeType.value
      },
      state.value.chunks,
      mimeType.value
    )

    ElMessage.success('保存成功，ID: ' + recordingId)
    handleReset()
  } catch (error) {
    ElMessage.error('保存失败: ' + (error as Error).message)
  }
}

const handlePreview = () => {
  try {
    const blob = getRecordedBlob()
    const url = URL.createObjectURL(blob)

    previewVisible.value = true

    watch(previewVisible, (val) => {
      if (val && previewVideoRef.value) {
        previewVideoRef.value.src = url
      } else if (!val) {
        URL.revokeObjectURL(url)
      }
    }, { immediate: true })
  } catch (error) {
    ElMessage.error('预览失败: ' + (error as Error).message)
  }
}

const handleReset = () => {
  reset()
  ElMessage.info('已重置')
}

onMounted(() => {
  supportInfo.value = checkSupport()
})
</script>

<style scoped>
.recorder-module {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.unsupported-message {
  padding: 20px;
}

.recording-info {
  margin-top: 20px;
  padding-top: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.info-item .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.info-item .value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.info-item .value.recording-active {
  color: #f56c6c;
  animation: pulse 1.5s infinite;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 8px;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background-color: #f56c6c;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.control-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.preview-video {
  width: 100%;
  max-height: 500px;
  background-color: #000;
  border-radius: 4px;
}
</style>
