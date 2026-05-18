import express = require('express');
import cors = require('cors');
import multer = require('multer');
import path = require('path');
import fs = require('fs');
import { insertImage, getAllImages, deleteImage, getImageById } from './database';
import type { ImageRecord } from './types';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4399;

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

app.use('/uploads', express.static(uploadsDir));

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: '未上传文件' });
    return;
  }

  const { width, height } = req.body;
  if (!width || !height) {
    res.status(400).json({ success: false, error: '缺少图片尺寸信息' });
    return;
  }

  const filename = path.parse(req.file.filename).name;
  const resultPath = `uploads/${filename}-result.png`;

  const record: Omit<ImageRecord, 'id'> = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    originalPath: `uploads/${req.file.filename}`,
    resultPath,
    createdAt: Date.now(),
    width: Number(width),
    height: Number(height)
  };

  const id = insertImage(record);
  const fullRecord = getImageById(id);

  res.json({
    success: true,
    data: fullRecord
  });
});

app.post('/api/save-result/:id', express.json({ limit: '50mb' }), (req, res) => {
  const id = Number(req.params.id);
  const { resultData } = req.body as { resultData: string };

  if (!resultData) {
    res.status(400).json({ success: false, error: '缺少结果数据' });
    return;
  }

  const record = getImageById(id);
  if (!record) {
    res.status(404).json({ success: false, error: '记录不存在' });
    return;
  }

  const base64Data = resultData.replace(/^data:image\/png;base64,/, '');
  const resultPath = path.join(process.cwd(), record.resultPath);

  fs.writeFile(resultPath, base64Data, 'base64', (err) => {
    if (err) {
      res.status(500).json({ success: false, error: '保存失败' });
      return;
    }
    res.json({ success: true, resultPath: record.resultPath });
  });
});

app.get('/api/images', (_req, res) => {
  const images = getAllImages();
  res.json({
    success: true,
    data: images,
    total: images.length
  });
});

app.delete('/api/images/:id', (req, res) => {
  const id = Number(req.params.id);
  const record = getImageById(id);

  if (!record) {
    res.status(404).json({ success: false, error: '记录不存在' });
    return;
  }

  const originalPath = path.join(process.cwd(), record.originalPath);
  const resultPath = path.join(process.cwd(), record.resultPath);

  if (fs.existsSync(originalPath)) {
    fs.unlinkSync(originalPath);
  }
  if (fs.existsSync(resultPath)) {
    fs.unlinkSync(resultPath);
  }

  const deleted = deleteImage(id);
  res.json({ success: deleted });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', port: PORT });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务运行在 http://localhost:${PORT}`);
});
