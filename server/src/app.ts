import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
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

const app = new Koa();

app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(HTTP_PORT, () => {
  console.log(`HTTP 服务已启动，端口: ${HTTP_PORT}`);
});

startWebSocketServer();
