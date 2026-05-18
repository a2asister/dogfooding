import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const uploadController = {
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ code: 400, message: '请选择要上传的文件', data: null });
        return;
      }

      const file = req.file;
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      
      if (!allowedExts.includes(ext)) {
        res.status(400).json({ code: 400, message: '只支持上传图片文件', data: null });
        return;
      }

      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;
      const filepath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filepath, file.buffer);
      
      const url = `/uploads/${filename}`;
      
      res.json({ code: 0, message: '上传成功', data: { url, filename } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '上传失败', data: null });
    }
  }
};
