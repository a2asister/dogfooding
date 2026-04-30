const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    pool: config.database.pool,
    logging: config.server.nodeEnv === 'development' ? console.log : false,
    timezone: '+08:00'
  }
);

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    await sequelize.sync({ alter: false });
    console.log('模型同步完成');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDatabase };