<template>
  <div class="toolbar">
    <div class="tool-group">
      <button 
        v-for="tool in tools" 
        :key="tool.id"
        :class="{ active: drawingStore.currentTool === tool.id }"
        @click="selectTool(tool.id)"
      >
        {{ tool.icon }}
        <span>{{ tool.name }}</span>
      </button>
    </div>
    <div class="divider"></div>
    <div class="action-group">
      <button @click="undo">↩️ 撤销</button>
      <button @click="redo">↪️ 重做</button>
      <button @click="exportSVG">📤 导出SVG</button>
      <button @click="saveDrawing">💾 保存</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDrawingStore } from '@/stores/drawing'

const drawingStore = useDrawingStore()

const tools = [
  { id: 'pen', name: '钢笔', icon: '✒️' },
  { id: 'select', name: '选择', icon: '👆' },
  { id: 'path', name: '路径编辑', icon: '〰️' },
  { id: 'combine', name: '组合', icon: '🔗' }
]

const selectTool = (toolId: string) => {
  console.log('Selecting tool:', toolId)
  drawingStore.setCurrentTool(toolId)
}

const undo = () => {
  console.log('Undo clicked')
  drawingStore.undo()
}
const redo = () => {
  console.log('Redo clicked')
  drawingStore.redo()
}
const exportSVG = () => {
  console.log('Export SVG clicked')
  drawingStore.exportSVG()
}
const saveDrawing = () => {
  console.log('Save clicked')
  drawingStore.save()
}
</script>

<style lang="scss" scoped>
.toolbar {
  height: 60px;
  background: #16213e;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 10px;
  border-bottom: 2px solid #0f3460;
}

.tool-group,
.action-group {
  display: flex;
  gap: 8px;
}

.divider {
  width: 2px;
  height: 40px;
  background: #0f3460;
  margin: 0 10px;
}

button {
  padding: 10px 16px;
  background: #0f3460;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: #1a4a7a;
    transform: translateY(-2px);
  }

  &.active {
    background: #e94560;
    box-shadow: 0 0 15px rgba(233, 69, 96, 0.5);
  }
}
</style>
