const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const fs = require('fs');
const path = require('path');

const app = new Koa();
const router = new Router();
const PORT = 8765;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'clipboard.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ items: [] }, null, 2));
}

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { items: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function detectType(content) {
  if (content.startsWith('data:image/') || content.startsWith('http') && content.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
    return 'image';
  }
  if (content.startsWith('http://') || content.startsWith('https://')) {
    return 'link';
  }
  return 'text';
}

router.get('/api/items', (ctx) => {
  const data = readData();
  const items = data.items
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  ctx.body = { success: true, data: items };
});

router.get('/api/items/:type', (ctx) => {
  const { type } = ctx.params;
  const data = readData();
  const items = data.items
    .filter(item => item.type === type)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  ctx.body = { success: true, data: items };
});

router.post('/api/items', (ctx) => {
  const { content } = ctx.request.body;
  if (!content || !content.trim()) {
    ctx.status = 400;
    ctx.body = { success: false, message: '内容不能为空' };
    return;
  }

  const data = readData();
  const existingItem = data.items.find(item => item.content === content);
  
  if (existingItem) {
    existingItem.createdAt = new Date().toISOString();
    writeData(data);
    ctx.body = { success: true, data: existingItem };
    return;
  }

  const newItem = {
    id: require('uuid').v4(),
    content: content.trim(),
    type: detectType(content),
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.items.unshift(newItem);
  
  if (data.items.length > 500) {
    const nonPinned = data.items.filter(item => !item.pinned);
    const pinned = data.items.filter(item => item.pinned);
    data.items = [...pinned, ...nonPinned.slice(0, 500 - pinned.length)];
  }

  writeData(data);
  ctx.body = { success: true, data: newItem };
});

router.put('/api/items/:id', (ctx) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;
  const data = readData();
  const index = data.items.findIndex(item => item.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '记录不存在' };
    return;
  }

  data.items[index] = {
    ...data.items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeData(data);
  ctx.body = { success: true, data: data.items[index] };
});

router.delete('/api/items/:id', (ctx) => {
  const { id } = ctx.params;
  const data = readData();
  const index = data.items.findIndex(item => item.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '记录不存在' };
    return;
  }

  data.items.splice(index, 1);
  writeData(data);
  ctx.body = { success: true };
});

router.delete('/api/items', (ctx) => {
  const data = readData();
  data.items = data.items.filter(item => item.pinned);
  writeData(data);
  ctx.body = { success: true, cleared: data.items.length > 0 ? 0 : data.items.length };
});

router.get('/api/search', (ctx) => {
  const { keyword, type } = ctx.query;
  const data = readData();
  let items = data.items;

  if (keyword && keyword.trim()) {
    const lowerKeyword = keyword.toLowerCase();
    items = items.filter(item => 
      item.content.toLowerCase().includes(lowerKeyword)
    );
  }

  if (type) {
    items = items.filter(item => item.type === type);
  }

  items.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  ctx.body = { success: true, data: items };
});

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type']
}));

app.use(bodyParser({
  jsonLimit: '10mb',
  formLimit: '10mb',
  textLimit: '10mb'
}));

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`剪贴板助手后端服务已启动: http://localhost:${PORT}`);
});
