function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function canvasToBlob(canvas, format, quality) {
  return new Promise((resolve) => {
    const mimeType = `image/${format}`
    const qualityValue = quality !== undefined ? quality / 100 : undefined
    canvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      qualityValue
    )
  })
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function calculateNewSize(imgWidth, imgHeight, targetWidth, targetHeight) {
  if (!targetWidth && !targetHeight) {
    return { width: imgWidth, height: imgHeight }
  }

  if (targetWidth && targetHeight) {
    return { width: parseInt(targetWidth), height: parseInt(targetHeight) }
  }

  const ratio = imgWidth / imgHeight
  if (targetWidth) {
    return { 
      width: parseInt(targetWidth), 
      height: Math.round(parseInt(targetWidth) / ratio) 
    }
  } else {
    return { 
      width: Math.round(parseInt(targetHeight) * ratio), 
      height: parseInt(targetHeight) 
    }
  }
}

async function tryCompressWithQuality(canvas, format, quality, originalSize) {
  const blob = await canvasToBlob(canvas, format, quality)
  const sizeRatio = blob.size / originalSize
  
  if (sizeRatio < 1) {
    return { blob, size: blob.size, quality }
  }
  
  if (quality > 30) {
    return await tryCompressWithQuality(canvas, format, quality - 10, originalSize)
  }
  
  return { blob, size: blob.size, quality }
}

export async function compressImage(imageUrl, options = {}) {
  const { quality = 80, format = 'jpeg', width, height, originalSize = 0 } = options
  const img = await loadImage(imageUrl)
  
  const newSize = calculateNewSize(img.width, img.height, width, height)
  
  const canvas = document.createElement('canvas')
  canvas.width = newSize.width
  canvas.height = newSize.height
  
  const ctx = canvas.getContext('2d')
  
  if (format === 'jpeg' || format === 'jpg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  
  let result
  if (originalSize > 0 && (format === 'jpeg' || format === 'jpg')) {
    result = await tryCompressWithQuality(canvas, format, quality, originalSize)
  } else {
    const blob = await canvasToBlob(canvas, format, quality)
    result = { blob, size: blob.size, quality }
  }
  
  const base64 = await blobToBase64(result.blob)
  
  return {
    blob: result.blob,
    base64,
    size: result.size,
    width: canvas.width,
    height: canvas.height,
    format,
    usedQuality: result.quality
  }
}

export async function convertImage(imageUrl, targetFormat = 'png') {
  const img = await loadImage(imageUrl)
  
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  
  const ctx = canvas.getContext('2d')
  
  if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  
  ctx.drawImage(img, 0, 0)
  
  const quality = targetFormat === 'png' ? undefined : 0.8
  const blob = await canvasToBlob(canvas, targetFormat, quality * 100)
  const base64 = await blobToBase64(blob)
  
  return {
    blob,
    base64,
    size: blob.size,
    width: canvas.width,
    height: canvas.height,
    format: targetFormat
  }
}

export async function cropImage(imageUrl, options = {}) {
  const { width, height } = options
  const img = await loadImage(imageUrl)
  
  const targetWidth = parseInt(width) || img.width
  const targetHeight = parseInt(height) || img.height
  
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  const imgRatio = img.width / img.height
  const targetRatio = targetWidth / targetHeight
  
  let sx, sy, sw, sh
  
  if (imgRatio > targetRatio) {
    sh = img.height
    sw = img.height * targetRatio
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = img.width / targetRatio
    sx = 0
    sy = (img.height - sh) / 2
  }
  
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight)
  
  const ext = imageUrl.split('.').pop().split('?')[0].toLowerCase()
  const format = ['png', 'webp', 'gif'].includes(ext) ? ext : 'jpeg'
  const quality = format === 'png' ? undefined : 0.85
  
  const blob = await canvasToBlob(canvas, format, quality * 100)
  const base64 = await blobToBase64(blob)
  
  return {
    blob,
    base64,
    size: blob.size,
    width: canvas.width,
    height: canvas.height,
    format
  }
}

export function base64ToBlob(base64, mimeType = 'image/jpeg') {
  const byteString = atob(base64.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  
  return new Blob([ab], { type: mimeType })
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
