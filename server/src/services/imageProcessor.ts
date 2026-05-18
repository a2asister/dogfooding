import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import type { Rect } from '../types'

const projectRoot = path.join(__dirname, '..', '..')
const processedDir = path.join(projectRoot, 'processed')
const uploadsDir = path.join(projectRoot, 'uploads')

if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true })
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

export const processImage = async (
  originalPath: string,
  marks: Rect[],
  outputId: number
): Promise<{ processedPath: string; thumbnailPath: string }> => {
  const fullPath = path.join(projectRoot, originalPath)
  const image = sharp(fullPath)
  const metadata = await image.metadata()
  
  if (!metadata.width || !metadata.height) {
    throw new Error('无法获取图片尺寸')
  }

  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixelData = new Uint8ClampedArray(data)
  
  for (const mark of marks) {
    inpaintRegion(pixelData, info.width, info.height, info.channels, mark)
  }

  const processedFileName = `processed_${outputId}.png`
  const processedPath = `/processed/${processedFileName}`
  const fullProcessedPath = path.join(processedDir, processedFileName)

  await sharp(pixelData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels as 1 | 2 | 3 | 4
    }
  })
    .png({ quality: 100, compressionLevel: 0 })
    .toFile(fullProcessedPath)

  const thumbnailFileName = `thumb_${outputId}.jpg`
  const thumbnailPath = `/processed/${thumbnailFileName}`
  const fullThumbnailPath = path.join(processedDir, thumbnailFileName)

  await sharp(fullProcessedPath)
    .resize(200, 150, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile(fullThumbnailPath)

  return { processedPath, thumbnailPath }
}

