import type { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../database/init';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import { config } from '../config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../..', config.uploadPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function uploadFile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  if (!req.file) {
    res.json(error('未上传文件'));
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.json(
    success({
      url: fileUrl,
      filename: req.file.originalname,
      size: req.file.size,
    })
  );
}

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const messages = db
    .prepare(
      'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC'
    )
    .all(req.user.userId);

  res.json(success(messages));
}

export async function markMessageRead(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const id = parseInt(req.params.id, 10);

  db.prepare('UPDATE messages SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, req.user.userId);

  res.json(success(null, '已标记为已读'));
}
