import crypto from 'node:crypto'
import zlib from 'node:zlib'
import { promisify } from 'node:util'
import type { CompressionOptions, ImageRecord } from './types'
import { findImageByHash, insertImage } from './database'

const gzip = promisify(zlib.gzip)
const gunzip = promisify(zlib.gunzip)

export interface CompressionResult {
  compressedData: Buffer
  compressedSize: number
  width: number
  height: number
  compressionRatio: number
}

export async function compressImage(
  fileBuffer: Buffer,
  originalName: string,
  options: CompressionOptions
): Promise<ImageRecord> {
  const originalHash = crypto
    .createHash('sha256')
    .update(fileBuffer)
    .digest('hex')

  const existing = findImageByHash(originalHash)
  if (existing) {
    return existing
  }

  const dimensions = getImageDimensions(fileBuffer)
  const { compressedData, compressedSize, compressionRatio } = await performCompression(
    fileBuffer,
    options
  )

  const compressedHash = crypto
    .createHash('sha256')
    .update(compressedData)
    .digest('hex')

  const record: ImageRecord = {
    id: crypto.randomUUID(),
    originalName,
    originalSize: fileBuffer.length,
    compressedSize,
    originalHash,
    compressedHash,
    mimeType: 'image/png',
    width: dimensions.width,
    height: dimensions.height,
    quality: options.quality,
    compressionRatio,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    originalData: fileBuffer,
    compressedData
  }

  insertImage(record)

  return record
}

export async function saveCompressedImage(
  compressedBuffer: Buffer,
  originalName: string,
  originalSize: number,
  compressedSize: number,
  width: number,
  height: number,
  quality: number,
  compressionRatio: number,
  mimeType: string = 'image/png'
): Promise<ImageRecord> {
  const originalHash = crypto
    .createHash('sha256')
    .update(compressedBuffer)
    .digest('hex')

  const existing = findImageByHash(originalHash)
  if (existing) {
    return existing
  }

  const compressedHash = crypto
    .createHash('sha256')
    .update(compressedBuffer)
    .digest('hex')

  const record: ImageRecord = {
    id: crypto.randomUUID(),
    originalName,
    originalSize,
    compressedSize,
    originalHash,
    compressedHash,
    mimeType,
    width,
    height,
    quality,
    compressionRatio,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    originalData: compressedBuffer,
    compressedData: compressedBuffer
  }

  insertImage(record)

  return record
}

async function performCompression(
  data: Buffer,
  options: CompressionOptions
): Promise<CompressionResult> {
  let compressed = data
  const iterations = options.lossless ? options.iterations : 1

  for (let i = 0; i < iterations; i++) {
    const level = options.lossless
      ? Math.min(9, 6 + i)
      : Math.max(1, Math.floor((options.quality / 100) * 9))

    compressed = await gzip(compressed, { level })

    if (!options.colorSampling && i === 0) {
      compressed = simulateColorSampling(compressed, options.quality)
    }

    await new Promise(resolve => setTimeout(resolve, 50))
  }

  const originalSize = data.length
  const compressedSize = compressed.length
  const compressionRatio = Number(((originalSize - compressedSize) / originalSize).toFixed(4))

  const dimensions = getImageDimensions(data)

  return {
    compressedData: compressed,
    compressedSize,
    width: dimensions.width,
    height: dimensions.height,
    compressionRatio
  }
}

function simulateColorSampling(data: Buffer, quality: number): Buffer {
  const sampleRate = Math.max(0.1, quality / 100)
  const result = Buffer.alloc(Math.ceil(data.length * sampleRate))
  for (let i = 0, j = 0; i < data.length && j < result.length; i += Math.ceil(1 / sampleRate), j++) {
    result[j] = data[i] as number
  }
  return result
}

function getImageDimensions(buffer: Buffer): { width: number; height: number } {
  if (buffer.length >= 24 && buffer.toString('ascii', 1, 8) === 'PNG\r\n\x1a\n') {
    const width = buffer.readUInt32BE(16)
    const height = buffer.readUInt32BE(20)
    return { width, height }
  }

  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2
    while (offset < buffer.length - 4) {
      if (buffer[offset] === 0xff) {
        const marker = buffer[offset + 1] as number
        if ((marker >= 0xc0 && marker <= 0xcf) && marker !== 0xc4 && marker !== 0xcc) {
          const height = buffer.readUInt16BE(offset + 5)
          const width = buffer.readUInt16BE(offset + 7)
          return { width, height }
        }
        const segmentLength = buffer.readUInt16BE(offset + 2)
        offset += 2 + segmentLength
      } else {
        offset++
      }
    }
  }

  return { width: 800, height: 600 }
}

export async function decompressImage(data: Buffer): Promise<Buffer> {
  try {
    return await gunzip(data)
  } catch {
    return data
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i] as string}`
}
