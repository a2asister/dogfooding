import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { contentRoutes } from './routes/content.js';
import { distributionRoutes } from './routes/distribution.js';
import { analyticsRoutes } from './routes/analytics.js';
import { initializeMockData } from './data/mockData.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

initializeMockData();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '内容生态系统 API 服务正常运行' });
});

app.use('/api/content', contentRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 内容生态系统 API 服务已启动: http://localhost:${PORT}`);
  console.log(`📊 前端 Astro 服务: http://localhost:4321`);
});
