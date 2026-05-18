import init, { inpaint_image } from '../wasm/image_inpaint'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

let wasmInitialized = false

export const initWasm = async (): Promise<void> => {
  if (wasmInitialized) return
  try {
    await init()
    wasmInitialized = true
    console.log('WASM 模块初始化成功')
  } catch (err) {
    console.warn('WASM 初始化失败，将使用 JS 回退方案:', err)
  }
}

export const inpaintWithWasm = async (
  canvas: HTMLCanvasElement,
  marks: Rect[]
): Promise<boolean> => {
  if (!wasmInitialized) {
    console.warn('WASM 未初始化，使用 JS 回退方案')
    return false
  }

  try {
    const ctx = canvas.getContext('2d')
    if (!ctx) return false

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    const marksX = marks.map(m => m.x)
    const marksY = marks.map(m => m.y)
    const marksWidth = marks.map(m => m.width)
    const marksHeight = marks.map(m => m.height)

    inpaint_image(
      imageData,
      new Float64Array(marksX),
      new Float64Array(marksY),
      new Float64Array(marksWidth),
      new Float64Array(marksHeight)
    )

    ctx.putImageData(imageData, 0, 0)
    return true
  } catch (err) {
    console.error('WASM 处理失败:', err)
    return false
  }
}
