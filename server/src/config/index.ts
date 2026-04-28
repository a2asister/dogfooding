import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'logistics_db',
    dialect: 'mysql' as const,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || ''
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000'
  }
};
