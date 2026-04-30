import { Context } from 'koa'
import { query, queryOne } from '../config/database'
import { responseHandler } from '../middleware/handler'
import { paginate } from '../utils/utils'

export const getDashboard = async (ctx: Context) => {
  const today = new Date().toISOString().split('T')[0]

  const todayOrdersResult = await queryOne(
    `SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ?`,
    [today]
  )

  const todayRevenueResult = await queryOne(
    `SELECT SUM(paid_amount) as total FROM orders WHERE DATE(created_at) = ? AND status NOT IN ('pending', 'cancelled')`,
    [today]
  )

  const totalOrdersResult = await queryOne(
    `SELECT COUNT(*) as count FROM orders`
  )

  const totalRevenueResult = await queryOne(
    `SELECT SUM(paid_amount) as total FROM orders WHERE status NOT IN ('pending', 'cancelled')`
  )

  const pendingOrders = await queryOne(
    `SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`
  )

  const preparingOrders = await queryOne(
    `SELECT COUNT(*) as count FROM orders WHERE status = 'preparing'`
  )

  const deliveringOrders = await queryOne(
    `SELECT COUNT(*) as count FROM orders WHERE status = 'delivering'`
  )

  const topProducts = await query(
    `SELECT p.id, p.name, SUM(oi.quantity) as count 
     FROM order_items oi 
     JOIN products p ON oi.product_id = p.id 
     JOIN orders o ON oi.order_id = o.id 
     WHERE o.status NOT IN ('pending', 'cancelled')
     GROUP BY p.id, p.name 
     ORDER BY count DESC 
     LIMIT 5`
  )

  const recentOrders = await query(
    `SELECT o.*, u.name as user_name 
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     ORDER BY o.created_at DESC 
     LIMIT 10`
  )

  ctx.body = responseHandler.success({
    todayOrders: todayOrdersResult.count || 0,
    todayRevenue: todayRevenueResult.total || 0,
    totalOrders: totalOrdersResult.count || 0,
    totalRevenue: totalRevenueResult.total || 0,
    pendingOrders: pendingOrders.count || 0,
    preparingOrders: preparingOrders.count || 0,
    deliveringOrders: deliveringOrders.count || 0,
    topProducts,
    recentOrders,
  })
}

export const getSales = async (ctx: Context) => {
  const { startDate, endDate, type = 'day' } = ctx.query as any

  let dateFormat = '%Y-%m-%d'
  if (type === 'week') dateFormat = '%Y-%u'
  if (type === 'month') dateFormat = '%Y-%m'

  const sales = await query(
    `SELECT DATE_FORMAT(created_at, ?) as date, 
            COUNT(*) as order_count, 
            SUM(paid_amount) as revenue
     FROM orders 
     WHERE status NOT IN ('pending', 'cancelled')
     GROUP BY date
     ORDER BY date DESC
     LIMIT 30`,
    [dateFormat]
  )

  ctx.body = responseHandler.success(sales)
}

export const getLogs = async (ctx: Context) => {
  const { userId, action, startDate, endDate, page = 1, pageSize = 10 } = ctx.query as any

  let whereClause = 'WHERE 1=1'
  const params: any[] = []

  if (userId) {
    whereClause += ' AND ol.user_id = ?'
    params.push(userId)
  }

  if (action) {
    whereClause += ' AND ol.action = ?'
    params.push(action)
  }

  if (startDate) {
    whereClause += ' AND DATE(ol.created_at) >= ?'
    params.push(startDate)
  }

  if (endDate) {
    whereClause += ' AND DATE(ol.created_at) <= ?'
    params.push(endDate)
  }

  const { limit, offset } = paginate(parseInt(page), parseInt(pageSize))

  const logs = await query(
    `SELECT ol.*, u.name as user_name, u.username 
     FROM operation_logs ol 
     LEFT JOIN users u ON ol.user_id = u.id 
     ${whereClause} 
     ORDER BY ol.created_at DESC 
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )

  const totalResult = await queryOne(
    `SELECT COUNT(*) as total FROM operation_logs ol ${whereClause}`,
    params
  )

  ctx.body = responseHandler.success({
    logs,
    total: totalResult.total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  })
}
