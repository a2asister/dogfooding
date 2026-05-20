import Router from 'koa-router';
import XLSX from 'xlsx';
import db from '../db';
import { success, PaginationResult } from '../utils/response';

const router = new Router({ prefix: '/api/results' });

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 10, employeeId, planId, departmentId, grade, status } = ctx.query as any;
  
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (employeeId) {
    where += ' AND r.employee_id = ?';
    params.push(employeeId);
  }
  if (planId) {
    where += ' AND r.plan_id = ?';
    params.push(planId);
  }
  if (departmentId) {
    where += ' AND e.department_id = ?';
    params.push(departmentId);
  }
  if (grade) {
    where += ' AND r.grade = ?';
    params.push(grade);
  }
  if (status) {
    where += ' AND r.status = ?';
    params.push(status);
  }

  const total = db.prepare(`
    SELECT COUNT(*) as count 
    FROM assessment_results r
    LEFT JOIN employees e ON r.employee_id = e.id
    ${where}
  `).get(...params) as { count: number };
  
  const results = db.prepare(`
    SELECT r.*, p.name as plan_name, e.real_name as employee_name,
           e.employee_no, d.name as department_name, g.name as grade_name, g.color as grade_color
    FROM assessment_results r
    LEFT JOIN assessment_plans p ON r.plan_id = p.id
    LEFT JOIN employees e ON r.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN performance_grades g ON r.grade = g.grade
    ${where}
    ORDER BY r.final_score DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize) as any[];

  const result: PaginationResult<any> = {
    list: results.map(r => ({
      id: r.id,
      kpiId: r.kpi_id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeNo: r.employee_no,
      departmentName: r.department_name,
      planId: r.plan_id,
      planName: r.plan_name,
      selfScore: r.self_score,
      superiorScore: r.superior_score,
      reviewerScore: r.reviewer_score,
      finalScore: r.final_score,
      grade: r.grade,
      gradeName: r.grade_name,
      gradeColor: r.grade_color,
      totalBonus: r.total_bonus,
      totalPenalty: r.total_penalty,
      status: r.status,
      isAppealed: r.is_appealed,
      createdAt: r.created_at,
    })),
    total: total.count,
    page: Number(page),
    pageSize: Number(pageSize),
  };

  ctx.body = success(result);
});

router.get('/grades', async (ctx) => {
  const grades = db.prepare('SELECT * FROM performance_grades ORDER BY sort_order').all() as any[];
  ctx.body = success(grades.map(g => ({
    id: g.id,
    grade: g.grade,
    name: g.name,
    minScore: g.min_score,
    maxScore: g.max_score,
    description: g.description,
    color: g.color,
    sortOrder: g.sort_order,
  })));
});

router.get('/archive', async (ctx) => {
  const { page = 1, pageSize = 10, employeeId, startDate, endDate } = ctx.query as any;
  
  let where = 'WHERE r.status = \'completed\'';
  const params: any[] = [];

  if (employeeId) {
    where += ' AND r.employee_id = ?';
    params.push(employeeId);
  }
  if (startDate) {
    where += ' AND r.created_at >= ?';
    params.push(startDate);
  }
  if (endDate) {
    where += ' AND r.created_at <= ?';
    params.push(endDate);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM assessment_results r ${where}`).get(...params) as { count: number };
  
  const results = db.prepare(`
    SELECT r.*, p.name as plan_name, p.cycle_year, p.cycle_type,
           e.real_name as employee_name, d.name as department_name,
           g.name as grade_name
    FROM assessment_results r
    LEFT JOIN assessment_plans p ON r.plan_id = p.id
    LEFT JOIN employees e ON r.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN performance_grades g ON r.grade = g.grade
    ${where}
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize) as any[];

  const result: PaginationResult<any> = {
    list: results.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      departmentName: r.department_name,
      planName: r.plan_name,
      cycleYear: r.cycle_year,
      cycleType: r.cycle_type,
      finalScore: r.final_score,
      grade: r.grade,
      gradeName: r.grade_name,
      selfScore: r.self_score,
      superiorScore: r.superior_score,
      totalBonus: r.total_bonus,
      totalPenalty: r.total_penalty,
      createdAt: r.created_at,
    })),
    total: total.count,
    page: Number(page),
    pageSize: Number(pageSize),
  };

  ctx.body = success(result);
});

router.get('/export', async (ctx) => {
  const { planId, departmentId, format } = ctx.query as any;
  
  let where = 'WHERE r.status = \'completed\'';
  const params: any[] = [];

  if (planId) {
    where += ' AND r.plan_id = ?';
    params.push(planId);
  }
  if (departmentId) {
    where += ' AND e.department_id = ?';
    params.push(departmentId);
  }

  const results = db.prepare(`
    SELECT r.*, p.name as plan_name, e.real_name as employee_name,
           e.employee_no, d.name as department_name, g.name as grade_name
    FROM assessment_results r
    LEFT JOIN assessment_plans p ON r.plan_id = p.id
    LEFT JOIN employees e ON r.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN performance_grades g ON r.grade = g.grade
    ${where}
    ORDER BY r.final_score DESC
  `).all(...params) as any[];

  const data = results.map(r => ({
    '员工编号': r.employee_no,
    '员工姓名': r.employee_name,
    '所在部门': r.department_name,
    '考核计划': r.plan_name,
    '自评分': r.self_score,
    '上级评分': r.superior_score,
    '加分': r.total_bonus,
    '扣分': r.total_penalty,
    '最终得分': r.final_score,
    '绩效等级': r.grade_name,
    '考核时间': r.created_at,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '绩效数据');
  const buffer = XLSX.write(workbook, { type: 'base64' });

  ctx.body = success({ file: buffer, format: format || 'xlsx' });
});

router.get('/employee/:employeeId/trend', async (ctx) => {
  const { employeeId } = ctx.params;
  const { limit = 12 } = ctx.query;

  const results = db.prepare(`
    SELECT r.*, p.name as plan_name, p.cycle_year, p.cycle_month, p.cycle_type,
           g.name as grade_name
    FROM assessment_results r
    LEFT JOIN assessment_plans p ON r.plan_id = p.id
    LEFT JOIN performance_grades g ON r.grade = g.grade
    WHERE r.employee_id = ? AND r.status = 'completed'
    ORDER BY p.cycle_year DESC, p.cycle_month DESC
    LIMIT ?
  `).all(employeeId, limit) as any[];

  ctx.body = success(results.reverse().map(r => ({
    planName: r.plan_name,
    cycleYear: r.cycle_year,
    cycleMonth: r.cycle_month,
    cycleType: r.cycle_type,
    finalScore: r.final_score,
    grade: r.grade,
    gradeName: r.grade_name,
    selfScore: r.self_score,
    superiorScore: r.superior_score,
  })));
});

export default router;
