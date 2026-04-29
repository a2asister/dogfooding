import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import { User, Course, CourseSelection, ElectiveBatch, CourseCategory } from '../models';
import { literal } from 'sequelize';
import ExcelJS from 'exceljs';

const router = new Router({ prefix: '/api/statistics' });

router.get('/overview', authMiddleware, async (ctx) => {
  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    totalSelections,
    publishedCourses,
    activeBatches,
  ] = await Promise.all([
    User.count({ where: { role: 'student' } }),
    User.count({ where: { role: 'teacher' } }),
    Course.count(),
    CourseSelection.count({ where: { status: 'selected' } }),
    Course.count({ where: { status: 'published' } }),
    ElectiveBatch.count({ where: { status: 'active' } }),
  ]);

  ctx.body = {
    success: true,
    data: {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalSelections,
      publishedCourses,
      activeBatches,
    },
  };
});

router.get('/hot-courses', authMiddleware, async (ctx) => {
  const { limit = 10 } = ctx.query;

  const courses = await Course.findAll({
    where: { status: 'published' },
    include: [
      { association: 'category', attributes: ['id', 'name'] },
      { association: 'teacher', attributes: ['id', 'name'] },
    ],
    order: [['currentStudents', 'DESC']],
    limit: parseInt(limit as string) || 10,
  });

  ctx.body = { success: true, data: courses };
});

router.get('/category-stats', authMiddleware, async (ctx) => {
  const categories = await CourseCategory.findAll({
    where: { isActive: true },
    include: [{ association: 'courses' }],
  });

  const stats = categories.map((cat) => {
    const courses = (cat as unknown as Record<string, unknown>).courses as Course[] || [];
    const totalSelections = courses.reduce((sum, c) => sum + (c.currentStudents || 0), 0);
    return {
      id: cat.id,
      name: cat.name,
      code: cat.code,
      courseCount: courses.length,
      totalSelections,
    };
  });

  ctx.body = { success: true, data: stats };
});

router.get('/selection-trend', authMiddleware, async (ctx) => {
  const { batchId } = ctx.query;

  const where: Record<string, unknown> = { status: 'selected' };
  if (batchId) {
    where.batchId = batchId;
  }

  const dateLiteral = literal('DATE(selectedAt)');
  const selections = await CourseSelection.findAll({
    where,
    attributes: [
      [dateLiteral, 'date'],
      [literal('COUNT(*)'), 'count'],
    ],
    group: [dateLiteral as unknown as string],
    order: [[dateLiteral as unknown as string, 'ASC']],
  });

  ctx.body = {
    success: true,
    data: selections.map((s) => ({
      date: (s as unknown as Record<string, unknown>).date,
      count: (s as unknown as Record<string, unknown>).count,
    })),
  };
});

