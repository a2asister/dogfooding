import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa();
const router = new Router();
const DATA_PATH = path.join(__dirname, 'data', 'files.json');

app.use(cors());
app.use(bodyParser());

const readData = async () => {
  try {
    const data = await fs.readJson(DATA_PATH);
    return data;
  } catch (error) {
    return { files: [] };
  }
};

const writeData = async (data) => {
  await fs.writeJson(DATA_PATH, data, { spaces: 2 });
};

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

router.get('/api/files', async (ctx) => {
  const { type, search, sortBy, sortOrder } = ctx.query;
  let data = await readData();
  let files = [...data.files];

  if (type && type !== 'all') {
    files = files.filter(f => f.type === type);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    files = files.filter(f => 
      f.name.toLowerCase().includes(searchLower) ||
      (f.tags && f.tags.some(t => t.toLowerCase().includes(searchLower)))
    );
  }

  if (sortBy) {
    files.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'desc') {
        return aVal > bVal ? -1 : 1;
      }
      return aVal > bVal ? 1 : -1;
    });
  }

  ctx.body = { files };
});

router.get('/api/files/:id', async (ctx) => {
  const data = await readData();
  const file = data.files.find(f => f.id === ctx.params.id);
  
  if (file) {
    ctx.body = { file };
  } else {
    ctx.status = 404;
    ctx.body = { error: 'File not found' };
  }
});

router.get('/api/stats', async (ctx) => {
  const data = await readData();
  const files = data.files;
  
  const stats = {
    total: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    byType: {}
  };

  files.forEach(file => {
    if (!stats.byType[file.type]) {
      stats.byType[file.type] = { count: 0, size: 0 };
    }
    stats.byType[file.type].count++;
    stats.byType[file.type].size += file.size;
  });

  ctx.body = { stats };
});

router.post('/api/files/move', async (ctx) => {
  const { fileIds, newPath } = ctx.request.body;
  
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    ctx.status = 400;
    ctx.body = { success: false, error: '请选择要移动的文件' };
    return;
  }
  
  if (!newPath || typeof newPath !== 'string' || newPath.trim() === '') {
    ctx.status = 400;
    ctx.body = { success: false, error: '请输入有效的目标路径' };
    return;
  }

  const data = await readData();
  const validPath = newPath.trim();
  
  let movedCount = 0;
  data.files = data.files.map(file => {
    if (fileIds.includes(file.id)) {
      movedCount++;
      return {
        ...file,
        path: validPath,
        modifiedAt: new Date().toISOString()
      };
    }
    return file;
  });

  await writeData(data);
  ctx.body = { 
    success: true, 
    moved: movedCount,
    message: `成功移动 ${movedCount} 个文件到 ${validPath}`
  };
});

router.post('/api/files/delete', async (ctx) => {
  const { fileIds } = ctx.request.body;
  const data = await readData();
  
  const originalCount = data.files.length;
  data.files = data.files.filter(file => !fileIds.includes(file.id));
  const deletedCount = originalCount - data.files.length;

  await writeData(data);
  ctx.body = { success: true, deleted: deletedCount };
});

router.post('/api/files/rename', async (ctx) => {
  const { fileId, newName } = ctx.request.body;
  const data = await readData();
  
  const file = data.files.find(f => f.id === fileId);
  if (file) {
    file.name = newName;
    file.modifiedAt = new Date().toISOString();
    await writeData(data);
    ctx.body = { success: true, file };
  } else {
    ctx.status = 404;
    ctx.body = { error: 'File not found' };
  }
});

router.post('/api/files/batch-rename', async (ctx) => {
  const { renames } = ctx.request.body;
  const data = await readData();
  
  let renamedCount = 0;
  renames.forEach(({ fileId, newName }) => {
    const file = data.files.find(f => f.id === fileId);
    if (file) {
      file.name = newName;
      file.modifiedAt = new Date().toISOString();
      renamedCount++;
    }
  });

  await writeData(data);
  ctx.body = { success: true, renamed: renamedCount };
});

router.post('/api/files/batch-rename-pattern', async (ctx) => {
  const { fileIds, pattern, startIndex = 1 } = ctx.request.body;
  const data = await readData();
  
  let renamedCount = 0;
  fileIds.forEach((fileId, index) => {
    const file = data.files.find(f => f.id === fileId);
    if (file) {
      const extension = file.name.includes('.') 
        ? '.' + file.name.split('.').pop() 
        : '';
      const baseName = pattern.replace('{index}', String(startIndex + index));
      file.name = `${baseName}${extension}`;
      file.modifiedAt = new Date().toISOString();
      renamedCount++;
    }
  });

  await writeData(data);
  ctx.body = { success: true, renamed: renamedCount };
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
