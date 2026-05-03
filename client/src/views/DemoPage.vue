<template>
  <div class="demo-page fade-in">
    <div class="page-header">
      <h1>🎬 弹幕演示</h1>
      <p class="subtitle">体验自定义弹幕效果，发送您的第一条弹幕</p>
    </div>

    <!-- 视频播放区域 -->
    <div class="video-container">
      <div class="video-wrapper">
        <!-- 模拟视频背景 -->
        <div class="video-background">
          <div class="video-content">
            <div class="video-placeholder">
              <span class="play-icon">▶️</span>
              <p class="video-title">示例视频 - 弹幕演示</p>
            </div>
          </div>
        </div>

        <!-- 弹幕容器 -->
        <div class="danmaku-container" ref="danmakuContainer">
          <div 
            v-for="danmaku in activeDanmakus" 
            :key="danmaku.id"
            class="danmaku-item"
            :style="getDanmakuStyle(danmaku)"
          >
            {{ danmaku.text }}
          </div>
        </div>
      </div>

      <!-- 视频控制栏 -->
      <div class="video-controls">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="control-buttons">
          <button class="control-btn" @click="togglePlay">
            {{ isPlaying ? '⏸️' : '▶️' }}
          </button>
          <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
          <div class="right-controls">
            <button class="control-btn" @click="toggleFullscreen">⛶</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹幕发送区域 -->
    <div class="card danmaku-input-card">
      <div class="card-header">
        <h2>💬 发送弹幕</h2>
      </div>
      
      <div class="input-section">
        <div class="main-input">
          <input 
            type="text" 
            v-model="newDanmakuText" 
            placeholder="输入弹幕内容，按回车发送..."
            class="danmaku-input"
            @keyup.enter="sendDanmaku"
          />
          <button class="btn btn-primary send-btn" @click="sendDanmaku">
            发送弹幕 🚀
          </button>
        </div>

        <div class="quick-options">
          <label class="option-label">
            <span>弹幕颜色:</span>
            <input 
              type="color" 
              v-model="customColor" 
              class="color-input"
            />
          </label>
          <label class="option-label">
            <span>字体大小:</span>
            <select v-model="customFontSize" class="select-input">
              <option :value="16">小</option>
              <option :value="24">中</option>
              <option :value="32">大</option>
            </select>
          </label>
          <button class="btn btn-secondary" @click="resetToDefault">
            🔄 使用全局配置
          </button>
        </div>
      </div>
    </div>

    <!-- 快捷弹幕 -->
    <div class="card quick-danmaku-card">
      <div class="card-header">
        <h2>⚡ 快捷弹幕</h2>
      </div>
      <div class="quick-danmaku-grid">
        <button 
          v-for="(danmaku, index) in quickDanmakus" 
          :key="index"
          class="quick-danmaku-btn"
          @click="sendQuickDanmaku(danmaku)"
        >
          {{ danmaku }}
        </button>
      </div>
    </div>

    <!-- 当前配置信息 -->
    <div class="card config-info-card">
      <div class="card-header">
        <h2>📋 当前配置</h2>
        <span class="badge badge-success">已应用</span>
      </div>
      <div class="config-info-grid">
        <div class="config-item">
          <span class="config-label">字体大小</span>
          <span class="config-value">{{ config.fontSize }}px</span>
        </div>
        <div class="config-item">
          <span class="config-label">弹幕速度</span>
          <span class="config-value">{{ config.speed }}级</span>
        </div>
        <div class="config-item">
          <span class="config-label">弹幕颜色</span>
          <span class="config-value color-value" :style="{ color: config.color }">{{ config.color }}</span>
        </div>
        <div class="config-item">
          <span class="config-label">透明度</span>
          <span class="config-value">{{ Math.round(config.opacity * 100) }}%</span>
        </div>
        <div class="config-item full-width">
          <span class="config-label">屏蔽词数量</span>
          <span class="config-value">{{ blockedWords.length }} 个</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { configApi, blockedWordsApi } from '@/api'

