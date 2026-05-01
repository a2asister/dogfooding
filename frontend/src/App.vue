<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span class="text-3xl">🧠</span>
            思维导图编辑器
          </h1>
          <div class="flex items-center gap-4">
            <button 
              v-if="nodes.length > 0"
              @click="saveMindmap"
              class="btn btn-primary"
            >
              💾 保存
            </button>
            <button 
              @click="showFileManager = !showFileManager"
              class="btn btn-secondary"
            >
              📁 文件列表
            </button>
            <button 
              v-if="nodes.length > 0"
              @click="showExportDialog = true"
              class="btn btn-secondary"
            >
              📤 导出
            </button>
            <button 
              v-if="currentMindmapId"
              @click="showShareDialog = true"
              class="btn btn-secondary"
            >
              🔗 分享
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="relative">
      <FileManager 
        v-if="showFileManager"
        @close="showFileManager = false"
        @load="loadMindmap"
        @new="createNewMindmap"
      />

      <ExportDialog 
        v-if="showExportDialog"
        :mindmap-data="currentMindmapData"
        @close="showExportDialog = false"
      />

      <ShareDialog 
        v-if="showShareDialog"
        :mindmap-id="currentMindmapId"
        @close="showShareDialog = false"
      />

      <div v-if="nodes.length === 0" class="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div class="text-center">
          <div class="text-8xl mb-6">🗺️</div>
          <h2 class="text-3xl font-bold text-gray-700 mb-4">开始创建你的思维导图</h2>
          <p class="text-gray-500 mb-8 max-w-md">
            可视化创作脑图，支持节点增删、拖拽编辑、样式美化、画布缩放等实时编辑能力
          </p>
          <div class="flex gap-4 justify-center">
            <button @click="createNewMindmap" class="btn btn-primary text-lg px-8 py-3">
              ➕ 创建新思维导图
            </button>
            <button @click="showFileManager = true" class="btn btn-secondary text-lg px-8 py-3">
              📂 打开已有文件
            </button>
          </div>
        </div>
      </div>

      <MindMapCanvas 
        v-if="nodes.length > 0"
        :nodes="nodes"
        :edges="edges"
        :styles="styles"
        :zoom="zoom"
        :selected-node="selectedNode"
        @update:nodes="nodes = $event"
        @update:edges="edges = $event"
        @update:styles="styles = $event"
        @update:zoom="zoom = $event"
        @update:selected-node="selectedNode = $event"
        @undo="undo"
        @redo="redo"
        @add-node="addNode"
        @delete-node="deleteNode"
        @add-edge="addEdge"
        @delete-edge="deleteEdge"
        @save-history="saveHistory"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import MindMapCanvas from './components/MindMapCanvas.vue'
import FileManager from './components/FileManager.vue'
import ExportDialog from './components/ExportDialog.vue'
import ShareDialog from './components/ShareDialog.vue'

const showFileManager = ref(false)
const showExportDialog = ref(false)
const showShareDialog = ref(false)

const currentMindmapId = ref(null)
const nodes = ref([])
const edges = ref([])
const styles = ref({})
const zoom = ref(1)
const selectedNode = ref(null)

const history = ref([])
const historyIndex = ref(-1)

const currentMindmapData = computed(() => ({
  title: 'Mind Map',
  nodes: nodes.value,
  edges: edges.value,
  styles: styles.value,
  history: history.value
}))

const saveHistory = () => {
  const snapshot = JSON.stringify({
    nodes: nodes.value,
    edges: edges.value,
    styles: styles.value
  })
  
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  
  history.value.push(snapshot)
  historyIndex.value = history.value.length - 1
  
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    restoreHistory(historyIndex.value)
  }
}

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    restoreHistory(historyIndex.value)
  }
}

const restoreHistory = (index) => {
  const snapshot = JSON.parse(history.value[index])
  nodes.value = snapshot.nodes
  edges.value = snapshot.edges
  styles.value = snapshot.styles
}

const createNewMindmap = () => {
  const rootId = uuidv4()
  nodes.value = [
    {
      id: rootId,
      text: '中心主题',
      x: 400,
      y: 300,
      width: 120,
      height: 60,
      type: 'root'
    }
  ]
  edges.value = []
  styles.value = {}
  zoom.value = 1
  selectedNode.value = null
  currentMindmapId.value = null
  history.value = []
  historyIndex.value = -1
  showFileManager.value = false
  
  saveHistory()
}

const loadMindmap = async (id) => {
  try {
    const response = await axios.get(`/api/mindmaps/${id}`)
    const mindmap = response.data
    
    currentMindmapId.value = id
    nodes.value = mindmap.nodes || []
    edges.value = mindmap.edges || []
    styles.value = mindmap.styles || {}
    zoom.value = 1
    selectedNode.value = null
    history.value = mindmap.history || []
    historyIndex.value = history.value.length - 1
    showFileManager.value = false
  } catch (error) {
    console.error('Failed to load mindmap:', error)
    alert('加载失败')
  }
}

const saveMindmap = async () => {
  try {
    const data = {
      title: 'Mind Map',
      nodes: nodes.value,
      edges: edges.value,
      styles: styles.value,
      history: history.value
    }
    
    if (currentMindmapId.value) {
      await axios.put(`/api/mindmaps/${currentMindmapId.value}`, data)
    } else {
      const response = await axios.post('/api/mindmaps', data)
      currentMindmapId.value = response.data.id
    }
    
    alert('保存成功！')
  } catch (error) {
    console.error('Failed to save mindmap:', error)
    alert('保存失败')
  }
}

const addNode = (parentId, position) => {
  saveHistory()
  
  const newNode = {
    id: uuidv4(),
    text: '新节点',
    x: position ? position.x : 0,
    y: position ? position.y : 0,
    width: 100,
    height: 50,
    type: 'child'
  }
  
  if (parentId) {
    const parentNode = nodes.value.find(n => n.id === parentId)
    if (parentNode) {
      const siblingCount = edges.value.filter(e => e.from === parentId).length
      newNode.x = parentNode.x + parentNode.width + 50
      newNode.y = parentNode.y + (siblingCount * 70)
      
      edges.value.push({
        id: uuidv4(),
        from: parentId,
        to: newNode.id
      })
    }
  }
  
  nodes.value.push(newNode)
  selectedNode.value = newNode.id
}

const deleteNode = (nodeId) => {
  saveHistory()
  
  const deleteNodeAndChildren = (id) => {
    const node = nodes.value.find(n => n.id === id)
    if (!node) return []
    
    const childEdges = edges.value.filter(e => e.from === id)
    const childIds = childEdges.map(e => e.to)
    
    const allIds = [id, ...childIds.flatMap(cid => deleteNodeAndChildren(cid))]
    return allIds
  }
  
  const idsToDelete = deleteNodeAndChildren(nodeId)
  nodes.value = nodes.value.filter(n => !idsToDelete.includes(n.id))
  edges.value = edges.value.filter(e => !idsToDelete.includes(e.from) && !idsToDelete.includes(e.to))
  
  if (selectedNode.value === nodeId) {
    selectedNode.value = null
  }
}

const addEdge = (fromId, toId) => {
  if (fromId === toId) return
  if (edges.value.some(e => e.from === fromId && e.to === toId)) return
  
  saveHistory()
  
  edges.value.push({
    id: uuidv4(),
    from: fromId,
    to: toId
  })
}

const deleteEdge = (edgeId) => {
  saveHistory()
  edges.value = edges.value.filter(e => e.id !== edgeId)
}

watch([nodes, edges, styles], () => {
  if (currentMindmapId.value) {
    
  }
}, { deep: true })
</script>
