import Router from 'koa-router';
import db from '../db';
import { success } from '../utils/response';

const router = new Router({ prefix: '/api/statistics' });

router.get('/overview', async (ctx) => {
  const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees WHERE status = 1').get() as { count: number };
  const totalPlans = db.prepare('SELECT COUNT(*) as count FROM assessment_plans').get() as { count: number };
  const activePlans = db.prepare('SELECT COUNT(*) as count FROM assessment_plans WHERE status = \'in_progress\'').get() as { count: number };
  const totalResults = db.prepare('SELECT COUNT(*) as count FROM assessment_results WHERE status = \'completed\'').get() as { count: number };

  const gradeDistribution = db.prepare(`
    SELECT r.grade, g.name as grade_name, g.color, COUNT(*) as count
    FROM assessment_results r
    LEFT JOIN performance_grades g ON r.grade = g.grade
    WHERE r.status = 'completed'
    GROUP BY r.grade
    ORDER BY g.sort_order
  `).all() as any[];

  ctx.body = success({
    totalEmployees: totalEmployees.count,
    totalPlans: totalPlans.count,
    activePlans: activePlans.count,
    totalResults: totalResults.count,
    gradeDistribution: gradeDistribution.map(g => ({
      grade: g.grade,
      gradeName: g.grade_name,
      color: g.color,
      count: g.count,
    })),
  });
});

router.get('/department-ranking', async (ctx) => {
  const { planId, cycleYear } = ctx.query as any;
  
  let where = 'WHERE r.status = \'completed\'';
  const params: any[] = [];

  if (planId) {
    where += ' AND r.plan_id = ?';
    params.push(planId);
  }
  if (cycleYear) {
    where += ' AND p.cycle_year = ?';
    params.push(cycleYear);
  }

  const rankings = db.prepare(`
    SELECT d.id, d.name as department_name,
           COUNT(r.id) as total_count,
           AVG(r.final_score) as avg_score,
           SUM(CASE WHEN r.grade = 'S' THEN 1 ELSE 0 END) as s_count,
           SUM(CASE WHEN r.grade = 'A' THEN 1 ELSE 0 END) as a_count,
           SUM(CASE WHEN r.grade = 'B' THEN 1 ELSE 0 END) as b_count,
           SUM(CASE WHEN r.grade = 'C' THEN 1 ELSE 0 END) as c_count,
           SUM(CASE WHEN r.grade = 'D' THEN 1 ELSE 0 END) as d_count
    FROM departments d
    LEFT JOIN employees e ON d.id = e.department_id
    LEFT JOIN assessment_results r ON e.id = r.employee_id
    LEFT JOIN assessment_plans p ON r.plan_id = p.id
    ${where}
    GROUP BY d.id
    HAVING total_count > 0
    ORDER BY avg_score DESC
  `).all(...params) as any[];

  ctx.body = success(rankings.map((r, index) => ({
    rank: index + 1,
    departmentId: r.id,
    departmentName: r.department_name,
    totalCount: r.total_count,
    avgScore: Number(r.avg_score?.toFixed(2)) || 0,
    sCount: r.s_count || 0,
    aCount: r.a_count || 0,
    bCount: r.b_count || 0,
    cCount: r.c_count || 0,
    dCount: r.d_count || 0,
  })));
});

