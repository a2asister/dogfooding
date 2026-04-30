import { Context } from 'koa'
import pool, { query, queryOne } from '../config/database'
import { responseHandler, logOperation } from '../middleware/handler'
import { generateOrderNo, paginate } from '../utils/utils'
import logger from '../utils/logger'

export const getOrders = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { status, page = 1, pageSize = 10 } = ctx.query as any

  let whereClause = 'WHERE o.user_id = ?'
  const params: any[] = [userId]

  if (status) {
    whereClause += ' AND o.status = ?'
    params.push(status)
  }

  const { limit, offset } = paginate(parseInt(page), parseInt(pageSize))

  const orders = await query(
    `SELECT o.*, u.name as user_name 
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     ${whereClause} 
     ORDER BY o.created_at DESC 
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )

  for (const order of orders) {
    order.items = await query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    )
  }

  const totalResult = await queryOne(
    `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
    params
  )

  ctx.body = responseHandler.success({
    orders,
    total: totalResult.total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  })
}

export const getOrder = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { id } = ctx.params

  const order = await queryOne(
    `SELECT o.*, u.name as user_name 
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     WHERE o.id = ? AND o.user_id = ?`,
    [id, userId]
  )

  if (!order) {
    ctx.body = responseHandler.error('订单不存在')
    return
  }

  order.items = await query(
    'SELECT * FROM order_items WHERE order_id = ?',
    [order.id]
  )

  ctx.body = responseHandler.success(order)
}

export const createOrder = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { items, deliveryType, roomNumber, scheduledTime, remark } = ctx.request.body as any

  if (!items || items.length === 0) {
    ctx.body = responseHandler.error('购物车为空')
    return
  }

  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    let totalAmount = 0
    const orderItems: any[] = []

    for (const item of items) {
      const product = await queryOne(
        'SELECT * FROM products WHERE id = ? AND status = "active"',
        [item.productId]
      )

      if (!product) {
        throw new Error(`餐品 ID: ${item.productId} 不存在或已下架`)
      }

      if (product.stock < item.quantity) {
        throw new Error(`餐品 ${product.name} 库存不足`)
      }

      const subtotal = product.price * item.quantity
      totalAmount += subtotal

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: item.quantity,
        subtotal,
      })
    }

    const orderNo = generateOrderNo()
    const deliveryFee = deliveryType === 'room' ? 10 : 0
    const paidAmount = totalAmount + deliveryFee

    const orderResult = await query(
      `INSERT INTO orders 
       (order_no, user_id, status, total_amount, discount_amount, paid_amount, 
        delivery_type, room_number, scheduled_time, remark)
       VALUES (?, ?, 'pending', ?, 0, ?, ?, ?, ?, ?)`,
      [orderNo, userId, totalAmount, paidAmount, deliveryType, roomNumber, scheduledTime, remark]
    )

    const orderId = orderResult.insertId

    for (const item of orderItems) {
      await query(
        `INSERT INTO order_items 
         (order_id, product_id, product_name, product_image, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.productName, item.productImage, item.price, item.quantity, item.subtotal]
      )

      await query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      )
    }

    await connection.commit()

    const order = await queryOne('SELECT * FROM orders WHERE id = ?', [orderId])
    order.items = orderItems

    ctx.body = responseHandler.success(order, '下单成功')
    logger.info(`用户 ${userId} 下单成功，订单号: ${orderNo}`)
  } catch (error: any) {
    await connection.rollback()
    ctx.body = responseHandler.error(error.message || '下单失败')
    logger.error('下单失败:', error)
  } finally {
    connection.release()
  }
}

export const updateOrderStatus = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { id } = ctx.params
  const { status } = ctx.request.body as any

  const order = await queryOne('SELECT * FROM orders WHERE id = ?', [id])

  if (!order) {
    ctx.body = responseHandler.error('订单不存在')
    return
  }

  const validTransitions: Record<string, string[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['preparing', 'cancelled'],
    preparing: ['delivering', 'cancelled'],
    delivering: ['completed'],
    completed: ['after_sale'],
    after_sale: [],
    cancelled: [],
  }

  if (!validTransitions[order.status]?.includes(status)) {
    ctx.body = responseHandler.error('无效的订单状态变更')
    return
  }

  const updateFields: any = { status, updated_at: new Date() }
  
  if (status === 'paid') updateFields.paid_at = new Date()
  if (status === 'preparing') updateFields.prepared_at = new Date()
  if (status === 'delivering') updateFields.delivered_at = new Date()
  if (status === 'completed') updateFields.completed_at = new Date()
  if (status === 'cancelled') updateFields.cancelled_at = new Date()

  const result = await query(
    `UPDATE orders SET ${Object.keys(updateFields).map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
    [...Object.values(updateFields), id]
  )

  if (result.affectedRows > 0) {
    ctx.body = responseHandler.success(null, '状态更新成功')
    await logOperation(userId, 'update', 'order', parseInt(id), `更新订单状态: ${order.status} -> ${status}`)
  } else {
    ctx.body = responseHandler.error('更新失败')
  }
}

export const cancelOrder = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { id } = ctx.params
  const { reason } = ctx.request.body as any

  const order = await queryOne(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [id, userId]
  )

  if (!order) {
    ctx.body = responseHandler.error('订单不存在')
    return
  }

  if (!['pending', 'paid', 'preparing'].includes(order.status)) {
    ctx.body = responseHandler.error('该订单状态无法取消')
    return
  }

  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    const items = await query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [id]
    )

    for (const item of items) {
      await query(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.productId]
      )
    }

    await query(
      `UPDATE orders 
       SET status = 'cancelled', cancelled_at = NOW(), remark = CONCAT(COALESCE(remark, ''), ' | 取消原因: ', ?)
       WHERE id = ?`,
      [reason || '用户主动取消', id]
    )

    await connection.commit()
    ctx.body = responseHandler.success(null, '订单已取消')
    logger.info(`订单 ${id} 已取消`)
  } catch (error) {
    await connection.rollback()
    ctx.body = responseHandler.error('取消失败')
    logger.error('取消订单失败:', error)
  } finally {
    connection.release()
  }
}

export const applyAfterSale = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { id } = ctx.params
  const { type, reason, images } = ctx.request.body as any

  const order = await queryOne(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [id, userId]
  )

  if (!order) {
    ctx.body = responseHandler.error('订单不存在')
    return
  }

  if (order.status !== 'completed') {
    ctx.body = responseHandler.error('只有已完成的订单才能申请售后')
    return
  }

  const result = await query(
    `UPDATE orders SET status = 'after_sale' WHERE id = ?`,
    [id]
  )

  if (result.affectedRows > 0) {
    ctx.body = responseHandler.success(null, '售后申请已提交')
    await logOperation(userId, 'after_sale', 'order', parseInt(id), `售后申请: ${type} - ${reason}`)
  } else {
    ctx.body = responseHandler.error('提交失败')
  }
}
