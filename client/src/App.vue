<template>
  <div class="app-container">
    <div class="app-bg"></div>
    
    <div class="app-content">
      <header class="app-header">
        <h1 class="app-title">
          <span class="title-icon">⚡</span>
          <span>单位极速换算</span>
        </h1>
        <div class="header-actions">
          <button 
            v-if="activeCategory === 'currency'"
            class="refresh-btn"
            :class="{ refreshing: isRefreshingRates }"
            @click="refreshExchangeRates"
          >
            <span class="refresh-icon">🔄</span>
            <span>更新汇率</span>
          </button>
          <button class="fav-toggle-btn" @click="showFavorites = !showFavorites">
            <span>⭐ 收藏</span>
          </button>
        </div>
      </header>
      
      <div class="category-tabs">
        <div class="tabs-wrapper">
          <div class="tabs-scroll" ref="tabsScroll" @scroll="handleTabsScroll">
            <div 
              v-for="cat in categories" 
              :key="cat.id"
              class="tab-item"
              :class="{ active: activeCategory === cat.id }"
              @click="switchCategory(cat.id)"
            >
              <span class="tab-icon">{{ cat.icon }}</span>
              <span class="tab-name">{{ cat.name }}</span>
            </div>
          </div>
          <div class="tabs-fade-left" v-if="showLeftFade"></div>
          <div class="tabs-fade-right" v-if="showRightFade"></div>
        </div>
      </div>
      
      <div class="converter-section" v-if="!showFavorites">
        <div class="input-panel top-panel">
          <div class="panel-header">
            <select v-model="fromUnit" class="unit-select">
              <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">
                {{ unit.name }} ({{ unit.id.toUpperCase() }})
              </option>
            </select>
            <button class="copy-btn" @click="copyToClipboard(displayValue)" :title="'复制结果'">
              📋
            </button>
          </div>
          <div class="input-wrapper">
            <input 
              ref="topInput"
              type="number" 
              v-model="topValue"
              @input="handleTopInput"
              @focus="activeInput = 'top'"
              class="number-input"
              placeholder="0"
            />
          </div>
          <div class="unit-label">{{ getUnitLabel(fromUnit) }}</div>
        </div>
        
        <div class="swap-btn" @click="swapUnits">
          <div class="swap-icon">⇅</div>
        </div>
        
        <div class="input-panel bottom-panel">
          <div class="panel-header">
            <select v-model="toUnit" class="unit-select">
              <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">
                {{ unit.name }} ({{ unit.id.toUpperCase() }})
              </option>
            </select>
            <button class="copy-btn" @click="copyToClipboard(displayResult)" :title="'复制结果'">
              📋
            </button>
          </div>
          <div class="input-wrapper">
            <div class="result-display" :class="{ bouncing: isBouncing }">
              {{ displayResult || '0' }}
            </div>
          </div>
          <div class="unit-label">{{ getUnitLabel(toUnit) }}</div>
        </div>
        
        <div class="action-row">
          <button class="fav-action-btn" @click="addToFavorites">
            <span>⭐ 添加收藏</span>
          </button>
          <button class="history-btn" @click="showHistory = !showHistory">
            <span>📜 历史记录</span>
          </button>
        </div>
      </div>
      
      <div class="favorites-section" v-else>
        <div class="section-header">
          <h3>⭐ 我的收藏</h3>
          <button class="close-btn" @click="showFavorites = false">✕</button>
        </div>
        <div class="favorites-list" v-if="favorites.length > 0">
          <div 
            v-for="fav in favorites" 
            :key="fav.id"
            class="favorite-item"
            @click="applyFavorite(fav)"
          >
            <div class="favorite-info">
              <span class="fav-category">{{ getCategoryName(fav.category) }}</span>
              <span class="fav-units">
                {{ getUnitName(fav.category, fav.fromUnit) }} → {{ getUnitName(fav.category, fav.toUnit) }}
              </span>
            </div>
            <button class="remove-fav-btn" @click.stop="removeFavorite(fav.id)">
              ✕
            </button>
          </div>
        </div>
        <div class="empty-state" v-else>
          <div class="empty-icon">📭</div>
          <p>暂无收藏的换算组合</p>
        </div>
      </div>
      
      <div class="history-panel" v-if="showHistory && !showFavorites">
        <div class="section-header">
          <h3>📜 换算历史</h3>
          <div class="history-actions">
            <button class="clear-btn" v-if="history.length > 0" @click="clearHistory">
              清空
            </button>
            <button class="close-btn" @click="showHistory = false">✕</button>
          </div>
        </div>
        <div class="timeline" v-if="history.length > 0">
          <div 
            v-for="(item, index) in history" 
            :key="item.id"
            class="timeline-item"
            :class="{ 'is-last': index === history.length - 1 }"
            @click="applyHistory(item)"
          >
            <div class="timeline-line"></div>
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-main">
                <span class="timeline-value">{{ item.fromValue }}</span>
                <span class="timeline-unit">{{ getUnitShort(item.category, item.fromUnit) }}</span>
                <span class="timeline-arrow">→</span>
                <span class="timeline-value result">{{ item.toValue }}</span>
                <span class="timeline-unit">{{ getUnitShort(item.category, item.toUnit) }}</span>
              </div>
              <div class="timeline-meta">
                <span class="timeline-category">{{ getCategoryName(item.category) }}</span>
                <span class="timeline-time">{{ formatTime(item.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <div class="empty-icon">📭</div>
          <p>暂无换算历史</p>
        </div>
      </div>
      
      <div class="toast" :class="{ show: showToast }">
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { CATEGORIES, UNITS, convert, getUnitName, formatTimestamp } from './utils/units'
import { exchangeApi, favoritesApi, historyApi } from './utils/api'

const categories = CATEGORIES
const activeCategory = ref('length')
const fromUnit = ref('m')
const toUnit = ref('km')
const topValue = ref('1')
const displayValue = ref('1')
const displayResult = ref('')
const activeInput = ref('top')
const isBouncing = ref(false)
const showFavorites = ref(false)
const showHistory = ref(false)
const favorites = ref([])
const history = ref([])
const exchangeRates = ref(null)
const isRefreshingRates = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const showLeftFade = ref(false)
const showRightFade = ref(true)

const tabsScroll = ref(null)
const topInput = ref(null)

let bounceTimeout = null
let toastTimeout = null

function checkTabsScroll() {
  if (!tabsScroll.value) return
  
  const el = tabsScroll.value
  showLeftFade.value = el.scrollLeft > 5
  showRightFade.value = el.scrollLeft < (el.scrollWidth - el.clientWidth - 5)
}

function handleTabsScroll() {
  checkTabsScroll()
}

const currentUnits = computed(() => {
  return UNITS[activeCategory.value] || []
})

const currentCategory = computed(() => {
  return categories.find(c => c.id === activeCategory.value)
})

function switchCategory(categoryId) {
  if (activeCategory.value === categoryId) return
  
  activeCategory.value = categoryId
  const units = UNITS[categoryId]
  if (units && units.length >= 2) {
    fromUnit.value = units[0].id
    toUnit.value = units[1].id
  }
  topValue.value = '1'
  displayValue.value = '1'
  showFavorites.value = false
  showHistory.value = false
  
  performConversion()
}

function handleTopInput() {
  displayValue.value = topValue.value
  activeInput.value = 'top'
  performConversion()
}

function performConversion() {
  if (!topValue.value || topValue.value === '') {
    displayResult.value = ''
    return
  }
  
  const result = convert(
    activeCategory.value,
    topValue.value,
    fromUnit.value,
    toUnit.value,
    exchangeRates.value
  )
  
  if (result !== displayResult.value) {
    triggerBounce()
  }
  displayResult.value = result
}

function triggerBounce() {
  if (bounceTimeout) clearTimeout(bounceTimeout)
  isBouncing.value = true
  bounceTimeout = setTimeout(() => {
    isBouncing.value = false
  }, 300)
}

function swapUnits() {
  const tempUnit = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = tempUnit
  performConversion()
}

function getUnitLabel(unitId) {
  const unit = currentUnits.value.find(u => u.id === unitId)
  if (unit) {
    if (unit.symbol) return unit.symbol
    return unit.id.toUpperCase()
  }
  return unitId.toUpperCase()
}

function getCategoryName(categoryId) {
  const cat = categories.find(c => c.id === categoryId)
  return cat ? `${cat.icon} ${cat.name}` : categoryId
}

function getUnitShort(categoryId, unitId) {
  const unit = UNITS[categoryId]?.find(u => u.id === unitId)
  if (unit) {
    if (unit.symbol) return unit.symbol
    return unit.id.toUpperCase()
  }
  return unitId.toUpperCase()
}

function formatTime(timestamp) {
  return formatTimestamp(timestamp)
}

async function copyToClipboard(text) {
  if (!text) return
  
  try {
    await navigator.clipboard.writeText(text)
    showToastMessage('已复制到剪贴板 ✓')
  } catch (e) {
    showToastMessage('复制失败')
  }
}

function showToastMessage(msg) {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = msg
  showToast.value = true
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 2000)
}

async function addToFavorites() {
  try {
    const res = await favoritesApi.add({
      category: activeCategory.value,
      fromUnit: fromUnit.value,
      toUnit: toUnit.value
    })
    favorites.value = res.data.data
    showToastMessage('已添加收藏 ⭐')
  } catch (e) {
    showToastMessage('添加失败')
  }
}

async function removeFavorite(id) {
  try {
    const res = await favoritesApi.remove(id)
    favorites.value = res.data.data
    showToastMessage('已移除收藏')
  } catch (e) {
    showToastMessage('删除失败')
  }
}

function applyFavorite(fav) {
  activeCategory.value = fav.category
  fromUnit.value = fav.fromUnit
  toUnit.value = fav.toUnit
  showFavorites.value = false
  topValue.value = '1'
  displayValue.value = '1'
  performConversion()
  showToastMessage('已应用收藏组合')
}

async function saveToHistory() {
  if (!displayResult.value || displayResult.value === '' || displayResult.value === '—') return
  
  try {
    const res = await historyApi.add({
      category: activeCategory.value,
      fromUnit: fromUnit.value,
      toUnit: toUnit.value,
      fromValue: displayValue.value,
      toValue: displayResult.value
    })
    history.value = res.data.data
  } catch (e) {
    console.error('保存历史失败', e)
  }
}

async function clearHistory() {
  try {
    const res = await historyApi.clear()
    history.value = res.data.data
    showToastMessage('历史记录已清空')
  } catch (e) {
    showToastMessage('清空失败')
  }
}

function applyHistory(item) {
  activeCategory.value = item.category
  fromUnit.value = item.fromUnit
  toUnit.value = item.toUnit
  topValue.value = item.fromValue
  displayValue.value = item.fromValue
  displayResult.value = item.toValue
  showHistory.value = false
  showToastMessage('已回溯历史记录')
}

async function loadExchangeRates() {
  try {
    const res = await exchangeApi.getRates()
    exchangeRates.value = res.data.data
    performConversion()
  } catch (e) {
    console.error('加载汇率失败', e)
  }
}

async function refreshExchangeRates() {
  if (isRefreshingRates.value) return
  
  isRefreshingRates.value = true
  try {
    const res = await exchangeApi.refreshRates()
    exchangeRates.value = res.data.data
    performConversion()
    showToastMessage('汇率数据已更新 ✓')
  } catch (e) {
    showToastMessage('更新汇率失败')
  } finally {
    isRefreshingRates.value = false
  }
}

async function loadFavorites() {
  try {
    const res = await favoritesApi.getAll()
    favorites.value = res.data.data
  } catch (e) {
    console.error('加载收藏失败', e)
  }
}

async function loadHistory() {
  try {
    const res = await historyApi.getAll()
    history.value = res.data.data
  } catch (e) {
    console.error('加载历史失败', e)
  }
}

watch([activeCategory, fromUnit, toUnit], () => {
  performConversion()
})

watch([displayValue, displayResult], () => {
  if (displayValue.value && displayResult.value && displayResult.value !== '—') {
    saveToHistory()
  }
})

onMounted(async () => {
  await loadExchangeRates()
  await loadFavorites()
  await loadHistory()
  performConversion()
  
  nextTick(() => {
    checkTabsScroll()
    window.addEventListener('resize', checkTabsScroll)
  })
  
  setInterval(() => {
    if (activeCategory.value === 'currency') {
      loadExchangeRates()
    }
  }, 300000)
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.app-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 25%, #f0f9ff 50%, #eff6ff 75%, #e0f7fa 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  z-index: 0;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.app-content {
  position: relative;
  z-index: 1;
  max-width: 480px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-top: 10px;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  color: #1e3a5f;
  letter-spacing: -0.5px;
}

.title-icon {
  font-size: 24px;
  animation: pulse-light 2s infinite;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.refresh-btn, .fav-toggle-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  color: #3b82f6;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.refresh-btn:hover, .fav-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.refresh-btn.refreshing .refresh-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.category-tabs {
  margin-bottom: 24px;
}

.tabs-wrapper {
  position: relative;
}

.tabs-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 0 8px 12px;
}

.tabs-scroll::-webkit-scrollbar {
  height: 6px;
}

.tabs-scroll::-webkit-scrollbar-track {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 3px;
}

.tabs-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%);
  border-radius: 3px;
  cursor: pointer;
}

