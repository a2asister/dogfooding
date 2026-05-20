import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../db';
import { authMiddleware, AuthContext, requireRole } from '../middleware/auth';
import { Homework, HomeworkSubmission } from '../types';

const router = new Router({ prefix: '/api/homework' });

router.get('/', authMiddleware, async (ctx: AuthContext) => {
  const user = ctx.state.user;
  let homeworkList: Record<string, unknown>[] = [];

  if (user.role === 'teacher') {
    homeworkList = db.prepare(`
      SELECT h.*, c.title as courseName, cl.name as className
      FROM homeworks h
      JOIN courses c ON h.courseId = c.id
      JOIN classes cl ON h.classId = cl.id
      WHERE h.teacherId = ?
      ORDER BY h.createdAt DESC
    `).all(user.id);
  } else if (user.role === 'student') {
    const profile = db.prepare('SELECT classId FROM student_profiles WHERE userId = ?').get(user.id) as { classId?: string } | undefined;
    if (profile?.classId) {
      homeworkList = db.prepare(`
        SELECT h.*, c.title as courseName, cl.name as className,
               CASE WHEN hs.id IS NOT NULL THEN 1 ELSE 0 END as submitted,
               hs.score, hs.submittedAt
        FROM homeworks h
        JOIN courses c ON h.courseId = c.id
        JOIN classes cl ON h.classId = cl.id
        LEFT JOIN homework_submissions hs ON h.id = hs.homeworkId AND hs.studentId = ?
        WHERE h.classId = ?
        ORDER BY h.createdAt DESC
      `).all(user.id, profile.classId);
    }
  }

  ctx.body = { homeworkList };
});

router.get('/:id', authMiddleware, async (ctx: AuthContext) => {
  const homework = db.prepare(`
    SELECT h.*, c.title as courseName, cl.name as className, u.nickname as teacherName
    FROM homeworks h
    JOIN courses c ON h.courseId = c.id
    JOIN classes cl ON h.classId = cl.id
    JOIN users u ON h.teacherId = u.id
    WHERE h.id = ?
  `).get(ctx.params.id) as (Homework & { courseName: string; className: string; teacherName: string }) | undefined;

  if (!homework) {
    ctx.status = 404;
    ctx.body = { error: '作业不存在' };
    return;
  }

  let submission: HomeworkSubmission | undefined;
  if (ctx.state.user.role === 'student') {
    submission = db.prepare('SELECT * FROM homework_submissions WHERE homeworkId = ? AND studentId = ?')
      .get(ctx.params.id, ctx.state.user.id) as HomeworkSubmission | undefined;
  }

  ctx.body = { homework, submission };
});

router.get('/:id/submissions', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const homeworkId = ctx.params.id;
  const homework = db.prepare('SELECT * FROM homeworks WHERE id = ?').get(homeworkId) as Homework | undefined;

  if (!homework) {
    ctx.status = 404;
    ctx.body = { error: '作业不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && homework.teacherId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限查看此作业的提交' };
    return;
  }

  const submissions = db.prepare(`
    SELECT hs.*, u.nickname as studentName, u.avatar as studentAvatar
    FROM homework_submissions hs
    JOIN users u ON hs.studentId = u.id
    WHERE hs.homeworkId = ?
    ORDER BY hs.submittedAt DESC
  `).all(homeworkId);

  ctx.body = { submissions };
});

