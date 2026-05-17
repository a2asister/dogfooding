import encodePng from '@jsquash/png/encode'
import { init as initPng } from '@jsquash/png/encode'
import optimiseOxiPng from '@jsquash/oxipng/optimise'
import { init as initOxiPng } from '@jsquash/oxipng/optimise'
import pngWasmUrl from '@jsquash/png/codec/pkg/squoosh_png_bg.wasm?url'
import oxipngWasmUrl from '@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm?url'
import type { CompressionOptions } from './types'

let isWasmInitialized = false

async function initWasm(): Promise<void> {
  if (isWasmInitialized) return

  try {
    await Promise.all([initPng(pngWasmUrl), initOxiPng(oxipngWasmUrl)])
    isWasmInitialized = true
    console.info('WASM modules initialized successfully')
  } catch (error) {
    console.warn('WASM init failed, falling back to canvas:', error)
    isWasmInitialized = false
  }
}

function fileToImageData(file: File): Promise<{ imageData: ImageData; hasAlpha: boolean }> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas not supported'))
      return
    }

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const hasAlpha = file.type === 'image/png' || file.type === 'image/webp'

      URL.revokeObjectURL(img.src)
      resolve({ imageData, hasAlpha })
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }
    img.src = URL.createObjectURL(file)
  })
}

function applyColorSampling(imageData: ImageData, quality: number): ImageData {
  if (quality >= 90) return imageData

  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const factor = Math.max(2, Math.floor((100 - quality) / 15) + 1)

  for (let y = 0; y < height; y += factor) {
    for (let x = 0; x < width; x += factor) {
      let rSum = 0
      let gSum = 0
      let bSum = 0
      let aSum = 0
      let count = 0

      for (let dy = 0; dy < factor && y + dy < height; dy++) {
        for (let dx = 0; dx < factor && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4
          rSum += data[idx] as number
          gSum += data[idx + 1] as number
          bSum += data[idx + 2] as number
          aSum += data[idx + 3] as number
          count++
        }
      }

      const rAvg = Math.round(rSum / count)
      const gAvg = Math.round(gSum / count)
      const bAvg = Math.round(bSum / count)
      const aAvg = Math.round(aSum / count)

      for (let dy = 0; dy < factor && y + dy < height; dy++) {
        for (let dx = 0; dx < factor && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4
          data[idx] = rAvg
          data[idx + 1] = gAvg
          data[idx + 2] = bAvg
          data[idx + 3] = aAvg
        }
      }
    }
  }

  return new ImageData(data, width, height)
}

function quantizeColors(imageData: ImageData, quality: number): ImageData {
  if (quality >= 80) return imageData

  const levels = Math.max(2, Math.floor(quality / 10))
  const step = 255 / (levels - 1)

  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round((data[i] as number) / step) * step
    data[i + 1] = Math.round((data[i + 1] as number) / step) * step
    data[i + 2] = Math.round((data[i + 2] as number) / step) * step
  }

  return new ImageData(data, imageData.width, imageData.height)
}

async function compressJpeg(
  imageData: ImageData,
  quality: number
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas not supported'))
      return
    }

    canvas.width = imageData.width
    canvas.height = imageData.height
    ctx.putImageData(imageData, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('JPEG compression failed'))
          return
        }
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(blob)
      },
      'image/jpeg',
      quality / 100
    )
  })
}

async function compressPngLossless(
  imageData: ImageData,
  iterations: number,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  let pngBuffer: ArrayBuffer

  if (isWasmInitialized) {
    try {
      pngBuffer = await encodePng(imageData)
      onProgress?.(60)

      const level = Math.min(6, Math.max(1, iterations))
      pngBuffer = await optimiseOxiPng(pngBuffer, {
        level,
        interlace: false
      })
      onProgress?.(90)
    } catch (wasmError) {
      console.warn('WASM PNG compression failed, falling back to canvas:', wasmError)
      pngBuffer = await canvasPngCompress(imageData)
      onProgress?.(90)
    }
  } else {
    pngBuffer = await canvasPngCompress(imageData)
    onProgress?.(90)
  }

  return pngBuffer
}

async function compressPngLossy(
  imageData: ImageData,
  options: CompressionOptions,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  let processedData = imageData

  if (options.colorSampling) {
    processedData = applyColorSampling(processedData, options.quality)
  }

  processedData = quantizeColors(processedData, options.quality)
  onProgress?.(40)

  return compressPngLossless(processedData, options.iterations, onProgress)
}

function canvasPngCompress(imageData: ImageData): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas not supported'))
      return
    }

    canvas.width = imageData.width
    canvas.height = imageData.height
    ctx.putImageData(imageData, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('PNG compression failed'))
          return
        }
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(blob)
      },
      'image/png'
    )
  })
}

async function compressWithWasm(
  file: File,
  options: CompressionOptions,
  onProgress?: (progress: number) => void
): Promise<{
  compressedData: ArrayBuffer
  originalSize: number
  compressedSize: number
  width: number
  height: number
  outputFormat: string
}> {
  await initWasm()
  onProgress?.(10)

  const { imageData, hasAlpha } = await fileToImageData(file)
  onProgress?.(30)

  let compressedData: ArrayBuffer
  let outputFormat: string

  const isJpegSource = file.type === 'image/jpeg' || file.type === 'image/jpg'

  if (options.lossless) {
    outputFormat = 'image/png'
    compressedData = await compressPngLossless(imageData, options.iterations, onProgress)
  } else if (isJpegSource && !hasAlpha) {
    outputFormat = 'image/jpeg'
    compressedData = await compressJpeg(imageData, options.quality)
    onProgress?.(90)
  } else {
    outputFormat = 'image/png'
    compressedData = await compressPngLossy(imageData, options, onProgress)
  }

  onProgress?.(100)

  return {
    compressedData,
    originalSize: file.size,
    compressedSize: compressedData.byteLength,
    width: imageData.width,
    height: imageData.height,
    outputFormat
  }
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions,
  onProgress?: (progress: number) => void
): Promise<{
  compressedData: ArrayBuffer
  originalSize: number
  compressedSize: number
  width: number
  height: number
  compressionRatio: number
  outputFormat: string
}> {
  const result = await compressWithWasm(file, options, onProgress)

  let finalData = result.compressedData
  let finalSize = result.compressedSize

  if (result.compressedSize >= file.size) {
    const reader = new FileReader()
    const originalBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
    finalData = originalBuffer
    finalSize = file.size
  }

  const compressionRatio = Number(
    ((result.originalSize - finalSize) / result.originalSize).toFixed(4)
  )

  return {
    ...result,
    compressedData: finalData,
    compressedSize: finalSize,
    compressionRatio
  }
}

export function arrayBufferToFile(buffer: ArrayBuffer, fileName: string, mimeType: string): File {
  const blob = new Blob([buffer], { type: mimeType })
  return new File([blob], fileName, { type: mimeType })
}

export async function preloadWasm(): Promise<void> {
  try {
    await initWasm()
  } catch (error) {
    console.warn('Failed to preload WASM:', error)
  }
}

export default {
  compressImageFile,
  preloadWasm,
  arrayBufferToFile
}
