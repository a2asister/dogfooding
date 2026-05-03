<template>
  <div class="config-page fade-in">
    <div class="page-header">
      <h1>🎮 弹幕配置中心</h1>
      <p class="subtitle">自定义您的弹幕体验，打造专属观看方式</p>
    </div>

    <div class="config-grid">
      <!-- 基础配置卡片 -->
      <div class="card">
        <div class="card-header">
          <h2>📐 基础设置</h2>
        </div>
        
        <div class="config-content">
          <!-- 字号设置 -->
          <div class="input-group">
            <label>
              <span class="label-text">弹幕字号</span>
              <span class="value-badge">{{ config.fontSize }}px</span>
            </label>
            <input 
              type="range" 
              v-model="config.fontSize" 
              min="12" 
              max="48" 
              step="2"
              @input="updateConfig"
            />
            <div class="range-labels">
              <span>小</span>
              <span>中</span>
              <span>大</span>
            </div>
          </div>

          <!-- 速度设置 -->
          <div class="input-group">
            <label>
              <span class="label-text">弹幕速度</span>
              <span class="value-badge">{{ config.speed }}级</span>
            </label>
            <input 
              type="range" 
              v-model="config.speed" 
              min="1" 
              max="10" 
              step="1"
              @input="updateConfig"
            />
            <div class="range-labels">
              <span>慢</span>
              <span>中</span>
              <span>快</span>
            </div>
          </div>

          <!-- 透明度设置 -->
          <div class="input-group">
            <label>
              <span class="label-text">弹幕透明度</span>
              <span class="value-badge">{{ Math.round(config.opacity * 100) }}%</span>
            </label>
            <input 
              type="range" 
              v-model="config.opacity" 
              min="0.1" 
              max="1" 
              step="0.1"
              @input="updateConfig"
            />
          </div>
        </div>
      </div>

      <!-- 颜色配置卡片 -->
      <div class="card">
        <div class="card-header">
          <h2>🎨 颜色设置</h2>
        </div>
        
        <div class="config-content">
          <div class="input-group">
            <label class="label-text">弹幕颜色</label>
            <div class="color-picker-wrapper">
              <input 
                type="color" 
                v-model="config.color" 
                @input="updateConfig"
              />
              <div class="color-preview" :style="{ backgroundColor: config.color }"></div>
              <span class="color-value">{{ config.color }}</span>
            </div>
          </div>

          <!-- 预设颜色 -->
          <div class="preset-colors">
            <label class="label-text">预设颜色</label>
            <div class="color-grid">
              <div 
                v-for="color in presetColors" 
                :key="color.value"
                class="preset-color-item"
                :class="{ active: config.color === color.value }"
                :style="{ backgroundColor: color.value }"
                @click="selectColor(color.value)"
                :title="color.name"
              ></div>
            </div>
          </div>

          <!-- 预览区域 -->
          <div class="preview-section">
            <label class="label-text">实时预览</label>
            <div class="preview-area">
              <div 
                class="preview-danmaku"
                :style="{
                  fontSize: config.fontSize + 'px',
                  color: config.color,
                  opacity: config.opacity,
                  fontFamily: config.fontFamily
                }"
              >
                这是一条示例弹幕！🎉
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 屏蔽词管理卡片 -->
      <div class="card full-width">
        <div class="card-header">
          <h2>🚫 屏蔽词管理</h2>
          <span class="badge badge-info">{{ blockedWords.length }} 个屏蔽词</span>
        </div>
        
        <div class="config-content">
          <!-- 添加屏蔽词 -->
          <div class="add-word-section">
            <div class="input-group inline">
              <input 
                type="text" 
                v-model="newBlockedWord" 
                placeholder="输入要屏蔽的关键词..."
                @keyup.enter="addBlockedWord"
              />
              <button class="btn btn-primary" @click="addBlockedWord">
                ➕ 添加屏蔽词
              </button>
            </div>
          </div>

          <!-- 屏蔽词列表 -->
          <div class="blocked-words-list" v-if="blockedWords.length > 0">
            <div class="list-item" v-for="word in blockedWords" :key="word">
              <span class="word-text">{{ word }}</span>
              <button class="btn btn-danger" @click="removeBlockedWord(word)">
                🗑️ 删除
              </button>
            </div>
          </div>
          
          <div class="empty-state" v-else>
            <p>暂无屏蔽词，您可以添加关键词来过滤弹幕内容</p>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="btn btn-primary" @click="saveAllConfig">
          💾 保存所有配置
        </button>
        <button class="btn btn-secondary" @click="resetConfig">
          🔄 恢复默认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { configApi, blockedWordsApi } from '@/api'