const inpaintRegion = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  channels: number,
  rect: Rect
): void => {
  const startX = Math.max(0, Math.floor(rect.x) - 2)
  const startY = Math.max(0, Math.floor(rect.y) - 2)
  const endX = Math.min(width - 1, Math.ceil(rect.x + rect.width) + 2)
  const endY = Math.min(height - 1, Math.ceil(rect.y + rect.height) + 2)
  const regionWidth = endX - startX + 1
  const regionHeight = endY - startY + 1

  const regionMask = new Uint8Array(regionWidth * regionHeight)
  const origStartX = Math.max(0, Math.floor(rect.x))
  const origStartY = Math.max(0, Math.floor(rect.y))
  const origEndX = Math.min(width - 1, Math.ceil(rect.x + rect.width))
  const origEndY = Math.min(height - 1, Math.ceil(rect.y + rect.height))
  
  for (let y = origStartY; y <= origEndY; y++) {
    for (let x = origStartX; x <= origEndX; x++) {
      const maskIdx = (y - startY) * regionWidth + (x - startX)
      regionMask[maskIdx] = 1
    }
  }

  const isInRegion = (x: number, y: number): boolean => {
    if (x < startX || x > endX || y < startY || y > endY) return false
    const maskIdx = (y - startY) * regionWidth + (x - startX)
    return regionMask[maskIdx] === 1
  }

  const totalPixels = (origEndX - origStartX + 1) * (origEndY - origStartY + 1)
  let remainingPixels = totalPixels
  
  const maxIterations = 100
  for (let iter = 0; iter < maxIterations && remainingPixels > 0; iter++) {
    const tempData = new Uint8ClampedArray(data)
    let pixelsFilled = 0
    
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (!isInRegion(x, y)) continue

        const neighbors = getValidNeighbors(x, y, width, height, startX, startY, endX, endY, regionMask)
        
        if (neighbors.length >= 2) {
          const idx = (y * width + x) * channels
          
          for (let c = 0; c < channels; c++) {
            let sum = 0
            let weightSum = 0
            
            for (const n of neighbors) {
              const nIdx = (n.y * width + n.x) * channels
              const distance = Math.sqrt((x - n.x) ** 2 + (y - n.y) ** 2)
              const weight = 1 / (distance + 0.5)
              sum += tempData[nIdx + c] * weight
              weightSum += weight
            }
            
            data[idx + c] = Math.round(sum / weightSum)
          }
          
          const maskIdx = (y - startY) * regionWidth + (x - startX)
          regionMask[maskIdx] = 0
          pixelsFilled++
        }
      }
    }
    
    remainingPixels -= pixelsFilled
    
    if (pixelsFilled === 0 && remainingPixels > 0) {
      for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
          if (!isInRegion(x, y)) continue
          
          const neighbors = getAllNeighbors(x, y, width, height, startX, startY, endX, endY, regionMask)
          
          if (neighbors.length > 0) {
            const idx = (y * width + x) * channels
            
            for (let c = 0; c < channels; c++) {
              let sum = 0
              let weightSum = 0
              
              for (const n of neighbors) {
                const nIdx = (n.y * width + n.x) * channels
                const distance = Math.sqrt((x - n.x) ** 2 + (y - n.y) ** 2)
                const weight = 1 / (distance + 0.5)
                sum += data[nIdx + c] * weight
                weightSum += weight
              }
              
              data[idx + c] = Math.round(sum / weightSum)
            }
            
            const maskIdx = (y - startY) * regionWidth + (x - startX)
            regionMask[maskIdx] = 0
            remainingPixels--
          }
        }
      }
    }
  }

  for (let pass = 0; pass < 3; pass++) {
    const tempData = new Uint8ClampedArray(data)
    
    for (let y = origStartY; y <= origEndY; y++) {
      for (let x = origStartX; x <= origEndX; x++) {
        const idx = (y * width + x) * channels
        
        let sumR = 0, sumG = 0, sumB = 0, count = 0
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const nx = x + dx
            const ny = y + dy
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = (ny * width + nx) * channels
              sumR += tempData[nIdx]
              if (channels > 1) sumG += tempData[nIdx + 1]
              if (channels > 2) sumB += tempData[nIdx + 2]
              count++
            }
          }
        }
        
        if (count > 0) {
          data[idx] = Math.round((tempData[idx] * 0.5 + sumR / count * 0.5))
          if (channels > 1) data[idx + 1] = Math.round((tempData[idx + 1] * 0.5 + sumG / count * 0.5))
          if (channels > 2) data[idx + 2] = Math.round((tempData[idx + 2] * 0.5 + sumB / count * 0.5))
        }
      }
    }
  }

  for (let y = origStartY; y <= origEndY; y++) {
    for (let x = origStartX; x <= origEndX; x++) {
      const idx = (y * width + x) * channels
      
      let edgeSum = 0
      let edgeCount = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = (ny * width + nx) * channels
            edgeSum += Math.abs(data[nIdx] - data[idx])
            edgeCount++
          }
        }
      }
      
      if (edgeCount > 0) {
        const edgeLevel = edgeSum / edgeCount / 255
        const noiseAmount = edgeLevel * 8
        for (let c = 0; c < channels; c++) {
          const noise = (Math.random() - 0.5) * noiseAmount
          data[idx + c] = Math.max(0, Math.min(255, data[idx + c] + noise))
        }
      }
    }
  }
}

const getValidNeighbors = (
  x: number,
  y: number,
  width: number,
  height: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  regionMask: Uint8Array
): Array<{ x: number; y: number }> => {
  const neighbors: Array<{ x: number; y: number }> = []
  const radius = 5
  const regionWidth = endX - startX + 1

  const isInRegion = (nx: number, ny: number): boolean => {
    if (nx < startX || nx > endX || ny < startY || ny > endY) return false
    const maskIdx = (ny - startY) * regionWidth + (nx - startX)
    return regionMask[maskIdx] === 1
  }

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue

      const nx = x + dx
      const ny = y + dy

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
      if (isInRegion(nx, ny)) continue

      neighbors.push({ x: nx, y: ny })
    }
  }

  return neighbors
}

const getAllNeighbors = (
  x: number,
  y: number,
  width: number,
  height: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  regionMask: Uint8Array
): Array<{ x: number; y: number }> => {
  const neighbors: Array<{ x: number; y: number }> = []
  const radius = 8
  const regionWidth = endX - startX + 1

  const isInRegion = (nx: number, ny: number): boolean => {
    if (nx < startX || nx > endX || ny < startY || ny > endY) return false
    const maskIdx = (ny - startY) * regionWidth + (nx - startX)
    return regionMask[maskIdx] === 1
  }

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue

      const nx = x + dx
      const ny = y + dy

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
      if (isInRegion(nx, ny)) continue

      neighbors.push({ x: nx, y: ny })
    }
  }

  return neighbors
}
