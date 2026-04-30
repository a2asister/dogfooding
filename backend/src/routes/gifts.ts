import Router from '@koa/router'
import type { Context } from 'koa'
import pool from '../config/database.js'
import logger from '../config/logger.js'
import { NotFoundError, BadRequestError } from '../middleware/errorHandler.js'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'

const router = new Router({ prefix: '/gifts' })

router.get('/featured', optionalAuth, async (ctx: Context) => {
  const now = new Date()
  
  const [rows] = await pool.execute(
    `SELECT 
      g.id, g.name, g.description, g.icon, g.total_count, g.claimed_count,
      ga.id as game_id, ga.name as game_name,
      gt.id as type_id, gt.name as type_name
     FROM gifts g
     JOIN games ga ON g.game_id = ga.id
     JOIN gift_types gt ON g.type_id = gt.id
     WHERE g.is_active = 1 AND g.is_visible = 1
     AND (g.start_time IS NULL OR g.start_time <= ?)
     AND (g.end_time IS NULL OR g.end_time >= ?)
     ORDER BY g.claimed_count DESC
     LIMIT 12`,
    [now, now]
  )

  const gifts = (rows as any[]).map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    totalCount: row.total_count,
    claimedCount: row.claimed_count,
    game: {
      id: row.game_id,
      name: row.game_name,
    },
    type: {
      id: row.type_id,
      name: row.type_name,
    },
  }))

  ctx.body = {
    success: true,
    data: gifts,
  }
})

router.get('/', optionalAuth, async (ctx: Context) => {
  const { gameId, typeId, categoryId, keyword, page = 1, pageSize = 20 } = ctx.query
  
  const offset = (Number(page) - 1) * Number(pageSize)
  const params: any[] = []
  const conditions: string[] = []

  conditions.push('g.is_active = 1 AND g.is_visible = 1')
  conditions.push('(g.start_time IS NULL OR g.start_time <= NOW())')
  conditions.push('(g.end_time IS NULL OR g.end_time >= NOW())')

  if (gameId) {
    conditions.push('g.game_id = ?')
    params.push(Number(gameId))
  }

  if (typeId) {
    conditions.push('g.type_id = ?')
    params.push(Number(typeId))
  }

  if (categoryId) {
    conditions.push('ga.category_id = ?')
    params.push(Number(categoryId))
  }

  if (keyword) {
    conditions.push('(g.name LIKE ? OR g.description LIKE ?)')
    const keywordPattern = `%${keyword}%`
    params.push(keywordPattern, keywordPattern)
  }

  const whereClause = conditions.join(' AND ')

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total FROM gifts g
     JOIN games ga ON g.game_id = ga.id
     WHERE ${whereClause}`,
    params
  )

  const total = (countRows as any[])[0].total

  const [rows] = await pool.execute(
    `SELECT 
      g.id, g.name, g.description, g.icon, g.total_count, g.claimed_count,
      g.start_time, g.end_time,
      ga.id as game_id, ga.name as game_name, ga.icon as game_icon,
      gt.id as type_id, gt.name as type_name
     FROM gifts g
     JOIN games ga ON g.game_id = ga.id
     JOIN gift_types gt ON g.type_id = gt.id
     WHERE ${whereClause}
     ORDER BY g.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  )

  const gifts = (rows as any[]).map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    totalCount: row.total_count,
    claimedCount: row.claimed_count,
    startTime: row.start_time,
    endTime: row.end_time,
    game: {
      id: row.game_id,
      name: row.game_name,
      icon: row.game_icon,
    },
    type: {
      id: row.type_id,
      name: row.type_name,
    },
  }))

  ctx.body = {
    success: true,
    data: {
      items: gifts,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    },
  }
})

router.get('/:id', optionalAuth, async (ctx: Context) => {
  const giftId = ctx.params.id

  const [rows] = await pool.execute(
    `SELECT 
      g.id, g.name, g.description, g.icon, g.total_count, g.claimed_count,
      g.start_time, g.end_time, g.is_active, g.is_visible,
      ga.id as game_id, ga.name as game_name, ga.description as game_description, ga.icon as game_icon,
      gt.id as type_id, gt.name as type_name,
      gc.name as category_name
     FROM gifts g
     JOIN games ga ON g.game_id = ga.id
     JOIN gift_types gt ON g.type_id = gt.id
     JOIN game_categories gc ON ga.category_id = gc.id
     WHERE g.id = ?`,
    [giftId]
  )

  const gifts = rows as any[]
  if (gifts.length === 0) {
    throw new NotFoundError('礼包不存在')
  }

  const gift = gifts[0]

  let userClaimed = false
  if (ctx.state.user) {
    const [claimRows] = await pool.execute(
      'SELECT id FROM claim_records WHERE user_id = ? AND gift_id = ?',
      [ctx.state.user.id, giftId]
    )
    userClaimed = (claimRows as any[]).length > 0
  }

  ctx.body = {
    success: true,
    data: {
      id: gift.id,
      name: gift.name,
      description: gift.description,
      icon: gift.icon,
      totalCount: gift.total_count,
      claimedCount: gift.claimed_count,
      startTime: gift.start_time,
      endTime: gift.end_time,
      isActive: gift.is_active,
      isVisible: gift.is_visible,
      userClaimed,
      game: {
        id: gift.game_id,
        name: gift.game_name,
        description: gift.game_description,
        icon: gift.game_icon,
      },
      type: {
        id: gift.type_id,
        name: gift.type_name,
      },
      category: {
        name: gift.category_name,
      },
    },
  }
})

