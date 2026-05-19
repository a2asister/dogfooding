import 'dotenv/config';
import Koa from 'koa';
import cors from 'koa-cors';
import bodyParser from 'koa-bodyparser';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth';
import userRouter from './routes/user';
import auctionRouter from './routes/auction';
import merchantRouter from './routes/merchant';
import adminRouter from './routes/admin';
import orderRouter from './routes/order';
import messageRouter from './routes/message';
import { initWebSocket } from './services/websocket';
import { startAuctionScheduler } from './services/auctionScheduler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = new Koa();
const PORT = process.env.PORT || 38765;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization']
}));

app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Server error:', err);
    ctx.status = 500;
    ctx.body = { code: 500, message: '服务器内部错误' };
  }
});

app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(userRouter.routes()).use(userRouter.allowedMethods());
app.use(auctionRouter.routes()).use(auctionRouter.allowedMethods());
app.use(merchantRouter.routes()).use(merchantRouter.allowedMethods());
app.use(adminRouter.routes()).use(adminRouter.allowedMethods());
app.use(orderRouter.routes()).use(orderRouter.allowedMethods());
app.use(messageRouter.routes()).use(messageRouter.allowedMethods());

app.use(async (ctx) => {
  if (ctx.path === '/api/health') {
    ctx.body = { code: 200, message: 'OK', timestamp: Date.now() };
  }
});

const server = createServer(app.callback());

initWebSocket(server);
startAuctionScheduler();

server.listen(PORT, () => {
  console.log(`🚀 Auction server is running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket is running on ws://localhost:${PORT}/ws`);
});
