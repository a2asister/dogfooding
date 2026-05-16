import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import serve from 'koa-static';
import router from './routes';
import { HTTP_PORT } from './config';
import { startWebSocketServer } from './services/WebSocketService';
import './config/database';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = new Koa();

app.use(cors());
app.use(serve(path.join(__dirname, '../uploads'), { prefix: '/uploads' }));
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: uploadsDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024
  }
}));
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(HTTP_PORT, () => {
  console.log(`HTTP 服务已启动，端口: ${HTTP_PORT}`);
});

startWebSocketServer();
