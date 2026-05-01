<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          📤 导出思维导图
        </h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 text-2xl">
          ✕
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">选择导出格式</label>
          <select v-model="selectedFormat" class="w-full input">
            <option value="json">JSON 文件 (.json)</option>
            <option value="text">纯文本 (.txt)</option>
            <option value="markdown">Markdown (.md)</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">文件名</label>
          <input 
            v-model="fileName" 
            type="text" 
            class="w-full input"
            placeholder="请输入文件名"
          />
        </div>
        
        <div class="pt-4 flex gap-3 justify-end">
          <button @click="$emit('close')" class="btn btn-secondary">取消</button>
          <button @click="doExport" class="btn btn-primary">导出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  mindmapData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])

const selectedFormat = ref('json')
const fileName = ref('mindmap')

const getFileExtension = () => {
  switch (selectedFormat.value) {
    case 'json': return 'json'
    case 'text': return 'txt'
    case 'markdown': return 'md'
    default: return 'json'
  }
}

const generateContent = () => {
  const { nodes, edges } = props.mindmapData
  
  switch (selectedFormat.value) {
    case 'json':
      return JSON.stringify(props.mindmapData, null, 2)
    
    case 'text': {
      const rootNodes = nodes.filter(n => !edges.some(e => e.to === n.id))
      const lines = []
      
      const buildTree = (nodeId, level = 0) => {
        const node = nodes.find(n => n.id === nodeId)
        if (!node) return
        
        const indent = '  '.repeat(level)
        const prefix = level === 0 ? '■ ' : '├─ '
        lines.push(`${indent}${prefix}${node.text}`)
        
        const childEdges = edges.filter(e => e.from === nodeId)
        childEdges.forEach(edge => buildTree(edge.to, level + 1))
      }
      
      rootNodes.forEach(n => buildTree(n.id))
      return lines.join('\n')
    }
    
    case 'markdown': {
      const rootNodes = nodes.filter(n => !edges.some(e => e.to === n.id))
      const lines = []
      
      const buildTree = (nodeId, level = 1) => {
        const node = nodes.find(n => n.id === nodeId)
        if (!node) return
        
        const prefix = '#'.repeat(Math.min(level, 6))
        lines.push(`${prefix} ${node.text}`)
        lines.push('')
        
        const childEdges = edges.filter(e => e.from === nodeId)
        childEdges.forEach(edge => buildTree(edge.to, level + 1))
      }
      
      rootNodes.forEach(n => buildTree(n.id))
      return lines.join('\n')
    }
    
    default:
      return ''
  }
}

const doExport = () => {
  const content = generateContent()
  const extension = getFileExtension()
  const fullFileName = `${fileName.value}.${extension}`
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = fullFileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  emit('close')
}
</script>
