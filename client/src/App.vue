<template>
  <div class="app-container">
    <canvas ref="canvasRef" class="dust-canvas"></canvas>

    <ControlPanel
      v-model="config"
      @save="saveConfig"
      @capture="captureFrame"
    />

    <TemplateManager @apply="applyTemplate" />

    <div class="header">
      <h1>尘埃氛围动态特效生成器</h1>
      <p>移动鼠标感受尘埃飘动</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import ControlPanel from './components/ControlPanel.vue'
import TemplateManager from './components/TemplateManager.vue'
import { useDustEffect } from './composables/useDustEffect'
import type { EffectConfig } from './types/dust'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const defaultConfig: EffectConfig = {
  density: 10,
  speed: 1,
  lightIntensity: 1.5,
  hazeIntensity: 1,
  particleSize: 2,
  mouseInfluence: 5
}

const config = reactive<EffectConfig>({ ...defaultConfig })

let dustEffect: ReturnType<typeof useDustEffect> | null = null

onMounted(() => {
  if (canvasRef.value) {
    const canvas = canvasRef.value
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    dustEffect = useDustEffect(canvas, config)
    dustEffect.start()

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    })
  }
})

watch(config, () => {
  if (dustEffect) {
    dustEffect.updateConfig({ ...config })
  }
}, { deep: true })

const saveConfig = async () => {
  const name = prompt('请输入配置名称:')
  if (!name) return

  const category = prompt('请输入分类（如：浪漫/神秘/温馨）:') || '默认'

  try {
    const response = await fetch('/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, config })
    })
    if (response.ok) {
      alert('配置保存成功！')
    }
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const captureFrame = () => {
  if (dustEffect) {
    const dataUrl = dustEffect.captureFrame()
    const link = document.createElement('a')
    link.download = `dust-effect-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }
}

const applyTemplate = (templateConfig: EffectConfig) => {
  Object.assign(config, templateConfig)
}

</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.dust-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: none;
}

.header {
  position: fixed;
  left: 40px;
  top: 40px;
  z-index: 10;
}

.header h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.header p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}
</style>
