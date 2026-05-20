import Router from 'koa-router';
import dayjs from 'dayjs';
import { db } from '../db';
import { authMiddleware, AuthContext, requireRole } from '../middleware/auth';

const router = new Router({ prefix: '/api/stats' });

router.get('/student', authMiddleware, requireRole('student'), async (ctx: AuthContext) => {
  const studentId = ctx.state.user.id;

  const profile = db.prepare('SELECT points, level FROM student_profiles WHERE userId = ?').get(studentId) as { points: number; level: number };
  
  const totalCourses = db.prepare('SELECT COUNT(*) as count FROM course_enrollments WHERE studentId = ?').get(studentId) as { count: number };
  const completedCourses = db.prepare('SELECT COUNT(*) as count FROM course_enrollments WHERE studentId = ? AND progress >= 100').get(studentId) as { count: number };
  
  const totalChallenges = db.prepare('SELECT COUNT(*) as count FROM challenge_progress WHERE studentId = ?').get(studentId) as { count: number };
  const completedChallenges = db.prepare('SELECT COUNT(*) as count FROM challenge_progress WHERE studentId = ? AND completed = 1').get(studentId) as { count: number };
  
  const totalHomework = db.prepare(`
    SELECT COUNT(*) as count 
    FROM homework_submissions hs
    JOIN homeworks h ON hs.homeworkId = h.id
    JOIN student_profiles sp ON sp.classId = h.classId
    WHERE sp.userId = ?
  `).get(studentId) as { count: number };
  
  const avgScore = db.prepare(`
    SELECT AVG(score) as avg 
    FROM homework_submissions 
    WHERE studentId = ? AND score IS NOT NULL
  `).get(studentId) as { avg: number | null };

  const badges = db.prepare(`
    SELECT b.*, ub.earnedAt
    FROM user_badges ub
    JOIN badges b ON ub.badgeId = b.id
    WHERE ub.userId = ?
    ORDER BY ub.earnedAt DESC
  `).all(studentId);

  const recentActivity = db.prepare(`
    SELECT * FROM (
      SELECT 'course' as type, enrolledAt as date, courseId as id, NULL as title FROM course_enrollments WHERE studentId = ?
      UNION ALL
      SELECT 'challenge' as type, completedAt as date, challengeId as id, NULL as title FROM challenge_progress WHERE studentId = ? AND completed = 1
      UNION ALL
      SELECT 'homework' as type, submittedAt as date, homeworkId as id, NULL as title FROM homework_submissions WHERE studentId = ?
      UNION ALL
      SELECT 'project' as type, createdAt as date, id, title FROM projects WHERE studentId = ?
    ) ORDER BY date DESC LIMIT 10
  `).all(studentId, studentId, studentId, studentId);

  ctx.body = {
    stats: {
      points: profile?.points || 0,
      level: profile?.level || 1,
      totalCourses: totalCourses.count,
      completedCourses: completedCourses.count,
      totalChallenges: totalChallenges.count,
      completedChallenges: completedChallenges.count,
      totalHomework: totalHomework.count,
      avgScore: avgScore.avg || 0,
      badgesCount: badges.length,
    },
    badges,
    recentActivity,
  };
});

router.get('/teacher', authMiddleware, requireRole('teacher'), async (ctx: AuthContext) => {
  const teacherId = ctx.state.user.id;

  const totalClasses = db.prepare('SELECT COUNT(*) as count FROM classes WHERE teacherId = ?').get(teacherId) as { count: number };
  const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses WHERE teacherId = ?').get(teacherId) as { count: number };
  const totalHomework = db.prepare('SELECT COUNT(*) as count FROM homeworks WHERE teacherId = ?').get(teacherId) as { count: number };
  
  const totalStudents = db.prepare(`
    SELECT COUNT(DISTINCT sp.userId) as count
    FROM classes c
    JOIN student_profiles sp ON c.id = sp.classId
    WHERE c.teacherId = ?
  `).get(teacherId) as { count: number };

  const ungradedSubmissions = db.prepare(`
    SELECT COUNT(*) as count
    FROM homework_submissions hs
    JOIN homeworks h ON hs.homeworkId = h.id
    WHERE h.teacherId = ? AND hs.score IS NULL
  `).get(teacherId) as { count: number };

  const classStats = db.prepare(`
    SELECT 
      c.id,
      c.name,
      COUNT(DISTINCT sp.userId) as studentCount,
      COUNT(DISTINCT h.id) as homeworkCount
    FROM classes c
    LEFT JOIN student_profiles sp ON c.id = sp.classId
    LEFT JOIN homeworks h ON c.id = h.classId
    WHERE c.teacherId = ?
    GROUP BY c.id
  `).all(teacherId);

  const recentSubmissions = db.prepare(`
    SELECT hs.*, u.nickname as studentName, h.title as homeworkTitle
    FROM homework_submissions hs
    JOIN homeworks h ON hs.homeworkId = h.id
    JOIN users u ON hs.studentId = u.id
    WHERE h.teacherId = ?
    ORDER BY hs.submittedAt DESC LIMIT 10
  `).all(teacherId);

  ctx.body = {
    stats: {
      totalClasses: totalClasses.count,
      totalCourses: totalCourses.count,
      totalHomework: totalHomework.count,
      totalStudents: totalStudents.count,
      ungradedSubmissions: ungradedSubmissions.count,
    },
    classStats,
    recentSubmissions,
  };
});

