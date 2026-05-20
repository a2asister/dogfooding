import Router from 'koa-router';
import db from '../db';
import { success, error, PaginationResult } from '../utils/response';
import { logOperation } from '../utils/logger';

const router = new Router({ prefix: '/api/schemes' });

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, keyword, status } = ctx.query as any;
  
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (keyword) {
    where += ' AND name LIKE ?';
    params.push(`%${keyword}%`);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM assessment_schemes ${where}`).get(...params) as { count: number };
  
  const schemes = db.prepare(`
    SELECT s.*, u.real_name as creator_name
    FROM assessment_schemes s
    LEFT JOIN users u ON s.creator_id = u.id
    ${where}
    ORDER BY s.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize) as any[];

  const result: PaginationResult<any> = {
    list: schemes.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      applicablePositions: s.applicable_positions ? JSON.parse(s.applicable_positions) : [],
      weightConfig: s.weight_config ? JSON.parse(s.weight_config) : {},
      scoringRules: s.scoring_rules ? JSON.parse(s.scoring_rules) : {},
      bonusRules: s.bonus_rules ? JSON.parse(s.bonus_rules) : [],
      penaltyRules: s.penalty_rules ? JSON.parse(s.penalty_rules) : [],
      status: s.status,
      creatorId: s.creator_id,
      creatorName: s.creator_name,
      createdAt: s.created_at,
    })),
    total: total.count,
    page: Number(page),
    pageSize: Number(pageSize),
  };

  ctx.body = success(result);
});

router.get('/all', async (ctx) => {
  const schemes = db.prepare(`
    SELECT id, name, description, applicable_positions
    FROM assessment_schemes 
    WHERE status = 'enabled'
    ORDER BY created_at DESC
  `).all() as any[];

  ctx.body = success(schemes.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    applicablePositions: s.applicable_positions ? JSON.parse(s.applicable_positions) : [],
  })));
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const scheme = db.prepare(`
    SELECT s.*, u.real_name as creator_name
    FROM assessment_schemes s
    LEFT JOIN users u ON s.creator_id = u.id
    WHERE s.id = ?
  `).get(id) as any;

  if (!scheme) {
    ctx.body = error('方案不存在');
    return;
  }

  const indicators = db.prepare(`
    SELECT si.*, i.name as indicator_name, i.type as indicator_type, i.description as indicator_description,
           i.measurement_unit, i.calculation_formula, i.scoring_criteria
    FROM scheme_indicators si
    LEFT JOIN indicators i ON si.indicator_id = i.id
    WHERE si.scheme_id = ?
    ORDER BY si.sort_order
  `).all(id) as any[];

  ctx.body = success({
    id: scheme.id,
    name: scheme.name,
    description: scheme.description,
    applicablePositions: scheme.applicable_positions ? JSON.parse(scheme.applicable_positions) : [],
    weightConfig: scheme.weight_config ? JSON.parse(scheme.weight_config) : {},
    scoringRules: scheme.scoring_rules ? JSON.parse(scheme.scoring_rules) : {},
    bonusRules: scheme.bonus_rules ? JSON.parse(scheme.bonus_rules) : [],
    penaltyRules: scheme.penalty_rules ? JSON.parse(scheme.penalty_rules) : [],
    indicators: indicators.map(i => ({
      id: i.id,
      indicatorId: i.indicator_id,
      indicatorName: i.indicator_name,
      indicatorType: i.indicator_type,
      indicatorDescription: i.indicator_description,
      measurementUnit: i.measurement_unit,
      calculationFormula: i.calculation_formula,
      scoringCriteria: i.scoring_criteria,
      weight: i.weight,
      sortOrder: i.sort_order,
    })),
    status: scheme.status,
    creatorId: scheme.creator_id,
    creatorName: scheme.creator_name,
    createdAt: scheme.created_at,
  });
});

