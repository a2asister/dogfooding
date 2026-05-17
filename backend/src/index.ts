import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initDatabase } from './db';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 8765;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5678',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

initDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/dashboards', dashboardRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error('Server error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 API 健康检查: http://localhost:${PORT}/api/health`);
});