.tabs-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, #2563eb 0%, #0891b2 100%);
}

.tabs-fade-left,
.tabs-fade-right {
  position: absolute;
  top: 0;
  bottom: 12px;
  width: 40px;
  pointer-events: none;
  z-index: 10;
}

.tabs-fade-left {
  left: 0;
  background: linear-gradient(to right, #e0f2fe 0%, rgba(224, 242, 254, 0.8) 40%, transparent 100%);
}

.tabs-fade-right {
  right: 0;
  background: linear-gradient(to left, #e0f2fe 0%, rgba(224, 242, 254, 0.8) 40%, transparent 100%);
}

.tab-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.85);
  transform: translateY(-1px);
}

.tab-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.tab-icon {
  font-size: 16px;
}

.tab-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.converter-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
}

.top-panel {
  margin-bottom: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.bottom-panel {
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(239, 246, 255, 0.95) 100%);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.unit-select {
  padding: 8px 32px 8px 12px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: all 0.2s ease;
}

.unit-select:hover {
  border-color: rgba(59, 130, 246, 0.5);
}

.unit-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.copy-btn {
  background: none;
  border: none;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.copy-btn:hover {
  opacity: 1;
  background: rgba(59, 130, 246, 0.1);
}

.input-wrapper {
  position: relative;
  padding: 12px 0 8px;
}

.input-wrapper::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #8b5cf6 100%);
  border-radius: 2px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.input-wrapper:focus-within::after,
.bottom-panel .input-wrapper::after {
  opacity: 1;
}

.number-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  outline: none;
  text-align: right;
  padding: 8px 0;
  letter-spacing: -1px;
}

.number-input::placeholder {
  color: #cbd5e1;
}

.number-input::-webkit-outer-spin-button,
.number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input[type=number] {
  -moz-appearance: textfield;
}

.result-display {
  width: 100%;
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: right;
  padding: 8px 0;
  letter-spacing: -1.5px;
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  word-break: break-all;
  line-height: 1.2;
  min-height: 58px;
}

.result-display.bouncing {
  transform: scale(1.02);
}

.unit-label {
  text-align: right;
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  font-weight: 500;
}

.swap-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  margin: -12px 0;
  z-index: 10;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.swap-btn:hover {
  transform: scale(1.1) rotate(180deg);
}

.swap-icon {
  font-size: 20px;
  color: white;
  font-weight: bold;
}

.action-row {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.fav-action-btn, .history-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.08);
}

