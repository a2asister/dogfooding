<template>
  <div class="control-panel">
    <template v-if="activeTab === 'compress'">
      <div class="control-group">
        <div class="control-header">
          <span class="control-label">压缩画质</span>
          <span class="control-value">{{ params.quality }}%</span>
        </div>
        <div class="slider-container">
          <input 
            type="range" 
            :value="params.quality" 
            min="10" 
            max="100" 
            step="5"
            class="custom-slider"
            @input="updateParam('quality', $event.target.value)"
          />
          <div class="slider-ticks">
            <span>低</span>
            <span>平衡</span>
            <span>高</span>
          </div>
        </div>
      </div>

      <div class="control-group">
        <div class="control-header">
          <span class="control-label">输出格式</span>
        </div>
        <div class="format-selector">
          <button 
            v-for="format in formats" 
            :key="format.value"
            class="format-btn"
            :class="{ active: params.format === format.value }"
            @click="updateParam('format', format.value)"
          >
            {{ format.label }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <div class="control-header">
          <span class="control-label">尺寸调整</span>
          <span class="control-desc">可选，留空保持原尺寸</span>
        </div>
        <div class="dimension-inputs">
          <div class="input-group">
            <label>宽度</label>
            <input 
              type="number" 
              :value="params.width"
              placeholder="自动"
              @input="updateParam('width', $event.target.value)"
            />
            <span class="unit">px</span>
          </div>
          <span class="divider">×</span>
          <div class="input-group">
            <label>高度</label>
            <input 
              type="number" 
              :value="params.height"
              placeholder="自动"
              @input="updateParam('height', $event.target.value)"
            />
            <span class="unit">px</span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="activeTab === 'convert'">
      <div class="control-group">
        <div class="control-header">
          <span class="control-label">目标格式</span>
        </div>
        <div class="format-grid">
          <button 
            v-for="format in convertFormats" 
            :key="format.value"
            class="format-option"
            :class="{ active: params.targetFormat === format.value }"
            @click="updateParam('targetFormat', format.value)"
          >
            <div class="format-icon">{{ format.icon }}</div>
            <div class="format-name">{{ format.label }}</div>
          </button>
        </div>
      </div>

      <div class="info-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p>支持批量转换为多种流行格式，保持图片质量</p>
      </div>
    </template>

    <template v-if="activeTab === 'crop'">
      <div class="control-group">
        <div class="control-header">
          <span class="control-label">目标尺寸</span>
        </div>
        <div class="dimension-inputs">
          <div class="input-group">
            <label>宽度</label>
            <input 
              type="number" 
              :value="params.width"
              placeholder="必填"
              @input="updateParam('width', $event.target.value)"
            />
            <span class="unit">px</span>
          </div>
          <span class="divider">×</span>
          <div class="input-group">
            <label>高度</label>
            <input 
              type="number" 
              :value="params.height"
              placeholder="必填"
              @input="updateParam('height', $event.target.value)"
            />
            <span class="unit">px</span>
          </div>
        </div>
      </div>

      <div class="control-group">
        <div class="control-header">
          <span class="control-label">常用比例</span>
        </div>
        <div class="ratio-presets">
          <button 
            v-for="preset in ratioPresets" 
            :key="preset.label"
            class="preset-btn"
            @click="applyPreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <div class="info-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="3" y1="15" x2="21" y2="15"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
          <line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
        <p>图片将按比例裁剪以适应目标尺寸</p>
      </div>
    </template>

    <button 
      class="process-btn"
      :class="{ disabled: !hasFiles || processing }"
      :disabled="!hasFiles || processing"
      @click="$emit('process')"
    >
      <span v-if="processing">
        <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        处理中...
      </span>
      <span v-else>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        开始{{ actionLabel }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeTab: String,
  params: Object,
  processing: Boolean,
  hasFiles: Boolean,
  hasResults: Boolean
})

const emit = defineEmits(['update', 'process'])

const formats = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' }
]

const convertFormats = [
  { value: 'jpeg', label: 'JPEG', icon: '🟨' },
  { value: 'png', label: 'PNG', icon: '🟦' },
  { value: 'webp', label: 'WebP', icon: '🟩' },
  { value: 'avif', label: 'AVIF', icon: '🟪' }
]

const ratioPresets = [
  { label: '1:1', width: 1080, height: 1080 },
  { label: '16:9', width: 1920, height: 1080 },
  { label: '4:3', width: 1280, height: 960 },
  { label: '9:16', width: 1080, height: 1920 }
]

const actionLabel = computed(() => {
  const labels = {
    compress: '压缩',
    convert: '转换',
    crop: '裁剪'
  }
  return labels[props.activeTab] || '处理'
})

function updateParam(key, value) {
  emit('update', { [key]: value })
}

function applyPreset(preset) {
  emit('update', { width: preset.width, height: preset.height })
}
</script>

<style scoped>
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.control-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.control-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-start);
}

.control-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--accent-start), var(--accent-end));
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 3px solid var(--accent-start);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.custom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
}

.format-selector {
  display: flex;
  gap: 8px;
}

.format-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.format-btn:hover {
  border-color: var(--accent-start);
  color: var(--accent-start);
}

.format-btn.active {
  border-color: var(--accent-start);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  color: var(--accent-start);
}

.dimension-inputs {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.input-group {
  flex: 1;
  position: relative;
}

.input-group label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.input-group input {
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: all var(--transition-fast);
}

.input-group input:focus {
  border-color: var(--accent-start);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-group .unit {
  position: absolute;
  right: 12px;
  bottom: 13px;
  font-size: 12px;
  color: var(--text-muted);
}

.divider {
  color: var(--text-muted);
  font-size: 16px;
  padding-bottom: 12px;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.format-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.format-option:hover {
  border-color: var(--accent-start);
  transform: translateY(-2px);
}

.format-option.active {
  border-color: var(--accent-start);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
}

.format-icon {
  font-size: 28px;
}

.format-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.ratio-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 8px 16px;
  border: 2px solid var(--border-color);
  border-radius: 20px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.preset-btn:hover {
  border-color: var(--accent-start);
  color: var(--accent-start);
}

.info-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: rgba(99, 102, 241, 0.06);
  border-radius: var(--radius-md);
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.info-card svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--accent-start);
}

.info-card p {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.process-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-med);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  margin-top: 8px;
}

.process-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
}

.process-btn:active:not(.disabled) {
  transform: translateY(0);
}

.process-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.process-btn svg {
  width: 20px;
  height: 20px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
