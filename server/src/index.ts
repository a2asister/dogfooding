import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import session from 'koa-session';
import { config } from './config';
import router from './routes';
import { getDb } from './db';
import { deployService } from './services/deploy.service';
import { authService } from './services/auth.service';
import { alertService } from './services/alert.service';

const app = new Koa();

app.keys = [config.session.secret];

app.use(
  session(
    {
      key: 'cicd.sid',
      maxAge: config.session.maxAge,
      httpOnly: true,
      signed: true,
    },
    app
  )
);

app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);

app.use(bodyParser({ enableTypes: ['json'], jsonLimit: '10mb' }));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.status = (error as { status?: number }).status || 500;
    ctx.body = { error: error instanceof Error ? error.message : '服务器内部错误' };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

getDb();

deployService.initializeDefaultEnvironments();

setInterval(() => {
  authService.checkTokenExpiry();
  alertService.clearOld(30);
}, 60 * 60 * 1000);

const server = app.listen(config.server.port, () => {
  console.log(`🚀 CICD Platform Server running on port ${config.server.port}`);
  console.log(`📊 API: http://localhost:${config.server.port}/api/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    process.exit(0);
  });
});

export default app;
