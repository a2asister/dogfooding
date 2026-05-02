const Router = require('koa-router');
const { readJsonFile } = require('../utils/data-store');

const router = new Router();
const LOGS_FILE = 'audit-logs.json';
const CONTENTS_FILE = 'contents.json';
const RULES_FILE = 'rules.json';

router.get('/', async (ctx) => {
  const { auditor, action, startDate, endDate, page = 1, pageSize = 10 } = ctx.query;
  const data = readJsonFile(LOGS_FILE);
  let logs = data.logs || [];

  if (auditor) {
    logs = logs.filter(l => l.auditor === auditor);
  }
  if (action) {
    logs = logs.filter(l => l.action === action);
  }
  if (startDate) {
    logs = logs.filter(l => new Date(l.createdAt) >= new Date(startDate));
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    logs = logs.filter(l => new Date(l.createdAt) <= end);
  }

  const total = logs.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const end = start + parseInt(pageSize);
  const paginated = logs.slice(start, end);

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

router.get('/stats/daily', async (ctx) => {
  const { days = 7 } = ctx.query;
  const logsData = readJsonFile(LOGS_FILE);
  const logs = logsData.logs || [];
  
  const dailyStats = [];
  const now = new Date();
  
  for (let i = parseInt(days) - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayLogs = logs.filter(l => l.createdAt.startsWith(dateStr));
    
    dailyStats.push({
      date: dateStr,
      total: dayLogs.length,
      approved: dayLogs.filter(l => l.action === 'approve').length,
      rejected: dayLogs.filter(l => l.action === 'reject').length,
      reviewed: dayLogs.filter(l => l.action === 'review').length
    });
  }

  ctx.body = {
    success: true,
    data: dailyStats
  };
});

router.get('/stats/compliance', async (ctx) => {
  const contentsData = readJsonFile(CONTENTS_FILE);
  const rulesData = readJsonFile(RULES_FILE);
  const logsData = readJsonFile(LOGS_FILE);
  
  const contents = contentsData.contents || [];
  const rules = rulesData.rules || [];
  const logs = logsData.logs || [];

  const totalAudited = logs.length;
  const approved = logs.filter(l => l.action === 'approve').length;
  const rejected = logs.filter(l => l.action === 'reject').length;
  
  const complianceRate = totalAudited > 0 
    ? Math.round(((approved + rejected) / totalAudited) * 100) 
    : 100;

  const avgResponseTime = 24; // 模拟数据

  const compliance = {
    complianceRate,
    totalAudited,
    approved,
    rejected,
    avgResponseTime,
    activeRules: rules.filter(r => r.enabled).length,
    totalRules: rules.length,
    pendingContents: contents.filter(c => c.status === 'pending').length,
    highRiskContents: contents.filter(c => c.riskLevel === 'high' && c.status === 'pending').length
  };

  ctx.body = {
    success: true,
    data: compliance
  };
});

module.exports = router;
