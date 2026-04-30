const Router = require('koa-router');
const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const { readJSON, writeJSON, DATA_DIR } = require('../models/database');

const router = new Router();
const FILE_SHARE_FILE = 'fileShare.json';
const SHARE_DIR = path.join(DATA_DIR, 'shared');

const ensureShareDir = async () => {
  await fs.ensureDir(SHARE_DIR);
};

const sanitizeFilename = (filename) => {
  return filename.replace(/[<>:"/\\|?*]/g, '_');
};

const generateUniqueFilename = async (filename) => {
  const sanitized = sanitizeFilename(filename);
  const ext = path.extname(sanitized);
  const base = path.basename(sanitized, ext);
  
  let uniqueName = sanitized;
  let counter = 1;
  
  while (await fs.exists(path.join(SHARE_DIR, uniqueName))) {
    uniqueName = `${base}_${counter}${ext}`;
    counter++;
  }
  
  return uniqueName;
};

const copyFile = async (srcPath, destPath) => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(srcPath);
    const writeStream = fs.createWriteStream(destPath);
    
    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);
    
    readStream.pipe(writeStream);
  });
};

router.get('/', async (ctx) => {
  try {
    await ensureShareDir();
    const files = await readJSON(FILE_SHARE_FILE);
    const filesWithExists = [];
    
    for (const file of files) {
      const filePath = path.join(SHARE_DIR, file.filename);
      const exists = await fs.exists(filePath);
      let size = file.size || 0;
      
      if (exists) {
        const stat = await fs.stat(filePath);
        size = stat.size;
      }
      
      filesWithExists.push({
        ...file,
        exists,
        size,
        mimeType: mime.lookup(file.filename) || 'application/octet-stream'
      });
    }
    
    ctx.body = { success: true, data: filesWithExists };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/list', async (ctx) => {
  try {
    await ensureShareDir();
    const files = await fs.readdir(SHARE_DIR);
    const fileStats = [];
    
    for (const file of files) {
      const filePath = path.join(SHARE_DIR, file);
      const stat = await fs.stat(filePath);
      fileStats.push({
        name: file,
        size: stat.size,
        isDirectory: stat.isDirectory(),
        modifiedTime: stat.mtime.toISOString(),
        mimeType: mime.lookup(file) || 'application/octet-stream'
      });
    }
    
    ctx.body = { success: true, data: fileStats };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.post('/upload', async (ctx) => {
  try {
    await ensureShareDir();
    
    let uploadedFiles = [];
    
    if (ctx.request.files && ctx.request.files.file) {
      const files = Array.isArray(ctx.request.files.file) 
        ? ctx.request.files.file 
        : [ctx.request.files.file];
      
      const description = ctx.request.body?.description || '';
      
      for (const file of files) {
        if (!file) continue;
        
        const originalName = file.originalFilename || file.name;
        if (!originalName) continue;
        
        const uniqueName = await generateUniqueFilename(originalName);
        const targetPath = path.join(SHARE_DIR, uniqueName);
        
        const tempPath = file.filepath || file.path;
        if (tempPath && await fs.exists(tempPath)) {
          await copyFile(tempPath, targetPath);
          
          try {
            await fs.unlink(tempPath);
          } catch (e) {
            console.log('临时文件已被清理');
          }
        } else {
          ctx.status = 400;
          ctx.body = { success: false, message: '上传文件路径无效' };
          return;
        }
        
        const stat = await fs.stat(targetPath);
        
        const fileRecord = {
          id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
          filename: uniqueName,
          originalName: originalName,
          description: description,
          size: stat.size,
          mimeType: mime.lookup(uniqueName) || 'application/octet-stream',
          uploadedAt: new Date().toISOString(),
          downloads: 0
        };
        
        uploadedFiles.push(fileRecord);
      }
      
      if (uploadedFiles.length === 0) {
        ctx.status = 400;
        ctx.body = { success: false, message: '没有有效文件被上传' };
        return;
      }
      
      const existingFiles = await readJSON(FILE_SHARE_FILE);
      const updatedFiles = [...existingFiles, ...uploadedFiles];
      await writeJSON(FILE_SHARE_FILE, updatedFiles);
      
      ctx.body = { 
        success: true, 
        data: uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles,
        message: `成功上传 ${uploadedFiles.length} 个文件`
      };
    } else if (ctx.request.body && ctx.request.body.filename) {
      const { filename, content, description } = ctx.request.body;
      
      if (!filename) {
        ctx.status = 400;
        ctx.body = { success: false, message: '文件名不能为空' };
        return;
      }
      
      const uniqueName = await generateUniqueFilename(filename);
      const filePath = path.join(SHARE_DIR, uniqueName);
      
      const buffer = content ? Buffer.from(content, 'utf-8') : Buffer.from('');
      await fs.writeFile(filePath, buffer);
      
      const stat = await fs.stat(filePath);
      
      const newFile = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        filename: uniqueName,
        originalName: filename,
        description: description || '',
        size: stat.size,
        mimeType: mime.lookup(uniqueName) || 'text/plain',
        uploadedAt: new Date().toISOString(),
        downloads: 0
      };
      
      const existingFiles = await readJSON(FILE_SHARE_FILE);
      existingFiles.push(newFile);
      await writeJSON(FILE_SHARE_FILE, existingFiles);
      
      ctx.body = { success: true, data: newFile };
    } else {
      ctx.status = 400;
      ctx.body = { success: false, message: '未找到上传的文件' };
    }
  } catch (error) {
    console.error('上传失败:', error);
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/download/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const files = await readJSON(FILE_SHARE_FILE);
    const fileRecord = files.find(f => f.id === id);
    
    if (!fileRecord) {
      ctx.status = 404;
      ctx.body = { success: false, message: '文件不存在' };
      return;
    }
    
    const filePath = path.join(SHARE_DIR, fileRecord.filename);
    
    if (!await fs.exists(filePath)) {
      ctx.status = 404;
      ctx.body = { success: false, message: '文件已删除' };
      return;
    }
    
    fileRecord.downloads = (fileRecord.downloads || 0) + 1;
    await writeJSON(FILE_SHARE_FILE, files);
    
    const stat = await fs.stat(filePath);
    const mimeType = fileRecord.mimeType || mime.lookup(fileRecord.filename) || 'application/octet-stream';
    const downloadName = fileRecord.originalName || fileRecord.filename;
    
    const encodedName = encodeURIComponent(downloadName).replace(/'/g, '%27').replace(/"/g, '%22');
    
    ctx.type = mimeType;
    ctx.length = stat.size;
    ctx.set('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}; filename="${encodedName}"`);
    ctx.set('Accept-Ranges', 'bytes');
    
    ctx.body = fs.createReadStream(filePath);
    
  } catch (error) {
    console.error('下载失败:', error);
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/preview/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const files = await readJSON(FILE_SHARE_FILE);
    const fileRecord = files.find(f => f.id === id);
    
    if (!fileRecord) {
      ctx.status = 404;
      ctx.body = { success: false, message: '文件不存在' };
      return;
    }
    
    const filePath = path.join(SHARE_DIR, fileRecord.filename);
    
    if (!await fs.exists(filePath)) {
      ctx.status = 404;
      ctx.body = { success: false, message: '文件已删除' };
      return;
    }
    
    const stat = await fs.stat(filePath);
    const mimeType = fileRecord.mimeType || mime.lookup(fileRecord.filename) || 'application/octet-stream';
    
    const isTextType = mimeType.startsWith('text/') || 
                       mimeType === 'application/json' ||
                       mimeType === 'application/javascript' ||
                       mimeType === 'image/svg+xml';
    
    if (isTextType) {
      const content = await fs.readFile(filePath, 'utf-8');
      ctx.body = {
        success: true,
        data: {
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          content: content,
          size: stat.size,
          mimeType: mimeType,
          isText: true
        }
      };
    } else if (mimeType.startsWith('image/')) {
      const content = await fs.readFile(filePath);
      const base64 = content.toString('base64');
      ctx.body = {
        success: true,
        data: {
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          base64: base64,
          size: stat.size,
          mimeType: mimeType,
          isImage: true
        }
      };
    } else {
      ctx.body = {
        success: true,
        data: {
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          size: stat.size,
          mimeType: mimeType,
          previewAvailable: false,
          message: '此文件类型不支持预览，请下载查看'
        }
      };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.delete('/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const files = await readJSON(FILE_SHARE_FILE);
    const fileIndex = files.findIndex(f => f.id === id);
    
    if (fileIndex === -1) {
      ctx.status = 404;
      ctx.body = { success: false, message: '文件不存在' };
      return;
    }
    
    const fileRecord = files[fileIndex];
    const filePath = path.join(SHARE_DIR, fileRecord.filename);
    
    if (await fs.exists(filePath)) {
      await fs.unlink(filePath);
    }
    
    files.splice(fileIndex, 1);
    await writeJSON(FILE_SHARE_FILE, files);
    
    ctx.body = { success: true, message: '删除成功' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/stats', async (ctx) => {
  try {
    await ensureShareDir();
    const files = await fs.readdir(SHARE_DIR);
    let totalSize = 0;
    let fileCount = 0;
    let dirCount = 0;
    
    for (const file of files) {
      const filePath = path.join(SHARE_DIR, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        dirCount++;
      } else {
        fileCount++;
        totalSize += stat.size;
      }
    }
    
    const fileRecords = await readJSON(FILE_SHARE_FILE);
    const totalDownloads = fileRecords.reduce((sum, f) => sum + (f.downloads || 0), 0);
    
    ctx.body = {
      success: true,
      data: {
        totalSize,
        fileCount,
        dirCount,
        totalDownloads,
        sharePath: SHARE_DIR
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

module.exports = router;