.fav-action-btn:hover, .history-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);
}

.favorites-section, .history-panel {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
  animation: slide-up 0.3s ease;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.clear-btn {
  background: none;
  border: none;
  font-size: 13px;
  color: #94a3b8;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.favorite-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.favorite-item:hover {
  background: rgba(239, 246, 255, 0.9);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateX(4px);
}

.favorite-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fav-category {
  font-size: 12px;
  color: #64748b;
}

.fav-units {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.remove-fav-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #94a3b8;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.remove-fav-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 350px;
  overflow-y: auto;
  padding-left: 24px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding: 14px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  animation: slide-up 0.3s ease backwards;
}

.timeline-item:hover {
  transform: translateX(4px);
}

.timeline-line {
  position: absolute;
  left: -17px;
  top: 50%;
  bottom: -14px;
  width: 2px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.4) 0%, rgba(6, 182, 212, 0.3) 50%, rgba(139, 92, 246, 0.4) 100%);
  border-radius: 2px;
  z-index: 0;
}

.timeline-item.is-last .timeline-line {
  display: none;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  border: 3px solid white;
  position: absolute;
  left: -24px;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  z-index: 1;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
}

.timeline-main {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.timeline-value {
  font-size: 16px;
  font-weight: 600;
  color: #475569;
}

.timeline-value.result {
  background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.timeline-unit {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.timeline-arrow {
  font-size: 14px;
  color: #94a3b8;
}

.timeline-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
}

.timeline-category {
  font-size: 12px;
  color: #3b82f6;
  font-weight: 500;
}

.timeline-time {
  font-size: 12px;
  color: #94a3b8;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
}

.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

@media (max-width: 480px) {
  .app-content {
    padding: 16px;
  }
  
  .app-title {
    font-size: 18px;
  }
  
  .tab-item {
    padding: 8px 14px;
  }
  
  .number-input {
    font-size: 28px;
  }
  
  .result-display {
    font-size: 34px;
  }
  
  .input-panel {
    padding: 18px;
  }
}
</style>
