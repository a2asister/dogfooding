<script setup lang="ts">
import { usePhotoStore } from '@/stores/photo';
import { ElSlider, ElButton } from 'element-plus';

const store = usePhotoStore();

const paramConfig = [
  { key: 'denoiseStrength', label: '去噪强度', min: 0, max: 1, step: 0.1 },
  { key: 'textureEnhance', label: '纹理增强', min: 0, max: 1, step: 0.1 },
  { key: 'colorIntensity', label: '色彩强度', min: 0, max: 1, step: 0.1 },
  { key: 'sharpenLevel', label: '锐化程度', min: 0, max: 1, step: 0.1 },
  { key: 'brightness', label: '亮度调整', min: -1, max: 1, step: 0.1 },
  { key: 'contrast', label: '对比度', min: -1, max: 1, step: 0.1 },
] as const;

function handleChange(key: string, value: number): void {
  store.setModelParams({ [key]: value });
}
</script>

<template>
  <div>
    <div class="params-grid">
      <div v-for="config in paramConfig" :key="config.key" class="param-item">
        <div class="param-label">
          {{ config.label }}
          <span class="param-value">{{ store.modelParams[config.key].toFixed(1) }}</span>
        </div>
        <ElSlider
          :min="config.min"
          :max="config.max"
          :step="config.step"
          :model-value="store.modelParams[config.key]"
          @update:model-value="(val): void => handleChange(config.key, val as number)"
          :show-tooltip="true"
        />
      </div>
    </div>
    <div style="margin-top: 20px; text-align: center">
      <ElButton @click="store.resetModelParams">恢复默认</ElButton>
    </div>
  </div>
</template>
