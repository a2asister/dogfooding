import paper from 'paper'
import { inkFlowAnimation, springHandleAnimation, elasticDeformation } from './animations'
import type { DrawingStore } from '@/stores/drawing'

let currentPath: paper.Path | null = null
let isDrawing = false
let selectedPath: paper.Path | null = null
let drawingStore: DrawingStore | null = null

export const setDrawingStore = (store: DrawingStore) => {
  drawingStore = store
}

export const initPaper = (canvas: HTMLCanvasElement) => {
  paper.setup(canvas)
  
  const resizeCanvas = () => {
    if (paper.view) {
      paper.view.viewSize = new paper.Size(window.innerWidth, window.innerHeight - 60)
    }
  }
  
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
}

export const handleMouseDown = (event: MouseEvent) => {
  console.log('handleMouseDown', event.clientX, event.clientY)
  
  if (!drawingStore) {
    console.error('drawingStore not initialized')
    return
  }
  
  const point = new paper.Point(event.clientX, event.clientY - 60)

  if (drawingStore.currentTool === 'pen') {
    if (!isDrawing || !currentPath) {
      console.log('Creating new path')
      currentPath = new paper.Path()
      currentPath.strokeColor = new paper.Color('#e94560')
      currentPath.strokeWidth = 3
      currentPath.strokeCap = 'round'
      currentPath.strokeJoin = 'round'
      isDrawing = true
    }
    
    const segment = currentPath.add(point)
    console.log('Added segment at:', point)
    inkFlowAnimation(currentPath, segment)
  } else if (drawingStore.currentTool === 'select') {
    const hitResult = paper.project.hitTest(point, {
      segments: true,
      stroke: true,
      fill: true,
      tolerance: 5
    })
    
    if (hitResult && hitResult.item) {
      selectPath(hitResult.item as paper.Path)
    }
  }
}

export const handleMouseMove = (event: MouseEvent) => {
  if (!drawingStore) return
  
  const point = new paper.Point(event.clientX, event.clientY - 60)

  if (drawingStore.currentTool === 'pen' && currentPath && isDrawing && currentPath.segments.length > 0) {
    const lastSegment = currentPath.segments[currentPath.segments.length - 1] as paper.Segment | undefined
    if (lastSegment) {
      const delta = point.subtract(lastSegment.point)
      lastSegment.handleOut = delta.divide(3) as paper.Point
      lastSegment.handleIn = delta.divide(-3) as paper.Point
      elasticDeformation(currentPath)
    }
  } else if (drawingStore.currentTool === 'path' && selectedPath) {
    const hitResult = paper.project.hitTest(point, {
      segments: true,
      tolerance: 10
    })
    
    if (hitResult && hitResult.segment) {
      hitResult.segment.point = point as unknown as paper.Point
      elasticDeformation(selectedPath)
    }
  }
}

export const handleMouseUp = () => {
  console.log('handleMouseUp')
  if (!drawingStore) return
  
  if (drawingStore.currentTool === 'pen' && currentPath) {
    console.log('Adding path to store')
    const svgElement = currentPath.exportSVG() as unknown as SVGPathElement
    const dAttribute = svgElement?.getAttribute ? svgElement.getAttribute('d') || '' : ''
    drawingStore.addPath({
      pathData: dAttribute,
      strokeColor: currentPath.strokeColor as unknown as { toCSS: (hex: boolean) => string },
      strokeWidth: currentPath.strokeWidth,
      fillColor: currentPath.fillColor as unknown as { toCSS: (hex: boolean) => string } | null
    })
    currentPath = null
    isDrawing = false
  }
}

const selectPath = (path: paper.Path) => {
  if (selectedPath) {
    selectedPath.selected = false
  }
  
  selectedPath = path
  selectedPath.selected = true
  springHandleAnimation(path.segments)
}
