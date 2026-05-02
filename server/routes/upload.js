const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs-extra')
const crypto = require('crypto')

const router = express.Router()

const uploadDir = path.join(__dirname, '../../uploads')
const chunksDir = path.join(__dirname, '../../chunks')
const dataDir = path.join(__dirname, '../../data')
const uploadRecordsPath = path.join(dataDir, 'upload-records.json')

// 确保数据文件存在
const ensureDataFile = () => {
  fs.ensureDirSync(dataDir)
  if (!fs.existsSync(uploadRecordsPath)) {
    fs.writeJsonSync(uploadRecordsPath, {})
  }
}

ensureDataFile()

// 生成文件唯一标识
const generateFileKey = (fileName, fileSize, lastModified) => {
  const hash = crypto.createHash('md5')
  hash.update(`${String(fileName)}-${String(fileSize)}-${String(lastModified)}`)
  return hash.digest('hex')
}

// 获取上传记录
const getUploadRecord = (fileKey) => {
  ensureDataFile()
  const records = fs.readJsonSync(uploadRecordsPath, { throws: false }) || {}
  return records[fileKey] || null
}

// 保存上传记录
const saveUploadRecord = (fileKey, record) => {
  ensureDataFile()
  const records = fs.readJsonSync(uploadRecordsPath, { throws: false }) || {}
  records[fileKey] = {
    ...record,
    updatedAt: new Date().toISOString()
  }
  fs.writeJsonSync(uploadRecordsPath, records, { spaces: 2 })
}

