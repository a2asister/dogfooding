import { Context } from 'koa'
import { query, queryOne } from '../config/database'
import { responseHandler, logOperation } from '../middleware/handler'
import { paginate } from '../utils/utils'

export const getProducts = async (ctx: Context) => {
  const { categoryId, mealType, keyword, page = 1, pageSize = 10 } = ctx.query as any

  let whereClause = 'WHERE p.status = "active"'
  const params: any[] = []

  if (categoryId) {
    whereClause += ' AND p.category_id = ?'
    params.push(categoryId)
  }

  if (mealType) {
    whereClause += ' AND p.meal_type = ?'
    params.push(mealType)
  }

  if (keyword) {
    whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)'
    params.push(`%${keyword}%`, `%${keyword}%`)
  }

  const { limit, offset } = paginate(parseInt(page), parseInt(pageSize))

  const products = await query(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     ${whereClause} 
     ORDER BY p.sort DESC, p.created_at DESC 
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )

  const totalResult = await queryOne(
    `SELECT COUNT(*) as total FROM products p ${whereClause}`,
    params
  )

  ctx.body = responseHandler.success({
    products,
    total: totalResult.total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  })
}

export const getProduct = async (ctx: Context) => {
  const { id } = ctx.params

  const product = await queryOne(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
    [id]
  )

  if (!product) {
    ctx.body = responseHandler.error('餐品不存在')
    return
  }

  ctx.body = responseHandler.success(product)
}

export const createProduct = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { 
    name, description, price, originalPrice, image, 
    categoryId, mealType, stock, unit, isRecommend, sort 
  } = ctx.request.body as any

  if (!name || price === undefined) {
    ctx.body = responseHandler.error('餐品名称和价格不能为空')
    return
  }

  const result = await query(
    `INSERT INTO products 
     (name, description, price, original_price, image, category_id, meal_type, stock, unit, is_recommend, sort, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [name, description, price, originalPrice, image, categoryId, mealType, stock || 0, unit || '份', isRecommend || 0, sort || 0]
  )

  ctx.body = responseHandler.success(
    { id: result.insertId },
    '创建成功'
  )

  await logOperation(userId, 'create', 'product', result.insertId, `创建餐品: ${name}`)
}

export const updateProduct = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { id } = ctx.params
  const { 
    name, description, price, originalPrice, image, 
    categoryId, mealType, stock, unit, isRecommend, sort, status 
  } = ctx.request.body as any

  const result = await query(
    `UPDATE products 
     SET name = COALESCE(?, name),
         description = COALESCE(?, description),
         price = COALESCE(?, price),
         original_price = COALESCE(?, original_price),
         image = COALESCE(?, image),
         category_id = COALESCE(?, category_id),
         meal_type = COALESCE(?, meal_type),
         stock = COALESCE(?, stock),
         unit = COALESCE(?, unit),
         is_recommend = COALESCE(?, is_recommend),
         sort = COALESCE(?, sort),
         status = COALESCE(?, status),
         updated_at = NOW()
     WHERE id = ?`,
    [name, description, price, originalPrice, image, categoryId, mealType, stock, unit, isRecommend, sort, status, id]
  )

  if (result.affectedRows > 0) {
    ctx.body = responseHandler.success(null, '更新成功')
    await logOperation(userId, 'update', 'product', parseInt(id), `更新餐品 ID: ${id}`)
  } else {
    ctx.body = responseHandler.error('更新失败')
  }
}

export const deleteProduct = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { id } = ctx.params

  const result = await query(
    'DELETE FROM products WHERE id = ?',
    [id]
  )

  if (result.affectedRows > 0) {
    ctx.body = responseHandler.success(null, '删除成功')
    await logOperation(userId, 'delete', 'product', parseInt(id), `删除餐品 ID: ${id}`)
  } else {
    ctx.body = responseHandler.error('删除失败')
  }
}

export const toggleStatus = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { id } = ctx.params

  const product = await queryOne('SELECT status FROM products WHERE id = ?', [id])
  
  if (!product) {
    ctx.body = responseHandler.error('餐品不存在')
    return
  }

  const newStatus = product.status === 'active' ? 'inactive' : 'active'
  
  await query(
    'UPDATE products SET status = ?, updated_at = NOW() WHERE id = ?',
    [newStatus, id]
  )

  ctx.body = responseHandler.success(
    { status: newStatus },
    '状态更新成功'
  )

  await logOperation(userId, 'update', 'product', parseInt(id), `更新餐品状态: ${newStatus}`)
}
