import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import {
  Course,
  CourseSchedule,
  CourseSelection,
  CourseFavorite,
  ElectiveBatch,
  User,
} from '../models';

export const getActiveBatches = async (): Promise<ElectiveBatch[]> => {
  const now = new Date();
  return ElectiveBatch.findAll({
    where: {
      status: 'active',
      startDate: { [Op.lte]: now },
      endDate: { [Op.gte]: now },
    },
    order: [['startDate', 'DESC']],
  });
};

export const getBatchById = async (id: string): Promise<ElectiveBatch | null> => {
  return ElectiveBatch.findByPk(id);
};

export const checkTimeConflict = async (
  studentId: string,
  newCourseId: string,
  batchId: string
): Promise<{
  conflict: boolean;
  conflictingCourse?: {
    id: string;
    name: string;
    schedules: {
      dayOfWeek: number;
      startPeriod: number;
      endPeriod: number;
    }[];
  };
}> => {
  const newCourse = await Course.findByPk(newCourseId, {
    include: [{ association: 'schedules' }],
  });

  if (!newCourse) {
    return { conflict: false };
  }

  const selectedSelections = await CourseSelection.findAll({
    where: {
      studentId,
      batchId,
      status: 'selected',
    },
    include: [
      {
        association: 'course',
        include: [{ association: 'schedules' }],
      },
    ],
  });

  const newSchedules = (newCourse as unknown as Record<string, unknown>).schedules as CourseSchedule[] || [];

  for (const selection of selectedSelections) {
    const selectedCourse = (selection as unknown as Record<string, unknown>).course as Course | undefined;
    if (!selectedCourse) continue;

    const selectedSchedules = (selectedCourse as unknown as Record<string, unknown>).schedules as CourseSchedule[] || [];

    for (const newSched of newSchedules) {
      for (const selectedSched of selectedSchedules) {
        if (newSched.dayOfWeek === selectedSched.dayOfWeek) {
          const newStart = newSched.startPeriod;
          const newEnd = newSched.endPeriod;
          const selStart = selectedSched.startPeriod;
          const selEnd = selectedSched.endPeriod;

          if (newStart <= selEnd && newEnd >= selStart) {
            return {
              conflict: true,
              conflictingCourse: {
                id: selectedCourse.id,
                name: selectedCourse.name,
                schedules: selectedSchedules.map((s) => ({
                  dayOfWeek: s.dayOfWeek,
                  startPeriod: s.startPeriod,
                  endPeriod: s.endPeriod,
                })),
              },
            };
          }
        }
      }
    }
  }

  return { conflict: false };
};

