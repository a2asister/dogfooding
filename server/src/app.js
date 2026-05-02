const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const router = require('./routes');
const { initializeLockCleaner } = require('./utils/lockCleaner');
const initializeSeats = require('./utils/initializeSeats');

const app = new Koa();

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

// 初始化数据
console.log('正在初始化系统数据...');
initializeSeats();
initializeLockCleaner();

const PORT = 55555;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
