import Router from 'koa-router';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { db } from '../db';
import { authMiddleware, AuthContext, requireRole } from '../middleware/auth';
import { Challenge, ChallengeProgress } from '../types';

const router = new Router({ prefix: '/api/challenges' });

router.get('/', authMiddleware, async (ctx: AuthContext) => {
  const { level, completed } = ctx.query as { level?: string; completed?: string };

  let query = 'SELECT * FROM challenges WHERE 1=1';
  const params: string[] = [];

  if (level) {
    query += ' AND level = ?';
    params.push(level);
  }

  query += ' ORDER BY createdAt DESC';
  let challenges = db.prepare(query).all(...params) as Challenge[];

  if (ctx.state.user.role === 'student' && completed !== undefined) {
    const studentId = ctx.state.user.id;
    const progressList = db.prepare('SELECT challengeId, completed FROM challenge_progress WHERE studentId = ?')
      .all(studentId) as { challengeId: string; completed: number }[];
    
    const completedMap = new Map(progressList.map(p => [p.challengeId, !!p.completed]));
    
    const isCompleted = completed === 'true';
    challenges = challenges.filter(c => {
      const challengeCompleted = completedMap.get(c.id) || false;
      return isCompleted ? challengeCompleted : !challengeCompleted;
    });

    challenges = challenges.map(c => ({
      ...c,
      completed: completedMap.get(c.id) || false,
    }));
  }

  ctx.body = { challenges };
});

router.get('/my-progress', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const studentId = ctx.state.user.id;
  const progress = db.prepare(`
    SELECT cp.*, c.title, c.description, c.level, c.points
    FROM challenge_progress cp
    JOIN challenges c ON cp.challengeId = c.id
    WHERE cp.studentId = ?
    ORDER BY cp.completedAt DESC
  `).all(studentId);

  ctx.body = { progress };
});

router.get('/:id', authMiddleware, async (ctx: AuthContext) => {
  const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?')
    .get(ctx.params.id) as Challenge | undefined;

  if (!challenge) {
    ctx.status = 404;
    ctx.body = { error: '闯关题不存在' };
    return;
  }

  let userProgress: ChallengeProgress | undefined;
  if (ctx.state.user.role === 'student') {
    userProgress = db.prepare('SELECT * FROM challenge_progress WHERE challengeId = ? AND studentId = ?')
      .get(ctx.params.id, ctx.state.user.id) as ChallengeProgress | undefined;
  }

  ctx.body = { challenge, progress: userProgress };
});

router.post('/', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const { title, description, level, content, expectedOutput, points } = ctx.request.body as {
    title: string;
    description: string;
    level: 'easy' | 'medium' | 'hard';
    content: string;
    expectedOutput?: string;
    points?: number;
  };

  if (!title || !description || !level || !content) {
    ctx.status = 400;
    ctx.body = { error: '请填写完整信息' };
    return;
  }

  const challengeId = uuidv4();
  const now = dayjs().toISOString();

  db.prepare(`
    INSERT INTO challenges (id, title, description, level, content, expectedOutput, points, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(challengeId, title, description, level, content, expectedOutput || null, points || 10, now);

  const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId) as Challenge;
  ctx.body = { challenge };
});

router.put('/:id', authMiddleware, requireRole('teacher', 'admin'), async (ctx: AuthContext) => {
  const challengeId = ctx.params.id;
  const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId) as Challenge | undefined;

  if (!challenge) {
    ctx.status = 404;
    ctx.body = { error: '闯关题不存在' };
    return;
  }

  const { title, description, level, content, expectedOutput, points } = ctx.request.body as {
    title?: string;
    description?: string;
    level?: 'easy' | 'medium' | 'hard';
    content?: string;
    expectedOutput?: string;
    points?: number;
  };

  db.prepare(`
    UPDATE challenges
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        level = COALESCE(?, level),
        content = COALESCE(?, content),
        expectedOutput = COALESCE(?, expectedOutput),
        points = COALESCE(?, points)
    WHERE id = ?
  `).run(title || null, description || null, level || null, content || null, 
         expectedOutput || null, points || null, challengeId);

  const updatedChallenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId) as Challenge;
  ctx.body = { challenge: updatedChallenge };
});

router.delete('/:id', authMiddleware, requireRole('admin'), async (ctx: AuthContext) => {
  const challengeId = ctx.params.id;
  db.prepare('DELETE FROM challenges WHERE id = ?').run(challengeId);
  ctx.body = { message: '删除成功' };
});

router.post('/:id/submit', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const challengeId = ctx.params.id;
  const studentId = ctx.state.user.id;
  const { code, output } = ctx.request.body as { code: string; output?: string };

  if (!code) {
    ctx.status = 400;
    ctx.body = { error: '请提交代码' };
    return;
  }

  const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId) as Challenge | undefined;
  if (!challenge) {
    ctx.status = 404;
    ctx.body = { error: '闯关题不存在' };
    return;
  }

  let completed = false;
  if (challenge.expectedOutput && output) {
    completed = output.trim() === challenge.expectedOutput.trim();
  }

  const now = dayjs().toISOString();
  const existingProgress = db.prepare('SELECT * FROM challenge_progress WHERE challengeId = ? AND studentId = ?')
    .get(challengeId, studentId) as ChallengeProgress | undefined;

  if (existingProgress) {
    const newAttempts = existingProgress.attempts + 1;
    if (completed && !existingProgress.completed) {
      db.prepare(`
        UPDATE challenge_progress
        SET completed = 1, attempts = ?, code = ?, completedAt = ?
        WHERE id = ?
      `).run(newAttempts, code, now, existingProgress.id);

      db.prepare('UPDATE student_profiles SET points = points + ? WHERE userId = ?')
        .run(challenge.points, studentId);
    } else {
      db.prepare(`
        UPDATE challenge_progress
        SET attempts = ?, code = ?
        WHERE id = ?
      `).run(newAttempts, code, existingProgress.id);
    }
  } else {
    const progressId = uuidv4();
    db.prepare(`
      INSERT INTO challenge_progress (id, challengeId, studentId, completed, attempts, code, completedAt)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `).run(progressId, challengeId, studentId, completed ? 1 : 0, code, completed ? now : null);

    if (completed) {
      db.prepare('UPDATE student_profiles SET points = points + ? WHERE userId = ?')
        .run(challenge.points, studentId);
    }
  }

  ctx.body = { completed, message: completed ? '闯关成功！' : '继续加油！' };
});

export default router;
