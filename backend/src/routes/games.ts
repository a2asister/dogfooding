import Router from '@koa/router'
import type { Context } from 'koa'
import pool from '../config/database.js'
import { optionalAuth } from '../middleware/auth.js'

const router = new Router({ prefix: '/games' })

router.get('/categories', async (ctx: Context) => {
  const [rows] = await pool.execute(
    `SELECT gc.id, gc.name, gc.description, gc.sort_order,
     COUNT(DISTINCT g.id) as game_count
     FROM game_categories gc
     LEFT JOIN games g ON gc.id = g.category_id AND g.is_active = 1
     WHERE gc.is_active = 1
     GROUP BY gc.id, gc.name, gc.description, gc.sort_order
     ORDER BY gc.sort_order ASC, gc.id ASC`
  )

  const categories = (rows as any[]).map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
    gameCount: row.game_count,
  }))

  ctx.body = {
    success: true,
    data: categories,
  }
})

router.get('/featured', optionalAuth, async (ctx: Context) => {
  const [rows] = await pool.execute(
    `SELECT 
      g.id, g.name, g.icon, g.description,
      gc.id as category_id, gc.name as category_name,
      (SELECT COUNT(*) FROM gifts WHERE game_id = g.id AND is_active = 1 AND is_visible = 1) as gift_count
     FROM games g
     JOIN game_categories gc ON g.category_id = gc.id
     WHERE g.is_active = 1
     ORDER BY gift_count DESC, g.id DESC
     LIMIT 10`
  )

  const games = (rows as any[]).map(row => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    description: row.description,
    giftCount: row.gift_count,
    category: {
      id: row.category_id,
      name: row.category_name,
    },
  }))

  ctx.body = {
    success: true,
    data: games,
  }
})

router.get('/', optionalAuth, async (ctx: Context) => {
  const { categoryId, keyword, page = 1, pageSize = 20 } = ctx.query
  
  const offset = (Number(page) - 1) * Number(pageSize)
  const params: any[] = []
  const conditions: string[] = []

  conditions.push('g.is_active = 1')

  if (categoryId) {
    conditions.push('g.category_id = ?')
    params.push(Number(categoryId))
  }

  if (keyword) {
    conditions.push('(g.name LIKE ? OR g.description LIKE ?)')
    const keywordPattern = `%${keyword}%`
    params.push(keywordPattern, keywordPattern)
  }

  const whereClause = conditions.join(' AND ')

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) as total FROM games g WHERE ${whereClause}`,
    params
  )

  const total = (countRows as any[])[0].total

  const [rows] = await pool.execute(
    `SELECT 
      g.id, g.name, g.icon, g.description, g.publisher,
      gc.id as category_id, gc.name as category_name,
      (SELECT COUNT(*) FROM gifts WHERE game_id = g.id AND is_active = 1 AND is_visible = 1) as gift_count
     FROM games g
     JOIN game_categories gc ON g.category_id = gc.id
     WHERE ${whereClause}
     ORDER BY g.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  )

  const games = (rows as any[]).map(row => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    description: row.description,
    publisher: row.publisher,
    giftCount: row.gift_count,
    category: {
      id: row.category_id,
      name: row.category_name,
    },
  }))

  ctx.body = {
    success: true,
    data: {
      items: games,
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
  const gameId = ctx.params.id

  const [gameRows] = await pool.execute(
    `SELECT 
      g.id, g.name, g.icon, g.description, g.publisher,
      gc.id as category_id, gc.name as category_name
     FROM games g
     JOIN game_categories gc ON g.category_id = gc.id
     WHERE g.id = ? AND g.is_active = 1`,
    [gameId]
  )

  const games = gameRows as any[]
  if (games.length === 0) {
    ctx.status = 404
    ctx.body = {
      success: false,
      error: {
        message: '游戏不存在',
        code: 404,
      },
    }
    return
  }

  const game = games[0]

  const [giftRows] = await pool.execute(
    `SELECT 
      g.id, g.name, g.icon, g.description, g.total_count, g.claimed_count,
      g.start_time, g.end_time,
      gt.id as type_id, gt.name as type_name
     FROM gifts g
     JOIN gift_types gt ON g.type_id = gt.id
     WHERE g.game_id = ? AND g.is_active = 1 AND g.is_visible = 1
     AND (g.start_time IS NULL OR g.start_time <= NOW())
     AND (g.end_time IS NULL OR g.end_time >= NOW())
     ORDER BY g.created_at DESC`,
    [gameId]
  )

  const gifts = (giftRows as any[]).map(row => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    description: row.description,
    totalCount: row.total_count,
    claimedCount: row.claimed_count,
    remainingCount: row.total_count - row.claimed_count,
    startTime: row.start_time,
    endTime: row.end_time,
    type: {
      id: row.type_id,
      name: row.type_name,
    },
  }))

  ctx.body = {
    success: true,
    data: {
      id: game.id,
      name: game.name,
      icon: game.icon,
      description: game.description,
      publisher: game.publisher,
      category: {
        id: game.category_id,
        name: game.category_name,
      },
      gifts,
    },
  }
})

export default router
