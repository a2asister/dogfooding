import { Sequelize } from 'sequelize';
import logger from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'grand_canal_monitoring',
  process.env.DB_USER || 'canal_user',
  process.env.DB_PASSWORD || 'canal_pass123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307'),
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
    timezone: '+08:00',
  }
);

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    
    await sequelize.sync({ alter: false });
    logger.info('数据库模型同步完成');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
};

export default sequelize;
