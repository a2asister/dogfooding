import type { Context, Next } from 'koa'
import logger from '../config/logger.js'

class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404)
  }
}

export class BadRequestError extends AppError {
  constructor(message = '请求参数错误') {
    super(message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '未授权访问') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '无权限访问') {
    super(message, 403)
  }
}

export class ConflictError extends AppError {
  constructor(message = '资源冲突') {
    super(message, 409)
  }
}

const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next()

    if (ctx.status === 404 && !ctx.body) {
      throw new NotFoundError('接口不存在')
    }
  } catch (err: any) {
    const statusCode = err.statusCode || err.status || 500
    const message = err.isOperational ? err.message : '服务器内部错误'

    if (statusCode >= 500) {
      logger.error(`${ctx.method} ${ctx.path}`, {
        status: statusCode,
        message: err.message,
        stack: err.stack,
        requestId: ctx.state.requestId,
      })
    } else {
      logger.warn(`${ctx.method} ${ctx.path}`, {
        status: statusCode,
        message: err.message,
        requestId: ctx.state.requestId,
      })
    }

    ctx.status = statusCode
    ctx.body = {
      success: false,
      error: {
        message,
        code: statusCode,
      },
    }
  }
}

export default errorHandler