const config = ref({
  fontSize: 24,
  speed: 5,
  color: '#ffffff',
  opacity: 0.9,
  fontFamily: 'Microsoft YaHei, sans-serif'
})

const blockedWords = ref([])
const newBlockedWord = ref('')

// 预设颜色
const presetColors = [
  { name: '白色', value: '#ffffff' },
  { name: '红色', value: '#ff4757' },
  { name: '绿色', value: '#2ed573' },
  { name: '蓝色', value: '#3742fa' },
  { name: '黄色', value: '#ffa502' },
  { name: '紫色', value: '#a55eea' },
  { name: '粉色', value: '#ff6b81' },
  { name: '青色', value: '#1e90ff' },
  { name: '橙色', value: '#ff6348' },
  { name: '灰色', value: '#a4b0be' },
  { name: '金色', value: '#ffd700' },
  { name: '银色', value: '#c0c0c0' }
]

// 获取配置
const loadConfig = async () => {
  try {
    const response = await configApi.getConfig()
    if (response.success) {
      config.value = { ...config.value, ...response.data }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 获取屏蔽词
const loadBlockedWords = async () => {
  try {
    const response = await blockedWordsApi.getBlockedWords()
    if (response.success) {
      blockedWords.value = response.data
    }
  } catch (error) {
    console.error('加载屏蔽词失败:', error)
  }
}

// 更新配置（实时）
const updateConfig = async () => {
  try {
    await configApi.updateConfig(config.value)
  } catch (error) {
    console.error('更新配置失败:', error)
  }
}

// 选择预设颜色
const selectColor = (color) => {
  config.value.color = color
  updateConfig()
}

// 添加屏蔽词
const addBlockedWord = async () => {
  if (!newBlockedWord.value.trim()) return
  
  try {
    const response = await blockedWordsApi.addBlockedWord(newBlockedWord.value.trim())
    if (response.success) {
      blockedWords.value = response.data
      newBlockedWord.value = ''
    }
  } catch (error) {
    console.error('添加屏蔽词失败:', error)
    alert('添加失败：' + (error.response?.data?.message || '未知错误'))
  }
}

// 删除屏蔽词
const removeBlockedWord = async (word) => {
  try {
    const response = await blockedWordsApi.deleteBlockedWord(word)
    if (response.success) {
      blockedWords.value = response.data
    }
  } catch (error) {
    console.error('删除屏蔽词失败:', error)
    alert('删除失败：' + (error.response?.data?.message || '未知错误'))
  }
}

// 保存所有配置
const saveAllConfig = async () => {
  try {
    await configApi.updateConfig(config.value)
    alert('✅ 配置保存成功！')
  } catch (error) {
    console.error('保存配置失败:', error)
    alert('❌ 保存失败，请稍后重试')
  }
}

// 恢复默认配置
const resetConfig = () => {
  if (confirm('确定要恢复默认配置吗？')) {
    config.value = {
      fontSize: 24,
      speed: 5,
      color: '#ffffff',
      opacity: 0.9,
      fontFamily: 'Microsoft YaHei, sans-serif'
    }
    updateConfig()
  }
}

onMounted(() => {
  loadConfig()
  loadBlockedWords()
})
</script>

<style scoped>
.config-page {
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

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

@media (max-width: 850px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}

.full-width {
  grid-column: 1 / -1;
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

.config-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.label-text {
  font-weight: 600;
  color: #333;
}

.value-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.color-picker-wrapper input[type="color"] {
  width: 60px;
  height: 48px;
  padding: 0;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}

.color-preview {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.color-value {
  font-family: monospace;
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.preset-colors {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.preset-color-item {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.preset-color-item:hover {
  transform: scale(1.1);
}

.preset-color-item.active {
  border-color: #333;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #667eea;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-area {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
}

.preview-danmaku {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  font-weight: 600;
  letter-spacing: 1px;
}

.add-word-section {
  margin-bottom: 24px;
}

.input-group.inline {
  display: flex;
  gap: 12px;
  margin-bottom: 0;
}

.input-group.inline input {
  flex: 1;
}

.blocked-words-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.word-text {
  font-weight: 600;
  color: #333;
  padding: 8px 16px;
  background: rgba(255, 71, 87, 0.1);
  border-radius: 4px;
  color: #ff4757;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: #666;
  background: #f9f9f9;
  border-radius: 8px;
}

.action-buttons {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
}

.action-buttons .btn {
  min-width: 160px;
  padding: 16px 32px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .color-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .input-group.inline {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .btn {
    width: 100%;
  }
}
</style>
