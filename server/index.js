const http = require('http');
const app = require('./app');
const { testConnection, syncDatabase } = require('./config/database');
// 导入模型以确保它们被注册到 Sequelize
require('./models');

const PORT = process.env.PORT || 3001;

// 启动服务器的函数
async function startServer() {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 同步数据库模型
    await syncDatabase();
    
    // 创建 HTTP 服务器
    const server = http.createServer(app.callback());
    
    // 启动服务器
    server.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
    });
    
    return server;
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);
});

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

// 启动服务器
startServer();

// 导出启动函数（用于测试）
module.exports = { startServer };
