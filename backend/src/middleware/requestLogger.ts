import type { Context, Next } from 'koa'
import { v4 as uuidv4 } from 'uuid'
import logger from '../config/logger.js'
import pool from '../config/database.js'

const requestLogger = async (ctx: Context, next: Next) => {
  const requestId = uuidv4()
  ctx.state.requestId = requestId

  const startTime = Date.now()
  const method = ctx.method
  const path = ctx.path
  const ip = ctx.ip || ctx.headers['x-forwarded-for'] || 'unknown'
  const userAgent = ctx.headers['user-agent'] || ''
  const queryParams = JSON.stringify(ctx.query)
  let requestBody = ''

  if (ctx.request.body && Object.keys(ctx.request.body as object).length > 0) {
    const body = { ...ctx.request.body } as Record<string, any>
    if (body.password) body.password = '***'
    if (body.confirmPassword) body.confirmPassword = '***'
    requestBody = JSON.stringify(body)
  }

  logger.info(`[${requestId}] ${method} ${path}`, {
    ip,
    userAgent,
    queryParams: ctx.query,
    requestBody: requestBody ? JSON.parse(requestBody) : undefined,
  })

  try {
    await next()

    const responseTime = Date.now() - startTime
    const statusCode = ctx.status

    logger.info(`[${requestId}] ${method} ${path} ${statusCode} (${responseTime}ms)`, {
      responseTime,
      statusCode,
    })

    try {
      await pool.execute(
        `INSERT INTO request_logs 
         (request_id, method, path, query_params, request_body, status_code, response_time, ip_address, user_agent, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          requestId,
          method,
          path,
          queryParams,
          requestBody || null,
          statusCode,
          responseTime,
          ip,
          userAgent,
          ctx.state.user?.id || null,
        ]
      )
    } catch (dbError) {
      logger.error('Failed to save request log to database', { error: dbError })
    }
  } catch (err: any) {
    const responseTime = Date.now() - startTime
    const statusCode = err.statusCode || err.status || 500

    logger.error(`[${requestId}] ${method} ${path} ${statusCode} (${responseTime}ms)`, {
      error: err.message,
      stack: err.stack,
    })

    try {
      await pool.execute(
        `INSERT INTO request_logs 
         (request_id, method, path, query_params, request_body, status_code, response_time, ip_address, user_agent, user_id, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          requestId,
          method,
          path,
          queryParams,
          requestBody || null,
          statusCode,
          responseTime,
          ip,
          userAgent,
          ctx.state.user?.id || null,
          err.message,
        ]
      )
    } catch (dbError) {
      logger.error('Failed to save error log to database', { error: dbError })
    }

    throw err
  }
}

export default requestLogger