// 配置数据
const config = ref({
  fontSize: 24,
  speed: 5,
  color: '#ffffff',
  opacity: 0.9,
  fontFamily: 'Microsoft YaHei, sans-serif'
})

const blockedWords = ref([])
const customColor = ref('#ffffff')
const customFontSize = ref(24)

// 弹幕数据
const activeDanmakus = ref([])
const newDanmakuText = ref('')
const danmakuIdCounter = ref(0)

// 视频控制
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(300) // 5分钟
const progress = computed(() => (currentTime.value / duration.value) * 100)

const danmakuContainer = ref(null)

// 快捷弹幕
const quickDanmakus = [
  '666666',
  '太精彩了！',
  '前方高能！',
  '弹幕护体！',
  '233333',
  'awsl',
  '卧槽！',
  '太强了！',
  '泪目了',
  '有内鬼！',
  '禁止套娃',
  '名场面'
]

// 示例弹幕库
const sampleDanmakus = [
  { text: '欢迎来到弹幕演示平台！', delay: 1000 },
  { text: '这是一条自动播放的弹幕', delay: 2500 },
  { text: '自定义配置让弹幕更有趣', delay: 4000 },
  { text: '6666666666', delay: 5500 },
  { text: '弹幕护体！弹幕护体！', delay: 7000 },
  { text: '前方高能预警！', delay: 8500 },
  { text: '这个平台太好用了！', delay: 10000 },
  { text: '2333333333', delay: 11500 }
]

// 动画定时器
let animationInterval = null
let sampleDanmakuTimeout = null

// 加载配置
const loadConfig = async () => {
  try {
    const response = await configApi.getConfig()
    if (response.success) {
      config.value = { ...config.value, ...response.data }
      customColor.value = config.value.color
      customFontSize.value = config.value.fontSize
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 加载屏蔽词
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

// 检查是否包含屏蔽词
const containsBlockedWord = (text) => {
  return blockedWords.value.some(word => text.toLowerCase().includes(word.toLowerCase()))
}

// 发送弹幕
const sendDanmaku = () => {
  const text = newDanmakuText.value.trim()
  if (!text) return
  
  if (containsBlockedWord(text)) {
    alert('⚠️ 弹幕内容包含屏蔽词，无法发送！')
    return
  }
  
  createDanmaku(text, customColor.value, customFontSize.value)
  newDanmakuText.value = ''
}

// 发送快捷弹幕
const sendQuickDanmaku = (text) => {
  if (containsBlockedWord(text)) {
    alert('⚠️ 弹幕内容包含屏蔽词，无法发送！')
    return
  }
  createDanmaku(text, customColor.value, customFontSize.value)
}

// 创建弹幕
const createDanmaku = (text, color, fontSize) => {
  const id = danmakuIdCounter.value++
  const containerHeight = danmakuContainer.value?.offsetHeight || 400
  const trackHeight = fontSize + 10
  const maxTracks = Math.floor(containerHeight / trackHeight) || 8
  const track = Math.floor(Math.random() * maxTracks)
  
  const danmaku = {
    id,
    text,
    color: color || config.value.color,
    fontSize: fontSize || config.value.fontSize,
    speed: config.value.speed,
    opacity: config.value.opacity,
    fontFamily: config.value.fontFamily,
    position: 'right',
    track,
    startTime: Date.now(),
    left: 100, // 初始位置（百分比）
    animationDuration: getAnimationDuration(config.value.speed)
  }
  
  activeDanmakus.value.push(danmaku)
}

// 获取动画持续时间
const getAnimationDuration = (speed) => {
  // 速度1-10级，对应15-5秒
  return 20 - (speed - 1) * 1.5
}

// 获取弹幕样式
const getDanmakuStyle = (danmaku) => {
  const containerWidth = danmakuContainer.value?.offsetWidth || 800
  const textWidth = danmaku.text.length * danmaku.fontSize * 0.7
  const totalDistance = containerWidth + textWidth
  
  const elapsed = (Date.now() - danmaku.startTime) / 1000
  const progress = elapsed / danmaku.animationDuration
  const currentLeft = 100 - (progress * (100 + (textWidth / containerWidth) * 100))
  
  // 如果弹幕已经移出屏幕，移除它
  if (currentLeft < -50) {
    const index = activeDanmakus.value.findIndex(d => d.id === danmaku.id)
    if (index > -1) {
      activeDanmakus.value.splice(index, 1)
    }
    return {}
  }
  
  const trackHeight = danmaku.fontSize + 10
  const top = danmaku.track * trackHeight + 10
  
  return {
    position: 'absolute',
    left: `${currentLeft}%`,
    top: `${top}px`,
    color: danmaku.color,
    fontSize: `${danmaku.fontSize}px`,
    opacity: danmaku.opacity,
    fontFamily: danmaku.fontFamily,
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.5)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    transform: 'translateZ(0)',
    willChange: 'left'
  }
}

// 切换播放状态
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startAutoDanmakus()
  } else {
    stopAutoDanmakus()
  }
}

