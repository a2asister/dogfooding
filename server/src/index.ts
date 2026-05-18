import express, { type Request, type Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import {
  createPhotoRecord,
  updateProgress,
  markCompleted,
  markFailed,
  getPhotoById,
  getAllPhotos,
  deletePhoto,
} from './database';
import { processImage, getFilePath } from './processor';
import { setupWebSocket, broadcastProgress } from './websocket';
import { defaultModelParams, type ModelParams, type ApiResponse } from './types';

const PORT = 14587;
const app = express();
const server = createServer(app);

setupWebSocket(server);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  },
});

app.post('/api/photos/upload', upload.single('photo'), (req: Request, res: Response<ApiResponse>) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: '未上传文件' });
      return;
    }

    const paramsBody = (req.body.params as string) ?? JSON.stringify(defaultModelParams);
    let modelParams: ModelParams;
    try {
      modelParams = JSON.parse(paramsBody) as ModelParams;
    } catch {
      modelParams = defaultModelParams;
    }

    const id = uuidv4();
    const record = createPhotoRecord(id, req.file.originalname, req.file.filename, modelParams);

    void processImage(id, req.file.path, modelParams, (progress) => {
      updateProgress(id, 'processing', progress.progress);
      broadcastProgress(progress);
    })
      .then((processedPath) => {
        markCompleted(id, path.basename(processedPath));
        broadcastProgress({
          taskId: id,
          stage: 'postprocess',
          progress: 100,
          message: '处理完成!',
        });
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        markFailed(id, errorMessage);
        broadcastProgress({
          taskId: id,
          stage: 'postprocess',
          progress: 0,
          message: `处理失败: ${errorMessage}`,
        });
      });

    res.json({ success: true, data: record });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '上传失败';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

app.get('/api/photos', (_req: Request, res: Response<ApiResponse>) => {
  try {
    const photos = getAllPhotos();
    res.json({ success: true, data: photos });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取列表失败';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

app.get('/api/photos/:id', (req: Request, res: Response<ApiResponse>) => {
  try {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json({ success: false, error: '缺少ID参数' });
      return;
    }
    const photo = getPhotoById(id);
    if (!photo) {
      res.status(404).json({ success: false, error: '照片不存在' });
      return;
    }
    res.json({ success: true, data: photo });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取失败';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

app.delete('/api/photos/:id', (req: Request, res: Response<ApiResponse>) => {
  try {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json({ success: false, error: '缺少ID参数' });
      return;
    }
    const photo = getPhotoById(id);
    if (!photo) {
      res.status(404).json({ success: false, error: '照片不存在' });
      return;
    }

    const originalPath = getFilePath(photo.originalPath);
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }
    if (photo.processedPath) {
      const processedPath = getFilePath(photo.processedPath);
      if (fs.existsSync(processedPath)) {
        fs.unlinkSync(processedPath);
      }
    }

    deletePhoto(id);
    res.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '删除失败';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

app.get('/api/health', (_req: Request, res: Response<ApiResponse>) => {
  res.json({ success: true, data: { status: 'ok', timestamp: Date.now() } });
});

server.listen(PORT, () => {
  console.log(`老照片修复服务已启动: http://localhost:${PORT}`);
});
