import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../db';
import { authMiddleware, AuthContext, requireRole } from '../middleware/auth';

const router = new Router({ prefix: '/api/wrong-questions' });

router.get('/', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const studentId = ctx.state.user.id;
  const questions = db.prepare(`
    SELECT wq.*, c.title as challengeTitle, h.title as homeworkTitle
    FROM wrong_questions wq
    LEFT JOIN challenges c ON wq.challengeId = c.id
    LEFT JOIN homeworks h ON wq.homeworkId = h.id
    WHERE wq.studentId = ?
    ORDER BY wq.createdAt DESC
  `).all(studentId);

  ctx.body = { questions };
});

router.post('/', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const { challengeId, homeworkId, questionTitle, wrongCode, correctCode, note } = ctx.request.body as {
    challengeId?: string;
    homeworkId?: string;
    questionTitle: string;
    wrongCode: string;
    correctCode?: string;
    note?: string;
  };

  if (!questionTitle || !wrongCode) {
    ctx.status = 400;
    ctx.body = { error: '请填写完整信息' };
    return;
  }

  const questionId = uuidv4();
  const now = dayjs().toISOString();

  db.prepare(`
    INSERT INTO wrong_questions (id, studentId, challengeId, homeworkId, questionTitle, wrongCode, correctCode, note, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(questionId, ctx.state.user.id, challengeId || null, homeworkId || null, 
         questionTitle, wrongCode, correctCode || null, note || null, now);

  ctx.body = { message: '添加成功' };
});

router.put('/:id', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const questionId = ctx.params.id;
  const question = db.prepare('SELECT * FROM wrong_questions WHERE id = ?').get(questionId) as { studentId: string } | undefined;

  if (!question) {
    ctx.status = 404;
    ctx.body = { error: '错题不存在' };
    return;
  }

  if (question.studentId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限修改此错题' };
    return;
  }

  const { correctCode, note } = ctx.request.body as { correctCode?: string; note?: string };

  db.prepare(`
    UPDATE wrong_questions
    SET correctCode = COALESCE(?, correctCode),
        note = COALESCE(?, note)
    WHERE id = ?
  `).run(correctCode || null, note || null, questionId);

  ctx.body = { message: '更新成功' };
});

router.delete('/:id', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const questionId = ctx.params.id;
  const question = db.prepare('SELECT * FROM wrong_questions WHERE id = ?').get(questionId) as { studentId: string } | undefined;

  if (!question) {
    ctx.status = 404;
    ctx.body = { error: '错题不存在' };
    return;
  }

  if (question.studentId !== ctx.state.user.id) {
    ctx.status = 403;
    ctx.body = { error: '无权限删除此错题' };
    return;
  }

  db.prepare('DELETE FROM wrong_questions WHERE id = ?').run(questionId);
  ctx.body = { message: '删除成功' };
});

export default router;
