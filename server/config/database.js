const { Sequelize } = require('sequelize');

// 数据库配置
const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'game_reservation',
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
};

// 创建 Sequelize 实例
const sequelize = new Sequelize(databaseConfig);

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
}

// 同步数据库模型
async function syncDatabase() {
  try {
    // 在开发环境中可以使用 force: true 来重置数据库
    // 在生产环境中应该使用 alter: true 或者手动迁移
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development' 
    });
    console.log('数据库模型同步成功');
  } catch (error) {
    console.error('数据库模型同步失败:', error);
  }
}

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  syncDatabase
};
