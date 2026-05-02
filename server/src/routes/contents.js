const Router = require('koa-router');
const { readJsonFile, writeJsonFile, generateId } = require('../utils/data-store');

const router = new Router();
const CONTENTS_FILE = 'contents.json';

router.get('/', async (ctx) => {
  const { type, status, search, page = 1, pageSize = 10 } = ctx.query;
  let data = readJsonFile(CONTENTS_FILE);
  let contents = data.contents || [];

  if (type) {
    contents = contents.filter(c => c.type === type);
  }
  if (status) {
    contents = contents.filter(c => c.status === status);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    contents = contents.filter(c => 
      c.title.toLowerCase().includes(searchLower) ||
      c.content.toLowerCase().includes(searchLower)
    );
  }

  const total = contents.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const end = start + parseInt(pageSize);
  const paginated = contents.slice(start, end);

  ctx.body = {
    success: true,
    data: {
      items: paginated,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = readJsonFile(CONTENTS_FILE);
  const content = (data.contents || []).find(c => c.id === id);

  if (!content) {
    ctx.status = 404;
    ctx.body = { success: false, message: '内容不存在' };
    return;
  }

  ctx.body = {
    success: true,
    data: content
  };
});

router.post('/', async (ctx) => {
  const { type, title, content, author, fileName, fileSize } = ctx.request.body;
  const data = readJsonFile(CONTENTS_FILE);
  
  const newContent = {
    id: generateId(),
    type,
    title,
    content,
    author,
    status: 'pending',
    createdAt: new Date().toISOString(),
    riskLevel: 'low',
    autoAuditResult: null
  };

  if (type === 'attachment' && fileName) {
    newContent.fileName = fileName;
    newContent.fileSize = fileSize;
  }

  if (!data.contents) data.contents = [];
  data.contents.unshift(newContent);
  writeJsonFile(CONTENTS_FILE, data);

  ctx.body = {
    success: true,
    data: newContent
  };
});

router.put('/:id/audit', async (ctx) => {
  const { id } = ctx.params;
  const { action, reason, auditor } = ctx.request.body;
  const data = readJsonFile(CONTENTS_FILE);
  const contents = data.contents || [];
  const index = contents.findIndex(c => c.id === id);

  if (index === -1) {
    ctx.status = 404;
    ctx.body = { success: false, message: '内容不存在' };
    return;
  }

  const statusMap = {
    'approve': 'approved',
    'reject': 'rejected',
    'review': 'reviewing'
  };

  contents[index].status = statusMap[action] || 'pending';
  contents[index].auditResult = {
    action,
    reason,
    auditor,
    auditedAt: new Date().toISOString()
  };

  writeJsonFile(CONTENTS_FILE, data);

  const logsData = readJsonFile('audit-logs.json');
  if (!logsData.logs) logsData.logs = [];
  logsData.logs.unshift({
    id: generateId(),
    contentId: id,
    contentTitle: contents[index].title,
    action,
    auditor: auditor || '系统',
    reason: reason || '',
    createdAt: new Date().toISOString()
  });
  writeJsonFile('audit-logs.json', logsData);

  ctx.body = {
    success: true,
    data: contents[index]
  };
});

router.get('/stats/summary', async (ctx) => {
  const data = readJsonFile(CONTENTS_FILE);
  const contents = data.contents || [];

  const summary = {
    total: contents.length,
    pending: contents.filter(c => c.status === 'pending').length,
    reviewing: contents.filter(c => c.status === 'reviewing').length,
    approved: contents.filter(c => c.status === 'approved').length,
    rejected: contents.filter(c => c.status === 'rejected').length,
    byType: {
      article: contents.filter(c => c.type === 'article').length,
      attachment: contents.filter(c => c.type === 'attachment').length,
      comment: contents.filter(c => c.type === 'comment').length,
      announcement: contents.filter(c => c.type === 'announcement').length
    },
    byRisk: {
      high: contents.filter(c => c.riskLevel === 'high').length,
      medium: contents.filter(c => c.riskLevel === 'medium').length,
      low: contents.filter(c => c.riskLevel === 'low').length
    }
  };

  ctx.body = {
    success: true,
    data: summary
  };
});

module.exports = router;
