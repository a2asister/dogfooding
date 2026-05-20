import Router from 'koa-router';
import db from '../db';
import { success, error, PaginationResult } from '../utils/response';
import { logOperation } from '../utils/logger';

const router = new Router({ prefix: '/api/personal-kpis' });

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, employeeId, planId, status } = ctx.query as any;
  
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (employeeId) {
    where += ' AND pk.employee_id = ?';
    params.push(employeeId);
  }
  if (planId) {
    where += ' AND pk.plan_id = ?';
    params.push(planId);
  }
  if (status) {
    where += ' AND pk.status = ?';
    params.push(status);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM personal_kpis pk ${where}`).get(...params) as { count: number };
  
  const kpis = db.prepare(`
    SELECT pk.*, p.name as plan_name, e.real_name as employee_name, 
           d.name as department_name, s.name as scheme_name
    FROM personal_kpis pk
    LEFT JOIN assessment_plans p ON pk.plan_id = p.id
    LEFT JOIN employees e ON pk.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN assessment_schemes s ON pk.scheme_id = s.id
    ${where}
    ORDER BY pk.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize) as any[];

  const result: PaginationResult<any> = {
    list: kpis.map(k => ({
      id: k.id,
      planId: k.plan_id,
      planName: k.plan_name,
      employeeId: k.employee_id,
      employeeName: k.employee_name,
      departmentName: k.department_name,
      schemeId: k.scheme_id,
      schemeName: k.scheme_name,
      indicatorsConfig: k.indicators_config ? JSON.parse(k.indicators_config) : [],
      status: k.status,
      periodLocked: k.period_locked,
      createdBy: k.created_by,
      createdAt: k.created_at,
    })),
    total: total.count,
    page: Number(page),
    pageSize: Number(pageSize),
  };

  ctx.body = success(result);
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const kpi = db.prepare(`
    SELECT pk.*, p.name as plan_name, e.real_name as employee_name,
           d.name as department_name, s.name as scheme_name,
           u.real_name as creator_name
    FROM personal_kpis pk
    LEFT JOIN assessment_plans p ON pk.plan_id = p.id
    LEFT JOIN employees e ON pk.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN assessment_schemes s ON pk.scheme_id = s.id
    LEFT JOIN users u ON pk.created_by = u.id
    WHERE pk.id = ?
  `).get(id) as any;

  if (!kpi) {
    ctx.body = error('KPI不存在');
    return;
  }

  const result = db.prepare(`
    SELECT * FROM assessment_results WHERE kpi_id = ?
  `).get(id) as any;

  const workflow = db.prepare(`
    SELECT w.*, u.real_name as operator_name
    FROM assessment_workflow w
    LEFT JOIN users u ON w.operator_id = u.id
    WHERE w.kpi_id = ?
    ORDER BY w.created_at DESC
  `).all(id) as any[];

  ctx.body = success({
    id: kpi.id,
    planId: kpi.plan_id,
    planName: kpi.plan_name,
    employeeId: kpi.employee_id,
    employeeName: kpi.employee_name,
    departmentName: kpi.department_name,
    schemeId: kpi.scheme_id,
    schemeName: kpi.scheme_name,
    indicatorsConfig: kpi.indicators_config ? JSON.parse(kpi.indicators_config) : [],
    status: kpi.status,
    periodLocked: kpi.period_locked,
    createdBy: kpi.created_by,
    creatorName: kpi.creator_name,
    result: result ? {
      id: result.id,
      selfScore: result.self_score,
      selfAssessment: result.self_assessment,
      evidenceUrl: result.evidence_url,
      superiorScore: result.superior_score,
      superiorComments: result.superior_comments,
      reviewerScore: result.reviewer_score,
      reviewerComments: result.reviewer_comments,
      finalScore: result.final_score,
      grade: result.grade,
      totalBonus: result.total_bonus,
      totalPenalty: result.total_penalty,
      status: result.status,
      isAppealed: result.is_appealed,
      appealReason: result.appeal_reason,
      appealResult: result.appeal_result,
    } : null,
    workflow: workflow.map(w => ({
      id: w.id,
      operatorId: w.operator_id,
      operatorName: w.operator_name,
      action: w.action,
      comments: w.comments,
      createdAt: w.created_at,
    })),
    createdAt: kpi.created_at,
  });
});

