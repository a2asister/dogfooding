import { defineStore } from 'pinia'
import { ref } from 'vue'

interface PathData {
  id: string
  pathData: string
  strokeColor: string
  strokeWidth: number
  fillColor?: string
}

interface HistoryState {
  paths: PathData[]
}

export interface DrawingStore {
  currentTool: string
  paths: PathData[]
  selectedPathId: string | null
  setCurrentTool: (tool: string) => void
  addPath: (path: { pathData?: string; strokeColor?: { toCSS: (hex: boolean) => string } | null; strokeWidth: number; fillColor?: { toCSS: (hex: boolean) => string } | null }) => void
  undo: () => void
  redo: () => void
  exportSVG: () => void
  save: () => void
}

export const useDrawingStore = defineStore('drawing', () => {
  const currentTool = ref('pen')
  const paths = ref<PathData[]>([])
  const history = ref<HistoryState[]>([])
  const historyIndex = ref(-1)
  const selectedPathId = ref<string | null>(null)

  const setCurrentTool = (tool: string) => {
    currentTool.value = tool
  }

  const saveState = () => {
    const state = { paths: JSON.parse(JSON.stringify(paths.value)) }
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(state)
    historyIndex.value++
  }

  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--
      paths.value = JSON.parse(JSON.stringify(history.value[historyIndex.value].paths))
    }
  }

  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      paths.value = JSON.parse(JSON.stringify(history.value[historyIndex.value].paths))
    }
  }

  const addPath = (path: { pathData?: string; strokeColor?: { toCSS: (hex: boolean) => string } | null; strokeWidth: number; fillColor?: { toCSS: (hex: boolean) => string } | null }) => {
    const pathData: PathData = {
      id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pathData: path.pathData || '',
      strokeColor: path.strokeColor?.toCSS(true) || '#e94560',
      strokeWidth: path.strokeWidth,
      fillColor: path.fillColor?.toCSS(true)
    }
    paths.value.push(pathData)
    console.log('Path added to store, total paths:', paths.value.length)
    saveState()
  }

  const exportSVG = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
  ${paths.value.map(p => `<path d="${p.pathData}" stroke="${p.strokeColor}" stroke-width="${p.strokeWidth}" fill="${p.fillColor || 'none'}"/>`).join('\n')}
</svg>`
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `drawing_${Date.now()}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const save = async () => {
    console.log('Saving drawing...', paths.value)
  }

  return {
    currentTool,
    paths,
    selectedPathId,
    setCurrentTool,
    addPath,
    undo,
    redo,
    exportSVG,
    save
  }
})
