import 'reflect-metadata';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/user';
import { environmentRoutes } from './routes/environment';
import { hostRoutes } from './routes/host';
import { containerRoutes } from './routes/container';
import { appRoutes } from './routes/app';
import { logRoutes } from './routes/log';
import { alertRoutes } from './routes/alert';
import { alertExtendedRoutes } from './routes/alertExtended';
import { traceRoutes } from './routes/trace';
import { initDataCollector } from './services/collector';
import { initAlertChecker } from './services/alert';
import { initTraceDataGenerator } from './services/traceGenerator';

dotenv.config();

const PORT = process.env.PORT || 8765;

const app = new Koa();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      code: ctx.status,
      message: err.message || 'Internal Server Error',
      data: null,
    };
  }
});

app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(environmentRoutes.routes()).use(environmentRoutes.allowedMethods());
app.use(hostRoutes.routes()).use(hostRoutes.allowedMethods());
app.use(containerRoutes.routes()).use(containerRoutes.allowedMethods());
app.use(appRoutes.routes()).use(appRoutes.allowedMethods());
app.use(logRoutes.routes()).use(logRoutes.allowedMethods());
app.use(alertRoutes.routes()).use(alertRoutes.allowedMethods());
app.use(alertExtendedRoutes.routes()).use(alertExtendedRoutes.allowedMethods());
app.use(traceRoutes.routes()).use(traceRoutes.allowedMethods());

initializeDatabase()
  .then(async () => {
    console.log('Database connected successfully');
    setTimeout(() => {
      initDataCollector();
      initAlertChecker();
      initTraceDataGenerator();
    }, 1000);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
