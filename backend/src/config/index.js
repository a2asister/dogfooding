require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'smart_home',
    user: process.env.DB_USER || 'smart_home',
    password: process.env.DB_PASSWORD || 'smart_home123',
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  logger: {
    level: process.env.LOG_LEVEL || 'debug',
    file: process.env.LOG_FILE || 'logs/app.log'
  }
};