export const selectCourse = async (
  studentId: string,
  courseId: string,
  batchId: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const batch = await ElectiveBatch.findByPk(batchId, { transaction });
    if (!batch) {
      await transaction.rollback();
      return { success: false, message: '选课批次不存在' };
    }

    const now = new Date();
    if (now < batch.startDate || now > batch.endDate) {
      await transaction.rollback();
      return { success: false, message: '不在选课时间段内' };
    }

    if (batch.status !== 'active') {
      await transaction.rollback();
      return { success: false, message: '该批次已结束或取消' };
    }

    const student = await User.findByPk(studentId, { transaction });
    if (!student || student.gradeId) {
      const gradeIds = JSON.parse(JSON.stringify(batch.gradeIds)) as string[];
      if (student?.gradeId && !gradeIds.includes(student.gradeId)) {
        await transaction.rollback();
        return { success: false, message: '您所在的年级不可参与此批次选课' };
      }
    }

    const course = await Course.findByPk(courseId, {
      transaction,
      lock: true,
    });

    if (!course) {
      await transaction.rollback();
      return { success: false, message: '课程不存在' };
    }

    if (course.status !== 'published') {
      await transaction.rollback();
      return { success: false, message: '课程未发布' };
    }

    if (course.currentStudents >= course.maxStudents) {
      await transaction.rollback();
      return { success: false, message: '课程名额已满' };
    }

    const existingSelection = await CourseSelection.findOne({
      where: { studentId, courseId, batchId },
      transaction,
    });

    if (existingSelection) {
      if (existingSelection.status === 'selected') {
        await transaction.rollback();
        return { success: false, message: '您已选择该课程' };
      }
      if (existingSelection.status === 'dropped') {
        await CourseSelection.update(
          { status: 'selected', droppedAt: null, selectedAt: new Date() },
          { where: { id: existingSelection.id }, transaction }
        );

        await Course.increment(
          { currentStudents: 1 },
          { where: { id: courseId }, transaction }
        );

        await transaction.commit();
        return { success: true, message: '选课成功' };
      }
    }

    const { conflict, conflictingCourse } = await checkTimeConflict(
      studentId,
      courseId,
      batchId
    );

    if (conflict && conflictingCourse) {
      await transaction.rollback();
      return {
        success: false,
        message: `课程时间冲突：与课程\"${conflictingCourse.name}\"时间冲突`,
      };
    }

    const currentSelections = await CourseSelection.findAll({
      where: { studentId, batchId, status: 'selected' },
      include: [{ association: 'course' }],
      transaction,
    });

    const currentCredits = currentSelections.reduce((sum, s) => {
      const course = (s as unknown as Record<string, unknown>).course as Course | undefined;
      if (!course) return sum;
      return sum + Number(course.credit);
    }, 0);

    if (currentCredits + Number(course.credit) > Number(batch.maxCredits)) {
      await transaction.rollback();
      return {
        success: false,
        message: `已选学分(${currentCredits}) + 新课程学分(${course.credit}) 超过最大限制(${batch.maxCredits})`,
      };
    }

    await CourseSelection.create(
      {
        studentId,
        courseId,
        batchId,
        status: 'selected',
        selectedAt: new Date(),
      },
      { transaction }
    );

    await Course.increment(
      { currentStudents: 1 },
      { where: { id: courseId }, transaction }
    );

    await transaction.commit();
    return { success: true, message: '选课成功' };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const dropCourse = async (
  studentId: string,
  courseId: string,
  batchId: string
): Promise<{ success: boolean; message: string }> => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const batch = await ElectiveBatch.findByPk(batchId, { transaction });
    if (!batch) {
      await transaction.rollback();
      return { success: false, message: '选课批次不存在' };
    }

    const now = new Date();
    if (now > batch.endDate) {
      await transaction.rollback();
      return { success: false, message: '选课已结束，无法退课' };
    }

    const selection = await CourseSelection.findOne({
      where: { studentId, courseId, batchId, status: 'selected' },
      transaction,
    });

    if (!selection) {
      await transaction.rollback();
      return { success: false, message: '未找到该选课记录' };
    }

    await CourseSelection.update(
      { status: 'dropped', droppedAt: new Date() },
      { where: { id: selection.id }, transaction }
    );

    await Course.decrement(
      { currentStudents: 1 },
      { where: { id: courseId }, transaction }
    );

    await transaction.commit();
    return { success: true, message: '退课成功' };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getStudentSelections = async (
  studentId: string,
  batchId: string
): Promise<CourseSelection[]> => {
  return CourseSelection.findAll({
    where: { studentId, batchId, status: 'selected' },
    include: [
      {
        association: 'course',
        include: [
          { association: 'category', attributes: ['id', 'name'] },
          { association: 'teacher', attributes: ['id', 'name'] },
          { association: 'schedules' },
        ],
      },
    ],
    order: [['selectedAt', 'DESC']],
  });
};

export const toggleFavorite = async (
  studentId: string,
  courseId: string
): Promise<{ success: boolean; message: string; isFavorite: boolean }> => {
  const existing = await CourseFavorite.findOne({
    where: { studentId, courseId },
  });

  if (existing) {
    await existing.destroy();
    return { success: true, message: '已取消收藏', isFavorite: false };
  }

  await CourseFavorite.create({ studentId, courseId });
  return { success: true, message: '收藏成功', isFavorite: true };
};

export const getStudentFavorites = async (studentId: string): Promise<CourseFavorite[]> => {
  return CourseFavorite.findAll({
    where: { studentId },
    include: [
      {
        association: 'course',
        include: [
          { association: 'category', attributes: ['id', 'name'] },
          { association: 'teacher', attributes: ['id', 'name'] },
          { association: 'schedules' },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

export const createBatch = async (data: {
  name: string;
  academicYear: string;
  semester: string;
  startDate: Date;
  endDate: Date;
  gradeIds: string[];
  maxCredits: number;
  minCredits: number;
  description?: string;
}): Promise<{ success: boolean; message: string; batch?: ElectiveBatch }> => {
  const batch = await ElectiveBatch.create({
    ...data,
    status: 'pending',
  });

  return { success: true, message: '创建成功', batch };
};

export const getBatches = async (options: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  rows: ElectiveBatch[];
  count: number;
  totalPages: number;
}> => {
  const { status, page = 1, pageSize = 20 } = options;

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }

  const { rows, count } = await ElectiveBatch.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    rows,
    count,
    totalPages: Math.ceil(count / pageSize),
  };
};

export const startBatch = async (id: string): Promise<{ success: boolean; message: string }> => {
  const batch = await ElectiveBatch.findByPk(id);

  if (!batch) {
    return { success: false, message: '批次不存在' };
  }

  if (batch.status !== 'pending') {
    return { success: false, message: '只能启动待开始的批次' };
  }

  await ElectiveBatch.update({ status: 'active' }, { where: { id } });

  return { success: true, message: '批次已启动' };
};

export const endBatch = async (id: string): Promise<{ success: boolean; message: string }> => {
  const batch = await ElectiveBatch.findByPk(id);

  if (!batch) {
    return { success: false, message: '批次不存在' };
  }

  if (batch.status !== 'active') {
    return { success: false, message: '只能结束进行中的批次' };
  }

  await ElectiveBatch.update({ status: 'ended' }, { where: { id } });

  return { success: true, message: '批次已结束' };
};
