import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../db';
import { authMiddleware, AuthContext, requireRole } from '../middleware/auth';
import { Course } from '../types';

const router = new Router({ prefix: '/api/courses' });

router.get('/', authMiddleware, async (ctx: AuthContext) => {
  const { level, isPublic, teacherId } = ctx.query as {
    level?: string;
    isPublic?: string;
    teacherId?: string;
  };

  let query = 'SELECT c.*, u.nickname as teacherName FROM courses c LEFT JOIN users u ON c.teacherId = u.id WHERE 1=1';
  const params: string[] = [];

  if (level) {
    query += ' AND c.level = ?';
    params.push(level);
  }
  if (isPublic !== undefined) {
    query += ' AND c.isPublic = ?';
    params.push(isPublic === 'true' ? '1' : '0');
  }
  if (teacherId) {
    query += ' AND c.teacherId = ?';
    params.push(teacherId);
  }

  query += ' ORDER BY c.createdAt DESC';
  const courses = db.prepare(query).all(...params) as (Course & { teacherName: string })[];

  ctx.body = { courses };
});

router.get('/my', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const studentId = ctx.state.user.id;
  const enrollments = db.prepare(`
    SELECT ce.*, c.title, c.description, c.level, c.thumbnail, u.nickname as teacherName
    FROM course_enrollments ce
    JOIN courses c ON ce.courseId = c.id
    JOIN users u ON c.teacherId = u.id
    WHERE ce.studentId = ?
    ORDER BY ce.enrolledAt DESC
  `).all(studentId);

  ctx.body = { courses: enrollments };
});

router.get('/:id', authMiddleware, async (ctx: AuthContext) => {
  const course = db.prepare(`
    SELECT c.*, u.nickname as teacherName
    FROM courses c LEFT JOIN users u ON c.teacherId = u.id
    WHERE c.id = ?
  `).get(ctx.params.id) as (Course & { teacherName: string }) | undefined;

  if (!course) {
    ctx.status = 404;
    ctx.body = { error: '课程不存在' };
    return;
  }

  if (ctx.state.user.role === 'student') {
    const enrollment = db.prepare('SELECT * FROM course_enrollments WHERE courseId = ? AND studentId = ?')
      .get(course.id, ctx.state.user.id);
    ctx.body = { course, enrolled: !!enrollment, enrollment };
    return;
  }

  ctx.body = { course };
});

router.post('/', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const { title, description, level, content, thumbnail, isPublic } = ctx.request.body as {
    title: string;
    description: string;
    level: 'beginner' | 'basic' | 'advanced';
    content: string;
    thumbnail?: string;
    isPublic?: boolean;
  };

  if (!title || !description || !level || !content) {
    ctx.status = 400;
    ctx.body = { error: '请填写完整信息' };
    return;
  }

  const courseId = uuidv4();
  const now = dayjs().toISOString();

  db.prepare(`
    INSERT INTO courses (id, title, description, level, teacherId, content, thumbnail, isPublic, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(courseId, title, description, level, ctx.state.user.id, content, thumbnail || null, isPublic ? 1 : 0, now, now);

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as Course;
  ctx.body = { course };
});

router.put('/:id', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const courseId = ctx.params.id;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as Course | undefined;

  if (!course) {
    ctx.status = 404;
    ctx.body = { error: '课程不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && course.teacherId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限修改此课程' };
    return;
  }

  const { title, description, level, content, thumbnail, isPublic } = ctx.request.body as {
    title?: string;
    description?: string;
    level?: 'beginner' | 'basic' | 'advanced';
    content?: string;
    thumbnail?: string;
    isPublic?: boolean;
  };

  const now = dayjs().toISOString();
  db.prepare(`
    UPDATE courses
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        level = COALESCE(?, level),
        content = COALESCE(?, content),
        thumbnail = COALESCE(?, thumbnail),
        isPublic = COALESCE(?, isPublic),
        updatedAt = ?
    WHERE id = ?
  `).run(title || null, description || null, level || null, content || null, thumbnail || null, 
         isPublic !== undefined ? (isPublic ? 1 : 0) : null, now, courseId);

  const updatedCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as Course;
  ctx.body = { course: updatedCourse };
});

router.delete('/:id', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const courseId = ctx.params.id;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as Course | undefined;

  if (!course) {
    ctx.status = 404;
    ctx.body = { error: '课程不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && course.teacherId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限删除此课程' };
    return;
  }

  db.prepare('DELETE FROM courses WHERE id = ?').run(courseId);
  ctx.body = { message: '删除成功' };
});

router.post('/:id/enroll', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const courseId = ctx.params.id;
  const studentId = ctx.state.user.id;

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as Course | undefined;
  if (!course) {
    ctx.status = 404;
    ctx.body = { error: '课程不存在' };
    return;
  }

  const existing = db.prepare('SELECT * FROM course_enrollments WHERE courseId = ? AND studentId = ?')
    .get(courseId, studentId);
  if (existing) {
    ctx.status = 400;
    ctx.body = { error: '已报名该课程' };
    return;
  }

  const enrollmentId = uuidv4();
  const now = dayjs().toISOString();

  db.prepare(`
    INSERT INTO course_enrollments (id, courseId, studentId, progress, enrolledAt)
    VALUES (?, ?, ?, 0, ?)
  `).run(enrollmentId, courseId, studentId, now);

  ctx.body = { message: '报名成功' };
});

router.put('/:id/progress', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const courseId = ctx.params.id;
  const studentId = ctx.state.user.id;
  const { progress } = ctx.request.body as { progress: number };

  const enrollment = db.prepare('SELECT * FROM course_enrollments WHERE courseId = ? AND studentId = ?')
    .get(courseId, studentId);
  if (!enrollment) {
    ctx.status = 404;
    ctx.body = { error: '未报名该课程' };
    return;
  }

  db.prepare('UPDATE course_enrollments SET progress = ? WHERE courseId = ? AND studentId = ?')
    .run(progress, courseId, studentId);

  ctx.body = { message: '进度已更新' };
});

export default router;