router.post('/:id/claim', authMiddleware, async (ctx: Context) => {
  const giftId = ctx.params.id
  const userId = ctx.state.user.id
  const ip = ctx.ip || ctx.headers['x-forwarded-for'] || 'unknown'
  const userAgent = ctx.headers['user-agent'] || ''

  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()

    const [giftRows] = await connection.execute(
      `SELECT g.*, 
       (SELECT COUNT(*) FROM gift_codes WHERE gift_id = g.id AND is_claimed = 0) as available_codes
       FROM gifts g 
       WHERE g.id = ? FOR UPDATE`,
      [giftId]
    )

    const gifts = giftRows as any[]
    if (gifts.length === 0) {
      throw new NotFoundError('礼包不存在')
    }

    const gift = gifts[0]
    const now = new Date()

    if (!gift.is_active) {
      throw new BadRequestError('礼包已下架')
    }

    if (gift.start_time && new Date(gift.start_time) > now) {
      throw new BadRequestError('礼包领取时间未到')
    }

    if (gift.end_time && new Date(gift.end_time) < now) {
      throw new BadRequestError('礼包已过期')
    }

    const [claimRows] = await connection.execute(
      'SELECT id FROM claim_records WHERE user_id = ? AND gift_id = ?',
      [userId, giftId]
    )

    if ((claimRows as any[]).length > 0) {
      throw new BadRequestError('您已领取过此礼包')
    }

    if (gift.available_codes <= 0) {
      throw new BadRequestError('礼包码已领完')
    }

    const [codeRows] = await connection.execute(
      'SELECT id, code FROM gift_codes WHERE gift_id = ? AND is_claimed = 0 LIMIT 1 FOR UPDATE',
      [giftId]
    )

    const codes = codeRows as any[]
    if (codes.length === 0) {
      throw new BadRequestError('礼包码已领完')
    }

    const giftCode = codes[0]

    await connection.execute(
      `UPDATE gift_codes 
       SET is_claimed = 1, claimed_by = ?, claimed_at = NOW() 
       WHERE id = ?`,
      [userId, giftCode.id]
    )

    await connection.execute(
      'UPDATE gifts SET claimed_count = claimed_count + 1 WHERE id = ?',
      [giftId]
    )

    await connection.execute(
      `INSERT INTO claim_records 
       (user_id, gift_id, gift_code_id, code, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, giftId, giftCode.id, giftCode.code, ip, userAgent]
    )

    await connection.commit()

    logger.info('Gift claimed', {
      userId,
      giftId,
      giftCodeId: giftCode.id,
      code: giftCode.code,
    })

    ctx.body = {
      success: true,
      data: {
        code: giftCode.code,
        claimedAt: new Date(),
      },
      message: '领取成功',
    }
  } catch (err: any) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
})

router.get('/my/list', authMiddleware, async (ctx: Context) => {
  const userId = ctx.state.user.id
  const { page = 1, pageSize = 20 } = ctx.query
  
  const offset = (Number(page) - 1) * Number(pageSize)

  const [countRows] = await pool.execute(
    'SELECT COUNT(*) as total FROM claim_records WHERE user_id = ?',
    [userId]
  )

  const total = (countRows as any[])[0].total

  const [rows] = await pool.execute(
    `SELECT 
      cr.id, cr.code, cr.claimed_at,
      g.id as gift_id, g.name as gift_name, g.icon as gift_icon,
      ga.name as game_name, ga.icon as game_icon,
      gt.name as type_name,
      gc.is_activated, gc.activated_at
     FROM claim_records cr
     JOIN gifts g ON cr.gift_id = g.id
     JOIN games ga ON g.game_id = ga.id
     JOIN gift_types gt ON g.type_id = gt.id
     JOIN gift_codes gc ON cr.gift_code_id = gc.id
     WHERE cr.user_id = ?
     ORDER BY cr.claimed_at DESC
     LIMIT ? OFFSET ?`,
    [userId, Number(pageSize), offset]
  )

  const claims = (rows as any[]).map(row => ({
    id: row.id,
    code: row.code,
    claimedAt: row.claimed_at,
    isActivated: row.is_activated,
    activatedAt: row.activated_at,
    gift: {
      id: row.gift_id,
      name: row.gift_name,
      icon: row.gift_icon,
    },
    game: {
      name: row.game_name,
      icon: row.game_icon,
    },
    type: {
      name: row.type_name,
    },
  }))

  ctx.body = {
    success: true,
    data: {
      items: claims,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    },
  }
})

router.post('/:id/activate', authMiddleware, async (ctx: Context) => {
  const giftId = ctx.params.id
  const userId = ctx.state.user.id

  const [claimRows] = await pool.execute(
    `SELECT cr.id, cr.gift_code_id, gc.code, gc.is_activated
     FROM claim_records cr
     JOIN gift_codes gc ON cr.gift_code_id = gc.id
     WHERE cr.user_id = ? AND cr.gift_id = ?`,
    [userId, giftId]
  )

  const claims = claimRows as any[]
  if (claims.length === 0) {
    throw new NotFoundError('您未领取此礼包')
  }

  const claim = claims[0]
  if (claim.is_activated) {
    throw new BadRequestError('礼包码已激活')
  }

  await pool.execute(
    'UPDATE gift_codes SET is_activated = 1, activated_at = NOW() WHERE id = ?',
    [claim.gift_code_id]
  )

  logger.info('Gift code activated', {
    userId,
    giftId,
    giftCodeId: claim.gift_code_id,
    code: claim.code,
  })

  ctx.body = {
    success: true,
    message: '激活成功',
  }
})

export default router
