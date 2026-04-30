import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '8080'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'hotel_ordering',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'hotel-ordering-jwt-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  log: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },
}

export default config
