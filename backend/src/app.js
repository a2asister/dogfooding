const Koa = require('koa');
const Router = require('koa-router');
const { koaBody } = require('koa-body');
const cors = require('koa-cors');
const path = require('path');
const fs = require('fs-extra');

const devicesRouter = require('./routes/devices');
const trafficRouter = require('./routes/traffic');
const accessControlRouter = require('./routes/accessControl');
const settingsRouter = require('./routes/settings');
const guestNetworkRouter = require('./routes/guestNetwork');
const alertsRouter = require('./routes/alerts');
const fileShareRouter = require('./routes/fileShare');

const app = new Koa();
const router = new Router();

const UPLOAD_TEMP_DIR = path.join(__dirname, '../../temp_uploads');
fs.ensureDirSync(UPLOAD_TEMP_DIR);

app.use(cors());

app.use(koaBody({
  multipart: true,
  jsonLimit: '100mb',
  formLimit: '100mb',
  textLimit: '100mb',
  formidable: {
    uploadDir: UPLOAD_TEMP_DIR,
    keepExtensions: true,
    maxFieldsSize: 100 * 1024 * 1024,
    maxFileSize: 100 * 1024 * 1024,
    multiples: true,
    hash: false
  }
}));

router.get('/', async (ctx) => {
  ctx.body = {
    message: '家庭局域网管理系统 API',
    version: '1.0.0'
  };
});

router.use('/api/devices', devicesRouter.routes(), devicesRouter.allowedMethods());
router.use('/api/traffic', trafficRouter.routes(), trafficRouter.allowedMethods());
router.use('/api/access-control', accessControlRouter.routes(), accessControlRouter.allowedMethods());
router.use('/api/settings', settingsRouter.routes(), settingsRouter.allowedMethods());
router.use('/api/guest-network', guestNetworkRouter.routes(), guestNetworkRouter.allowedMethods());
router.use('/api/alerts', alertsRouter.routes(), alertsRouter.allowedMethods());
router.use('/api/file-share', fileShareRouter.routes(), fileShareRouter.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
