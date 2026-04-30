import { Context } from 'koa'
import { queryOne, query } from '../config/database'
import { comparePassword, generateToken, hashPassword } from '../utils/utils'
import { responseHandler, logOperation } from '../middleware/handler'
import logger from '../utils/logger'

export const login = async (ctx: Context) => {
  const { username, password } = ctx.request.body as any

  if (!username || !password) {
    ctx.body = responseHandler.error('用户名和密码不能为空')
    return
  }

  const user = await queryOne(
    'SELECT * FROM users WHERE username = ?',
    [username]
  )

  if (!user) {
    ctx.body = responseHandler.error('用户不存在')
    return
  }

  if (!comparePassword(password, user.password)) {
    ctx.body = responseHandler.error('密码错误')
    return
  }

  if (user.status !== 'active') {
    ctx.body = responseHandler.error('用户已被禁用')
    return
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
  })

  const { password: _, ...userWithoutPassword } = user

  ctx.body = responseHandler.success({
    user: userWithoutPassword,
    token,
  })

  logger.info(`用户 ${username} 登录成功`)
}

export const adminLogin = async (ctx: Context) => {
  const { username, password } = ctx.request.body as any

  if (!username || !password) {
    ctx.body = responseHandler.error('用户名和密码不能为空')
    return
  }

  const user = await queryOne(
    'SELECT * FROM users WHERE username = ?',
    [username]
  )

  if (!user) {
    ctx.body = responseHandler.error('用户不存在')
    return
  }

  if (user.role !== 'admin' && user.role !== 'staff') {
    ctx.body = responseHandler.error('权限不足')
    return
  }

  if (!comparePassword(password, user.password)) {
    ctx.body = responseHandler.error('密码错误')
    return
  }

  if (user.status !== 'active') {
    ctx.body = responseHandler.error('用户已被禁用')
    return
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
  })

  const { password: _, ...userWithoutPassword } = user

  ctx.body = responseHandler.success({
    user: userWithoutPassword,
    token,
  })

  await logOperation(user.id, 'login', 'user', user.id, '管理员登录')
  logger.info(`管理员 ${username} 登录成功`)
}

export const getProfile = async (ctx: Context) => {
  const userId = ctx.user!.id

  const user = await queryOne(
    'SELECT id, username, name, email, phone, room_number, role, status, created_at, updated_at FROM users WHERE id = ?',
    [userId]
  )

  ctx.body = responseHandler.success(user)
}

export const updateProfile = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { name, email, phone, roomNumber } = ctx.request.body as any

  const result = await query(
    `UPDATE users 
     SET name = COALESCE(?, name), 
         email = COALESCE(?, email), 
         phone = COALESCE(?, phone), 
         room_number = COALESCE(?, room_number),
         updated_at = NOW()
     WHERE id = ?`,
    [name, email, phone, roomNumber, userId]
  )

  if (result.affectedRows > 0) {
    const user = await queryOne(
      'SELECT id, username, name, email, phone, room_number, role, status, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    )
    ctx.body = responseHandler.success(user, '更新成功')
    
    await logOperation(userId, 'update', 'user', userId, '更新个人信息')
  } else {
    ctx.body = responseHandler.error('更新失败')
  }
}
