import { Context } from 'koa';
import { getDB } from '../models/database';
import { successResponse } from '../utils/auth';

export async function getDashboardData(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const db = getDB();

  const today = new Date().getDay() || 7;
  const todaySchedules = db
    .prepare(
      `
    SELECT s.*, c.name as course_name, c.teacher
    FROM schedules s
    JOIN courses c ON s.course_id = c.id
    WHERE s.user_id = ? AND s.week_day = ?
    ORDER BY s.start_period
  `
    )
    .all(userId, today);

  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM messages WHERE user_id = ? AND is_read = 0').get(userId) as any;

  const pendingEvaluations = db
    .prepare('SELECT COUNT(*) as count FROM evaluations WHERE user_id = ? AND submitted = 0')
    .get(userId) as any;

  const recentGrades = db
    .prepare('SELECT * FROM grades WHERE user_id = ? ORDER BY created_at DESC LIMIT 5')
    .all(userId);

  const gpa = db
    .prepare(
      'SELECT AVG(grade_point) as gpa FROM grades WHERE user_id = ? AND grade_point IS NOT NULL'
    )
    .get(userId) as any;

  const totalCredits = db
    .prepare(
      `
    SELECT SUM(c.credit) as total
    FROM selections s
    JOIN courses c ON s.course_id = c.id
    WHERE s.user_id = ? AND s.status = 1
  `
    )
    .get(userId) as any;

  const notifications = db
    .prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 5')
    .all(userId);

  ctx.body = successResponse({
    todaySchedules,
    unreadCount: unreadCount.count,
    pendingEvaluations: pendingEvaluations.count,
    recentGrades,
    gpa: gpa.gpa || 0,
    totalCredits: totalCredits.total || 0,
    notifications,
  });
}

export async function getSchedule(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const db = getDB();

  const schedules = db
    .prepare(
      `
    SELECT s.*, c.name as course_name, c.teacher, c.credit
    FROM schedules s
    JOIN courses c ON s.course_id = c.id
    WHERE s.user_id = ?
    ORDER BY s.week_day, s.start_period
  `
    )
    .all(userId);

  ctx.body = successResponse(schedules);
}

export async function getGrades(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const { semester } = ctx.query;
  const db = getDB();

  let sql = 'SELECT * FROM grades WHERE user_id = ?';
  const params: any[] = [userId];

  if (semester) {
    sql += ' AND semester = ?';
    params.push(semester);
  }

  sql += ' ORDER BY created_at DESC';

  const grades = db.prepare(sql).all(...params);

  const stats = db
    .prepare(
      `
    SELECT
      AVG(score) as avgScore,
      AVG(grade_point) as gpa,
      COUNT(*) as totalCourses,
      SUM(CASE WHEN score >= 60 THEN 1 ELSE 0 END) as passedCourses
    FROM grades
    WHERE user_id = ?
  `
    )
    .get(userId) as any;

  ctx.body = successResponse({
    list: grades,
    stats: {
      avgScore: stats.avgScore || 0,
      gpa: stats.gpa || 0,
      totalCourses: stats.totalCourses || 0,
      passedCourses: stats.passedCourses || 0,
    },
  });
}

export async function getCourses(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const db = getDB();

  const selectedCourseIds = db
    .prepare('SELECT course_id FROM selections WHERE user_id = ? AND status = 1')
    .all(userId)
    .map((s: any) => s.course_id);

  const availableCourses = db
    .prepare(
      `
    SELECT c.*,
      CASE WHEN s.course_id IS NOT NULL THEN 1 ELSE 0 END as selected
    FROM courses c
    LEFT JOIN selections s ON c.id = s.course_id AND s.user_id = ? AND s.status = 1
    WHERE c.enrolled < c.capacity
    ORDER BY c.created_at DESC
  `
    )
    .all(userId);

  const selectedCourses = db
    .prepare(
      `
    SELECT c.*, s.created_at as selected_at
    FROM selections s
    JOIN courses c ON s.course_id = c.id
    WHERE s.user_id = ? AND s.status = 1
    ORDER BY s.created_at DESC
  `
    )
    .all(userId);

  ctx.body = successResponse({
    availableCourses,
    selectedCourses,
  });
}

