require('dotenv').config();
const Koa = require('koa');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const { connectDatabase } = require('./config/database');
const { errorMiddleware } = require('./middleware/error');
const { logger: winstonLogger } = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const sceneRoutes = require('./routes/sceneRoutes');
const taskRoutes = require('./routes/taskRoutes');
const alertRoutes = require('./routes/alertRoutes');
const energyRoutes = require('./routes/energyRoutes');

const app = new Koa();
const config = require('./config');

app.use(logger());
app.use(cors());
app.use(bodyParser());
app.use(errorMiddleware);

app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(deviceRoutes.routes()).use(deviceRoutes.allowedMethods());
app.use(sceneRoutes.routes()).use(sceneRoutes.allowedMethods());
app.use(taskRoutes.routes()).use(taskRoutes.allowedMethods());
app.use(alertRoutes.routes()).use(alertRoutes.allowedMethods());
app.use(energyRoutes.routes()).use(energyRoutes.allowedMethods());

app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = {
    success: false,
    message: 'API 接口不存在'
  };
});

const startServer = async () => {
  try {
    await connectDatabase();
    
    const PORT = config.server.port || 3000;
    
    app.listen(PORT, () => {
      winstonLogger.info(`智能家居后端服务启动成功，端口: ${PORT}`);
      console.log(`智能家居后端服务启动成功，端口: ${PORT}`);
    });
  } catch (error) {
    winstonLogger.error('服务启动失败:', error);
    console.error('服务启动失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;