<template>
  <div class="home-container">
    <div class="editor-panel">
      <div class="canvas-wrapper">
        <canvas ref="canvasRef" width="800" height="500"></canvas>
        <div class="canvas-controls">
          <button @click="toggleScatter" class="control-btn">
            {{ isScattered ? '✨ 聚合' : '💥 碎裂' }}
          </button>
          <button @click="saveArtwork" class="control-btn primary">
            📸 保存作品
          </button>
        </div>
      </div>

      <div class="control-panel">
        <h3>⚙️ 参数控制</h3>
        
        <div class="control-group">
          <label>输入文字</label>
          <input v-model="config.text" @input="updateText" class="text-input" maxlength="20">
        </div>

        <div class="control-group">
          <label>字体大小: {{ config.fontSize }}px</label>
          <input v-model.number="config.fontSize" type="range" min="50" max="200" @input="recreateParticles">
        </div>

        <div class="control-group">
          <label>粒子大小: {{ config.particleSize }}px</label>
          <input v-model.number="config.particleSize" type="range" min="2" max="10" @input="recreateParticles">
        </div>

        <div class="control-group">
          <label>碎裂速度: {{ config.scatterSpeed }}</label>
          <input v-model.number="config.scatterSpeed" type="range" min="5" max="30">
        </div>

        <div class="control-group">
          <label>聚合速度: {{ config.gatherSpeed.toFixed(2) }}</label>
          <input v-model.number="config.gatherSpeed" type="range" min="0.01" max="0.1" step="0.01">
        </div>

        <div class="control-group">
          <label>鼠标影响范围: {{ config.mouseInfluence }}px</label>
          <input v-model.number="config.mouseInfluence" type="range" min="50" max="200">
        </div>

        <div class="control-group colors">
          <label>渐变颜色</label>
          <div class="color-inputs">
            <input v-model="config.colorStart" type="color">
            <span>→</span>
            <input v-model="config.colorEnd" type="color">
          </div>
        </div>

        <div class="param-record">
          <h4>📋 当前参数</h4>
          <div class="param-grid">
            <span class="param-item">文字: {{ config.text }}</span>
            <span class="param-item">字体: {{ config.fontSize }}px</span>
            <span class="param-item">粒子: {{ config.particleSize }}px</span>
            <span class="param-item">鼠标: {{ config.mouseInfluence }}px</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { ParticleSystem, ParticleConfig } from '@/utils/ParticleSystem'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let particleSystem: ParticleSystem | null = null
const isScattered = ref(false)

const config = reactive<ParticleConfig>({
  text: '粒子艺术',
  fontSize: 120,
  particleSize: 4,
  scatterSpeed: 15,
  gatherSpeed: 0.05,
  colorStart: '#ff6b6b',
  colorEnd: '#48dbfb',
  mouseInfluence: 120
})

const CREATE_ARTWORK = gql`
  mutation CreateArtwork($input: CreateArtworkInput!) {
    createArtwork(input: $input) {
      id
      text
      imageData
    }
  }
`

const { mutate: createArtwork } = useMutation(CREATE_ARTWORK)

const toggleScatter = () => {
  if (!particleSystem) return
  if (isScattered.value) {
    particleSystem.gather()
  } else {
    particleSystem.scatter()
  }
  isScattered.value = !isScattered.value
}

const updateText = () => {
  if (particleSystem) {
    particleSystem.updateText(config.text)
  }
}

const recreateParticles = () => {
  if (particleSystem && canvasRef.value) {
    particleSystem.destroy()
    particleSystem = new ParticleSystem(canvasRef.value, { ...config })
  }
}

const saveArtwork = async () => {
  if (!particleSystem) return
  
  const canvas = particleSystem.getCanvas()
  const imageData = canvas.toDataURL('image/png')
  
  try {
    await createArtwork({
      input: {
        text: config.text,
        imageData,
        fontSize: config.fontSize,
        particleSize: config.particleSize,
        colorStart: config.colorStart,
        colorEnd: config.colorEnd,
        category: '默认'
      }
    })
    alert('作品保存成功！')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  }
}

onMounted(() => {
  if (canvasRef.value) {
    particleSystem = new ParticleSystem(canvasRef.value, { ...config })
  }
})

onUnmounted(() => {
  if (particleSystem) {
    particleSystem.destroy()
  }
})
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.editor-panel {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.canvas-wrapper {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

canvas {
  display: block;
  border-radius: 15px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  cursor: crosshair;
  width: 100%;
}

.canvas-controls {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  justify-content: center;
}

.control-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.control-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.control-btn.primary:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.control-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.control-panel h3 {
  margin-bottom: 25px;
  font-size: 1.3rem;
  background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.control-group {
  margin-bottom: 20px;
}

.control-group label {
  display: block;
  margin-bottom: 10px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.text-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.text-input:focus {
  outline: none;
  border-color: #48dbfb;
  box-shadow: 0 0 20px rgba(72, 219, 251, 0.2);
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #48dbfb, #ff9ff3);
  cursor: pointer;
  transition: transform 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.colors .color-inputs {
  display: flex;
  align-items: center;
  gap: 15px;
}

input[type="color"] {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: none;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.param-record {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.param-record h4 {
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.param-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.param-item {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}
</style>