router.post('/', async (ctx) => {
  const {
    name, description, applicablePositions, weightConfig, scoringRules,
    bonusRules, penaltyRules, indicators
  } = ctx.request.body as any;

  const totalWeight = indicators.reduce((sum: number, i: any) => sum + (i.weight || 0), 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    ctx.body = error('指标权重之和必须等于100%');
    return;
  }

  const result = db.prepare(`
    INSERT INTO assessment_schemes (name, description, applicable_positions, weight_config, scoring_rules, bonus_rules, penalty_rules, status, creator_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?)
  `).run(
    name, description, JSON.stringify(applicablePositions || []),
    JSON.stringify(weightConfig || {}), JSON.stringify(scoringRules || {}),
    JSON.stringify(bonusRules || []), JSON.stringify(penaltyRules || []),
    ctx.user?.userId
  );

  const schemeId = result.lastInsertRowid;

  const insertIndicator = db.prepare(`
    INSERT INTO scheme_indicators (scheme_id, indicator_id, weight, sort_order)
    VALUES (?, ?, ?, ?)
  `);

  indicators.forEach((i: any, index: number) => {
    insertIndicator.run(schemeId, i.indicatorId, i.weight, index);
  });

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '创建考核方案',
    module: '考核方案管理',
    details: `创建考核方案 ${name}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success({ id: schemeId }, '创建成功');
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const {
    name, description, applicablePositions, weightConfig, scoringRules,
    bonusRules, penaltyRules, indicators, status
  } = ctx.request.body as any;

  const scheme = db.prepare('SELECT * FROM assessment_schemes WHERE id = ?').get(id) as any;
  if (!scheme) {
    ctx.body = error('方案不存在');
    return;
  }

  if (indicators) {
    const totalWeight = indicators.reduce((sum: number, i: any) => sum + (i.weight || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      ctx.body = error('指标权重之和必须等于100%');
      return;
    }
  }

  db.prepare(`
    UPDATE assessment_schemes SET 
      name = ?, description = ?, applicable_positions = ?, weight_config = ?, 
      scoring_rules = ?, bonus_rules = ?, penalty_rules = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name, description, JSON.stringify(applicablePositions || []),
    JSON.stringify(weightConfig || {}), JSON.stringify(scoringRules || {}),
    JSON.stringify(bonusRules || []), JSON.stringify(penaltyRules || []),
    status, id
  );

  if (indicators) {
    db.prepare('DELETE FROM scheme_indicators WHERE scheme_id = ?').run(id);
    const insertIndicator = db.prepare(`
      INSERT INTO scheme_indicators (scheme_id, indicator_id, weight, sort_order)
      VALUES (?, ?, ?, ?)
    `);
    indicators.forEach((i: any, index: number) => {
      insertIndicator.run(id, i.indicatorId, i.weight, index);
    });
  }

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '更新考核方案',
    module: '考核方案管理',
    details: `更新考核方案 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '更新成功');
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;

  const scheme = db.prepare('SELECT * FROM assessment_schemes WHERE id = ?').get(id) as any;
  if (!scheme) {
    ctx.body = error('方案不存在');
    return;
  }

  const planCount = db.prepare('SELECT COUNT(*) as count FROM assessment_plans WHERE id IN (SELECT plan_id FROM personal_kpis WHERE scheme_id = ?)').get(id) as { count: number };
  if (planCount.count > 0) {
    ctx.body = error('该方案已被考核计划使用，无法删除');
    return;
  }

  db.prepare('DELETE FROM scheme_indicators WHERE scheme_id = ?').run(id);
  db.prepare('DELETE FROM assessment_schemes WHERE id = ?').run(id);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '删除考核方案',
    module: '考核方案管理',
    details: `删除考核方案 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '删除成功');
});

router.post('/:id/validate', async (ctx) => {
  const { id } = ctx.params;
  const indicators = db.prepare(`
    SELECT weight FROM scheme_indicators WHERE scheme_id = ?
  `).all(id) as { weight: number }[];

  const totalWeight = indicators.reduce((sum, i) => sum + i.weight, 0);
  const isValid = Math.abs(totalWeight - 100) <= 0.01;

  ctx.body = success({
    isValid,
    totalWeight,
    message: isValid ? '校验通过' : `权重总和为 ${totalWeight}%，需要等于100%`,
  });
});

export default router;
