<template>
  <div class="control-panel">
    <h3>特效参数</h3>

    <div class="control-group">
      <label>尘埃密度: {{ modelValue.density.toFixed(1) }}</label>
      <input v-model.number="modelValue.density" type="range" min="1" max="20" step="0.5" />
    </div>

    <div class="control-group">
      <label>漂浮速度: {{ modelValue.speed.toFixed(1) }}</label>
      <input v-model.number="modelValue.speed" type="range" min="0.1" max="5" step="0.1" />
    </div>

    <div class="control-group">
      <label>光影强度: {{ modelValue.lightIntensity.toFixed(1) }}</label>
      <input v-model.number="modelValue.lightIntensity" type="range" min="0" max="3" step="0.1" />
    </div>

    <div class="control-group">
      <label>朦胧强度: {{ modelValue.hazeIntensity.toFixed(1) }}</label>
      <input v-model.number="modelValue.hazeIntensity" type="range" min="0" max="5" step="0.1" />
    </div>

    <div class="control-group">
      <label>颗粒大小: {{ modelValue.particleSize.toFixed(1) }}</label>
      <input v-model.number="modelValue.particleSize" type="range" min="0.5" max="5" step="0.1" />
    </div>

    <div class="control-group">
      <label>鼠标扰动: {{ modelValue.mouseInfluence.toFixed(1) }}</label>
      <input v-model.number="modelValue.mouseInfluence" type="range" min="0" max="10" step="0.5" />
    </div>

    <div class="button-group">
      <button @click="$emit('save')" class="btn-primary">保存配置</button>
      <button @click="$emit('capture')" class="btn-secondary">截图保存</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EffectConfig } from '../types/dust'

const props = defineProps<{
  modelValue: EffectConfig
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'capture'): void
}>()
</script>

<style scoped>
.control-panel {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(10px);
  padding: 24px;
  border-radius: 16px;
  width: 320px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

h3 {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.control-group {
  margin-bottom: 16px;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #aaa;
}

.control-group input[type='range'] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.control-group input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
