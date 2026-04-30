import app from './app';
import { connectDatabase } from './config/database';
import logger from './utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3011;

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      logger.info(`京杭大运河污染大屏监控系统后端服务已启动`);
      logger.info(`服务地址: http://localhost:${PORT}`);
      logger.info(`API 路径: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('服务启动失败:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  process.exit(1);
});

startServer();
