import { Request, Response } from 'express';
import path from 'path';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: '请选择要上传的文件' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      message: '上传成功',
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('上传文件错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const uploadMultipleImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      res.status(400).json({ message: '请选择要上传的文件' });
      return;
    }

    const files = Array.isArray(req.files) ? req.files : [];
    const urls = files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    }));

    res.json({
      message: '上传成功',
      files: urls,
    });
  } catch (error) {
    console.error('批量上传文件错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};
