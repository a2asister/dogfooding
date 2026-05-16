import db from '../config/database';
import { AuthContext } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export class UploadController {
  static async uploadImage(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const files = ctx.request.files as any;
    const file = files?.file || files?.image;

    if (!file) {
      ctx.body = { code: 400, message: '未找到文件' };
      return;
    }

    const fileType = file.type || file.mimetype || '';
    const fileName = file.name || file.originalFilename || '';
    const ext = path.extname(fileName).toLowerCase();
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    if (!allowedTypes.includes(fileType) && !allowedExts.includes(ext)) {
      ctx.body = { code: 400, message: `不支持的图片格式: ${fileType} ${ext}` };
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    const fileSize = file.size || file.length || 0;
    if (fileSize > maxSize) {
      ctx.body = { code: 400, message: '图片大小不能超过10MB' };
      return;
    }

    const fileExt = ext || path.extname(file.path) || '.png';
    const finalFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExt}`;
    const filePath = path.join(uploadDir, finalFileName);

    console.log('图片上传:', { originalName: fileName, type: fileType, size: fileSize, finalName: finalFileName });

    const reader = fs.createReadStream(file.path || file.filepath);
    const writer = fs.createWriteStream(filePath);
    reader.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const fileUrl = `/uploads/${finalFileName}`;

    await UploadController.logOperation(userId, 'upload_image', 'file', finalFileName, `上传图片: ${fileName}`);

    ctx.body = {
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        name: file.name,
        size: file.size
      }
    };
  }

  static async uploadFile(ctx: AuthContext) {
    const userId = ctx.state.userId!;
    const file = ctx.request.files?.file as any;

    if (!file) {
      ctx.body = { code: 400, message: '未找到文件' };
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      ctx.body = { code: 400, message: '文件大小不能超过50MB' };
      return;
    }

    const ext = path.extname(file.name);
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const reader = fs.createReadStream(file.path);
    const writer = fs.createWriteStream(filePath);
    reader.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const fileUrl = `/uploads/${fileName}`;

    await UploadController.logOperation(userId, 'upload_file', 'file', fileName, `上传文件: ${file.name}`);

    ctx.body = {
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        name: file.name,
        size: file.size
      }
    };
  }

  static async downloadFile(ctx: AuthContext) {
    const { fileName } = ctx.params as { fileName: string };
    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(filePath)) {
      ctx.status = 404;
      ctx.body = { code: 404, message: '文件不存在' };
      return;
    }

    const stats = fs.statSync(filePath);
    ctx.set('Content-Length', stats.size.toString());
    ctx.set('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    ctx.body = fs.createReadStream(filePath);
  }

  private static async logOperation(
    userId: number,
    operationType: string,
    targetType: string,
    targetId: string,
    detail: string
  ) {
    return new Promise((resolve) => {
      db.run(
        'INSERT INTO operation_logs (user_id, operation_type, target_type, target_id, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, operationType, targetType, targetId, detail, new Date().toISOString()],
        () => resolve(null)
      );
    });
  }
}
