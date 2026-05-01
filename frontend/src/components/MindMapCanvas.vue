<template>
  <div class="relative w-full h-[calc(100vh-80px)] bg-gray-100 overflow-hidden">
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white rounded-lg shadow-md p-2">
      <button 
        @click="$emit('undo')" 
        class="px-3 py-1.5 text-sm rounded hover:bg-gray-100 flex items-center gap-1"
        title="撤销 (Ctrl+Z)"
      >
        ↩️ 撤销
      </button>
      <button 
        @click="$emit('redo')" 
        class="px-3 py-1.5 text-sm rounded hover:bg-gray-100 flex items-center gap-1"
        title="重做 (Ctrl+Y)"
      >
        ↪️ 重做
      </button>
      <div class="w-px bg-gray-300 mx-1"></div>
      <button 
        @click="addSibling" 
        class="px-3 py-1.5 text-sm rounded hover:bg-gray-100 flex items-center gap-1"
        :disabled="!selectedNode"
        title="添加同级节点"
      >
        ➕ 同级
      </button>
      <button 
        @click="addChild" 
        class="px-3 py-1.5 text-sm rounded hover:bg-gray-100 flex items-center gap-1"
        :disabled="!selectedNode"
        title="添加子节点"
      >
        🌱 子节点
      </button>
      <button 
        @click="deleteSelected" 
        class="px-3 py-1.5 text-sm rounded hover:bg-red-100 text-red-600 flex items-center gap-1"
        :disabled="!selectedNode"
        title="删除节点 (Delete)"
      >
        🗑️ 删除
      </button>
    </div>

    <div class="absolute bottom-4 right-4 z-10 flex gap-2 bg-white rounded-lg shadow-md p-2">
      <button 
        @click="zoomIn" 
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
        title="放大"
      >
        🔍+
      </button>
      <span class="px-3 py-1 text-sm text-gray-600">
        {{ Math.round(modelValue.zoom * 100) }}%
      </span>
      <button 
        @click="zoomOut" 
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
        title="缩小"
      >
        🔍-
      </button>
      <button 
        @click="resetView" 
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
        title="重置视图"
      >
        🔄
      </button>
    </div>

    <div class="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-3" v-if="selectedNode">
      <h4 class="text-sm font-medium text-gray-700 mb-2">节点样式</h4>
      <div class="space-y-2">
        <div class="flex gap-1">
          <div
            v-for="color in nodeColors"
            :key="color"
            @click="setNodeColor(color)"
            class="w-6 h-6 rounded cursor-pointer border-2 hover:scale-110 transition-transform"
            :style="{ backgroundColor: color, borderColor: selectedStyle?.backgroundColor === color ? '#000' : 'transparent' }"
          ></div>
        </div>
        <select 
          :value="selectedStyle?.fontSize || 14" 
          @change="setFontSize($event.target.value)"
          class="w-full px-2 py-1 text-sm border rounded"
        >
          <option :value="12">小</option>
          <option :value="14">中</option>
          <option :value="16">大</option>
          <option :value="18">特大</option>
        </select>
        <select 
          :value="selectedStyle?.fontWeight || 'normal'" 
          @change="setFontWeight($event.target.value)"
          class="w-full px-2 py-1 text-sm border rounded"
        >
          <option value="normal">正常</option>
          <option value="bold">加粗</option>
        </select>
      </div>
    </div>

    <div 
      ref="canvasContainer"
      class="w-full h-full cursor-grab active:cursor-grabbing"
      @wheel="handleWheel"
      @mousedown="handleCanvasMouseDown"
      @mousemove="handleCanvasMouseMove"
      @mouseup="handleCanvasMouseUp"
      @mouseleave="handleCanvasMouseUp"
    >
      <div 
        class="absolute"
        :style="canvasTransform"
      >
        <svg 
          class="absolute top-0 left-0 pointer-events-none"
          :width="canvasSize.width"
          :height="canvasSize.height"
          style="overflow: visible;"
        >
          <g v-for="edge in modelValue.edges" :key="edge.id">
            <line
              :x1="getEdgeStartX(edge)"
              :y1="getEdgeStartY(edge)"
              :x2="getEdgeEndX(edge)"
              :y2="getEdgeEndY(edge)"
              stroke="#cbd5e1"
              stroke-width="2"
            />
            <polygon
              :points="getArrowPoints(edge)"
              fill="#cbd5e1"
            />
          </g>
        </svg>

        <div
          v-for="node in modelValue.nodes"
          :key="node.id"
          class="absolute select-none cursor-move transition-shadow duration-150"
          :style="getNodeStyle(node)"
          @mousedown.stop="handleNodeMouseDown($event, node)"
          @dblclick="startEditing(node)"
        >
          <div 
            v-if="editingNode?.id === node.id"
            class="w-full h-full"
          >
            <input
              ref="editInput"
              v-model="editingText"
              class="w-full h-full bg-transparent border-none outline-none text-center"
              :style="getInputStyle(node)"
              @blur="finishEditing"
              @keydown.enter="finishEditing"
              @keydown.esc="cancelEditing"
            />
          </div>
          <div 
            v-else
            class="w-full h-full flex items-center justify-center text-center px-2"
            :style="getTextStyle(node)"
          >
            {{ node.text }}
          </div>
          
          <div 
            v-if="selectedNode === node.id"
            class="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-crosshair border-2 border-white shadow"
            @mousedown.stop="startConnecting($event, node)"
          ></div>
        </div>
      </div>
    </div>

    <svg 
      v-if="isConnecting"
      class="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
    >
      <line
        :x1="connectingStart.x"
        :y1="connectingStart.y"
        :x2="connectingEnd.x"
        :y2="connectingEnd.y"
        stroke="#3b82f6"
        stroke-width="2"
        stroke-dasharray="5,5"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  edges: { type: Array, default: () => [] },
  styles: { type: Object, default: () => ({}) },
  zoom: { type: Number, default: 1 },
  selectedNode: { type: String, default: null }
})

