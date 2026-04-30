import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import { config } from '../config'

const logDir = path.join(__dirname, '../../', config.log.dir)

const fileTransport = new DailyRotateFile({
  filename: path.join(logDir, '%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
})

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`
    })
  ),
})

const logger = winston.createLogger({
  level: config.log.level,
  levels: winston.config.npm.levels,
  transports: [
    fileTransport,
    consoleTransport,
  ],
})

export const httpLogger = (ctx: any, next: () => Promise<any>) => {
  const start = Date.now()
  
  return next().then(() => {
    const ms = Date.now() - start
    const logMessage = `${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`
    
    if (ctx.status >= 400) {
      logger.error(logMessage)
    } else {
      logger.info(logMessage)
    }
  }).catch((err) => {
    const ms = Date.now() - start
    logger.error(`${ctx.method} ${ctx.url} - ${err.status || 500} - ${ms}ms - ${err.message}`)
    throw err
  })
}

export default logger