router.post('/', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const { title, description, courseId, classId, deadline } = ctx.request.body as {
    title: string;
    description: string;
    courseId: string;
    classId: string;
    deadline: string;
  };

  if (!title || !description || !courseId || !classId || !deadline) {
    ctx.status = 400;
    ctx.body = { error: '请填写完整信息' };
    return;
  }

  const homeworkId = uuidv4();
  const now = dayjs().toISOString();

  db.prepare(`
    INSERT INTO homeworks (id, title, description, courseId, teacherId, classId, deadline, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(homeworkId, title, description, courseId, ctx.state.user.id, classId, deadline, now, now);

  const homework = db.prepare('SELECT * FROM homeworks WHERE id = ?').get(homeworkId) as Homework;
  ctx.body = { homework };
});

router.put('/:id', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const homeworkId = ctx.params.id;
  const homework = db.prepare('SELECT * FROM homeworks WHERE id = ?').get(homeworkId) as Homework | undefined;

  if (!homework) {
    ctx.status = 404;
    ctx.body = { error: '作业不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && homework.teacherId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限修改此作业' };
    return;
  }

  const { title, description, courseId, classId, deadline } = ctx.request.body as {
    title?: string;
    description?: string;
    courseId?: string;
    classId?: string;
    deadline?: string;
  };
  const now = dayjs().toISOString();

  db.prepare(`
    UPDATE homeworks
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        courseId = COALESCE(?, courseId),
        classId = COALESCE(?, classId),
        deadline = COALESCE(?, deadline),
        updatedAt = ?
    WHERE id = ?
  `).run(title || null, description || null, courseId || null, classId || null, deadline || null, now, homeworkId);

  const updatedHomework = db.prepare('SELECT * FROM homeworks WHERE id = ?').get(homeworkId) as Homework;
  ctx.body = { homework: updatedHomework };
});

router.delete('/:id', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const homeworkId = ctx.params.id;
  const homework = db.prepare('SELECT * FROM homeworks WHERE id = ?').get(homeworkId) as Homework | undefined;

  if (!homework) {
    ctx.status = 404;
    ctx.body = { error: '作业不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && homework.teacherId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限删除此作业' };
    return;
  }

  db.prepare('DELETE FROM homeworks WHERE id = ?').run(homeworkId);
  ctx.body = { message: '删除成功' };
});

router.post('/:id/submit', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const homeworkId = ctx.params.id;
  const studentId = ctx.state.user.id;
  const { content, code } = ctx.request.body as { content: string; code: string };

  if (!content || !code) {
    ctx.status = 400;
    ctx.body = { error: '请提交完整的作业内容' };
    return;
  }

  const homework = db.prepare('SELECT * FROM homeworks WHERE id = ?').get(homeworkId) as Homework | undefined;
  if (!homework) {
    ctx.status = 404;
    ctx.body = { error: '作业不存在' };
    return;
  }

  const now = dayjs().toISOString();
  const existingSubmission = db.prepare('SELECT * FROM homework_submissions WHERE homeworkId = ? AND studentId = ?')
    .get(homeworkId, studentId) as HomeworkSubmission | undefined;

  if (existingSubmission) {
    db.prepare(`
      UPDATE homework_submissions
      SET content = ?, code = ?, submittedAt = ?
      WHERE id = ?
    `).run(content, code, now, existingSubmission.id);
  } else {
    const submissionId = uuidv4();
    db.prepare(`
      INSERT INTO homework_submissions (id, homeworkId, studentId, content, code, submittedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(submissionId, homeworkId, studentId, content, code, now);
  }

  ctx.body = { message: '提交成功' };
});

router.put('/:id/grade/:submissionId', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const homeworkId = ctx.params.id;
  const submissionId = ctx.params.submissionId;
  const { score, comment } = ctx.request.body as { score: number; comment?: string };

  const homework = db.prepare('SELECT * FROM homeworks WHERE id = ?').get(homeworkId) as Homework | undefined;
  if (!homework) {
    ctx.status = 404;
    ctx.body = { error: '作业不存在' };
    return;
  }

  if (ctx.state.user.role !== 'admin' && homework.teacherId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限批改此作业' };
    return;
  }

  const now = dayjs().toISOString();
  db.prepare(`
    UPDATE homework_submissions
    SET score = ?, comment = ?, gradedAt = ?
    WHERE id = ?
  `).run(score, comment || null, now, submissionId);

  ctx.body = { message: '批改完成' };
});

export default router;
