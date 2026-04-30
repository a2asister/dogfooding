import { Context, Next } from 'koa'
import logger from '../utils/logger'
import { query } from '../config/database'

export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next()
  } catch (err: any) {
    logger.error('请求错误:', err)
    
    ctx.status = err.status || 500
    ctx.body = {
      code: err.status || 500,
      message: err.message || '服务器内部错误',
      data: null,
    }
  }
}

export const logOperation = async (
  userId: number,
  action: string,
  targetType: string,
  targetId: number,
  details: string
) => {
  try {
    await query(
      `INSERT INTO operation_logs (user_id, action, target_type, target_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, action, targetType, targetId, details]
    )
  } catch (err) {
    logger.error('记录操作日志失败:', err)
  }
}

export const responseHandler = {
  success: (data: any, message: string = '操作成功') => ({
    code: 200,
    message,
    data,
  }),
  error: (message: string, code: number = 400) => ({
    code,
    message,
    data: null,
  }),
}
