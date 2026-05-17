import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import type { CompressionOptions, ImageInfo } from './types'
import { compressImage, decompressImage, saveCompressedImage } from './compressionService'
import { deleteImage, getImageById, getImageList, getTotalCount } from './database'

const router = Router()

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持 PNG、JPEG、WEBP 格式的图片'))
    }
  }
})

router.post('/upload', upload.array('images', 20), (req: Request, res: Response) => {
  void (async () => {
    try {
      const files = req.files as Express.Multer.File[] | undefined
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: '请选择要上传的图片' })
        return
      }

      const body = req.body as Record<string, string>
      const qualityRaw = body.quality ?? '80'
      const colorSamplingRaw = body.colorSampling ?? 'true'
      const iterationsRaw = body.iterations ?? '3'
      const losslessRaw = body.lossless ?? 'false'

      const options: CompressionOptions = {
        quality: Number(qualityRaw),
        colorSampling: colorSamplingRaw === 'true',
        iterations: Number(iterationsRaw),
        lossless: losslessRaw === 'true'
      }

      const results: ImageInfo[] = []

      for (const file of files) {
        const record = await compressImage(file.buffer, file.originalname, options)
        results.push({
          id: record.id,
          originalName: record.originalName,
          originalSize: record.originalSize,
          compressedSize: record.compressedSize,
          mimeType: record.mimeType,
          width: record.width,
          height: record.height,
          quality: record.quality,
          compressionRatio: record.compressionRatio,
          createdAt: record.createdAt
        })
      }

      res.json({
        success: true,
        message: `成功压缩 ${results.length} 张图片`,
        data: results
      })
    } catch (error) {
      console.error('压缩失败:', error)
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '压缩失败'
      })
    }
  })()
})

router.post('/upload/compressed', upload.array('images', 20), (req: Request, res: Response) => {
  void (async () => {
    try {
      const files = req.files as Express.Multer.File[] | undefined
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: '请选择要上传的图片' })
        return
      }

      const body = req.body as Record<string, string>
      const count = Number(body.count ?? files.length)

      const results: ImageInfo[] = []

      for (let i = 0; i < files.length && i < count; i++) {
        const file = files[i]
        if (!file) continue

        const originalName = body[`originalName_${i}`] ?? file.originalname
        const originalSize = Number(body[`originalSize_${i}`] ?? file.size)
        const compressedSize = Number(body[`compressedSize_${i}`] ?? file.size)
        const width = Number(body[`width_${i}`] ?? 0)
        const height = Number(body[`height_${i}`] ?? 0)
        const compressionRatio = Number(body[`compressionRatio_${i}`] ?? 0)
        const quality = Number(body[`quality_${i}`] ?? 100)
        const mimeType = body[`mimeType_${i}`] ?? 'image/png'

        const record = await saveCompressedImage(
          file.buffer,
          originalName,
          originalSize,
          compressedSize,
          width,
          height,
          quality,
          compressionRatio,
          mimeType
        )

        results.push({
          id: record.id,
          originalName: record.originalName,
          originalSize: record.originalSize,
          compressedSize: record.compressedSize,
          mimeType: record.mimeType,
          width: record.width,
          height: record.height,
          quality: record.quality,
          compressionRatio: record.compressionRatio,
          createdAt: record.createdAt
        })
      }

      res.json({
        success: true,
        message: `成功保存 ${results.length} 张压缩图片`,
        data: results
      })
    } catch (error) {
      console.error('保存压缩图片失败:', error)
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '保存失败'
      })
    }
  })()
})

router.get('/images', (_req: Request, res: Response) => {
  try {
    const limitRaw = _req.query.limit ?? '100'
    const offsetRaw = _req.query.offset ?? '0'

    const limit = Number(limitRaw)
    const offset = Number(offsetRaw)

    const images = getImageList(limit, offset)
    const total = getTotalCount()

    res.json({
      success: true,
      data: {
        list: images,
        total,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('获取图片列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取图片列表失败'
    })
  }
})

router.get('/images/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      res.status(400).json({ success: false, message: '缺少图片ID' })
      return
    }
    const record = getImageById(id)

    if (!record) {
      res.status(404).json({ success: false, message: '图片不存在' })
      return
    }

    res.json({
      success: true,
      data: {
        id: record.id,
        originalName: record.originalName,
        originalSize: record.originalSize,
        compressedSize: record.compressedSize,
        mimeType: record.mimeType,
        width: record.width,
        height: record.height,
        quality: record.quality,
        compressionRatio: record.compressionRatio,
        createdAt: record.createdAt
      }
    })
  } catch (error) {
    console.error('获取图片信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取图片信息失败'
    })
  }
})

router.get('/images/:id/download', (req: Request, res: Response) => {
  void (async () => {
    try {
      const { id } = req.params
      if (!id) {
        res.status(400).json({ success: false, message: '缺少图片ID' })
        return
      }
      const record = getImageById(id)

      if (!record) {
        res.status(404).json({ success: false, message: '图片不存在' })
        return
      }

      const typeParam = req.query.type ?? 'compressed'
      const data = typeParam === 'original' ? record.originalData : record.compressedData
      const prefix = typeParam === 'original' ? 'original' : 'compressed'

      const decompressed = await decompressImage(data)

      const fileName = record.originalName.replace(/\.[^.]+$/, '')
      const ext = record.originalName.match(/\.[^.]+$/)?.[0] ?? '.png'

      res.setHeader('Content-Type', 'application/octet-stream')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileName)}_${prefix}${ext}"`
      )
      res.send(decompressed)
    } catch (error) {
      console.error('下载失败:', error)
      res.status(500).json({
        success: false,
        message: '下载失败'
      })
    }
  })()
})

router.get('/images/:id/preview', (req: Request, res: Response) => {
  void (async () => {
    try {
      const { id } = req.params
      if (!id) {
        res.status(400).json({ success: false, message: '缺少图片ID' })
        return
      }
      const record = getImageById(id)

      if (!record) {
        res.status(404).json({ success: false, message: '图片不存在' })
        return
      }

      const typeParam = req.query.type ?? 'compressed'
      const data = typeParam === 'original' ? record.originalData : record.compressedData

      const decompressed = await decompressImage(data)

      res.setHeader('Content-Type', record.mimeType)
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.send(decompressed)
    } catch (error) {
      console.error('预览失败:', error)
      res.status(500).json({
        success: false,
        message: '预览失败'
      })
    }
  })()
})

router.delete('/images/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      res.status(400).json({ success: false, message: '缺少图片ID' })
      return
    }
    const deleted = deleteImage(id)

    if (!deleted) {
      res.status(404).json({ success: false, message: '图片不存在' })
      return
    }

    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除失败:', error)
    res.status(500).json({
      success: false,
      message: '删除失败'
    })
  }
})

router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: '服务运行正常' })
})

export default router
