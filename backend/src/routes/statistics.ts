import Router from '@koa/router'
import type { Context } from 'koa'
import pool from '../config/database.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = new Router({ prefix: '/statistics' })

router.get('/overview', async (ctx: Context) => {
  const [giftRows] = await pool.execute(
    `SELECT COUNT(*) as count FROM gifts 
     WHERE is_active = 1 AND is_visible = 1
     AND (start_time IS NULL OR start_time <= NOW())
     AND (end_time IS NULL OR end_time >= NOW())`
  )

  const [gameRows] = await pool.execute(
    'SELECT COUNT(*) as count FROM games WHERE is_active = 1'
  )

  const [claimRows] = await pool.execute(
    'SELECT COUNT(*) as count FROM claim_records'
  )

  const [todayClaimRows] = await pool.execute(
    `SELECT COUNT(*) as count FROM claim_records 
     WHERE DATE(claimed_at) = CURDATE()`
  )

  const gifts = giftRows as any[]
  const games = gameRows as any[]
  const claims = claimRows as any[]
  const todayClaims = todayClaimRows as any[]

  ctx.body = {
    success: true,
    data: {
      totalGifts: gifts[0]?.count || 0,
      totalGames: games[0]?.count || 0,
      totalClaims: claims[0]?.count || 0,
      todayClaims: todayClaims[0]?.count || 0,
    },
  }
})

router.get('/dashboard', authMiddleware, adminMiddleware, async (ctx: Context) => {
  const [overviewRows] = await pool.execute(`
    SELECT
      (SELECT COUNT(*) FROM gifts) as totalGifts,
      (SELECT COUNT(*) FROM gifts WHERE is_active = 1) as activeGifts,
      (SELECT COUNT(*) FROM games) as totalGames,
      (SELECT COUNT(*) FROM games WHERE is_active = 1) as activeGames,
      (SELECT COUNT(*) FROM users) as totalUsers,
      (SELECT COUNT(*) FROM users WHERE is_admin = 1) as adminUsers,
      (SELECT COUNT(*) FROM claim_records) as totalClaims
  `)

  const overview = (overviewRows as any[])[0]

  const [dailyClaimsRows] = await pool.execute(`
    SELECT 
      DATE(claimed_at) as date,
      COUNT(*) as count
    FROM claim_records
    WHERE claimed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(claimed_at)
    ORDER BY date ASC
  `)

  const [topGiftsRows] = await pool.execute(`
    SELECT 
      g.id, g.name,
      COUNT(cr.id) as claimCount,
      g.total_count as totalCount,
      g.claimed_count as claimedCount
    FROM gifts g
    LEFT JOIN claim_records cr ON g.id = cr.gift_id
    GROUP BY g.id, g.name, g.total_count, g.claimed_count
    ORDER BY claimCount DESC
    LIMIT 10
  `)

  const [topGamesRows] = await pool.execute(`
    SELECT 
      ga.id, ga.name,
      COUNT(cr.id) as claimCount
    FROM games ga
    LEFT JOIN gifts g ON ga.id = g.game_id
    LEFT JOIN claim_records cr ON g.id = cr.gift_id
    GROUP BY ga.id, ga.name
    ORDER BY claimCount DESC
    LIMIT 10
  `)

  const [giftTypesRows] = await pool.execute(`
    SELECT 
      gt.id, gt.name,
      COUNT(g.id) as giftCount
    FROM gift_types gt
    LEFT JOIN gifts g ON gt.id = g.type_id
    GROUP BY gt.id, gt.name
    ORDER BY giftCount DESC
  `)

  ctx.body = {
    success: true,
    data: {
      overview: {
        totalGifts: overview.totalGifts,
        activeGifts: overview.activeGifts,
        totalGames: overview.totalGames,
        activeGames: overview.activeGames,
        totalUsers: overview.totalUsers,
        adminUsers: overview.adminUsers,
        totalClaims: overview.totalClaims,
      },
      dailyClaims: dailyClaimsRows,
      topGifts: topGiftsRows,
      topGames: topGamesRows,
      giftTypes: giftTypesRows,
    },
  }
})

router.get('/claims/trend', authMiddleware, adminMiddleware, async (ctx: Context) => {
  const { days = 30 } = ctx.query

  const [rows] = await pool.execute(`
    SELECT 
      DATE(claimed_at) as date,
      COUNT(*) as count
    FROM claim_records
    WHERE claimed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(claimed_at)
    ORDER BY date ASC
  `, [Number(days)])

  ctx.body = {
    success: true,
    data: rows,
  }
})

router.get('/gifts/stats', authMiddleware, adminMiddleware, async (ctx: Context) => {
  const [rows] = await pool.execute(`
    SELECT 
      g.id, g.name, g.description,
      g.total_count as totalCount,
      g.claimed_count as claimedCount,
      (g.total_count - g.claimed_count) as remainingCount,
      g.created_at as createdAt,
      ga.name as gameName,
      gt.name as typeName
    FROM gifts g
    JOIN games ga ON g.game_id = ga.id
    JOIN gift_types gt ON g.type_id = gt.id
    ORDER BY g.created_at DESC
  `)

  ctx.body = {
    success: true,
    data: rows,
  }
})

export default router
