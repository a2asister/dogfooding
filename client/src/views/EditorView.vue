<template>
  <div class="editor-container">
    <div class="toolbar">
      <h1>3D 流程图编辑器</h1>
      <div class="toolbar-actions">
        <button @click="addNode">添加节点</button>
        <button @click="saveFlowchart">保存</button>
        <button @click="exportImage">导出图片</button>
      </div>
    </div>
    <div ref="canvasContainer" class="canvas-container"></div>
    <div class="sidebar" v-if="selectedNode">
      <h3>节点属性</h3>
      <div class="property">
        <label>名称:</label>
        <input v-model="selectedNode.name" @input="updateNode" />
      </div>
      <div class="property">
        <label>类型:</label>
        <select v-model="selectedNode.type" @change="updateNode">
          <option value="process">流程</option>
          <option value="decision">决策</option>
          <option value="start">开始</option>
          <option value="end">结束</option>
        </select>
      </div>
      <button @click="deleteNode">删除节点</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FlowchartEngine } from '@/engine/FlowchartEngine'
import { useFlowchartStore } from '@/stores/flowchart'

const canvasContainer = ref<HTMLDivElement | null>(null)
const selectedNode = ref<any>(null)
let engine: FlowchartEngine | null = null
const flowchartStore = useFlowchartStore()

const addNode = () => {
  if (engine) {
    const node = engine.addNode()
    flowchartStore.addNode(node)
  }
}

const updateNode = () => {
  if (engine && selectedNode.value) {
    engine.updateNode(selectedNode.value)
  }
}

const deleteNode = () => {
  if (engine && selectedNode.value) {
    engine.removeNode(selectedNode.value.id)
    flowchartStore.removeNode(selectedNode.value.id)
    selectedNode.value = null
  }
}

const saveFlowchart = async () => {
  if (engine) {
    const data = engine.exportData()
    await flowchartStore.saveFlowchart(data)
  }
}

const exportImage = () => {
  if (engine) {
    engine.exportImage()
  }
}

const handleNodeSelect = (node: any) => {
  selectedNode.value = node
}

onMounted(() => {
  if (canvasContainer.value) {
    engine = new FlowchartEngine(canvasContainer.value)
    engine.onNodeSelect(handleNodeSelect)
    engine.init()
  }
})

onUnmounted(() => {
  if (engine) {
    engine.dispose()
  }
})
</script>

<style scoped>
.editor-container {
  display: grid;
  grid-template-rows: 60px 1fr;
  grid-template-columns: 1fr 280px;
  width: 100%;
  height: 100%;
}

.toolbar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(20, 20, 50, 0.8);
  border-bottom: 1px solid rgba(100, 150, 255, 0.3);
  backdrop-filter: blur(10px);
}

.toolbar h1 {
  font-size: 20px;
  background: linear-gradient(90deg, #64ffda, #6496ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
}

.toolbar-actions button {
  padding: 8px 16px;
  background: linear-gradient(135deg, #6496ff, #64ffda);
  border: none;
  border-radius: 6px;
  color: #0c0c1e;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.toolbar-actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(100, 150, 255, 0.4);
}

.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.sidebar {
  background: rgba(20, 20, 50, 0.9);
  border-left: 1px solid rgba(100, 150, 255, 0.3);
  padding: 20px;
  backdrop-filter: blur(10px);
}

.sidebar h3 {
  margin-bottom: 20px;
  color: #64ffda;
}

.property {
  margin-bottom: 16px;
}

.property label {
  display: block;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.8);
}

.property input,
.property select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(20, 20, 50, 0.8);
  border: 1px solid rgba(100, 150, 255, 0.3);
  border-radius: 6px;
  color: white;
  outline: none;
}

.property option {
  background: rgb(20, 20, 50);
  color: white;
}

.property input:focus,
.property select:focus {
  border-color: #64ffda;
}

.sidebar button {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
}
</style>
