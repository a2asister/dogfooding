import Router from 'koa-router';
import db from '../db';
import { success, error, PaginationResult } from '../utils/response';
import { logOperation } from '../utils/logger';

const router = new Router({ prefix: '/api/plans' });

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, keyword, status, cycleYear, templateType } = ctx.query as any;
  
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
  if (cycleYear) {
    where += ' AND cycle_year = ?';
    params.push(cycleYear);
  }
  if (templateType) {
    where += ' AND template_type = ?';
    params.push(templateType);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM assessment_plans ${where}`).get(...params) as { count: number };
  
  const plans = db.prepare(`
    SELECT p.*, u.real_name as creator_name,
    COUNT(DISTINCT pp.employee_id) as participant_count
    FROM assessment_plans p
    LEFT JOIN users u ON p.creator_id = u.id
    LEFT JOIN assessment_plan_participants pp ON p.id = pp.plan_id
    ${where}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize) as any[];

  const result: PaginationResult<any> = {
    list: plans.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      templateType: p.template_type,
      cycleType: p.cycle_type,
      cycleYear: p.cycle_year,
      cycleMonth: p.cycle_month,
      startDate: p.start_date,
      endDate: p.end_date,
      selfAssessmentStart: p.self_assessment_start,
      selfAssessmentEnd: p.self_assessment_end,
      superiorAssessmentStart: p.superior_assessment_start,
      superiorAssessmentEnd: p.superior_assessment_end,
      reviewStart: p.review_start,
      reviewEnd: p.review_end,
      resultPublicationDate: p.result_publication_date,
      status: p.status,
      participantCount: p.participant_count,
      creatorId: p.creator_id,
      creatorName: p.creator_name,
      createdAt: p.created_at,
    })),
    total: total.count,
    page: Number(page),
    pageSize: Number(pageSize),
  };

  ctx.body = success(result);
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const plan = db.prepare(`
    SELECT p.*, u.real_name as creator_name
    FROM assessment_plans p
    LEFT JOIN users u ON p.creator_id = u.id
    WHERE p.id = ?
  `).get(id) as any;

  if (!plan) {
    ctx.body = error('计划不存在');
    return;
  }

  const participants = db.prepare(`
    SELECT pp.*, e.real_name, e.employee_no, d.name as department_name,
           u2.real_name as assessor_name, u3.real_name as reviewer_name
    FROM assessment_plan_participants pp
    LEFT JOIN employees e ON pp.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN users u2 ON pp.assessor_id = u2.id
    LEFT JOIN users u3 ON pp.reviewer_id = u3.id
    WHERE pp.plan_id = ?
  `).all(id) as any[];

  ctx.body = success({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    templateType: plan.template_type,
    cycleType: plan.cycle_type,
    cycleYear: plan.cycle_year,
    cycleMonth: plan.cycle_month,
    startDate: plan.start_date,
    endDate: plan.end_date,
    selfAssessmentStart: plan.self_assessment_start,
    selfAssessmentEnd: plan.self_assessment_end,
    superiorAssessmentStart: plan.superior_assessment_start,
    superiorAssessmentEnd: plan.superior_assessment_end,
    reviewStart: plan.review_start,
    reviewEnd: plan.review_end,
    resultPublicationDate: plan.result_publication_date,
    status: plan.status,
    creatorId: plan.creator_id,
    creatorName: plan.creator_name,
    participants: participants.map(p => ({
      id: p.id,
      employeeId: p.employee_id,
      realName: p.real_name,
      employeeNo: p.employee_no,
      departmentName: p.department_name,
      assessorId: p.assessor_id,
      assessorName: p.assessor_name,
      reviewerId: p.reviewer_id,
      reviewerName: p.reviewer_name,
      status: p.status,
    })),
    createdAt: plan.created_at,
  });
});

