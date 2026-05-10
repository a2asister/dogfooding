import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import router from './routes.js';
import db from './db.js';

const app = new Koa();

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.status = 500;
    ctx.body = { error: err.message };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT_START = 8080;
const PORT_MAX = 8100;

async function startServer() {
  try {
    await db.init();
    
    let port = PORT_START;
    const startServerOnPort = () => {
      return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
          console.log(`Server running on http://localhost:${port}`);
          resolve(server);
        });
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE' && port < PORT_MAX) {
            port++;
            startServerOnPort().then(resolve).catch(reject);
          } else {
            reject(err);
          }
        });
      });
    };
    
    await startServerOnPort();
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
