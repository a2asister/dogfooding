import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { queryOne } from '../config/database'

export interface AuthUser {
  id: number
  username: string
  role: string
}

declare module 'koa' {
  interface Context {
    user?: AuthUser
  }
}

export const authMiddleware = async (ctx: Context, next: Next) => {
  const authorization = ctx.headers.authorization
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: '未授权，请先登录',
      data: null,
    }
    return
  }

  const token = authorization.replace('Bearer ', '')

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthUser
    
    const user = await queryOne(
      'SELECT id, username, name, role, status FROM users WHERE id = ?',
      [decoded.id]
    )

    if (!user) {
      ctx.status = 401
      ctx.body = {
        code: 401,
        message: '用户不存在',
        data: null,
      }
      return
    }

    if (user.status !== 'active') {
      ctx.status = 403
      ctx.body = {
        code: 403,
        message: '用户已被禁用',
        data: null,
      }
      return
    }

    ctx.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    }

    await next()
  } catch (error) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: 'Token 无效或已过期',
      data: null,
    }
  }
}

export const adminMiddleware = async (ctx: Context, next: Next) => {
  if (!ctx.user) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: '未授权',
      data: null,
    }
    return
  }

  if (ctx.user.role !== 'admin' && ctx.user.role !== 'staff') {
    ctx.status = 403
    ctx.body = {
      code: 403,
      message: '权限不足',
      data: null,
    }
    return
  }

  await next()
}
