import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import router from './routes';
import appLogger from './utils/logger';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  credentials: true,
}));

app.use(morgan('combined', {
  stream: {
    write: (message: string) => appLogger.info(message.trim()),
  },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', router);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '京杭大运河污染大屏监控系统 API 服务运行正常',
    timestamp: new Date().toISOString(),
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  appLogger.error('请求错误:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'API 路径不存在',
  });
});

export default app;