router.get('/company-overview', async (ctx) => {
  const { year } = ctx.query as any;

  const monthlyData = db.prepare(`
    SELECT 
      p.cycle_year,
      p.cycle_month,
      COUNT(r.id) as total_count,
      AVG(r.final_score) as avg_score
    FROM assessment_plans p
    LEFT JOIN assessment_results r ON p.id = r.plan_id
    WHERE r.status = 'completed' AND p.cycle_year = ?
    GROUP BY p.cycle_year, p.cycle_month
    ORDER BY p.cycle_month
  `).all(year || new Date().getFullYear()) as any[];

  const departmentStats = db.prepare(`
    SELECT d.id, d.name as department_name,
           COUNT(r.id) as total_count,
           AVG(r.final_score) as avg_score
    FROM departments d
    LEFT JOIN employees e ON d.id = e.department_id
    LEFT JOIN assessment_results r ON e.id = r.employee_id
    WHERE r.status = 'completed'
    GROUP BY d.id
    ORDER BY avg_score DESC
  `).all() as any[];

  const gradeStats = db.prepare(`
    SELECT r.grade, g.name as grade_name, g.color,
           COUNT(*) as count,
           ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM assessment_results WHERE status = 'completed'), 2) as percentage
    FROM assessment_results r
    LEFT JOIN performance_grades g ON r.grade = g.grade
    WHERE r.status = 'completed'
    GROUP BY r.grade
    ORDER BY g.sort_order
  `).all() as any[];

  ctx.body = success({
    monthlyTrend: monthlyData.map(m => ({
      month: m.cycle_month,
      totalCount: m.total_count,
      avgScore: Number(m.avg_score?.toFixed(2)) || 0,
    })),
    departmentStats: departmentStats.map(d => ({
      departmentId: d.id,
      departmentName: d.department_name,
      totalCount: d.total_count,
      avgScore: Number(d.avg_score?.toFixed(2)) || 0,
    })),
    gradeDistribution: gradeStats.map(g => ({
      grade: g.grade,
      gradeName: g.grade_name,
      color: g.color,
      count: g.count,
      percentage: g.percentage,
    })),
  });
});

router.get('/indicator-completion', async (ctx) => {
  const { planId, departmentId } = ctx.query as any;
  
  const results = db.prepare(`
    SELECT 
      i.name as indicator_name,
      i.measurement_unit,
      AVG(CAST(json_extract(ar.scores, '$.' || i.id) as REAL)) as avg_actual,
      AVG(i.target_value) as avg_target,
      COUNT(*) as total_count
    FROM indicators i
    INNER JOIN scheme_indicators si ON i.id = si.indicator_id
    INNER JOIN assessment_schemes s ON si.scheme_id = s.id
    INNER JOIN personal_kpis pk ON s.id = pk.scheme_id
    INNER JOIN assessment_results ar ON pk.id = ar.kpi_id
    INNER JOIN employees e ON pk.employee_id = e.id
    WHERE ar.status = 'completed'
    ${planId ? 'AND pk.plan_id = ?' : ''}
    ${departmentId ? 'AND e.department_id = ?' : ''}
    GROUP BY i.id
    HAVING total_count > 0
  `).all(...[planId, departmentId].filter(Boolean)) as any[];

  ctx.body = success(results.map(r => ({
    indicatorName: r.indicator_name,
    measurementUnit: r.measurement_unit,
    avgActual: Number(r.avg_actual?.toFixed(2)) || 0,
    avgTarget: Number(r.avg_target?.toFixed(2)) || 0,
    completionRate: r.avg_target > 0 ? Number(((r.avg_actual / r.avg_target) * 100).toFixed(2)) : 0,
  })));
});

router.get('/charts/export', async (ctx) => {
  const { type } = ctx.query as any;

  let data: any[] = [];
  if (type === 'grade_distribution') {
    data = db.prepare(`
      SELECT g.grade, g.name as grade_name, g.color, COUNT(r.id) as count
      FROM performance_grades g
      LEFT JOIN assessment_results r ON g.grade = r.grade AND r.status = 'completed'
      GROUP BY g.grade
      ORDER BY g.sort_order
    `).all();
  } else if (type === 'monthly_trend') {
    data = db.prepare(`
      SELECT 
        p.cycle_year,
        p.cycle_month,
        COUNT(r.id) as count,
        AVG(r.final_score) as avg_score
      FROM assessment_plans p
      LEFT JOIN assessment_results r ON p.id = r.plan_id
      WHERE r.status = 'completed'
      GROUP BY p.cycle_year, p.cycle_month
      ORDER BY p.cycle_year, p.cycle_month
    `).all();
  } else {
    data = [];
  }

  ctx.body = success({
    type,
    data,
    exportTime: new Date().toISOString(),
  });
});

export default router;
