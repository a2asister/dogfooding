<script setup lang="ts">
import { computed } from 'vue'
import type { CompressionOptions } from '../types'

const props = defineProps<{
  modelValue: CompressionOptions
  disabled: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CompressionOptions]
}>()

const quality = computed({
  get: () => props.modelValue.quality,
  set: (value: number) => emit('update:modelValue', { ...props.modelValue, quality: value })
})

const colorSampling = computed({
  get: () => props.modelValue.colorSampling,
  set: (value: boolean) => emit('update:modelValue', { ...props.modelValue, colorSampling: value })
})

const iterations = computed({
  get: () => props.modelValue.iterations,
  set: (value: number) => emit('update:modelValue', { ...props.modelValue, iterations: value })
})

const lossless = computed({
  get: () => props.modelValue.lossless,
  set: (value: boolean) => emit('update:modelValue', { ...props.modelValue, lossless: value })
})
</script>

<template>
  <div class="settings-card card">
    <div class="settings-header">
      <h3>压缩设置</h3>
      <span class="settings-hint">WASM 极速压缩</span>
    </div>

    <div class="settings-body">
      <div class="setting-item">
        <div class="setting-label">
          <span>压缩质量</span>
          <span class="value-badge">{{ quality }}%</span>
        </div>
        <input
          type="range"
          v-model.number="quality"
          :min="lossless ? 100 : 10"
          :max="100"
          :step="5"
          :disabled="disabled || lossless"
        />
        <div class="setting-hint">
          {{ lossless ? '无损模式下质量固定为 100%' : '数值越高，质量越好但文件越大' }}
        </div>
      </div>

      <div class="setting-item">
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="lossless"
            :disabled="disabled"
          />
          <span class="checkbox-text">
            <strong>无损压缩</strong>
            <small>保持原始画质，压缩率较低</small>
          </span>
        </label>
      </div>

      <div class="setting-item">
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="colorSampling"
            :disabled="disabled || lossless"
          />
          <span class="checkbox-text">
            <strong>色彩采样</strong>
            <small>优化色度通道，有效减小文件</small>
          </span>
        </label>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <span>二次迭代次数</span>
          <span class="value-badge">{{ iterations }} 次</span>
        </div>
        <input
          type="range"
          v-model.number="iterations"
          :min="1"
          :max="5"
          :step="1"
          :disabled="disabled"
        />
        <div class="setting-hint">无损压缩时多次迭代可提升压缩率</div>
      </div>
    </div>

    <div class="settings-footer">
      <div class="tech-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>WebAssembly 加速</span>
      </div>
      <div class="tech-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#6366f1"/>
        </svg>
        <span>Concurrent 并发</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-card {
  padding: 20px;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.settings-header h3 {
  font-size: 16px;
  color: var(--text-primary);
}

.settings-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

.settings-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.value-badge {
  background: var(--primary-color);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.setting-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type='checkbox'] {
  margin-top: 2px;
  flex-shrink: 0;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: var(--text-primary);
}

.checkbox-text small {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: normal;
  margin-top: 2px;
}

.settings-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}
</style>