router.post('/', async (ctx) => {
  const { planId, employeeId, schemeId, indicatorsConfig } = ctx.request.body as any;

  const existing = db.prepare('SELECT id FROM personal_kpis WHERE plan_id = ? AND employee_id = ?').get(planId, employeeId);
  if (existing) {
    ctx.body = error('该员工在此考核计划下已有KPI');
    return;
  }

  const result = db.prepare(`
    INSERT INTO personal_kpis (plan_id, employee_id, scheme_id, indicators_config, status, created_by)
    VALUES (?, ?, ?, ?, 'draft', ?)
  `).run(planId, employeeId, schemeId, JSON.stringify(indicatorsConfig || []), ctx.user?.userId);

  db.prepare(`
    INSERT INTO assessment_results (kpi_id, employee_id, plan_id, status)
    VALUES (?, ?, ?, 'pending')
  `).run(result.lastInsertRowid, employeeId, planId);

  db.prepare(`
    INSERT INTO assessment_workflow (kpi_id, operator_id, action, comments)
    VALUES (?, ?, 'create', '创建KPI')
  `).run(result.lastInsertRowid, ctx.user?.userId);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '创建个人KPI',
    module: '个人KPI管理',
    details: `为员工 ${employeeId} 创建KPI`,
    ipAddress: ctx.ip,
  });

  ctx.body = success({ id: result.lastInsertRowid }, '创建成功');
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { indicatorsConfig, status } = ctx.request.body as any;

  const kpi = db.prepare('SELECT * FROM personal_kpis WHERE id = ?').get(id) as any;
  if (!kpi) {
    ctx.body = error('KPI不存在');
    return;
  }

  db.prepare(`
    UPDATE personal_kpis SET indicators_config = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(JSON.stringify(indicatorsConfig || []), status, id);

  ctx.body = success(null, '更新成功');
});

router.post('/:id/action', async (ctx) => {
  const { id } = ctx.params;
  const { action, comments } = ctx.request.body as { action: string; comments?: string };

  const kpi = db.prepare('SELECT * FROM personal_kpis WHERE id = ?').get(id) as any;
  if (!kpi) {
    ctx.body = error('KPI不存在');
    return;
  }

  const statusMap: Record<string, string> = {
    'submit': 'pending_review',
    'approve': 'approved',
    'reject': 'rejected',
    'lock': 'locked',
    'start_self_assessment': 'self_assessing',
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    ctx.body = error('无效的操作');
    return;
  }

  db.prepare('UPDATE personal_kpis SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, id);

  db.prepare(`
    INSERT INTO assessment_workflow (kpi_id, operator_id, action, comments)
    VALUES (?, ?, ?, ?)
  `).run(id, ctx.user?.userId, action, comments || '');

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: `KPI${action}`,
    module: '个人KPI管理',
    details: `KPI ID:${id} 执行${action}操作`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '操作成功');
});

router.post('/:id/self-assessment', async (ctx) => {
  const { id } = ctx.params;
  const { scores, selfAssessment, evidenceUrl } = ctx.request.body as any;

  const kpi = db.prepare('SELECT * FROM personal_kpis WHERE id = ?').get(id) as any;
  if (!kpi) {
    ctx.body = error('KPI不存在');
    return;
  }

  const result = db.prepare('SELECT * FROM assessment_results WHERE kpi_id = ?').get(id) as any;
  if (!result) {
    ctx.body = error('考核结果不存在');
    return;
  }

  const indicatorsConfig = JSON.parse(kpi.indicators_config || '[]');
  let totalSelfScore = 0;
  
  for (const indicator of indicatorsConfig) {
    const score = scores[indicator.indicatorId] || 0;
    totalSelfScore += (score * indicator.weight) / 100;
  }

  db.prepare(`
    UPDATE assessment_results SET 
      self_score = ?, self_assessment = ?, evidence_url = ?, status = 'self_completed',
      updated_at = CURRENT_TIMESTAMP
    WHERE kpi_id = ?
  `).run(totalSelfScore, selfAssessment, evidenceUrl, id);

  db.prepare('UPDATE personal_kpis SET status = \'superior_assessing\', updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

  db.prepare(`
    INSERT INTO assessment_workflow (kpi_id, operator_id, action, comments)
    VALUES (?, ?, 'self_assessment', ?)
  `).run(id, ctx.user?.userId, selfAssessment || '完成自评');

  ctx.body = success(null, '自评提交成功');
});

router.post('/:id/superior-assessment', async (ctx) => {
  const { id } = ctx.params;
  const { scores, comments, bonus, penalty } = ctx.request.body as any;

  const kpi = db.prepare('SELECT * FROM personal_kpis WHERE id = ?').get(id) as any;
  if (!kpi) {
    ctx.body = error('KPI不存在');
    return;
  }

  const result = db.prepare('SELECT * FROM assessment_results WHERE kpi_id = ?').get(id) as any;
  if (!result) {
    ctx.body = error('考核结果不存在');
    return;
  }

  const indicatorsConfig = JSON.parse(kpi.indicators_config || '[]');
  let totalScore = 0;
  
  for (const indicator of indicatorsConfig) {
    const score = scores[indicator.indicatorId] || 0;
    totalScore += (score * indicator.weight) / 100;
  }

  const totalBonus = (bonus || []).reduce((sum: number, b: any) => sum + (b.points || 0), 0);
  const totalPenalty = (penalty || []).reduce((sum: number, p: any) => sum + (p.points || 0), 0);
  const finalScore = Math.max(0, Math.min(100, totalScore + totalBonus - totalPenalty));

  const gradeResult = db.prepare(`
    SELECT grade FROM performance_grades 
    WHERE min_score <= ? AND max_score >= ?
    ORDER BY min_score DESC
    LIMIT 1
  `).get(finalScore, finalScore) as { grade: string } | undefined;

  db.prepare(`
    UPDATE assessment_results SET 
      superior_score = ?, superior_comments = ?, total_bonus = ?, total_penalty = ?, 
      final_score = ?, grade = ?, status = 'reviewing', updated_at = CURRENT_TIMESTAMP
    WHERE kpi_id = ?
  `).run(totalScore, comments, totalBonus, totalPenalty, finalScore, gradeResult?.grade || null, id);

  db.prepare('UPDATE personal_kpis SET status = \'reviewing\', updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

  db.prepare(`
    INSERT INTO assessment_workflow (kpi_id, operator_id, action, comments)
    VALUES (?, ?, 'superior_assessment', ?)
  `).run(id, ctx.user?.userId, comments || '完成上级评分');

  ctx.body = success(null, '评分提交成功');
});

router.post('/:id/review', async (ctx) => {
  const { id } = ctx.params;
  const { action, comments, scoreAdjustment } = ctx.request.body as any;

  const result = db.prepare('SELECT * FROM assessment_results WHERE kpi_id = ?').get(id) as any;
  if (!result) {
    ctx.body = error('考核结果不存在');
    return;
  }

  if (action === 'approve') {
    let finalScore = result.final_score;
    if (scoreAdjustment) {
      finalScore = Math.max(0, Math.min(100, finalScore + scoreAdjustment));
      const gradeResult = db.prepare(`
        SELECT grade FROM performance_grades 
        WHERE min_score <= ? AND max_score >= ?
        ORDER BY min_score DESC
        LIMIT 1
      `).get(finalScore, finalScore) as { grade: string } | undefined;

      db.prepare(`
        UPDATE assessment_results SET 
          reviewer_score = ?, reviewer_comments = ?, final_score = ?, grade = ?, status = 'completed',
          updated_at = CURRENT_TIMESTAMP
        WHERE kpi_id = ?
      `).run(scoreAdjustment, comments, finalScore, gradeResult?.grade || null, id);
    } else {
      db.prepare(`
        UPDATE assessment_results SET 
          reviewer_comments = ?, status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE kpi_id = ?
      `).run(comments, id);
    }

    db.prepare('UPDATE personal_kpis SET status = \'completed\', updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    db.prepare(`
      INSERT INTO assessment_workflow (kpi_id, operator_id, action, comments)
      VALUES (?, ?, 'review_approve', ?)
    `).run(id, ctx.user?.userId, comments || '审核通过');

  } else if (action === 'reject') {
    db.prepare(`
      UPDATE assessment_results SET reviewer_comments = ?, status = 'rejected', updated_at = CURRENT_TIMESTAMP
      WHERE kpi_id = ?
    `).run(comments, id);

    db.prepare('UPDATE personal_kpis SET status = \'rejected\', updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    db.prepare(`
      INSERT INTO assessment_workflow (kpi_id, operator_id, action, comments)
      VALUES (?, ?, 'review_reject', ?)
    `).run(id, ctx.user?.userId, comments || '审核驳回');
  }

  ctx.body = success(null, '操作成功');
});

router.post('/:id/appeal', async (ctx) => {
  const { id } = ctx.params;
  const { reason } = ctx.request.body as { reason: string };

  db.prepare(`
    UPDATE assessment_results SET is_appealed = 1, appeal_reason = ?, status = 'appealed', updated_at = CURRENT_TIMESTAMP
    WHERE kpi_id = ?
  `).run(reason, id);

  db.prepare(`
    INSERT INTO assessment_workflow (kpi_id, operator_id, action, comments)
    VALUES (?, ?, 'appeal', ?)
  `).run(id, ctx.user?.userId, reason);

  ctx.body = success(null, '申诉提交成功');
});

router.post('/:id/appeal/resolve', async (ctx) => {
  const { id } = ctx.params;
  const { result, response } = ctx.request.body as { result: string; response: string };

  if (result === 'sustained') {
    db.prepare(`
      UPDATE assessment_results SET appeal_result = ?, status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE kpi_id = ?
    `).run(response, id);
  } else {
    db.prepare(`
      UPDATE assessment_results SET appeal_result = ?, is_appealed = 0, status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE kpi_id = ?
    `).run(response, id);
  }

  db.prepare(`
    INSERT INTO assessment_workflow (kpi_id, operator_id, action, comments)
    VALUES (?, ?, 'appeal_resolve', ?)
  `).run(id, ctx.user?.userId, response);

  ctx.body = success(null, '申诉处理完成');
});

export default router;