// 删除上传记录
const deleteUploadRecord = (fileKey) => {
  ensureDataFile()
  const records = fs.readJsonSync(uploadRecordsPath, { throws: false }) || {}
  if (records[fileKey]) {
    delete records[fileKey]
    fs.writeJsonSync(uploadRecordsPath, records, { spaces: 2 })
  }
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { fileName, fileSize, lastModified } = req.body
    const fileKey = generateFileKey(fileName, fileSize, lastModified)
    const chunkDir = path.join(chunksDir, fileKey)
    fs.ensureDirSync(chunkDir)
    cb(null, chunkDir)
  },
  filename: (req, file, cb) => {
    const { chunkIndex } = req.body
    cb(null, `chunk_${chunkIndex}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 单个分片最大 100MB
  }
})

// 检查上传状态（断点续传）
router.get('/check', async (req, res) => {
  try {
    const { fileName, fileSize, lastModified } = req.query
    const fileKey = generateFileKey(fileName, fileSize, lastModified)

    // 检查文件是否已完全上传
    const finalPath = path.join(uploadDir, fileName)
    if (fs.existsSync(finalPath)) {
      const stats = fs.statSync(finalPath)
      if (stats.size === parseInt(fileSize)) {
        return res.json({
          success: true,
          uploaded: true,
          message: '文件已存在'
        })
      }
    }

    // 检查已上传的分片
    const chunkDir = path.join(chunksDir, fileKey)
    const uploadedChunks = []

    if (fs.existsSync(chunkDir)) {
      const files = fs.readdirSync(chunkDir)
      files.forEach(file => {
        const match = file.match(/^chunk_(\d+)$/)
        if (match) {
          uploadedChunks.push(parseInt(match[1]))
        }
      })
    }

    // 获取上传记录
    const record = getUploadRecord(fileKey)

    res.json({
      success: true,
      uploaded: false,
      uploadedChunks: uploadedChunks.sort((a, b) => a - b),
      record
    })
  } catch (error) {
    console.error('检查上传状态失败:', error)
    res.status(500).json({
      success: false,
      message: error.message || '检查上传状态失败'
    })
  }
})

// 上传分片
router.post('/chunk', upload.single('chunk'), async (req, res) => {
  try {
    const { fileName, fileSize, lastModified, chunkIndex, totalChunks } = req.body
    
    console.log('分片上传请求:', {
      fileName,
      fileSize,
      lastModified,
      chunkIndex,
      totalChunks,
      file: req.file ? {
        originalname: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      } : null
    })

    const fileKey = generateFileKey(fileName, fileSize, lastModified)

    // 更新上传记录
    const record = getUploadRecord(fileKey) || {
      fileName,
      fileSize: parseInt(fileSize),
      lastModified: parseInt(lastModified),
      totalChunks: parseInt(totalChunks),
      uploadedChunks: [],
      createdAt: new Date().toISOString()
    }

    if (!record.uploadedChunks.includes(parseInt(chunkIndex))) {
      record.uploadedChunks.push(parseInt(chunkIndex))
      record.uploadedChunks.sort((a, b) => a - b)
    }

    saveUploadRecord(fileKey, record)

    res.json({
      success: true,
      message: `分片 ${chunkIndex} 上传成功`,
      data: {
        chunkIndex: parseInt(chunkIndex),
        uploadedCount: record.uploadedChunks.length,
        totalChunks: record.totalChunks
      }
    })
  } catch (error) {
    console.error('上传分片失败:', error)
    res.status(500).json({
      success: false,
      message: error.message || '上传分片失败'
    })
  }
})

// 合并分片
router.post('/merge', async (req, res) => {
  try {
    const { fileName, fileSize, lastModified, totalChunks } = req.body
    const parsedTotalChunks = parseInt(totalChunks)
    
    console.log('合并请求参数:', {
      fileName,
      fileSize,
      lastModified,
      totalChunks,
      parsedTotalChunks
    })

    const fileKey = generateFileKey(fileName, fileSize, lastModified)
    const chunkDir = path.join(chunksDir, fileKey)
    const finalPath = path.join(uploadDir, fileName)

    console.log('合并文件信息:', {
      fileKey,
      chunkDir,
      finalPath,
      chunkDirExists: fs.existsSync(chunkDir)
    })

    // 列出分片目录中的文件
    if (fs.existsSync(chunkDir)) {
      const chunkFiles = fs.readdirSync(chunkDir)
      console.log('分片目录中的文件:', chunkFiles)
    }

    // 检查所有分片是否存在
    const missingChunks = []
    for (let i = 0; i < parsedTotalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk_${i}`)
      if (!fs.existsSync(chunkPath)) {
        missingChunks.push(i)
      }
    }

    if (missingChunks.length > 0) {
      return res.status(400).json({
        success: false,
        message: `缺少分片: ${missingChunks.join(', ')}`,
        missingChunks
      })
    }

    // 合并分片
    const writeStream = fs.createWriteStream(finalPath)

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk_${i}`)
      const readStream = fs.createReadStream(chunkPath)

      await new Promise((resolve, reject) => {
        readStream.pipe(writeStream, { end: false })
        readStream.on('end', resolve)
        readStream.on('error', reject)
      })
    }

    writeStream.end()

    // 等待写入完成
    await new Promise((resolve) => {
      writeStream.on('finish', resolve)
    })

    // 验证文件大小
    const stats = fs.statSync(finalPath)
    if (stats.size !== parseInt(fileSize)) {
      fs.unlinkSync(finalPath)
      return res.status(500).json({
        success: false,
        message: '文件合并后大小不一致'
      })
    }

    // 清理临时分片目录
    if (fs.existsSync(chunkDir)) {
      fs.removeSync(chunkDir)
    }

    // 删除上传记录
    deleteUploadRecord(fileKey)

    res.json({
      success: true,
      message: '文件合并成功',
      data: {
        fileName,
        fileSize: stats.size,
        filePath: finalPath
      }
    })
  } catch (error) {
    console.error('合并分片失败:', error)
    res.status(500).json({
      success: false,
      message: error.message || '合并分片失败'
    })
  }
})

// 获取已上传文件列表
router.get('/files', async (req, res) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        data: []
      })
    }

    const files = fs.readdirSync(uploadDir)
    const fileList = files.map(fileName => {
      const filePath = path.join(uploadDir, fileName)
      const stats = fs.statSync(filePath)
      return {
        name: fileName,
        size: stats.size,
        createdAt: stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString()
      }
    })

    // 按创建时间降序排序
    fileList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json({
      success: true,
      data: fileList
    })
  } catch (error) {
    console.error('获取文件列表失败:', error)
    res.status(500).json({
      success: false,
      message: error.message || '获取文件列表失败'
    })
  }
})

// 删除已上传文件
router.delete('/files/:fileName', async (req, res) => {
  try {
    const fileName = decodeURIComponent(req.params.fileName)
    const filePath = path.join(uploadDir, fileName)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      })
    }

    fs.unlinkSync(filePath)

    res.json({
      success: true,
      message: '文件删除成功'
    })
  } catch (error) {
    console.error('删除文件失败:', error)
    res.status(500).json({
      success: false,
      message: error.message || '删除文件失败'
    })
  }
})

module.exports = router
