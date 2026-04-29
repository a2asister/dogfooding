import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import { Course, CourseSelection, CourseSchedule, User } from '../models';
import { z } from 'zod';
import ExcelJS from 'exceljs';

const router = new Router({ prefix: '/api/teacher' });

router.get('/my-courses', authMiddleware, async (ctx) => {
  const teacherId = ctx.state.user.id;
  const { status, page, pageSize } = ctx.query;

  const where: Record<string, unknown> = { teacherId };
  if (status) {
    where.status = status;
  }

  const limit = pageSize ? parseInt(pageSize as string) : 20;
  const offset = page ? (parseInt(page as string) - 1) * limit : 0;

  const { count, rows } = await Course.findAndCountAll({
    where,
    include: [
      { association: 'category', attributes: ['id', 'name'] },
      { association: 'schedules' },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  ctx.body = {
    success: true,
    data: {
      rows,
      count,
      totalPages: Math.ceil(count / limit),
    },
  };
});

router.get('/courses/:courseId/selections', authMiddleware, async (ctx) => {
  const teacherId = ctx.state.user.id;
  const { courseId } = ctx.params;
  const { batchId } = ctx.query;

  const course = await Course.findOne({
    where: { id: courseId, teacherId },
  });

  if (!course) {
    ctx.status = 404;
    ctx.body = { success: false, message: '课程不存在或您无权限访问' };
    return;
  }

  const where: Record<string, unknown> = { courseId, status: 'selected' };
  if (batchId) {
    where.batchId = batchId;
  }

  const selections = await CourseSelection.findAll({
    where,
    include: [
      {
        association: 'student',
        attributes: ['id', 'name', 'studentNo', 'email', 'phone'],
        include: [
          { association: 'grade', attributes: ['name'] },
          { association: 'class', attributes: ['name'] },
        ],
      },
      { association: 'batch', attributes: ['id', 'name'] },
    ],
    order: [['selectedAt', 'ASC']],
  });

  ctx.body = { success: true, data: selections };
});

const updateGradeSchema = z.object({
  score: z.number().min(0).max(100).optional(),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']).optional(),
  isPassed: z.boolean().optional(),
  comment: z.string().optional(),
});

router.put('/selections/:selectionId/grade', authMiddleware, async (ctx) => {
  const teacherId = ctx.state.user.id;
  const { selectionId } = ctx.params;

  const result = updateGradeSchema.safeParse(ctx.request.body);
  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const selection = await CourseSelection.findByPk(selectionId, {
    include: [
      {
        association: 'course',
        attributes: ['id', 'teacherId'],
      },
    ],
  });

  if (!selection) {
    ctx.status = 404;
    ctx.body = { success: false, message: '选课记录不存在' };
    return;
  }

  const course = (selection as unknown as Record<string, unknown>).course as Course | undefined;
  if (!course || course.teacherId !== teacherId) {
    ctx.status = 403;
    ctx.body = { success: false, message: '您无权限修改该课程的成绩' };
    return;
  }

  await CourseSelection.update(
    {
      ...result.data,
      gradedAt: new Date(),
      isGraded: true,
    },
    { where: { id: selectionId } }
  );

  ctx.body = { success: true, message: '成绩录入成功' };
});

router.get('/courses/:courseId/export-grades', authMiddleware, async (ctx) => {
  const teacherId = ctx.state.user.id;
  const { courseId } = ctx.params;
  const { batchId } = ctx.query;

  const course = await Course.findOne({
    where: { id: courseId, teacherId },
    include: [
      { association: 'category', attributes: ['name'] },
      { association: 'schedules' },
    ],
  });

  if (!course) {
    ctx.status = 404;
    ctx.body = { success: false, message: '课程不存在或您无权限访问' };
    return;
  }

  const where: Record<string, unknown> = { courseId, status: 'selected' };
  if (batchId) {
    where.batchId = batchId;
  }

  const selections = await CourseSelection.findAll({
    where,
    include: [
      {
        association: 'student',
        attributes: ['id', 'name', 'studentNo'],
        include: [
          { association: 'grade', attributes: ['name'] },
          { association: 'class', attributes: ['name'] },
        ],
      },
    ],
    order: [['selectedAt', 'ASC']],
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('成绩表');

  const category = (course as unknown as Record<string, unknown>).category as { name: string } | undefined;
  const schedules = (course as unknown as Record<string, unknown>).schedules as CourseSchedule[] || [];

  const scheduleText = schedules
    .map((s) => {
      const dayMap: Record<number, string> = {
        1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'
      };
      return `${dayMap[s.dayOfWeek] || s.dayOfWeek} 第${s.startPeriod}-${s.endPeriod}节 ${s.location}`;
    })
    .join('；');

  worksheet.mergeCells('A1:H1');
  worksheet.getCell('A1').value = `课程成绩表 - ${course.name} (${course.code})`;
  worksheet.getCell('A1').font = { bold: true, size: 14 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:H2');
  worksheet.getCell('A2').value = `课程分类：${category?.name || '-'} | 学分：${course.credit} | 上课时间：${scheduleText || '-'}`;
  worksheet.getCell('A2').font = { size: 11 };
  worksheet.getCell('A2').alignment = { horizontal: 'left' };

  worksheet.addRow([]);

  worksheet.getRow(4).values = [
    '序号', '学号', '姓名', '年级', '班级', '分数', '等级', '是否通过'
  ];
  worksheet.getRow(4).font = { bold: true };
  worksheet.getRow(4).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6E6E6' },
  };

  worksheet.columns = [
    { width: 8 },
    { width: 15 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
  ];

  selections.forEach((s, index) => {
    const student = (s as unknown as Record<string, unknown>).student as User | undefined;
    const grade = student ? (student as unknown as Record<string, unknown>).grade as { name: string } | undefined : undefined;
    const cls = student ? (student as unknown as Record<string, unknown>).class as { name: string } | undefined : undefined;

    worksheet.addRow({
      index: index + 1,
      studentNo: student?.studentNo || '-',
      name: student?.name || '-',
      grade: grade?.name || '-',
      class: cls?.name || '-',
      score: s.score ?? '-',
      gradeLevel: s.grade || '-',
      isPassed: s.isPassed !== undefined ? (s.isPassed ? '是' : '否') : '-',
    });
  });

  ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  ctx.set('Content-Disposition', `attachment; filename=grades-${course.code}.xlsx`);

  const buffer = await workbook.xlsx.writeBuffer();
  ctx.body = buffer;
});

export default router;
