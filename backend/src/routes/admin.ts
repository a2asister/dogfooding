import Router from '@koa/router'
import type { Context } from 'koa'
import pool from '../config/database.js'
import logger from '../config/logger.js'
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = new Router({ prefix: '/admin' })

router.use(authMiddleware, adminMiddleware)

router.get('/users', async (ctx: Context) => {
  const { page = 1, pageSize = 20, keyword } = ctx.query
  
  const offset = (Number(page) - 1) * Number(pageSize)
  const params: any[] = []
  const conditions: string[] = ['1=1']

  if (keyword) {
    conditions.push('(username LIKE ? OR phone LIKE ? OR email LIKE ?)')
    const keywordPattern = `%${keyword}%`
    params.push(keywordPattern, keywordPattern, keywordPattern)
  }

  const whereClause = conditions.join(' AND ')

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
    params
  )

  const total = (countRows as any[])[0].total

  const [rows] = await pool.execute(
    `SELECT 
      id, username, phone, email, avatar, is_verified, is_admin, 
      last_login_at, created_at, updated_at
     FROM users 
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  )

  ctx.body = {
    success: true,
    data: {
      items: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    },
  }
})

router.get('/users/:id', async (ctx: Context) => {
  const userId = ctx.params.id

  const [rows] = await pool.execute(
    `SELECT 
      id, username, phone, email, avatar, is_verified, is_admin, 
      last_login_at, created_at, updated_at
     FROM users WHERE id = ?`,
    [userId]
  )

  const users = rows as any[]
  if (users.length === 0) {
    throw new NotFoundError('用户不存在')
  }

  const [claimRows] = await pool.execute(
    `SELECT COUNT(*) as count FROM claim_records WHERE user_id = ?`,
    [userId]
  )

  const claims = claimRows as any[]

  ctx.body = {
    success: true,
    data: {
      ...users[0],
      claimCount: claims[0]?.count || 0,
    },
  }
})

router.put('/users/:id', async (ctx: Context) => {
  const userId = ctx.params.id
  const { isVerified, isAdmin } = ctx.request.body as {
    isVerified?: boolean
    isAdmin?: boolean
  }

  const [rows] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId])
  if ((rows as any[]).length === 0) {
    throw new NotFoundError('用户不存在')
  }

  const updates: string[] = []
  const params: any[] = []

  if (isVerified !== undefined) {
    updates.push('is_verified = ?')
    params.push(isVerified ? 1 : 0)
  }

  if (isAdmin !== undefined) {
    updates.push('is_admin = ?')
    params.push(isAdmin ? 1 : 0)
  }

  if (updates.length > 0) {
    params.push(userId)
    await pool.execute(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params
    )

    logger.info('User updated by admin', {
      adminId: ctx.state.user.id,
      userId,
      updates,
    })
  }

  ctx.body = {
    success: true,
    message: '更新成功',
  }
})

router.get('/gifts', async (ctx: Context) => {
  const { page = 1, pageSize = 20, keyword, gameId, typeId, isActive } = ctx.query
  
  const offset = (Number(page) - 1) * Number(pageSize)
  const params: any[] = []
  const conditions: string[] = ['1=1']

  if (keyword) {
    conditions.push('(g.name LIKE ? OR g.description LIKE ?)')
    const keywordPattern = `%${keyword}%`
    params.push(keywordPattern, keywordPattern)
  }

  if (gameId) {
    conditions.push('g.game_id = ?')
    params.push(Number(gameId))
  }

  if (typeId) {
    conditions.push('g.type_id = ?')
    params.push(Number(typeId))
  }

  if (isActive !== undefined) {
    conditions.push('g.is_active = ?')
    params.push(isActive === 'true' ? 1 : 0)
  }

  const whereClause = conditions.join(' AND ')

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total FROM gifts g WHERE ${whereClause}`,
    params
  )

  const total = (countRows as any[])[0].total

  const [rows] = await pool.execute(
    `SELECT 
      g.*,
      ga.name as game_name,
      gt.name as type_name,
      (SELECT COUNT(*) FROM gift_codes WHERE gift_id = g.id AND is_claimed = 0) as available_codes
     FROM gifts g
     JOIN games ga ON g.game_id = ga.id
     JOIN gift_types gt ON g.type_id = gt.id
     WHERE ${whereClause}
     ORDER BY g.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  )

  ctx.body = {
    success: true,
    data: {
      items: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    },
  }
})

router.post('/gifts', async (ctx: Context) => {
  const {
    gameId,
    typeId,
    name,
    description,
    icon,
    totalCount,
    startTime,
    endTime,
    isVisible,
    isActive,
  } = ctx.request.body as {
    gameId: number
    typeId: number
    name: string
    description: string
    icon?: string
    totalCount: number
    startTime?: string
    endTime?: string
    isVisible?: boolean
    isActive?: boolean
  }

  if (!gameId || !typeId || !name || !totalCount) {
    throw new BadRequestError('缺少必要参数')
  }

  const [gameRows] = await pool.execute('SELECT id FROM games WHERE id = ?', [gameId])
  if ((gameRows as any[]).length === 0) {
    throw new BadRequestError('游戏不存在')
  }

  const [typeRows] = await pool.execute('SELECT id FROM gift_types WHERE id = ?', [typeId])
  if ((typeRows as any[]).length === 0) {
    throw new BadRequestError('礼包类型不存在')
  }

  const [result] = await pool.execute(
    `INSERT INTO gifts 
     (game_id, type_id, name, description, icon, total_count, start_time, end_time, is_visible, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      gameId,
      typeId,
      name,
      description,
      icon || null,
      totalCount,
      startTime || null,
      endTime || null,
      isVisible !== false ? 1 : 0,
      isActive !== false ? 1 : 0,
    ]
  )

  const insertResult = result as any
  const giftId = insertResult.insertId

  logger.info('Gift created', {
    adminId: ctx.state.user.id,
    giftId,
    name,
  })

  ctx.status = 201
  ctx.body = {
    success: true,
    data: {
      id: giftId,
    },
    message: '创建成功',
  }
})

