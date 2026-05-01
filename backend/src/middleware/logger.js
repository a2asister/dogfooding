import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logsDir = path.join(__dirname, '../../logs')

const logLevels = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
}

const getTimestamp = () => {
  const now = new Date()
  return now.toISOString().replace('T', ' ').substring(0, 19)
}

const getDateString = () => {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

const formatLog = (level, message, metadata = {}) => {
  const timestamp = getTimestamp()
  const metaString = Object.keys(metadata).length > 0 
    ? ` | ${JSON.stringify(metadata)}` 
    : ''
  return `[${timestamp}] [${level}] ${message}${metaString}`
}

const ensureLogsDir = async () => {
  try {
    await fs.access(logsDir)
  } catch {
    await fs.mkdir(logsDir, { recursive: true })
  }
}

const writeLog = async (level, message, metadata = {}) => {
  await ensureLogsDir()
  const logEntry = formatLog(level, message, metadata)
  const logFile = path.join(logsDir, `${getDateString()}.log`)
  
  console.log(logEntry)
  
  try {
    await fs.appendFile(logFile, logEntry + '\n', 'utf8')
  } catch (error) {
    console.error(`Failed to write log: ${error.message}`)
  }
}

export const logger = {
  debug: (message, metadata = {}) => writeLog(logLevels.DEBUG, message, metadata),
  info: (message, metadata = {}) => writeLog(logLevels.INFO, message, metadata),
  warn: (message, metadata = {}) => writeLog(logLevels.WARN, message, metadata),
  error: (message, metadata = {}) => writeLog(logLevels.ERROR, message, metadata)
}

export const koaLogger = async (ctx, next) => {
  const start = Date.now()
  const startTime = process.hrtime()
  
  await next()
  
  const elapsed = process.hrtime(startTime)
  const responseTime = elapsed[0] * 1000 + elapsed[1] / 1000000
  
  const metadata = {
    method: ctx.method,
    url: ctx.url,
    status: ctx.status,
    responseTime: `${responseTime.toFixed(2)}ms`,
    ip: ctx.ip,
    userAgent: ctx.get('User-Agent')
  }
  
  const level = ctx.status >= 400 ? logLevels.WARN : logLevels.INFO
  const message = `${ctx.method} ${ctx.url} ${ctx.status} - ${responseTime.toFixed(2)}ms`
  
  await writeLog(level, message, metadata)
}

export default logger