router.post('/', async (ctx) => {
  const {
    name, description, templateType, cycleType, cycleYear, cycleMonth,
    startDate, endDate, selfAssessmentStart, selfAssessmentEnd,
    superiorAssessmentStart, superiorAssessmentEnd, reviewStart, reviewEnd,
    resultPublicationDate, participants
  } = ctx.request.body as any;

  const result = db.prepare(`
    INSERT INTO assessment_plans (name, description, template_type, cycle_type, cycle_year, cycle_month, start_date, end_date, self_assessment_start, self_assessment_end, superior_assessment_start, superior_assessment_end, review_start, review_end, result_publication_date, status, creator_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)
  `).run(
    name, description, templateType, cycleType, cycleYear, cycleMonth,
    startDate, endDate, selfAssessmentStart, selfAssessmentEnd,
    superiorAssessmentStart, superiorAssessmentEnd, reviewStart, reviewEnd,
    resultPublicationDate, ctx.user?.userId
  );

  const planId = result.lastInsertRowid;

  if (participants && participants.length > 0) {
    const insertParticipant = db.prepare(`
      INSERT INTO assessment_plan_participants (plan_id, employee_id, assessor_id, reviewer_id, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);

    for (const p of participants) {
      try {
        insertParticipant.run(planId, p.employeeId, p.assessorId, p.reviewerId);
      } catch {
      }
    }
  }

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '创建考核计划',
    module: '考核计划管理',
    details: `创建考核计划 ${name}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success({ id: planId }, '创建成功');
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const {
    name, description, templateType, cycleType, cycleYear, cycleMonth,
    startDate, endDate, selfAssessmentStart, selfAssessmentEnd,
    superiorAssessmentStart, superiorAssessmentEnd, reviewStart, reviewEnd,
    resultPublicationDate, status, participants
  } = ctx.request.body as any;

  const plan = db.prepare('SELECT * FROM assessment_plans WHERE id = ?').get(id) as any;
  if (!plan) {
    ctx.body = error('计划不存在');
    return;
  }

  db.prepare(`
    UPDATE assessment_plans SET 
      name = ?, description = ?, template_type = ?, cycle_type = ?, cycle_year = ?, cycle_month = ?,
      start_date = ?, end_date = ?, self_assessment_start = ?, self_assessment_end = ?,
      superior_assessment_start = ?, superior_assessment_end = ?, review_start = ?, review_end = ?,
      result_publication_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name, description, templateType, cycleType, cycleYear, cycleMonth,
    startDate, endDate, selfAssessmentStart, selfAssessmentEnd,
    superiorAssessmentStart, superiorAssessmentEnd, reviewStart, reviewEnd,
    resultPublicationDate, status, id
  );

  if (participants) {
    db.prepare('DELETE FROM assessment_plan_participants WHERE plan_id = ?').run(id);
    const insertParticipant = db.prepare(`
      INSERT INTO assessment_plan_participants (plan_id, employee_id, assessor_id, reviewer_id, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);
    for (const p of participants) {
      try {
        insertParticipant.run(id, p.employeeId, p.assessorId, p.reviewerId);
      } catch {
      }
    }
  }

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '更新考核计划',
    module: '考核计划管理',
    details: `更新考核计划 ID:${id}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '更新成功');
});

router.post('/:id/participants/batch', async (ctx) => {
  const { id } = ctx.params;
  const { participantIds, assessorId, reviewerId } = ctx.request.body as any;

  const insertParticipant = db.prepare(`
    INSERT OR REPLACE INTO assessment_plan_participants (plan_id, employee_id, assessor_id, reviewer_id, status)
    VALUES (?, ?, ?, ?, 'pending')
  `);

  for (const employeeId of participantIds) {
    insertParticipant.run(id, employeeId, assessorId, reviewerId);
  }

  ctx.body = success(null, '批量添加成功');
});

router.post('/:id/action', async (ctx) => {
  const { id } = ctx.params;
  const { action, reason } = ctx.request.body as { action: string; reason?: string };

  const plan = db.prepare('SELECT * FROM assessment_plans WHERE id = ?').get(id) as any;
  if (!plan) {
    ctx.body = error('计划不存在');
    return;
  }

  const validTransitions: Record<string, string[]> = {
    'draft': ['pending'],
    'pending': ['in_progress', 'cancelled'],
    'in_progress': ['paused', 'completed', 'cancelled'],
    'paused': ['in_progress', 'cancelled'],
    'completed': ['published'],
    'published': ['archived'],
  };

  const statusMap: Record<string, string> = {
    'start': 'in_progress',
    'pause': 'paused',
    'resume': 'in_progress',
    'complete': 'completed',
    'publish': 'published',
    'cancel': 'cancelled',
    'archive': 'archived',
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    ctx.body = error('无效的操作');
    return;
  }

  const validNext = validTransitions[plan.status];
  if (!validNext || !validNext.includes(newStatus)) {
    ctx.body = error(`无法从当前状态 ${plan.status} 转换到 ${newStatus}`);
    return;
  }

  db.prepare('UPDATE assessment_plans SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, id);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: `考核计划${action}`,
    module: '考核计划管理',
    details: `考核计划 ID:${id} 执行${action}操作，原因: ${reason || '无'}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '操作成功');
});

router.post('/:id/extend', async (ctx) => {
  const { id } = ctx.params;
  const { phase, newEndDate, reason } = ctx.request.body as any;

  const validPhases = ['self_assessment', 'superior_assessment', 'review'];
  if (!validPhases.includes(phase)) {
    ctx.body = error('无效的阶段');
    return;
  }

  const columnMap: Record<string, string> = {
    'self_assessment': 'self_assessment_end',
    'superior_assessment': 'superior_assessment_end',
    'review': 'review_end',
  };

  db.prepare(`UPDATE assessment_plans SET ${columnMap[phase]} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newEndDate, id);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '考核计划延期',
    module: '考核计划管理',
    details: `考核计划 ID:${id} ${phase}阶段延期至 ${newEndDate}，原因: ${reason || '无'}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '延期成功');
});

router.get('/:id/progress', async (ctx) => {
  const { id } = ctx.params;

  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'self_assessing' THEN 1 ELSE 0 END) as self_assessing,
      SUM(CASE WHEN status = 'self_completed' THEN 1 ELSE 0 END) as self_completed,
      SUM(CASE WHEN status = 'superior_assessing' THEN 1 ELSE 0 END) as superior_assessing,
      SUM(CASE WHEN status = 'reviewing' THEN 1 ELSE 0 END) as reviewing,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM assessment_plan_participants
    WHERE plan_id = ?
  `).get(id) as any;

  ctx.body = success({
    total: stats.total || 0,
    pending: stats.pending || 0,
    selfAssessing: stats.self_assessing || 0,
    selfCompleted: stats.self_completed || 0,
    superiorAssessing: stats.superior_assessing || 0,
    reviewing: stats.reviewing || 0,
    completed: stats.completed || 0,
    overallProgress: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
  });
});

export default router;
