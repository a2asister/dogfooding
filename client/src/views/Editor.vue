<template>
  <div class="editor-container">
    <div class="canvas-wrapper">
      <canvas ref="canvasRef" width="800" height="600" class="particle-canvas"></canvas>
      
      <div v-if="!hasImage" class="upload-overlay">
        <div class="upload-area" @click="triggerUpload" @dragover.prevent @drop="handleDrop">
          <div class="upload-icon">📸</div>
          <p>点击或拖拽上传图片</p>
          <input ref="fileInputRef" type="file" accept="image/*" @change="handleFileSelect" class="hidden-input">
        </div>
      </div>
    </div>

    <div class="controls-panel">
      <div class="control-section">
        <h3>🎬 动画控制</h3>
        <div class="btn-group">
          <button @click="explode" class="control-btn">💥 拆解</button>
          <button @click="float" class="control-btn">🌊 飘散</button>
          <button @click="gather" class="control-btn">🎯 聚合</button>
          <button @click="reconstruct" class="control-btn">✨ 重组</button>
        </div>
      </div>

      <div class="control-section">
        <h3>⚙️ 参数调节</h3>
        
        <div class="param-item">
          <label>粒子大小: {{ params.particleSize }}px</label>
          <input type="range" v-model="params.particleSize" min="2" max="12" @change="updateParams">
        </div>

        <div class="param-item">
          <label>爆炸力度: {{ params.explosionForce }}</label>
          <input type="range" v-model="params.explosionForce" min="5" max="30" @change="updateParams">
        </div>

        <div class="param-item">
          <label>飘散速度: {{ params.floatSpeed }}</label>
          <input type="range" v-model="params.floatSpeed" min="0.1" max="2" step="0.1" @change="updateParams">
        </div>

        <div class="param-item">
          <label>鼠标范围: {{ params.mouseRadius }}px</label>
          <input type="range" v-model="params.mouseRadius" min="50" max="200" @change="updateParams">
        </div>

        <div class="param-item">
          <label>拖拽力度: {{ params.mouseForce }}</label>
          <input type="range" v-model="params.mouseForce" min="1" max="10" @change="updateParams">
        </div>

        <div class="param-row">
          <label class="checkbox-label">
            <input type="checkbox" v-model="params.colorFlicker" @change="updateParams">
            色彩闪烁
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="params.dynamicSize" @change="updateParams">
            动态大小
          </label>
        </div>
      </div>

      <div class="control-section">
        <h3>💾 保存作品</h3>
        <div class="save-section">
          <input v-model="workTitle" type="text" placeholder="作品名称" class="title-input">
          <button @click="saveWork" :disabled="!hasImage" class="save-btn">保存作品</button>
        </div>
      </div>

      <div class="tips-section">
        <h4>💡 使用提示</h4>
        <ul>
          <li>按住鼠标在画布上拖拽可扰动粒子</li>
          <li>调整参数后重新上传图片生效</li>
          <li>四种动画模式可任意切换</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { ParticleEngine, ParticleParams } from '../utils/ParticleEngine'
import { uploadImage, saveWork as saveWorkApi } from '../api'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const engine = ref<ParticleEngine | null>(null)
const hasImage = ref(false)
const workTitle = ref('')

const params = reactive<ParticleParams>({
  particleSize: 4,
  explosionForce: 15,
  floatSpeed: 0.5,
  gatherSpeed: 0.05,
  colorFlicker: true,
  dynamicSize: true,
  mouseRadius: 100,
  mouseForce: 5,
})

onMounted(() => {
  if (canvasRef.value) {
    engine.value = new ParticleEngine(canvasRef.value)
    engine.value.start()
  }
})

onUnmounted(() => {
  engine.value?.stop()
})

const triggerUpload = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await loadImage(file)
  }
}

const handleDrop = async (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    await loadImage(file)
  }
}

const loadImage = async (file: File) => {
  const img = new Image()
  img.src = URL.createObjectURL(file)
  
  await new Promise((resolve) => {
    img.onload = resolve
  })

  engine.value?.setParams(params)
  engine.value?.loadImage(img)
  hasImage.value = true

  await uploadImage(file, params)
}

const updateParams = () => {
  engine.value?.setParams(params)
}

const explode = () => engine.value?.explode()
const float = () => engine.value?.float()
const gather = () => engine.value?.gather()
const reconstruct = () => engine.value?.reconstruct()

const saveWork = async () => {
  if (!hasImage.value || !engine.value) return
  
  const imageData = engine.value.exportImage()
  const title = workTitle.value || `作品 ${Date.now()}`
  
  await saveWorkApi({
    title,
    imageData,
    params: { ...params },
  })
  
  alert('作品保存成功！')
  workTitle.value = ''
}
</script>

<style scoped>
.editor-container {
  display: flex;
  gap: 30px;
  height: 100%;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.particle-canvas {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.upload-area {
  padding: 60px 80px;
  border: 2px dashed rgba(0, 210, 255, 0.5);
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #00d2ff;
  background: rgba(0, 210, 255, 0.1);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.hidden-input {
  display: none;
}

.controls-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.control-section h3 {
  margin-bottom: 16px;
  font-size: 16px;
  color: #00d2ff;
}

.btn-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.control-btn {
  padding: 12px 8px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.param-item {
  margin-bottom: 16px;
}

.param-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.param-item input[type="range"] {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
}

.param-item input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
  border-radius: 50%;
  cursor: pointer;
}

.param-row {
  display: flex;
  gap: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.save-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title-input {
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 14px;
  outline: none;
}

.title-input:focus {
  border-color: #00d2ff;
}

.save-btn {
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 210, 255, 0.4);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tips-section {
  background: rgba(0, 210, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(0, 210, 255, 0.3);
}

.tips-section h4 {
  margin-bottom: 12px;
  color: #00d2ff;
  font-size: 14px;
}

.tips-section ul {
  list-style: none;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
}
</style>
