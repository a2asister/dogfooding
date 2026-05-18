<template>
  <div class="app">
    <header class="app-header">
      <div class="logo">
        <span class="logo-icon">🎵</span>
        <h1>无损音乐格式转换工具</h1>
      </div>
      <p class="subtitle">FLAC / WAV / MP3 批量转换 · WASM 无损编解码</p>
    </header>

    <main class="app-main">
      <div class="left-panel">
        <FileUpload
          :disabled="store.isUploading"
          @files-selected="handleFilesSelected"
        />

        <div v-if="store.uploadError" class="error-message">
          {{ store.uploadError }}
        </div>

        <FileList
          :files="store.uploadedFiles"
          :selected-ids="store.selectedFileIds"
          @toggle-select="store.toggleFileSelection"
          @remove="store.removeFile"
          @clear-all="store.clearAllFiles"
        />
      </div>

      <div class="right-panel">
        <ConversionSettings
          v-model="store.targetFormat"
          v-model:quality="store.quality"
        />

        <button
          class="convert-btn"
          type="button"
          :disabled="!store.hasSelection || store.isConverting"
          @click="handleConvert"
        >
          <span v-if="store.isConverting">🔄 启动转换中...</span>
          <span v-else>🚀 开始转换 ({{ store.selectedFileIds.size }} 个文件)</span>
        </button>

        <div v-if="store.convertError" class="error-message">
          {{ store.convertError }}
        </div>

        <BatchList
          :batches="allBatches"
          @download-task="handleDownloadTask"
          @download-batch="handleDownloadBatch"
        />
      </div>
    </main>

    <footer class="app-footer">
      <p>基于 WebAssembly 的无损音频编解码引擎 · 支持最高 192kHz/24bit 采样</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useConverterStore } from './stores/converter';
import { downloadTask, downloadBatch } from './services/api';
import FileUpload from './components/FileUpload.vue';
import FileList from './components/FileList.vue';
import ConversionSettings from './components/ConversionSettings.vue';
import BatchList from './components/BatchList.vue';

const store = useConverterStore();

const allBatches = computed(() => {
  return [
    ...store.activeBatches,
    ...store.completedBatches
  ].sort((a, b) => b.createdAt - a.createdAt);
});

async function handleFilesSelected(files: File[]): Promise<void> {
  try {
    await store.handleUpload(files);
  } catch {
    // Error handled in store
  }
}

async function handleConvert(): Promise<void> {
  try {
    await store.startConvert();
  } catch {
    // Error handled in store
  }
}

async function handleDownloadTask(taskId: string): Promise<void> {
  try {
    await downloadTask(taskId);
  } catch (error) {
    console.error('Download failed:', error);
  }
}

async function handleDownloadBatch(batchId: string): Promise<void> {
  try {
    await downloadBatch(batchId);
  } catch (error) {
    console.error('Batch download failed:', error);
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
  color: #e2e8f0;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  padding: 48px 24px 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 40px;
}

.app-header h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #718096;
  font-size: 15px;
}

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 24px;
  padding: 0 48px 48px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 1024px) {
  .app-main {
    grid-template-columns: 1fr;
    padding: 0 24px 48px;
  }
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.convert-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 18px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.convert-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
}

.convert-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: rgba(239, 68, 68, 0.15);
  color: #fc8181;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  border-left: 3px solid #f56565;
}

.app-footer {
  text-align: center;
  padding: 24px;
  color: #4a5568;
  font-size: 13px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