export async function selectCourse(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const courseId = parseInt(ctx.params.id);
  const db = getDB();

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
  if (!course) {
    ctx.body = successResponse(null, '课程不存在');
    return;
  }

  if (course.enrolled >= course.capacity) {
    ctx.body = successResponse(null, '课程已满');
    return;
  }

  const existing = db
    .prepare('SELECT * FROM selections WHERE user_id = ? AND course_id = ? AND status = 1')
    .get(userId, courseId);
  if (existing) {
    ctx.body = successResponse(null, '已选过该课程');
    return;
  }

  const selectedWeekDays = db
    .prepare(
      `
    SELECT s.week_day, s.start_period, s.end_period
    FROM schedules s
    JOIN selections sel ON s.course_id = sel.course_id
    WHERE sel.user_id = ? AND sel.status = 1
  `
    )
    .all(userId);

  const newSchedule = db
    .prepare('SELECT * FROM schedules WHERE course_id = ? LIMIT 1')
    .get(courseId) as any;

  if (newSchedule) {
    for (const s of selectedWeekDays) {
      if (
        s.week_day === newSchedule.week_day &&
        !(newSchedule.end_period < s.start_period || newSchedule.start_period > s.end_period)
      ) {
        ctx.body = successResponse(null, '课程时间冲突');
        return;
      }
    }
  }

  db.prepare('INSERT INTO selections (user_id, course_id, status) VALUES (?, ?, 1)').run(userId, courseId);
  db.prepare('UPDATE courses SET enrolled = enrolled + 1 WHERE id = ?').run(courseId);

  ctx.body = successResponse(null, '选课成功');
}

export async function dropCourse(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const courseId = parseInt(ctx.params.id);
  const db = getDB();

  const existing = db
    .prepare('SELECT * FROM selections WHERE user_id = ? AND course_id = ? AND status = 1')
    .get(userId, courseId);
  if (!existing) {
    ctx.body = successResponse(null, '未选该课程');
    return;
  }

  db.prepare('UPDATE selections SET status = 0 WHERE user_id = ? AND course_id = ?').run(userId, courseId);
  db.prepare('UPDATE courses SET enrolled = enrolled - 1 WHERE id = ?').run(courseId);

  ctx.body = successResponse(null, '退课成功');
}

export async function getEvaluations(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const db = getDB();

  const pending = db
    .prepare('SELECT * FROM evaluations WHERE user_id = ? AND submitted = 0 ORDER BY created_at')
    .all(userId);

  const history = db
    .prepare('SELECT * FROM evaluations WHERE user_id = ? AND submitted = 1 ORDER BY created_at DESC')
    .all(userId);

  ctx.body = successResponse({ pending, history });
}

export async function submitEvaluation(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const { id } = ctx.params;
  const { teachingScore, contentScore, overallScore, comment } = ctx.request.body as any;
  const db = getDB();

  db.prepare(
    `
    UPDATE evaluations
    SET teaching_score = ?, content_score = ?, overall_score = ?, comment = ?, submitted = 1
    WHERE id = ? AND user_id = ?
  `
  ).run(teachingScore, contentScore, overallScore, comment || '', id, userId);

  ctx.body = successResponse(null, '评教提交成功');
}

export async function getMessages(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const { type, isRead } = ctx.query;
  const db = getDB();

  let sql = 'SELECT * FROM messages WHERE user_id = ?';
  const params: any[] = [userId];

  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }

  if (isRead !== undefined) {
    sql += ' AND is_read = ?';
    params.push(isRead === '1' ? 1 : 0);
  }

  sql += ' ORDER BY created_at DESC';

  const messages = db.prepare(sql).all(...params);

  ctx.body = successResponse(messages);
}

export async function readMessage(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const { id } = ctx.params;
  const db = getDB();

  db.prepare('UPDATE messages SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);

  ctx.body = successResponse(null, '标记已读');
}

export async function getProfile(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const db = getDB();

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  const awards = [
    { year: '2023-2024', name: '一等奖学金', type: 'scholarship' },
    { year: '2023-2024', name: '三好学生', type: 'honor' },
    { year: '2022-2023', name: '优秀学生干部', type: 'honor' },
  ];

  const punishments: any[] = [];

  const trainingPlan = [
    { semester: '第一学期', courses: ['高等数学', '大学英语', '计算机基础'], totalCredits: 15 },
    { semester: '第二学期', courses: ['线性代数', '数据结构', '大学物理'], totalCredits: 18 },
    { semester: '第三学期', courses: ['操作系统', '计算机网络', '离散数学'], totalCredits: 20 },
    { semester: '第四学期', courses: ['数据库原理', '软件工程', '算法设计'], totalCredits: 22 },
  ];

  ctx.body = successResponse({
    user: {
      id: user.id,
      studentId: user.student_id,
      name: user.name,
      gender: user.gender,
      birthDate: user.birth_date,
      enrollmentDate: user.enrollment_date,
      department: user.department,
      major: user.major,
      class: user.class,
      phone: user.phone,
      email: user.email,
      status: user.status,
    },
    awards,
    punishments,
    trainingPlan,
  });
}

export async function getLoginRecords(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const db = getDB();

  const records = db
    .prepare('SELECT * FROM login_records WHERE user_id = ? ORDER BY login_time DESC LIMIT 20')
    .all(userId);

  ctx.body = successResponse(records);
}