const emit = defineEmits([
  'update:nodes',
  'update:edges',
  'update:styles',
  'update:zoom',
  'update:selectedNode',
  'undo',
  'redo',
  'add-node',
  'delete-node',
  'add-edge',
  'delete-edge',
  'save-history'
])

const modelValue = computed({
  get: () => ({
    nodes: props.nodes,
    edges: props.edges,
    styles: props.styles,
    zoom: props.zoom
  }),
  set: (val) => {
    emit('update:nodes', val.nodes)
    emit('update:edges', val.edges)
    emit('update:styles', val.styles)
    emit('update:zoom', val.zoom)
  }
})

const canvasContainer = ref(null)
const editInput = ref(null)

const panOffset = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

const isDragging = ref(false)
const dragNode = ref(null)
const dragOffset = ref({ x: 0, y: 0 })
const nodeMoved = ref(false)

const isConnecting = ref(false)
const connectingStartNode = ref(null)
const connectingStart = ref({ x: 0, y: 0 })
const connectingEnd = ref({ x: 0, y: 0 })

const editingNode = ref(null)
const editingText = ref('')

const nodeColors = [
  '#ffffff', '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#bfdbfe', '#ddd6fe', '#fbcfe8'
]

const canvasSize = ref({ width: 2000, height: 2000 })

const canvasTransform = computed(() => ({
  transform: `translate(${panOffset.value.x}px, ${panOffset.value.y}px) scale(${props.zoom})`,
  transformOrigin: '0 0'
}))

const selectedStyle = computed({
  get: () => {
    if (!props.selectedNode) return null
    return props.styles[props.selectedNode] || {
      backgroundColor: '#ffffff',
      fontSize: 14,
      fontWeight: 'normal'
    }
  },
  set: (val) => {
    if (!props.selectedNode) return
    const newStyles = { ...props.styles }
    newStyles[props.selectedNode] = val
    emit('update:styles', newStyles)
  }
})

