import { Context } from 'koa'
import { query, queryOne } from '../config/database'
import { responseHandler, logOperation } from '../middleware/handler'
import { hashPassword, paginate } from '../utils/utils'

export const getUsers = async (ctx: Context) => {
  const { keyword, page = 1, pageSize = 10 } = ctx.query as any

  let whereClause = 'WHERE 1=1'
  const params: any[] = []

  if (keyword) {
    whereClause += ' AND (username LIKE ? OR name LIKE ? OR phone LIKE ?)'
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
  }

  const { limit, offset } = paginate(parseInt(page), parseInt(pageSize))

  const users = await query(
    `SELECT id, username, name, email, phone, room_number, role, status, created_at, updated_at 
     FROM users 
     ${whereClause} 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )

  const totalResult = await queryOne(
    `SELECT COUNT(*) as total FROM users ${whereClause}`,
    params
  )

  ctx.body = responseHandler.success({
    users,
    total: totalResult.total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  })
}

export const createUser = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { username, password, name, email, phone, roomNumber, role } = ctx.request.body as any

  if (!username || !password) {
    ctx.body = responseHandler.error('用户名和密码不能为空')
    return
  }

  const existingUser = await queryOne(
    'SELECT id FROM users WHERE username = ?',
    [username]
  )

  if (existingUser) {
    ctx.body = responseHandler.error('用户名已存在')
    return
  }

  const hashedPassword = hashPassword(password)

  const result = await query(
    `INSERT INTO users (username, password, name, email, phone, room_number, role, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
    [username, hashedPassword, name, email, phone, roomNumber, role || 'guest']
  )

  ctx.body = responseHandler.success(
    { id: result.insertId },
    '创建成功'
  )

  await logOperation(userId, 'create', 'user', result.insertId, `创建用户: ${username}`)
}

export const updateUser = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { id } = ctx.params
  const { name, email, phone, roomNumber, role, status, password } = ctx.request.body as any

  const updates: any[] = []
  const params: any[] = []

  if (name !== undefined) {
    updates.push('name = ?')
    params.push(name)
  }
  if (email !== undefined) {
    updates.push('email = ?')
    params.push(email)
  }
  if (phone !== undefined) {
    updates.push('phone = ?')
    params.push(phone)
  }
  if (roomNumber !== undefined) {
    updates.push('room_number = ?')
    params.push(roomNumber)
  }
  if (role !== undefined) {
    updates.push('role = ?')
    params.push(role)
  }
  if (status !== undefined) {
    updates.push('status = ?')
    params.push(status)
  }
  if (password) {
    updates.push('password = ?')
    params.push(hashPassword(password))
  }

  if (updates.length === 0) {
    ctx.body = responseHandler.error('没有需要更新的字段')
    return
  }

  updates.push('updated_at = NOW()')
  params.push(id)

  const result = await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    params
  )

  if (result.affectedRows > 0) {
    ctx.body = responseHandler.success(null, '更新成功')
    await logOperation(userId, 'update', 'user', parseInt(id), `更新用户 ID: ${id}`)
  } else {
    ctx.body = responseHandler.error('更新失败')
  }
}

export const deleteUser = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { id } = ctx.params

  if (parseInt(id) === userId) {
    ctx.body = responseHandler.error('不能删除自己的账号')
    return
  }

  const orders = await queryOne(
    'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
    [id]
  )

  if (orders.count > 0) {
    ctx.body = responseHandler.error('该用户存在订单，无法删除')
    return
  }

  const result = await query(
    'DELETE FROM users WHERE id = ?',
    [id]
  )

  if (result.affectedRows > 0) {
    ctx.body = responseHandler.success(null, '删除成功')
    await logOperation(userId, 'delete', 'user', parseInt(id), `删除用户 ID: ${id}`)
  } else {
    ctx.body = responseHandler.error('删除失败')
  }
}