// 开始自动弹幕
const startAutoDanmakus = () => {
  sampleDanmakus.forEach((sample, index) => {
    setTimeout(() => {
      if (isPlaying.value) {
        createDanmaku(sample.text, config.value.color, config.value.fontSize)
      }
    }, sample.delay)
  })
}

// 停止自动弹幕
const stopAutoDanmakus = () => {
  if (sampleDanmakuTimeout) {
    clearTimeout(sampleDanmakuTimeout)
  }
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 重置为默认配置
const resetToDefault = () => {
  customColor.value = config.value.color
  customFontSize.value = config.value.fontSize
}

// 模拟时间流逝
const updateTime = () => {
  if (isPlaying.value && currentTime.value < duration.value) {
    currentTime.value += 1
  }
}

onMounted(() => {
  loadConfig()
  loadBlockedWords()
  
  // 开始时间更新
  animationInterval = setInterval(updateTime, 1000)
  
  // 自动开始播放
  isPlaying.value = true
  startAutoDanmakus()
})

onUnmounted(() => {
  if (animationInterval) {
    clearInterval(animationInterval)
  }
  stopAutoDanmakus()
})
</script>

<style scoped>
.demo-page {
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

/* 视频容器 */
.video-container {
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 300px;
}

.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.video-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.video-placeholder {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.play-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.8;
}

.video-title {
  font-size: 18px;
  font-weight: 600;
}

/* 弹幕容器 */
.danmaku-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.danmaku-item {
  position: absolute;
  white-space: nowrap;
  pointer-events: auto;
  cursor: default;
}

/* 视频控制栏 */
.video-controls {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.3));
  padding: 16px 20px;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin-bottom: 12px;
  cursor: pointer;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.control-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.time-display {
  font-family: monospace;
  font-size: 14px;
  font-weight: 600;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 弹幕输入卡片 */
.danmaku-input-card {
  margin-bottom: 24px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-input {
  display: flex;
  gap: 12px;
}

.danmaku-input {
  flex: 1;
  padding: 16px 20px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.danmaku-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.send-btn {
  padding: 16px 32px;
  font-size: 16px;
  border-radius: 12px;
}

.quick-options {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.color-input {
  width: 40px;
  height: 36px;
  padding: 0;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}

.select-input {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: white;
}

.select-input:focus {
  outline: none;
  border-color: #667eea;
}

/* 快捷弹幕 */
.quick-danmaku-card {
  margin-bottom: 24px;
}

.quick-danmaku-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.quick-danmaku-btn {
  padding: 12px 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-danmaku-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 配置信息卡片 */
.config-info-card {
  margin-bottom: 24px;
}

.config-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}

.config-item.full-width {
  grid-column: 1 / -1;
}

.config-label {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
}

.config-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.config-value.color-value {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .video-wrapper {
    min-height: 200px;
  }
  
  .main-input {
    flex-direction: column;
  }
  
  .send-btn {
    width: 100%;
  }
  
  .quick-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .config-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
