import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { config } from './config';
import { connectDatabase } from './database';
import { errorMiddleware, loggerMiddleware } from './middlewares/error';
import routes from './routes';

const app = new Koa();

app.use(loggerMiddleware);
app.use(errorMiddleware);

app.use(cors({
  origin: config.env === 'development' ? '*' : process.env.ALLOWED_ORIGINS || '*',
  credentials: true
}));

app.use(bodyParser({
  enableTypes: ['json', 'form'],
  jsonLimit: '10mb',
  formLimit: '10mb'
}));

app.use(routes.routes());
app.use(routes.allowedMethods());

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(config.port, () => {
      console.log(`🚀 服务器运行在 http://localhost:${config.port}`);
      console.log(`📊 环境: ${config.env}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;
