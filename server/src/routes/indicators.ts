import Router from 'koa-router';
import db from '../db';
import { success, error, PaginationResult } from '../utils/response';
import { logOperation } from '../utils/logger';

const router = new Router({ prefix: '/api/indicators' });

router.get('/categories', async (ctx) => {
  const categories = db.prepare('SELECT * FROM indicator_categories WHERE status = 1 ORDER BY sort_order, id').all() as any[];
  
  const buildTree = (parentId: number | string = 0): any[] => {
    return categories
      .filter(c => c.parent_id === parentId)
      .map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        parentId: c.parent_id,
        description: c.description,
        sortOrder: c.sort_order,
        children: buildTree(c.id),
      }));
  };

  ctx.body = success(buildTree());
});

router.post('/categories', async (ctx) => {
  const { name, code, parentId, description, sortOrder } = ctx.request.body as any;

  if (code) {
    const exists = db.prepare('SELECT id FROM indicator_categories WHERE code = ?').get(code);
    if (exists) {
      ctx.body = error('分类编码已存在');
      return;
    }
  }

  const result = db.prepare(`
    INSERT INTO indicator_categories (name, code, parent_id, description, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, code, parentId || 0, description, sortOrder || 0);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '创建指标分类',
    module: '指标库管理',
    details: `创建指标分类 ${name}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success({ id: result.lastInsertRowid }, '创建成功');
});

router.put('/categories/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, code, parentId, description, sortOrder, status } = ctx.request.body as any;

  const category = db.prepare('SELECT id FROM indicator_categories WHERE id = ?').get(id);
  if (!category) {
    ctx.body = error('分类不存在');
    return;
  }

  db.prepare(`
    UPDATE indicator_categories SET name = ?, code = ?, parent_id = ?, description = ?, sort_order = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, code, parentId || 0, description, sortOrder || 0, status, id);

  ctx.body = success(null, '更新成功');
});

router.delete('/categories/:id', async (ctx) => {
  const { id } = ctx.params;

  const childCount = db.prepare('SELECT COUNT(*) as count FROM indicator_categories WHERE parent_id = ?').get(id) as { count: number };
  if (childCount.count > 0) {
    ctx.body = error('该分类下还有子分类，无法删除');
    return;
  }

  const indicatorCount = db.prepare('SELECT COUNT(*) as count FROM indicators WHERE category_id = ?').get(id) as { count: number };
  if (indicatorCount.count > 0) {
    ctx.body = error('该分类下还有指标，无法删除');
    return;
  }

  db.prepare('DELETE FROM indicator_categories WHERE id = ?').run(id);
  ctx.body = success(null, '删除成功');
});

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, keyword, categoryId, type, isStandard, status } = ctx.query as any;
  
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (keyword) {
    where += ' AND (i.name LIKE ? OR i.code LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (categoryId) {
    where += ' AND i.category_id = ?';
    params.push(categoryId);
  }
  if (type) {
    where += ' AND i.type = ?';
    params.push(type);
  }
  if (isStandard !== undefined) {
    where += ' AND i.is_standard = ?';
    params.push(isStandard);
  }
  if (status !== undefined) {
    where += ' AND i.status = ?';
    params.push(status);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM indicators i ${where}`).get(...params) as { count: number };
  
  const indicators = db.prepare(`
    SELECT i.*, c.name as category_name
    FROM indicators i
    LEFT JOIN indicator_categories c ON i.category_id = c.id
    ${where}
    ORDER BY i.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize) as any[];

  const result: PaginationResult<any> = {
    list: indicators.map(i => ({
      id: i.id,
      name: i.name,
      code: i.code,
      categoryId: i.category_id,
      categoryName: i.category_name,
      type: i.type,
      description: i.description,
      measurementUnit: i.measurement_unit,
      calculationFormula: i.calculation_formula,
      scoringCriteria: i.scoring_criteria,
      targetValue: i.target_value,
      weight: i.weight,
      isStandard: i.is_standard,
      applicablePositions: i.applicable_positions ? JSON.parse(i.applicable_positions) : [],
      status: i.status,
      createdAt: i.created_at,
    })),
    total: total.count,
    page: Number(page),
    pageSize: Number(pageSize),
  };

  ctx.body = success(result);
});

router.get('/templates', async (ctx) => {
  const { position } = ctx.query;
  
  let where = 'WHERE is_standard = 1 AND status = 1';
  const params: any[] = [];

  if (position) {
    where += ' AND applicable_positions LIKE ?';
    params.push(`%${position}%`);
  }

  const templates = db.prepare(`
    SELECT i.*, c.name as category_name
    FROM indicators i
    LEFT JOIN indicator_categories c ON i.category_id = c.id
    ${where}
    ORDER BY i.created_at DESC
  `).all(...params) as any[];

  ctx.body = success(templates.map(i => ({
    id: i.id,
    name: i.name,
    type: i.type,
    categoryName: i.category_name,
    description: i.description,
    measurementUnit: i.measurement_unit,
    calculationFormula: i.calculation_formula,
    scoringCriteria: i.scoring_criteria,
    defaultWeight: i.weight,
    defaultTarget: i.target_value,
  })));
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const indicator = db.prepare(`
    SELECT i.*, c.name as category_name
    FROM indicators i
    LEFT JOIN indicator_categories c ON i.category_id = c.id
    WHERE i.id = ?
  `).get(id) as any;

  if (!indicator) {
    ctx.body = error('指标不存在');
    return;
  }

  ctx.body = success({
    id: indicator.id,
    name: indicator.name,
    code: indicator.code,
    categoryId: indicator.category_id,
    categoryName: indicator.category_name,
    type: indicator.type,
    description: indicator.description,
    measurementUnit: indicator.measurement_unit,
    calculationFormula: indicator.calculation_formula,
    scoringCriteria: indicator.scoring_criteria,
    targetValue: indicator.target_value,
    weight: indicator.weight,
    isStandard: indicator.is_standard,
    applicablePositions: indicator.applicable_positions ? JSON.parse(indicator.applicable_positions) : [],
    status: indicator.status,
  });
});

router.post('/', async (ctx) => {
  const {
    name, code, categoryId, type, description, measurementUnit,
    calculationFormula, scoringCriteria, targetValue, weight,
    isStandard, applicablePositions
  } = ctx.request.body as any;

  const result = db.prepare(`
    INSERT INTO indicators (name, code, category_id, type, description, measurement_unit, calculation_formula, scoring_criteria, target_value, weight, is_standard, applicable_positions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, code, categoryId, type, description, measurementUnit,
    calculationFormula, scoringCriteria, targetValue, weight,
    isStandard ? 1 : 0, JSON.stringify(applicablePositions || [])
  );

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '创建指标',
    module: '指标库管理',
    details: `创建指标 ${name}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success({ id: result.lastInsertRowid }, '创建成功');
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const {
    name, code, categoryId, type, description, measurementUnit,
    calculationFormula, scoringCriteria, targetValue, weight,
    isStandard, applicablePositions, status
  } = ctx.request.body as any;

  const indicator = db.prepare('SELECT id FROM indicators WHERE id = ?').get(id);
  if (!indicator) {
    ctx.body = error('指标不存在');
    return;
  }

  db.prepare(`
    UPDATE indicators SET 
      name = ?, code = ?, category_id = ?, type = ?, description = ?, 
      measurement_unit = ?, calculation_formula = ?, scoring_criteria = ?, 
      target_value = ?, weight = ?, is_standard = ?, applicable_positions = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name, code, categoryId, type, description, measurementUnit,
    calculationFormula, scoringCriteria, targetValue, weight,
    isStandard ? 1 : 0, JSON.stringify(applicablePositions || []), status, id
  );

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '更新指标',
    module: '指标库管理',
    details: `更新指标 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '更新成功');
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  db.prepare('DELETE FROM indicators WHERE id = ?').run(id);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '删除指标',
    module: '指标库管理',
    details: `删除指标 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '删除成功');
});

router.post('/batch', async (ctx) => {
  const { ids, action, data } = ctx.request.body as any;

  if (action === 'delete') {
    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`DELETE FROM indicators WHERE id IN (${placeholders})`).run(...ids);
    
    logOperation({
      userId: ctx.user?.userId,
      username: ctx.user?.username,
      operation: '批量删除指标',
      module: '指标库管理',
      details: `批量删除 ${ids.length} 个指标`,
      ipAddress: ctx.ip,
    });
  } else if (action === 'update') {
    const placeholders = ids.map(() => '?').join(',');
    const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ');
    db.prepare(`UPDATE indicators SET ${setClauses} WHERE id IN (${placeholders})`).run(...Object.values(data), ...ids);
  }

  ctx.body = success(null, '操作成功');
});

export default router;
