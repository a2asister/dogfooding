import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbDir = path.dirname(process.env.DATABASE_PATH || './database/community.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || './database/community.db',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [path.join(__dirname, '../entities/**/*.ts')],
  migrations: [path.join(__dirname, '../migrations/**/*.ts')],
  subscribers: [path.join(__dirname, '../subscribers/**/*.ts')],
});

export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    const dataSource = await AppDataSource.initialize();
    console.log('数据库连接成功');
    return dataSource;
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
};