const getNodeStyle = (node) => {
  const style = props.styles[node.id] || {
    backgroundColor: node.type === 'root' ? '#dbeafe' : '#ffffff',
    fontSize: 14,
    fontWeight: 'normal'
  }
  
  return {
    left: node.x + 'px',
    top: node.y + 'px',
    width: node.width + 'px',
    height: node.height + 'px',
    backgroundColor: style.backgroundColor,
    borderRadius: node.type === 'root' ? '12px' : '8px',
    boxShadow: props.selectedNode === node.id 
      ? '0 0 0 3px rgba(59, 130, 246, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
      : '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: node.type === 'root' ? '2px solid #3b82f6' : '1px solid #e5e7eb'
  }
}

const getTextStyle = (node) => {
  const style = props.styles[node.id] || {
    fontSize: 14,
    fontWeight: 'normal'
  }
  
  return {
    fontSize: style.fontSize + 'px',
    fontWeight: style.fontWeight,
    color: '#1f2937'
  }
}

const getInputStyle = (node) => {
  const style = props.styles[node.id] || {
    fontSize: 14,
    fontWeight: 'normal'
  }
  
  return {
    fontSize: style.fontSize + 'px',
    fontWeight: style.fontWeight,
    color: '#1f2937',
    textAlign: 'center'
  }
}

const getEdgeStartX = (edge) => {
  const fromNode = props.nodes.find(n => n.id === edge.from)
  if (!fromNode) return 0
  return fromNode.x + fromNode.width
}

const getEdgeStartY = (edge) => {
  const fromNode = props.nodes.find(n => n.id === edge.from)
  if (!fromNode) return 0
  return fromNode.y + fromNode.height / 2
}

const getEdgeEndX = (edge) => {
  const toNode = props.nodes.find(n => n.id === edge.to)
  if (!toNode) return 0
  return toNode.x
}

const getEdgeEndY = (edge) => {
  const toNode = props.nodes.find(n => n.id === edge.to)
  if (!toNode) return 0
  return toNode.y + toNode.height / 2
}

const getArrowPoints = (edge) => {
  const x = getEdgeEndX(edge)
  const y = getEdgeEndY(edge)
  const size = 8
  return `${x},${y} ${x-size},${y-size/2} ${x-size},${y+size/2}`
}

const handleWheel = (e) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.max(0.2, Math.min(3, props.zoom + delta))
  emit('update:zoom', newZoom)
}

const handleCanvasMouseDown = (e) => {
  if (e.button !== 0) return
  
  isPanning.value = true
  panStart.value = { x: e.clientX - panOffset.value.x, y: e.clientY - panOffset.value.y }
  emit('update:selectedNode', null)
}

const handleCanvasMouseMove = (e) => {
  if (isPanning.value) {
    panOffset.value = {
      x: e.clientX - panStart.value.x,
      y: e.clientY - panStart.value.y
    }
  }
  
  if (isDragging.value && dragNode.value) {
    const rect = canvasContainer.value.getBoundingClientRect()
    const x = (e.clientX - rect.left - panOffset.value.x) / props.zoom - dragOffset.value.x
    const y = (e.clientY - rect.top - panOffset.value.y) / props.zoom - dragOffset.value.y
    
    if (Math.abs(x - dragNode.value.x) > 1 || Math.abs(y - dragNode.value.y) > 1) {
      nodeMoved.value = true
    }
    
    const newNodes = props.nodes.map(n => 
      n.id === dragNode.value.id 
        ? { ...n, x, y }
        : n
    )
    emit('update:nodes', newNodes)
  }
  
  if (isConnecting.value) {
    const rect = canvasContainer.value.getBoundingClientRect()
    connectingEnd.value = {
      x: (e.clientX - rect.left - panOffset.value.x) / props.zoom,
      y: (e.clientY - rect.top - panOffset.value.y) / props.zoom
    }
  }
}

const handleCanvasMouseUp = (e) => {
  if (isConnecting.value) {
    const rect = canvasContainer.value.getBoundingClientRect()
    const x = (e.clientX - rect.left - panOffset.value.x) / props.zoom
    const y = (e.clientY - rect.top - panOffset.value.y) / props.zoom
    
    const targetNode = props.nodes.find(n => 
      n.id !== connectingStartNode.value.id &&
      x >= n.x && x <= n.x + n.width &&
      y >= n.y && y <= n.y + n.height
    )
    
    if (targetNode) {
      emit('add-edge', connectingStartNode.value.id, targetNode.id)
    }
  }
  
  if (isDragging.value && nodeMoved.value) {
    emit('save-history')
    nodeMoved.value = false
  }
  
  isPanning.value = false
  isDragging.value = false
  isConnecting.value = false
  dragNode.value = null
  connectingStartNode.value = null
}

