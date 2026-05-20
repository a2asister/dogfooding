import 'reflect-metadata';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/user';
import { environmentRoutes } from './routes/environment';
import { hostRoutes } from './routes/host';
import { containerRoutes } from './routes/container';
import { appRoutes } from './routes/app';
import { logRoutes } from './routes/log';
import { alertRoutes } from './routes/alert';
import { initDataCollector } from './services/collector';
import { initAlertChecker } from './services/alert';

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

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected successfully');
    initDataCollector();
    initAlertChecker();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
