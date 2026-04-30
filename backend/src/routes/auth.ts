import Router from '@koa/router'
import type { Context } from 'koa'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database.js'
import logger from '../config/logger.js'
import { BadRequestError, UnauthorizedError, ConflictError } from '../middleware/errorHandler.js'
import { authMiddleware } from '../middleware/auth.js'

const router = new Router({ prefix: '/auth' })

const generateToken = (user: { id: number; username: string; isAdmin: boolean }) => {
  const secret = (process.env.JWT_SECRET || 'your-secret-key') as string
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as string
  
  return jwt.sign(
    { userId: user.id, username: user.username, isAdmin: user.isAdmin },
    secret,
    { expiresIn } as jwt.SignOptions
  )
}

router.post('/register', async (ctx: Context) => {
  const { username, password, phone, email } = ctx.request.body as {
    username: string
    password: string
    phone?: string
    email?: string
  }

  if (!username || !password) {
    throw new BadRequestError('用户名和密码不能为空')
  }

  if (username.length < 3 || username.length > 20) {
    throw new BadRequestError('用户名长度应为3-20个字符')
  }

  if (password.length < 6) {
    throw new BadRequestError('密码长度至少为6个字符')
  }

  const [existingUsers] = await pool.execute(
    'SELECT id FROM users WHERE username = ?',
    [username]
  )

  if ((existingUsers as any[]).length > 0) {
    throw new ConflictError('用户名已存在')
  }

  if (phone) {
    const [existingPhones] = await pool.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    )
    if ((existingPhones as any[]).length > 0) {
      throw new ConflictError('手机号已被注册')
    }
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10')
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  const [result] = await pool.execute(
    `INSERT INTO users (username, password, phone, email, is_verified, is_admin)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [username, hashedPassword, phone || null, email || null, !!phone]
  )

  const insertResult = result as any
  const userId = insertResult.insertId

  const [userRows] = await pool.execute(
    'SELECT id, username, phone, email, avatar, is_verified, is_admin FROM users WHERE id = ?',
    [userId]
  )

  const users = userRows as any[]
  const user = users[0]
  const token = generateToken({ id: user.id, username: user.username, isAdmin: user.is_admin })

  logger.info('User registered', { userId: user.id, username: user.username })

  ctx.status = 201
  ctx.body = {
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.is_verified,
        isAdmin: user.is_admin,
      },
      token,
    },
  }
})

router.post('/login', async (ctx: Context) => {
  const { username, password } = ctx.request.body as {
    username: string
    password: string
  }

  if (!username || !password) {
    throw new BadRequestError('用户名和密码不能为空')
  }

  const [userRows] = await pool.execute(
    'SELECT * FROM users WHERE username = ?',
    [username]
  )

  const users = userRows as any[]
  if (users.length === 0) {
    throw new UnauthorizedError('用户名或密码错误')
  }

  const user = users[0]
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new UnauthorizedError('用户名或密码错误')
  }

  await pool.execute(
    'UPDATE users SET last_login_at = NOW() WHERE id = ?',
    [user.id]
  )

  const token = generateToken({ id: user.id, username: user.username, isAdmin: user.is_admin })

  logger.info('User logged in', { userId: user.id, username: user.username })

  ctx.body = {
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.is_verified,
        isAdmin: user.is_admin,
      },
      token,
    },
  }
})

router.get('/me', authMiddleware, async (ctx: Context) => {
  const user = ctx.state.user

  ctx.body = {
    success: true,
    data: {
      id: user.id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
    },
  }
})

router.post('/phone-login', async (ctx: Context) => {
  const { phone, code } = ctx.request.body as {
    phone: string
    code: string
  }

  if (!phone || !code) {
    throw new BadRequestError('手机号和验证码不能为空')
  }

  if (code !== '123456') {
    throw new BadRequestError('验证码错误')
  }

  let [userRows] = await pool.execute(
    'SELECT * FROM users WHERE phone = ?',
    [phone]
  )

  let users = userRows as any[]
  let user: any

  if (users.length === 0) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10')
    const randomPassword = Math.random().toString(36).substring(2, 15)
    const hashedPassword = await bcrypt.hash(randomPassword, saltRounds)
    const username = `user_${Date.now()}`

    const [result] = await pool.execute(
      `INSERT INTO users (username, password, phone, is_verified, is_admin)
       VALUES (?, ?, ?, 1, 0)`,
      [username, hashedPassword, phone]
    )

    const insertResult = result as any
    const userId = insertResult.insertId

    const [newUserRows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    )
    user = (newUserRows as any[])[0]

    logger.info('New user created via phone login', { userId: user.id, phone })
  } else {
    user = users[0]
    await pool.execute(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    )
  }

  const token = generateToken({ id: user.id, username: user.username, isAdmin: user.is_admin })

  logger.info('User logged in via phone', { userId: user.id, phone })

  ctx.body = {
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.is_verified,
        isAdmin: user.is_admin,
      },
      token,
    },
  }
})

export default router