router.get('/export/selection-summary', authMiddleware, async (ctx) => {
  const { batchId } = ctx.query;

  const where: Record<string, unknown> = { status: 'selected' };
  if (batchId) {
    where.batchId = batchId;
  }

  const selections = await CourseSelection.findAll({
    where,
    include: [
      {
        association: 'course',
        attributes: ['id', 'name', 'code', 'credit'],
        include: [
          { association: 'category', attributes: ['name'] },
          { association: 'teacher', attributes: ['name'] },
        ],
      },
      {
        association: 'student',
        attributes: ['id', 'name', 'studentNo', 'gradeId', 'classId'],
        include: [
          { association: 'grade', attributes: ['name'] },
          { association: 'class', attributes: ['name'] },
        ],
      },
      {
        association: 'batch',
        attributes: ['id', 'name'],
      },
    ],
    order: [['selectedAt', 'DESC']],
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('选课汇总');

  worksheet.columns = [
    { header: '序号', key: 'index', width: 8 },
    { header: '选课批次', key: 'batch', width: 20 },
    { header: '学号', key: 'studentNo', width: 15 },
    { header: '学生姓名', key: 'studentName', width: 12 },
    { header: '年级', key: 'grade', width: 12 },
    { header: '班级', key: 'class', width: 12 },
    { header: '课程编码', key: 'courseCode', width: 15 },
    { header: '课程名称', key: 'courseName', width: 25 },
    { header: '课程分类', key: 'category', width: 15 },
    { header: '学分', key: 'credit', width: 8 },
    { header: '授课教师', key: 'teacher', width: 12 },
    { header: '选课时间', key: 'selectedAt', width: 20 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6E6' },
  };

  selections.forEach((s, index) => {
    const course = (s as unknown as Record<string, unknown>).course as Course | undefined;
    const student = (s as unknown as Record<string, unknown>).student as User | undefined;
    const batch = (s as unknown as Record<string, unknown>).batch as ElectiveBatch | undefined;

    const category = course ? (course as unknown as Record<string, unknown>).category as CourseCategory | undefined : undefined;
    const teacher = course ? (course as unknown as Record<string, unknown>).teacher as User | undefined : undefined;
    const grade = student ? (student as unknown as Record<string, unknown>).grade as { name: string } | undefined : undefined;
    const cls = student ? (student as unknown as Record<string, unknown>).class as { name: string } | undefined : undefined;

    worksheet.addRow({
      index: index + 1,
      batch: batch?.name || '-',
      studentNo: student?.studentNo || '-',
      studentName: student?.name || '-',
      grade: grade?.name || '-',
      class: cls?.name || '-',
      courseCode: course?.code || '-',
      courseName: course?.name || '-',
      category: category?.name || '-',
      credit: course?.credit || 0,
      teacher: teacher?.name || '-',
      selectedAt: s.selectedAt ? s.selectedAt.toISOString().replace('T', ' ').substring(0, 19) : '-',
    });
  });

  ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  ctx.set('Content-Disposition', 'attachment; filename=selection-summary.xlsx');

  const buffer = await workbook.xlsx.writeBuffer();
  ctx.body = buffer;
});

router.get('/export/course-stats', authMiddleware, async (ctx) => {
  const courses = await Course.findAll({
    where: { status: 'published' },
    include: [
      { association: 'category', attributes: ['name'] },
      { association: 'teacher', attributes: ['name'] },
    ],
    order: [['currentStudents', 'DESC']],
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('课程统计');

  worksheet.columns = [
    { header: '序号', key: 'index', width: 8 },
    { header: '课程编码', key: 'code', width: 15 },
    { header: '课程名称', key: 'name', width: 25 },
    { header: '课程分类', key: 'category', width: 15 },
    { header: '学分', key: 'credit', width: 8 },
    { header: '授课教师', key: 'teacher', width: 12 },
    { header: '最大名额', key: 'maxStudents', width: 10 },
    { header: '已选人数', key: 'currentStudents', width: 10 },
    { header: '剩余名额', key: 'remaining', width: 10 },
    { header: '选课率', key: 'rate', width: 10 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6E6' },
  };

  courses.forEach((c, index) => {
    const category = (c as unknown as Record<string, unknown>).category as { name: string } | undefined;
    const teacher = (c as unknown as Record<string, unknown>).teacher as { name: string } | undefined;
    const current = c.currentStudents || 0;
    const max = c.maxStudents || 0;
    const remaining = max - current;
    const rate = max > 0 ? `${((current / max) * 100).toFixed(1)}%` : '-';

    worksheet.addRow({
      index: index + 1,
      code: c.code,
      name: c.name,
      category: category?.name || '-',
      credit: c.credit,
      teacher: teacher?.name || '-',
      maxStudents: max,
      currentStudents: current,
      remaining,
      rate,
    });
  });

  ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  ctx.set('Content-Disposition', 'attachment; filename=course-stats.xlsx');

  const buffer = await workbook.xlsx.writeBuffer();
  ctx.body = buffer;
});

export default router;
