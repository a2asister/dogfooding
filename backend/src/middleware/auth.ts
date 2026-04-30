import type { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import { UnauthorizedError, ForbiddenError } from './errorHandler.js'
import pool from '../config/database.js'

interface JwtPayload {
  userId: number
  username: string
  isAdmin: boolean
}

export const authMiddleware = async (ctx: Context, next: Next) => {
  const authHeader = ctx.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('未提供认证令牌')
  }

  const token = authHeader.substring(7)

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, secret) as JwtPayload

    const [rows] = await pool.execute(
      'SELECT id, username, phone, email, avatar, is_verified, is_admin FROM users WHERE id = ?',
      [decoded.userId]
    )

    const users = rows as any[]
    if (users.length === 0) {
      throw new UnauthorizedError('用户不存在')
    }

    const user = users[0]
    ctx.state.user = {
      id: user.id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.is_verified,
      isAdmin: user.is_admin,
    }

    await next()
  } catch (err: any) {
    if (err instanceof UnauthorizedError) {
      throw err
    }
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('令牌已过期')
    }
    if (err.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('无效的令牌')
    }
    throw new UnauthorizedError('认证失败')
  }
}

export const adminMiddleware = async (ctx: Context, next: Next) => {
  const user = ctx.state.user

  if (!user) {
    throw new UnauthorizedError('未登录')
  }

  if (!user.isAdmin) {
    throw new ForbiddenError('需要管理员权限')
  }

  await next()
}

export const optionalAuth = async (ctx: Context, next: Next) => {
  const authHeader = ctx.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)

    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key'
      const decoded = jwt.verify(token, secret) as JwtPayload

      const [rows] = await pool.execute(
        'SELECT id, username, phone, email, avatar, is_verified, is_admin FROM users WHERE id = ?',
        [decoded.userId]
      )

      const users = rows as any[]
      if (users.length > 0) {
        const user = users[0]
        ctx.state.user = {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          isVerified: user.is_verified,
          isAdmin: user.is_admin,
        }
      }
    } catch {
    }
  }

  await next()
}
