import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../db';
import { authMiddleware, AuthContext, requireRole } from '../middleware/auth';
import { Class } from '../types';

const router = new Router({ prefix: '/api/classes' });

router.get('/', authMiddleware, async (ctx: AuthContext) => {
  const user = ctx.state.user;
  let classes: Record<string, unknown>[] = [];

  if (user.role === 'teacher') {
    classes = db.prepare(`
      SELECT c.*, u.nickname as teacherName
      FROM classes c LEFT JOIN users u ON c.teacherId = u.id
      WHERE c.teacherId = ?
      ORDER BY c.createdAt DESC
    `).all(user.id);
  } else if (user.role === 'student') {
    const profile = db.prepare('SELECT classId FROM student_profiles WHERE userId = ?').get(user.id) as { classId?: string } | undefined;
    if (profile?.classId) {
      classes = db.prepare(`
        SELECT c.*, u.nickname as teacherName
        FROM classes c LEFT JOIN users u ON c.teacherId = u.id
        WHERE c.id = ?
      `).all(profile.classId);
    }
  } else if (user.role === 'admin') {
    classes = db.prepare(`
      SELECT c.*, u.nickname as teacherName
      FROM classes c LEFT JOIN users u ON c.teacherId = u.id
      ORDER BY c.createdAt DESC
    `).all();
  }

  ctx.body = { classes };
});

router.get('/:id', authMiddleware, async (ctx: AuthContext) => {
  const classData = db.prepare(`
    SELECT c.*, u.nickname as teacherName
    FROM classes c LEFT JOIN users u ON c.teacherId = u.id
    WHERE c.id = ?
  `).get(ctx.params.id) as (Class & { teacherName: string }) | undefined;

  if (!classData) {
    ctx.status = 404;
    ctx.body = { error: '班级不存在' };
    return;
  }

  const students = db.prepare(`
    SELECT u.id, u.nickname, u.avatar, sp.points, sp.level
    FROM student_profiles sp
    JOIN users u ON sp.userId = u.id
    WHERE sp.classId = ?
  `).all(ctx.params.id);

  ctx.body = { class: classData, students };
});

router.post('/', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const { name, description } = ctx.request.body as { name: string; description?: string };

  if (!name) {
    ctx.status = 400;
    ctx.body = { error: '请填写班级名称' };
    return;
  }

  const classId = uuidv4();
  const now = dayjs().toISOString();
  const teacherId = ctx.state.user.role === 'admin' ? (ctx.request.body as { teacherId?: string }).teacherId || ctx.state.user.id : ctx.state.user.id;

  db.prepare(`
    INSERT INTO classes (id, name, teacherId, description, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(classId, name, teacherId, description || null, now, now);

  const classData = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId) as Class;
  ctx.body = { class: classData };
});

router.put('/:id', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const classId = ctx.params.id;
  const classData = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId) as Class | undefined;

  if (!classData) {
    ctx.status = 404;
    ctx.body = { error: '班级不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && classData.teacherId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限修改此班级' };
    return;
  }

  const { name, description } = ctx.request.body as { name?: string; description?: string };
  const now = dayjs().toISOString();

  db.prepare(`
    UPDATE classes
    SET name = COALESCE(?, name),
        description = COALESCE(?, description),
        updatedAt = ?
    WHERE id = ?
  `).run(name || null, description || null, now, classId);

  const updatedClass = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId) as Class;
  ctx.body = { class: updatedClass };
});

router.delete('/:id', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const classId = ctx.params.id;
  const classData = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId) as Class | undefined;

  if (!classData) {
    ctx.status = 404;
    ctx.body = { error: '班级不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && classData.teacherId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限删除此班级' };
    return;
  }

  db.prepare('UPDATE student_profiles SET classId = NULL WHERE classId = ?').run(classId);
  db.prepare('DELETE FROM classes WHERE id = ?').run(classId);
  ctx.body = { message: '删除成功' };
});

router.post('/:id/add-student', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const classId = ctx.params.id;
  const { studentId } = ctx.request.body as { studentId: string };

  const classData = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId) as Class | undefined;
  if (!classData) {
    ctx.status = 404;
    ctx.body = { error: '班级不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && classData.teacherId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限管理此班级' };
    return;
  }

  const student = db.prepare('SELECT * FROM users WHERE id = ? AND role = ?').get(studentId, 'student');
  if (!student) {
    ctx.status = 404;
    ctx.body = { error: '学生不存在' };
    return;
  }

  db.prepare('UPDATE student_profiles SET classId = ? WHERE userId = ?').run(classId, studentId);
  ctx.body = { message: '添加成功' };
});

router.post('/:id/remove-student', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const classId = ctx.params.id;
  const { studentId } = ctx.request.body as { studentId: string };

  const classData = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId) as Class | undefined;
  if (!classData) {
    ctx.status = 404;
    ctx.body = { error: '班级不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && classData.teacherId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限管理此班级' };
    return;
  }

  db.prepare('UPDATE student_profiles SET classId = NULL WHERE userId = ? AND classId = ?').run(studentId, classId);
  ctx.body = { message: '移除成功' };
});

export default router;
