import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const logDir = process.env.LOG_DIR || path.join(__dirname, '../../logs')
const logLevel = process.env.LOG_LEVEL || 'info'

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    return `${timestamp} [${level}]: ${message} ${metaStr}`
  })
)

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: logLevel,
    format: consoleFormat,
  }),
]

if (process.env.NODE_ENV !== 'development') {
  transports.push(
    new DailyRotateFile({
      level: 'info',
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }) as unknown as winston.transport,
    new DailyRotateFile({
      level: 'error',
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }) as unknown as winston.transport
  )
}

const logger = winston.createLogger({
  level: logLevel,
  levels: winston.config.npm.levels,
  transports,
})

export default logger
