<template>
  <div class="sync-page fade-in">
    <div class="page-header">
      <h1>☁️ 云同步</h1>
      <p class="subtitle">同步您的弹幕配置到云端，跨设备无缝体验</p>
    </div>

    <!-- 同步状态卡片 -->
    <div class="card status-card">
      <div class="card-header">
        <h2>📊 同步状态</h2>
        <span 
          class="badge" 
          :class="syncStatus === 'success' ? 'badge-success' : syncStatus === 'error' ? 'badge-danger' : 'badge-info'"
        >
          {{ statusText }}
        </span>
      </div>
      
      <div class="status-content">
        <div class="status-item">
          <span class="status-label">最后同步时间</span>
          <span class="status-value">{{ lastSyncTime }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">设备数量</span>
          <span class="status-value">{{ deviceCount }} 台设备</span>
        </div>
        <div class="status-item">
          <span class="status-label">当前设备ID</span>
          <span class="status-value device-id">{{ deviceId }}</span>
        </div>
      </div>
    </div>

    <!-- 同步操作卡片 -->
    <div class="card actions-card">
      <div class="card-header">
        <h2>⚡ 同步操作</h2>
      </div>
      
      <div class="actions-content">
        <div class="action-section">
          <div class="action-description">
            <h3>上传到云端</h3>
            <p>将当前设备的弹幕配置和屏蔽词列表上传到云端</p>
          </div>
          <button 
            class="btn btn-primary action-btn" 
            @click="uploadToCloud"
            :disabled="isSyncing"
          >
            {{ isSyncing ? '同步中...' : '⬆️ 上传配置' }}
          </button>
        </div>

        <div class="action-section">
          <div class="action-description">
            <h3>从云端下载</h3>
            <p>将云端的弹幕配置和屏蔽词列表同步到当前设备</p>
          </div>
          <button 
            class="btn btn-secondary action-btn" 
            @click="downloadFromCloud"
            :disabled="isSyncing"
          >
            {{ isSyncing ? '同步中...' : '⬇️ 下载配置' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 当前配置预览 -->
    <div class="card preview-card">
      <div class="card-header">
        <h2>📋 当前配置预览</h2>
      </div>
      
      <div class="preview-content">
        <div class="config-preview">
          <h3>弹幕设置</h3>
          <div class="config-grid">
            <div class="config-item">
              <span class="config-label">字体大小</span>
              <span class="config-value">{{ currentConfig.fontSize }}px</span>
            </div>
            <div class="config-item">
              <span class="config-label">弹幕速度</span>
              <span class="config-value">{{ currentConfig.speed }}级</span>
            </div>
            <div class="config-item">
              <span class="config-label">弹幕颜色</span>
              <span class="config-value color-preview" :style="{ backgroundColor: currentConfig.color }">
                {{ currentConfig.color }}
              </span>
            </div>
            <div class="config-item">
              <span class="config-label">透明度</span>
              <span class="config-value">{{ Math.round(currentConfig.opacity * 100) }}%</span>
            </div>
          </div>
        </div>

        <div class="words-preview">
          <h3>屏蔽词列表 ({{ blockedWords.length }} 个)</h3>
          <div class="words-list" v-if="blockedWords.length > 0">
            <span class="word-tag" v-for="word in blockedWords" :key="word">
              {{ word }}
            </span>
          </div>
          <div class="empty-words" v-else>
            <p>暂无屏蔽词</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 同步历史 -->
    <div class="card history-card">
      <div class="card-header">
        <h2>📜 同步历史</h2>
      </div>
      
      <div class="history-content">
        <div class="history-list" v-if="syncHistory.length > 0">
          <div class="history-item" v-for="(item, index) in syncHistory" :key="index">
            <div class="history-info">
              <span class="history-type" :class="item.type">
                {{ item.type === 'upload' ? '⬆️ 上传' : '⬇️ 下载' }}
              </span>
              <span class="history-time">{{ item.time }}</span>
            </div>
            <span class="history-status" :class="item.status">
              {{ item.status === 'success' ? '✅ 成功' : '❌ 失败' }}
            </span>
          </div>
        </div>
        <div class="empty-history" v-else>
          <p>暂无同步记录，开始您的第一次同步吧！</p>
        </div>
      </div>
    </div>

    <!-- 同步设置 -->
    <div class="card settings-card">
      <div class="card-header">
        <h2>⚙️ 同步设置</h2>
      </div>
      
      <div class="settings-content">
        <div class="setting-item">
          <label class="setting-label">
            <input type="checkbox" v-model="autoSync" />
            <span>自动同步</span>
          </label>
          <p class="setting-desc">配置变更时自动同步到云端</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input type="checkbox" v-model="syncBlockedWords" />
            <span>同步屏蔽词</span>
          </label>
          <p class="setting-desc">同步时包含屏蔽词列表</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { configApi, blockedWordsApi, syncApi } from '@/api'

// 同步状态
const syncStatus = ref('idle') // idle, syncing, success, error
const isSyncing = ref(false)
const lastSyncTime = ref('从未同步')
const deviceCount = ref(0)
const deviceId = ref('')
const syncHistory = ref([])

// 配置数据
const currentConfig = ref({
  fontSize: 24,
  speed: 5,
  color: '#ffffff',
  opacity: 0.9,
  fontFamily: 'Microsoft YaHei, sans-serif'
})

const blockedWords = ref([])

// 设置
const autoSync = ref(false)
const syncBlockedWords = ref(true)

// 计算属性
const statusText = () => {
  switch (syncStatus.value) {
    case 'success': return '已同步'
    case 'error': return '同步失败'
    case 'syncing': return '同步中'
    default: return '待同步'
  }
}

// 生成设备ID
const generateDeviceId = () => {
  const storedId = localStorage.getItem('danmaku_device_id')
  if (storedId) {
    deviceId.value = storedId
    return storedId
  }
  
  const newId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  localStorage.setItem('danmaku_device_id', newId)
  deviceId.value = newId
  return newId
}

// 加载当前配置
const loadCurrentConfig = async () => {
  try {
    const [configResponse, wordsResponse] = await Promise.all([
      configApi.getConfig(),
      blockedWordsApi.getBlockedWords()
    ])
    
    if (configResponse.success) {
      currentConfig.value = { ...currentConfig.value, ...configResponse.data }
    }
    
    if (wordsResponse.success) {
      blockedWords.value = wordsResponse.data
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 获取同步状态
const getSyncStatus = async () => {
  try {
    const response = await syncApi.getSyncData()
    if (response.success && response.data.lastSync) {
      lastSyncTime.value = formatDateTime(response.data.lastSync)
      deviceCount.value = response.data.devices?.length || 0
    }
  } catch (error) {
    console.error('获取同步状态失败:', error)
  }
}

// 上传到云端
const uploadToCloud = async () => {
  if (isSyncing.value) return
  
  isSyncing.value = true
  syncStatus.value = 'syncing'
  
  try {
    // 先从后端获取最新配置，确保上传的是最新数据
    await loadCurrentConfig()
    
    const data = {
      config: currentConfig.value,
      blockedWords: syncBlockedWords.value ? blockedWords.value : undefined,
      deviceId: deviceId.value
    }
    
    const response = await syncApi.syncData(data)
    
    if (response.success) {
      syncStatus.value = 'success'
      lastSyncTime.value = formatDateTime(response.data.lastSync)
      addSyncHistory('upload', 'success')
      alert('✅ 上传成功！配置已同步到云端')
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('上传失败:', error)
    syncStatus.value = 'error'
    addSyncHistory('upload', 'error')
    alert('❌ 上传失败：' + (error.message || '未知错误'))
  } finally {
    isSyncing.value = false
  }
}

// 从云端下载
const downloadFromCloud = async () => {
  if (isSyncing.value) return
  
  isSyncing.value = true
  syncStatus.value = 'syncing'
  
  try {
    const response = await syncApi.getSyncData()
    
    if (response.success) {
      const data = response.data
      
      if (data.config) {
        // 更新后端配置
        await configApi.updateConfig(data.config)
        // 更新本地状态
        currentConfig.value = { ...currentConfig.value, ...data.config }
      }
      
      if (syncBlockedWords.value && data.blockedWords) {
        // 批量更新屏蔽词到后端
        await blockedWordsApi.updateBlockedWords(data.blockedWords)
        // 更新本地状态
        blockedWords.value = data.blockedWords
      }
      
      if (data.lastSync) {
        lastSyncTime.value = formatDateTime(data.lastSync)
      }
      
      syncStatus.value = 'success'
      addSyncHistory('download', 'success')
      alert('✅ 下载成功！云端配置已应用到本地')
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('下载失败:', error)
    syncStatus.value = 'error'
    addSyncHistory('download', 'error')
    alert('❌ 下载失败：' + (error.message || '未知错误'))
  } finally {
    isSyncing.value = false
  }
}

// 添加同步历史
const addSyncHistory = (type, status) => {
  const historyItem = {
    type,
    status,
    time: formatDateTime(new Date().toISOString())
  }
  
  syncHistory.value.unshift(historyItem)
  
  if (syncHistory.value.length > 20) {
    syncHistory.value = syncHistory.value.slice(0, 20)
  }
  
  localStorage.setItem('danmaku_sync_history', JSON.stringify(syncHistory.value))
}

// 格式化日期时间
const formatDateTime = (isoString) => {
  if (!isoString) return '从未同步'
  
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 加载同步历史
const loadSyncHistory = () => {
  const stored = localStorage.getItem('danmaku_sync_history')
  if (stored) {
    try {
      syncHistory.value = JSON.parse(stored)
    } catch (e) {
      syncHistory.value = []
    }
  }
}

onMounted(() => {
  generateDeviceId()
  loadCurrentConfig()
  getSyncStatus()
  loadSyncHistory()
})
</script>

<style scoped>
.sync-page {
  min-height: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  color: white;
}

.page-header h1 {
  font-size: 32px;
  margin-bottom: 12px;
  color: white;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
}

/* 卡片样式 */
.status-card,
.actions-card,
.preview-card,
.history-card,
.settings-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h2 {
  margin-bottom: 0;
  font-size: 20px;
}

/* 状态内容 */
.status-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
}

.status-label {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
}

.status-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.status-value.device-id {
  font-family: monospace;
  font-size: 12px;
  color: #667eea;
  word-break: break-all;
}

/* 操作内容 */
.actions-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.action-description h3 {
  margin-bottom: 8px;
  color: white;
}

.action-description p {
  font-size: 14px;
  opacity: 0.9;
}

.action-btn {
  min-width: 140px;
  padding: 16px 24px;
  font-size: 16px;
  border-radius: 12px;
  background: white !important;
  color: #667eea !important;
}

.action-btn:hover {
  transform: scale(1.05);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 预览内容 */
.preview-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .preview-content {
    grid-template-columns: 1fr;
  }
}

.config-preview,
.words-preview {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
}

.config-preview h3,
.words-preview h3 {
  margin-bottom: 16px;
  font-size: 16px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-label {
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.config-value {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.config-value.color-preview {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 4px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  width: fit-content;
}

.words-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.word-tag {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}

.empty-words,
.empty-history {
  text-align: center;
  padding: 32px;
  color: #666;
  background: #f5f5f5;
  border-radius: 8px;
}

/* 历史记录 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: #f0f0f0;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.history-type {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.history-type.upload {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
}

.history-type.download {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.history-time {
  font-size: 13px;
  color: #666;
}

.history-status {
  font-weight: 600;
  font-size: 13px;
}

.history-status.success {
  color: #2ed573;
}

.history-status.error {
  color: #ff4757;
}

/* 设置内容 */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
}

.setting-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.setting-desc {
  margin-top: 8px;
  margin-left: 32px;
  font-size: 13px;
  color: #666;
}

@media (max-width: 768px) {
  .actions-content {
    grid-template-columns: 1fr;
  }
  
  .action-section {
    flex-direction: column;
    text-align: center;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .status-content {
    grid-template-columns: 1fr;
  }
}
</style>