const handleNodeMouseDown = (e, node) => {
  e.stopPropagation()
  
  if (e.button !== 0) return
  
  emit('update:selectedNode', node.id)
  
  isDragging.value = true
  dragNode.value = node
  nodeMoved.value = false
  
  const rect = canvasContainer.value.getBoundingClientRect()
  dragOffset.value = {
    x: (e.clientX - rect.left - panOffset.value.x) / props.zoom - node.x,
    y: (e.clientY - rect.top - panOffset.value.y) / props.zoom - node.y
  }
}

const startEditing = (node) => {
  editingNode.value = node
  editingText.value = node.text
  nextTick(() => {
    if (editInput.value) {
      editInput.value.focus()
      editInput.value.select()
    }
  })
}

const finishEditing = () => {
  if (editingNode.value && editingText.value.trim()) {
    const newNodes = props.nodes.map(n =>
      n.id === editingNode.value.id
        ? { ...n, text: editingText.value.trim() }
        : n
    )
    emit('update:nodes', newNodes)
    emit('save-history')
  }
  editingNode.value = null
  editingText.value = ''
}

const cancelEditing = () => {
  editingNode.value = null
  editingText.value = ''
}

const startConnecting = (e, node) => {
  e.stopPropagation()
  
  isConnecting.value = true
  connectingStartNode.value = node
  connectingStart.value = {
    x: node.x + node.width,
    y: node.y + node.height / 2
  }
  connectingEnd.value = { ...connectingStart.value }
}

const addSibling = () => {
  if (!props.selectedNode) return
  
  const selectedNodeData = props.nodes.find(n => n.id === props.selectedNode)
  if (!selectedNodeData) return
  
  const parentEdge = props.edges.find(e => e.to === props.selectedNode)
  const parentId = parentEdge ? parentEdge.from : null
  
  emit('add-node', parentId, {
    x: selectedNodeData.x,
    y: selectedNodeData.y + 70
  })
}

const addChild = () => {
  if (!props.selectedNode) return
  emit('add-node', props.selectedNode)
}

const deleteSelected = () => {
  if (!props.selectedNode) return
  emit('delete-node', props.selectedNode)
}

const zoomIn = () => {
  const newZoom = Math.min(3, props.zoom + 0.1)
  emit('update:zoom', newZoom)
}

const zoomOut = () => {
  const newZoom = Math.max(0.2, props.zoom - 0.1)
  emit('update:zoom', newZoom)
}

const resetView = () => {
  panOffset.value = { x: 0, y: 0 }
  emit('update:zoom', 1)
}

const setNodeColor = (color) => {
  if (!props.selectedNode) return
  selectedStyle.value = { ...selectedStyle.value, backgroundColor: color }
  emit('save-history')
}

const setFontSize = (size) => {
  if (!props.selectedNode) return
  selectedStyle.value = { ...selectedStyle.value, fontSize: parseInt(size) }
  emit('save-history')
}

const setFontWeight = (weight) => {
  if (!props.selectedNode) return
  selectedStyle.value = { ...selectedStyle.value, fontWeight: weight }
  emit('save-history')
}

onMounted(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault()
      emit('undo')
    }
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault()
      emit('redo')
    }
    if (e.key === 'Delete' && props.selectedNode && !editingNode.value) {
      e.preventDefault()
      emit('delete-node', props.selectedNode)
    }
    if (e.key === 'Tab' && props.selectedNode) {
      e.preventDefault()
      emit('add-node', props.selectedNode)
    }
    if (e.key === 'Enter' && props.selectedNode && !editingNode.value) {
      e.preventDefault()
      const node = props.nodes.find(n => n.id === props.selectedNode)
      if (node) startEditing(node)
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
})
</script>