router.put('/gifts/:id', async (ctx: Context) => {
  const giftId = ctx.params.id
  const {
    gameId,
    typeId,
    name,
    description,
    icon,
    totalCount,
    startTime,
    endTime,
    isVisible,
    isActive,
  } = ctx.request.body as any

  const [rows] = await pool.execute('SELECT id FROM gifts WHERE id = ?', [giftId])
  if ((rows as any[]).length === 0) {
    throw new NotFoundError('礼包不存在')
  }

  const updates: string[] = []
  const params: any[] = []

  if (gameId !== undefined) {
    updates.push('game_id = ?')
    params.push(gameId)
  }
  if (typeId !== undefined) {
    updates.push('type_id = ?')
    params.push(typeId)
  }
  if (name !== undefined) {
    updates.push('name = ?')
    params.push(name)
  }
  if (description !== undefined) {
    updates.push('description = ?')
    params.push(description)
  }
  if (icon !== undefined) {
    updates.push('icon = ?')
    params.push(icon || null)
  }
  if (totalCount !== undefined) {
    updates.push('total_count = ?')
    params.push(totalCount)
  }
  if (startTime !== undefined) {
    updates.push('start_time = ?')
    params.push(startTime || null)
  }
  if (endTime !== undefined) {
    updates.push('end_time = ?')
    params.push(endTime || null)
  }
  if (isVisible !== undefined) {
    updates.push('is_visible = ?')
    params.push(isVisible ? 1 : 0)
  }
  if (isActive !== undefined) {
    updates.push('is_active = ?')
    params.push(isActive ? 1 : 0)
  }

  if (updates.length > 0) {
    updates.push('updated_at = NOW()')
    params.push(giftId)
    await pool.execute(
      `UPDATE gifts SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    logger.info('Gift updated', {
      adminId: ctx.state.user.id,
      giftId,
      updates,
    })
  }

  ctx.body = {
    success: true,
    message: '更新成功',
  }
})

router.delete('/gifts/:id', async (ctx: Context) => {
  const giftId = ctx.params.id

  const [rows] = await pool.execute('SELECT id FROM gifts WHERE id = ?', [giftId])
  if ((rows as any[]).length === 0) {
    throw new NotFoundError('礼包不存在')
  }

  await pool.execute('DELETE FROM claim_records WHERE gift_id = ?', [giftId])
  await pool.execute('DELETE FROM gift_codes WHERE gift_id = ?', [giftId])
  await pool.execute('DELETE FROM gifts WHERE id = ?', [giftId])

  logger.info('Gift deleted', {
    adminId: ctx.state.user.id,
    giftId,
  })

  ctx.body = {
    success: true,
    message: '删除成功',
  }
})

router.post('/gifts/:id/codes/import', async (ctx: Context) => {
  const giftId = ctx.params.id
  const { codes } = ctx.request.body as { codes: string[] }

  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    throw new BadRequestError('请提供礼包码列表')
  }

  const [rows] = await pool.execute('SELECT id FROM gifts WHERE id = ?', [giftId])
  if ((rows as any[]).length === 0) {
    throw new NotFoundError('礼包不存在')
  }

  const uniqueCodes = [...new Set(codes.filter(code => code && code.trim()))]
  
  if (uniqueCodes.length === 0) {
    throw new BadRequestError('没有有效的礼包码')
  }

  const values = uniqueCodes.map(() => `(?, ${giftId})`).join(', ')
  const params = uniqueCodes

  try {
    await pool.execute(
      `INSERT IGNORE INTO gift_codes (code, gift_id) VALUES ${values}`,
      params
    )

    logger.info('Gift codes imported', {
      adminId: ctx.state.user.id,
      giftId,
      count: uniqueCodes.length,
    })

    ctx.body = {
      success: true,
      data: {
        imported: uniqueCodes.length,
      },
      message: `成功导入 ${uniqueCodes.length} 个礼包码`,
    }
  } catch (err: any) {
    throw new BadRequestError('导入失败：' + err.message)
  }
})

router.get('/games', async (ctx: Context) => {
  const { page = 1, pageSize = 20, keyword, categoryId } = ctx.query
  
  const offset = (Number(page) - 1) * Number(pageSize)
  const params: any[] = []
  const conditions: string[] = ['1=1']

  if (keyword) {
    conditions.push('(g.name LIKE ? OR g.description LIKE ?)')
    const keywordPattern = `%${keyword}%`
    params.push(keywordPattern, keywordPattern)
  }

  if (categoryId) {
    conditions.push('g.category_id = ?')
    params.push(Number(categoryId))
  }

  const whereClause = conditions.join(' AND ')

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total FROM games g WHERE ${whereClause}`,
    params
  )

  const total = (countRows as any[])[0].total

  const [rows] = await pool.execute(
    `SELECT 
      g.*, gc.name as category_name
     FROM games g
     JOIN game_categories gc ON g.category_id = gc.id
     WHERE ${whereClause}
     ORDER BY g.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  )

  ctx.body = {
    success: true,
    data: {
      items: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    },
  }
})

router.post('/games', async (ctx: Context) => {
  const { categoryId, name, description, icon, publisher, isActive } = ctx.request.body as {
    categoryId: number
    name: string
    description: string
    icon?: string
    publisher?: string
    isActive?: boolean
  }

  if (!categoryId || !name) {
    throw new BadRequestError('缺少必要参数')
  }

  const [categoryRows] = await pool.execute('SELECT id FROM game_categories WHERE id = ?', [categoryId])
  if ((categoryRows as any[]).length === 0) {
    throw new BadRequestError('分类不存在')
  }

  const [result] = await pool.execute(
    `INSERT INTO games 
     (category_id, name, description, icon, publisher, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      categoryId,
      name,
      description || '',
      icon || null,
      publisher || null,
      isActive !== false ? 1 : 0,
    ]
  )

  const insertResult = result as any
  const gameId = insertResult.insertId

  logger.info('Game created', {
    adminId: ctx.state.user.id,
    gameId,
    name,
  })

  ctx.status = 201
  ctx.body = {
    success: true,
    data: {
      id: gameId,
    },
    message: '创建成功',
  }
})

router.put('/games/:id', async (ctx: Context) => {
  const gameId = ctx.params.id
  const { categoryId, name, description, icon, publisher, isActive } = ctx.request.body as any

  const [rows] = await pool.execute('SELECT id FROM games WHERE id = ?', [gameId])
  if ((rows as any[]).length === 0) {
    throw new NotFoundError('游戏不存在')
  }

  const updates: string[] = []
  const params: any[] = []

  if (categoryId !== undefined) {
    updates.push('category_id = ?')
    params.push(categoryId)
  }
  if (name !== undefined) {
    updates.push('name = ?')
    params.push(name)
  }
  if (description !== undefined) {
    updates.push('description = ?')
    params.push(description)
  }
  if (icon !== undefined) {
    updates.push('icon = ?')
    params.push(icon || null)
  }
  if (publisher !== undefined) {
    updates.push('publisher = ?')
    params.push(publisher || null)
  }
  if (isActive !== undefined) {
    updates.push('is_active = ?')
    params.push(isActive ? 1 : 0)
  }

  if (updates.length > 0) {
    updates.push('updated_at = NOW()')
    params.push(gameId)
    await pool.execute(
      `UPDATE games SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    logger.info('Game updated', {
      adminId: ctx.state.user.id,
      gameId,
      updates,
    })
  }

  ctx.body = {
    success: true,
    message: '更新成功',
  }
})

router.delete('/games/:id', async (ctx: Context) => {
  const gameId = ctx.params.id

  const [rows] = await pool.execute('SELECT id FROM games WHERE id = ?', [gameId])
  if ((rows as any[]).length === 0) {
    throw new NotFoundError('游戏不存在')
  }

  const [giftRows] = await pool.execute('SELECT id FROM gifts WHERE game_id = ?', [gameId])
  const giftIds = (giftRows as any[]).map(g => g.id)

  if (giftIds.length > 0) {
    await pool.execute(`DELETE FROM claim_records WHERE gift_id IN (${giftIds.map(() => '?').join(',')})`, giftIds)
    await pool.execute(`DELETE FROM gift_codes WHERE gift_id IN (${giftIds.map(() => '?').join(',')})`, giftIds)
    await pool.execute(`DELETE FROM gifts WHERE game_id = ?`, [gameId])
  }

  await pool.execute('DELETE FROM games WHERE id = ?', [gameId])

  logger.info('Game deleted', {
    adminId: ctx.state.user.id,
    gameId,
  })

  ctx.body = {
    success: true,
    message: '删除成功',
  }
})

router.get('/categories', async (ctx: Context) => {
  const [rows] = await pool.execute(
    `SELECT * FROM game_categories ORDER BY sort_order ASC, id ASC`
  )

  ctx.body = {
    success: true,
    data: rows,
  }
})

router.post('/categories', async (ctx: Context) => {
  const { name, description, sortOrder, isActive } = ctx.request.body as {
    name: string
    description?: string
    sortOrder?: number
    isActive?: boolean
  }

  if (!name) {
    throw new BadRequestError('分类名称不能为空')
  }

  const [result] = await pool.execute(
    `INSERT INTO game_categories (name, description, sort_order, is_active)
     VALUES (?, ?, ?, ?)`,
    [name, description || '', sortOrder || 0, isActive !== false ? 1 : 0]
  )

  const insertResult = result as any

  logger.info('Category created', {
    adminId: ctx.state.user.id,
    categoryId: insertResult.insertId,
    name,
  })

  ctx.status = 201
  ctx.body = {
    success: true,
    data: {
      id: insertResult.insertId,
    },
    message: '创建成功',
  }
})

router.put('/categories/:id', async (ctx: Context) => {
  const categoryId = ctx.params.id
  const { name, description, sortOrder, isActive } = ctx.request.body as any

  const [rows] = await pool.execute('SELECT id FROM game_categories WHERE id = ?', [categoryId])
  if ((rows as any[]).length === 0) {
    throw new NotFoundError('分类不存在')
  }

  const updates: string[] = []
  const params: any[] = []

  if (name !== undefined) {
    updates.push('name = ?')
    params.push(name)
  }
  if (description !== undefined) {
    updates.push('description = ?')
    params.push(description)
  }
  if (sortOrder !== undefined) {
    updates.push('sort_order = ?')
    params.push(sortOrder)
  }
  if (isActive !== undefined) {
    updates.push('is_active = ?')
    params.push(isActive ? 1 : 0)
  }

  if (updates.length > 0) {
    updates.push('updated_at = NOW()')
    params.push(categoryId)
    await pool.execute(
      `UPDATE game_categories SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    logger.info('Category updated', {
      adminId: ctx.state.user.id,
      categoryId,
      updates,
    })
  }

  ctx.body = {
    success: true,
    message: '更新成功',
  }
})

router.delete('/categories/:id', async (ctx: Context) => {
  const categoryId = ctx.params.id

  const [rows] = await pool.execute('SELECT id FROM game_categories WHERE id = ?', [categoryId])
  if ((rows as any[]).length === 0) {
    throw new NotFoundError('分类不存在')
  }

  const [gameRows] = await pool.execute('SELECT id FROM games WHERE category_id = ?', [categoryId])
  if ((gameRows as any[]).length > 0) {
    throw new BadRequestError('该分类下有游戏，无法删除')
  }

  await pool.execute('DELETE FROM game_categories WHERE id = ?', [categoryId])

  logger.info('Category deleted', {
    adminId: ctx.state.user.id,
    categoryId,
  })

  ctx.body = {
    success: true,
    message: '删除成功',
  }
})

router.get('/gift-types', async (ctx: Context) => {
  const [rows] = await pool.execute(
    `SELECT * FROM gift_types ORDER BY sort_order ASC, id ASC`
  )

  ctx.body = {
    success: true,
    data: rows,
  }
})

router.post('/gift-types', async (ctx: Context) => {
  const { name, description, sortOrder, isActive } = ctx.request.body as {
    name: string
    description?: string
    sortOrder?: number
    isActive?: boolean
  }

  if (!name) {
    throw new BadRequestError('类型名称不能为空')
  }

  const [result] = await pool.execute(
    `INSERT INTO gift_types (name, description, sort_order, is_active)
     VALUES (?, ?, ?, ?)`,
    [name, description || '', sortOrder || 0, isActive !== false ? 1 : 0]
  )

  const insertResult = result as any

  logger.info('Gift type created', {
    adminId: ctx.state.user.id,
    typeId: insertResult.insertId,
    name,
  })

  ctx.status = 201
  ctx.body = {
    success: true,
    data: {
      id: insertResult.insertId,
    },
    message: '创建成功',
  }
})

router.put('/gift-types/:id', async (ctx: Context) => {
  const typeId = ctx.params.id
  const { name, description, sortOrder, isActive } = ctx.request.body as any

  const [rows] = await pool.execute('SELECT id FROM gift_types WHERE id = ?', [typeId])
  if ((rows as any[]).length === 0) {
    throw new NotFoundError('类型不存在')
  }

  const updates: string[] = []
  const params: any[] = []

  if (name !== undefined) {
    updates.push('name = ?')
    params.push(name)
  }
  if (description !== undefined) {
    updates.push('description = ?')
    params.push(description)
  }
  if (sortOrder !== undefined) {
    updates.push('sort_order = ?')
    params.push(sortOrder)
  }
  if (isActive !== undefined) {
    updates.push('is_active = ?')
    params.push(isActive ? 1 : 0)
  }

  if (updates.length > 0) {
    updates.push('updated_at = NOW()')
    params.push(typeId)
    await pool.execute(
      `UPDATE gift_types SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    logger.info('Gift type updated', {
      adminId: ctx.state.user.id,
      typeId,
      updates,
    })
  }

  ctx.body = {
    success: true,
    message: '更新成功',
  }
})

router.delete('/gift-types/:id', async (ctx: Context) => {
  const typeId = ctx.params.id

  const [rows] = await pool.execute('SELECT id FROM gift_types WHERE id = ?', [typeId])
  if ((rows as any[]).length === 0) {
    throw new NotFoundError('类型不存在')
  }

  const [giftRows] = await pool.execute('SELECT id FROM gifts WHERE type_id = ?', [typeId])
  if ((giftRows as any[]).length > 0) {
    throw new BadRequestError('该类型下有礼包，无法删除')
  }

  await pool.execute('DELETE FROM gift_types WHERE id = ?', [typeId])

  logger.info('Gift type deleted', {
    adminId: ctx.state.user.id,
    typeId,
  })

  ctx.body = {
    success: true,
    message: '删除成功',
  }
})

router.get('/logs/request', async (ctx: Context) => {
  const { page = 1, pageSize = 20, method, statusCode, startTime, endTime } = ctx.query
  
  const offset = (Number(page) - 1) * Number(pageSize)
  const params: any[] = []
  const conditions: string[] = ['1=1']

  if (method) {
    conditions.push('method = ?')
    params.push(method)
  }

  if (statusCode) {
    conditions.push('status_code = ?')
    params.push(statusCode)
  }

  if (startTime) {
    conditions.push('created_at >= ?')
    params.push(startTime)
  }

  if (endTime) {
    conditions.push('created_at <= ?')
    params.push(endTime)
  }

  const whereClause = conditions.join(' AND ')

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total FROM request_logs WHERE ${whereClause}`,
    params
  )

  const total = (countRows as any[])[0].total

  const [rows] = await pool.execute(
    `SELECT * FROM request_logs 
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  )

  ctx.body = {
    success: true,
    data: {
      items: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    },
  }
})

router.get('/logs/operation', async (ctx: Context) => {
  const { page = 1, pageSize = 20, action, module, userId, startTime, endTime } = ctx.query
  
  const offset = (Number(page) - 1) * Number(pageSize)
  const params: any[] = []
  const conditions: string[] = ['1=1']

  if (action) {
    conditions.push('action = ?')
    params.push(action)
  }

  if (module) {
    conditions.push('module = ?')
    params.push(module)
  }

  if (userId) {
    conditions.push('user_id = ?')
    params.push(userId)
  }

  if (startTime) {
    conditions.push('created_at >= ?')
    params.push(startTime)
  }

  if (endTime) {
    conditions.push('created_at <= ?')
    params.push(endTime)
  }

  const whereClause = conditions.join(' AND ')

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total FROM operation_logs WHERE ${whereClause}`,
    params
  )

  const total = (countRows as any[])[0].total

  const [rows] = await pool.execute(
    `SELECT * FROM operation_logs 
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  )

  ctx.body = {
    success: true,
    data: {
      items: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    },
  }
})

router.get('/logs/error', async (ctx: Context) => {
  const { page = 1, pageSize = 20, level, startTime, endTime } = ctx.query
  
  const offset = (Number(page) - 1) * Number(pageSize)
  const params: any[] = []
  const conditions: string[] = ['1=1']

  if (level) {
    conditions.push('level = ?')
    params.push(level)
  }

  if (startTime) {
    conditions.push('created_at >= ?')
    params.push(startTime)
  }

  if (endTime) {
    conditions.push('created_at <= ?')
    params.push(endTime)
  }

  const whereClause = conditions.join(' AND ')

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total FROM error_logs WHERE ${whereClause}`,
    params
  )

  const total = (countRows as any[])[0].total

  const [rows] = await pool.execute(
    `SELECT * FROM error_logs 
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  )

  ctx.body = {
    success: true,
    data: {
      items: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    },
  }
})

export default router
