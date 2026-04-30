import { Context } from 'koa'
import { query, queryOne } from '../config/database'
import { responseHandler, logOperation } from '../middleware/handler'

export const getCategories = async (ctx: Context) => {
  const categories = await query(
    `SELECT * FROM categories 
     WHERE status = 'active' 
     ORDER BY sort DESC, created_at DESC`
  )

  ctx.body = responseHandler.success(categories)
}

export const createCategory = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { name, description, sort } = ctx.request.body as any

  if (!name) {
    ctx.body = responseHandler.error('分类名称不能为空')
    return
  }

  const result = await query(
    `INSERT INTO categories (name, description, sort, status)
     VALUES (?, ?, ?, 'active')`,
    [name, description, sort || 0]
  )

  ctx.body = responseHandler.success(
    { id: result.insertId },
    '创建成功'
  )

  await logOperation(userId, 'create', 'category', result.insertId, `创建分类: ${name}`)
}

export const updateCategory = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { id } = ctx.params
  const { name, description, sort, status } = ctx.request.body as any

  const result = await query(
    `UPDATE categories 
     SET name = COALESCE(?, name),
         description = COALESCE(?, description),
         sort = COALESCE(?, sort),
         status = COALESCE(?, status),
         updated_at = NOW()
     WHERE id = ?`,
    [name, description, sort, status, id]
  )

  if (result.affectedRows > 0) {
    ctx.body = responseHandler.success(null, '更新成功')
    await logOperation(userId, 'update', 'category', parseInt(id), `更新分类 ID: ${id}`)
  } else {
    ctx.body = responseHandler.error('更新失败')
  }
}

export const deleteCategory = async (ctx: Context) => {
  const userId = ctx.user!.id
  const { id } = ctx.params

  const products = await queryOne(
    'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
    [id]
  )

  if (products.count > 0) {
    ctx.body = responseHandler.error('该分类下存在餐品，无法删除')
    return
  }

  const result = await query(
    'DELETE FROM categories WHERE id = ?',
    [id]
  )

  if (result.affectedRows > 0) {
    ctx.body = responseHandler.success(null, '删除成功')
    await logOperation(userId, 'delete', 'category', parseInt(id), `删除分类 ID: ${id}`)
  } else {
    ctx.body = responseHandler.error('删除失败')
  }
}
