import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadFile, getMessages, markMessageRead } from '../controllers/upload';
import { authMiddleware } from '../middleware/auth';
import { config } from '../config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../..', config.uploadPath));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const router = Router();

router.post('/', authMiddleware, upload.single('file'), uploadFile);
router.get('/messages', authMiddleware, getMessages);
router.put('/messages/:id/read', authMiddleware, markMessageRead);

export default router;
