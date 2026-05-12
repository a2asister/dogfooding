<template>
  <div class="canvas-container" ref="canvasContainer">
    <canvas ref="paperCanvas" class="drawing-canvas"></canvas>
    <svg class="overlay-svg" :viewBox="viewBox">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDrawingStore } from '@/stores/drawing'
import { initPaper, handleMouseDown, handleMouseMove, handleMouseUp, setDrawingStore } from '@/utils/paperSetup'

const canvasContainer = ref<HTMLDivElement | null>(null)
const paperCanvas = ref<HTMLCanvasElement | null>(null)
const drawingStore = useDrawingStore()
const viewBox = ref('0 0 1920 1080')

onMounted(() => {
  console.log('DrawingCanvas mounted')
  if (paperCanvas.value && canvasContainer.value) {
    setDrawingStore(drawingStore)
    initPaper(paperCanvas.value)
    
    console.log('Adding event listeners')
    paperCanvas.value.addEventListener('mousedown', handleMouseDown)
    paperCanvas.value.addEventListener('mousemove', handleMouseMove)
    paperCanvas.value.addEventListener('mouseup', handleMouseUp)
    paperCanvas.value.addEventListener('mouseleave', handleMouseUp)
  }
})

onUnmounted(() => {
  if (paperCanvas.value) {
    paperCanvas.value.removeEventListener('mousedown', handleMouseDown)
    paperCanvas.value.removeEventListener('mousemove', handleMouseMove)
    paperCanvas.value.removeEventListener('mouseup', handleMouseUp)
    paperCanvas.value.removeEventListener('mouseleave', handleMouseUp)
  }
})
</script>

<style lang="scss" scoped>
.canvas-container {
  flex: 1;
  position: relative;
  background: #1a1a2e;
  overflow: hidden;
}

.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.overlay-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
