import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

const uploadDir = process.env.UPLOAD_PATH || './uploads';
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10);
const allowedFileTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,webp').split(',');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型，仅支持: ${allowedFileTypes.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
  },
});
