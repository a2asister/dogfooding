<script setup lang="ts">
import { ref } from 'vue'
import UploadPanel from './components/UploadPanel.vue'
import HistoryList from './components/HistoryList.vue'
import type { TabType } from './types'

const activeTab = ref<TabType>('upload')
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#6366f1"/>
          </svg>
          <h1>图片压缩工具</h1>
        </div>
        <nav class="tabs">
          <button
            :class="['tab-btn', activeTab === 'upload' && 'active']"
            @click="activeTab = 'upload'"
          >
            上传压缩
          </button>
          <button
            :class="['tab-btn', activeTab === 'history' && 'active']"
            @click="activeTab = 'history'"
          >
            已压缩列表
          </button>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <UploadPanel v-if="activeTab === 'upload'" />
        <HistoryList v-else />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo h1 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 8px 20px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--primary-color);
  color: white;
}

.app-main {
  flex: 1;
  padding: 24px 0;
}
</style>
