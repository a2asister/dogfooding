<template>
  <div class="conversion-settings">
    <h3>转换设置</h3>

    <div class="setting-group">
      <label class="setting-label">目标格式</label>
      <div class="format-options">
        <button
          v-for="format in formatOptions"
          :key="format.value"
          class="format-btn"
          :class="{ active: modelValue === format.value }"
          type="button"
          @click="$emit('update:modelValue', format.value)"
        >
          <span class="format-icon">{{ format.icon }}</span>
          <span class="format-name">{{ format.label }}</span>
        </button>
      </div>
    </div>

    <div class="setting-group">
      <label class="setting-label">音质预设</label>
      <div class="quality-options">
        <button
          v-for="opt in qualityOptions"
          :key="opt.value"
          class="quality-btn"
          :class="{ active: quality === opt.value }"
          type="button"
          @click="$emit('update:quality', opt.value)"
        >
          <span class="quality-name">{{ opt.label }}</span>
          <span class="quality-desc">{{ opt.description }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { qualityOptions, formatOptions } from '../types';
import type { AudioFormat, QualityPreset } from '../types';

defineProps<{
  modelValue: AudioFormat;
  quality: QualityPreset;
}>();

defineEmits<{
  'update:modelValue': [value: AudioFormat];
  'update:quality': [value: QualityPreset];
}>();
</script>

<style scoped>
.conversion-settings {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 24px;
}

.conversion-settings h3 {
  color: #e2e8f0;
  font-size: 18px;
  margin-bottom: 24px;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  color: #a0aec0;
  font-size: 14px;
  margin-bottom: 12px;
}

.format-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.format-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.format-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.format-btn.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.15);
}

.format-icon {
  font-size: 32px;
}

.format-name {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
}

.quality-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quality-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.quality-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.quality-btn.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.15);
}

.quality-name {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 14px;
}

.quality-desc {
  color: #718096;
  font-size: 12px;
}
</style>
