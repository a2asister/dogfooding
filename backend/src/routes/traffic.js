const Router = require('koa-router');
const { readJSON, writeJSON } = require('../models/database');

const router = new Router();
const TRAFFIC_FILE = 'traffic.json';

router.get('/', async (ctx) => {
  try {
    const traffic = await readJSON(TRAFFIC_FILE);
    ctx.body = { success: true, data: traffic };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/realtime', async (ctx) => {
  try {
    const realtimeData = {
      timestamp: new Date().toISOString(),
      upload: Math.random() * 10,
      download: Math.random() * 50,
      totalUpload: Math.random() * 1000,
      totalDownload: Math.random() * 5000
    };
    ctx.body = { success: true, data: realtimeData };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

router.get('/history', async (ctx) => {
  try {
    const { period = 'day' } = ctx.query;
    const historyData = generateHistoryData(period);
    ctx.body = { success: true, data: historyData };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
  }
});

function generateHistoryData(period) {
  const now = new Date();
  const data = [];
  let count;
  
  switch (period) {
    case 'day':
      count = 24;
      break;
    case 'week':
      count = 7;
      break;
    case 'month':
      count = 30;
      break;
    default:
      count = 24;
  }
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - i * (24 / count) * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      upload: Math.random() * 100,
      download: Math.random() * 500
    });
  }
  
  return data.reverse();
}

module.exports = router;
