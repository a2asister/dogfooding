import { Sequelize } from 'sequelize';
import { config } from '../config';

export const sequelize = new Sequelize(
  config.database.database,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    pool: config.database.pool,
    logging: config.env === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  }
);

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    if (config.env === 'development') {
      await sequelize.sync({ alter: true });
      console.log('数据库同步完成');
    }
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};
