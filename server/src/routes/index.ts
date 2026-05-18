import express, { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { insertImage, insertResult, updateResultStatus, getResults, getResult, deleteResult, getImageById } from '../models'
import { processImage } from '../services/imageProcessor'

const router = express.Router()

const projectRoot = path.join(__dirname, '..', '..')
const uploadsDir = path.join(projectRoot, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${uuidv4()}${ext}`
    cb(null, filename)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只允许上传图片文件'))
    }
  }
})

router.post('/upload', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' })
    }

    const relativePath = `/uploads/${req.file.filename}`
    const id = insertImage(req.file.originalname, relativePath)

    res.json({
      id,
      path: relativePath,
      url: `/api${relativePath}`
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: '上传失败' })
  }
})

router.post('/process', async (req: Request, res: Response) => {
  try {
    const { imageId, marks } = req.body

    if (!imageId || !marks || !Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ error: '参数错误' })
    }

    const image = getResult(imageId) || getImageData(imageId)
    if (!image) {
      return res.status(404).json({ error: '图片不存在' })
    }

    const resultId = insertResult(
      imageId,
      image.originalName,
      image.originalPath,
      JSON.stringify(marks)
    )

    try {
      const { processedPath, thumbnailPath } = await processImage(
        image.originalPath,
        marks,
        resultId
      )
      updateResultStatus(resultId, 'completed', processedPath, thumbnailPath)
    } catch (err) {
      console.error('Process error:', err)
      updateResultStatus(resultId, 'failed')
    }

    const result = getResult(resultId)
    if (result) {
      res.json({
        ...result,
        marks: JSON.parse(result.marks || '[]')
      })
    } else {
      res.status(500).json({ error: '处理失败' })
    }
  } catch (err) {
    console.error('Process error:', err)
    res.status(500).json({ error: '处理失败' })
  }
})

router.get('/results', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20

    const { list, total } = getResults(page, pageSize)
    
    const formattedList = list.map(item => ({
      ...item,
      marks: JSON.parse(item.marks || '[]')
    }))

    res.json({ list: formattedList, total })
  } catch (err) {
    console.error('Get results error:', err)
    res.status(500).json({ error: '获取列表失败' })
  }
})

router.get('/results/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const result = getResult(id)

    if (!result) {
      return res.status(404).json({ error: '记录不存在' })
    }

    res.json({
      ...result,
      marks: JSON.parse(result.marks || '[]')
    })
  } catch (err) {
    console.error('Get result error:', err)
    res.status(500).json({ error: '获取失败' })
  }
})

router.delete('/results/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const result = getResult(id)

    if (!result) {
      return res.status(404).json({ error: '记录不存在' })
    }

    if (result.processedPath) {
      const processedPath = path.join(__dirname, '..', '..', result.processedPath)
      if (fs.existsSync(processedPath)) {
        fs.unlinkSync(processedPath)
      }
    }

    if (result.thumbnailPath) {
      const thumbnailPath = path.join(__dirname, '..', '..', result.thumbnailPath)
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath)
      }
    }

    deleteResult(id)
    res.json({ success: true })
  } catch (err) {
    console.error('Delete result error:', err)
    res.status(500).json({ error: '删除失败' })
  }
})

router.get('/download', (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string
    if (!filePath) {
      return res.status(400).json({ error: '参数错误' })
    }

    const fullPath = path.join(__dirname, '..', '..', filePath)
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: '文件不存在' })
    }

    const filename = path.basename(filePath)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.sendFile(fullPath)
  } catch (err) {
    console.error('Download error:', err)
    res.status(500).json({ error: '下载失败' })
  }
})

function getImageData(imageId: number) {
  const image = getImageById(imageId)
  if (image) {
    return image
  }
  const result = getResult(imageId)
  if (result) {
    return {
      originalName: result.originalName,
      originalPath: result.originalPath
    }
  }
  return undefined
}

export default router