router.get('/admin', authMiddleware, requireRole('admin'), async (_ctx: AuthContext) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get() as { count: number };
  const totalTeachers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'").get() as { count: number };
  const totalParents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'parent'").get() as { count: number };
  
  const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number };
  const totalChallenges = db.prepare('SELECT COUNT(*) as count FROM challenges').get() as { count: number };
  const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  const totalClasses = db.prepare('SELECT COUNT(*) as count FROM classes').get() as { count: number };

  const newUsersThisMonth = db.prepare(`
    SELECT COUNT(*) as count FROM users 
    WHERE createdAt >= ?
  `).get(dayjs().startOf('month').toISOString()) as { count: number };

  const userGrowth = db.prepare(`
    SELECT 
      strftime('%Y-%m', createdAt) as month,
      COUNT(*) as count
    FROM users
    GROUP BY month
    ORDER BY month DESC LIMIT 6
  `).all();

  const popularCourses = db.prepare(`
    SELECT c.title, COUNT(ce.id) as enrollments
    FROM courses c
    LEFT JOIN course_enrollments ce ON c.id = ce.courseId
    GROUP BY c.id
    ORDER BY enrollments DESC LIMIT 5
  `).all();

  ctx.body = {
    stats: {
      totalUsers: totalUsers.count,
      totalStudents: totalStudents.count,
      totalTeachers: totalTeachers.count,
      totalParents: totalParents.count,
      totalCourses: totalCourses.count,
      totalChallenges: totalChallenges.count,
      totalProjects: totalProjects.count,
      totalClasses: totalClasses.count,
      newUsersThisMonth: newUsersThisMonth.count,
    },
    userGrowth,
    popularCourses,
  };
});

router.get('/parent/:studentId', authMiddleware, requireRole('parent'), async (ctx: AuthContext) => {
  const studentId = ctx.params.studentId;
  const parentId = ctx.state.user.id;

  const parentProfile = db.prepare('SELECT childrenIds FROM parent_profiles WHERE userId = ?').get(parentId) as { childrenIds: string } | undefined;
  const childrenIds: string[] = parentProfile?.childrenIds ? JSON.parse(parentProfile.childrenIds) : [];

  if (!childrenIds.includes(studentId)) {
    ctx.status = 403;
    ctx.body = { error: '无权限查看此学生数据' };
    return;
  }

  const student = db.prepare('SELECT id, nickname, avatar FROM users WHERE id = ?').get(studentId) as { id: string; nickname: string; avatar?: string };
  const profile = db.prepare('SELECT points, level FROM student_profiles WHERE userId = ?').get(studentId) as { points: number; level: number };

  const completedCourses = db.prepare('SELECT COUNT(*) as count FROM course_enrollments WHERE studentId = ? AND progress >= 100').get(studentId) as { count: number };
  const completedChallenges = db.prepare('SELECT COUNT(*) as count FROM challenge_progress WHERE studentId = ? AND completed = 1').get(studentId) as { count: number };

  const homeworkStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN score IS NOT NULL THEN 1 END) as graded,
      AVG(score) as avgScore
    FROM homework_submissions WHERE studentId = ?
  `).get(studentId) as { total: number; graded: number; avgScore: number | null };

  const monthlyReports = db.prepare(`
    SELECT * FROM monthly_reports 
    WHERE studentId = ? 
    ORDER BY month DESC LIMIT 6
  `).all(studentId);

  const recentHomework = db.prepare(`
    SELECT hs.*, h.title as homeworkTitle, h.deadline
    FROM homework_submissions hs
    JOIN homeworks h ON hs.homeworkId = h.id
    WHERE hs.studentId = ?
    ORDER BY hs.submittedAt DESC LIMIT 5
  `).all(studentId);

  ctx.body = {
    student,
    stats: {
      points: profile?.points || 0,
      level: profile?.level || 1,
      completedCourses: completedCourses.count,
      completedChallenges: completedChallenges.count,
      totalHomework: homeworkStats.total,
      gradedHomework: homeworkStats.graded,
      avgScore: homeworkStats.avgScore || 0,
    },
    monthlyReports,
    recentHomework,
  };
});

export default router;
