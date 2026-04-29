import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import {
  Course,
  CourseCategory,
  CourseSchedule,
  CourseSelection,
} from '../models';

export const getCourseCategories = async (): Promise<CourseCategory[]> => {
  return CourseCategory.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC']],
  });
};

export const createCourseCategory = async (data: {
  name: string;
  code: string;
  description?: string;
  sortOrder?: number;
}): Promise<{ success: boolean; message: string; category?: CourseCategory }> => {
  const existing = await CourseCategory.findOne({
    where: { code: data.code },
  });

  if (existing) {
    return { success: false, message: '分类编码已存在' };
  }

  const category = await CourseCategory.create(data);
  return { success: true, message: '创建成功', category };
};

export const updateCourseCategory = async (
  id: string,
  data: Partial<{
    name: string;
    code: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
  }>
): Promise<{ success: boolean; message: string }> => {
  const category = await CourseCategory.findByPk(id);

  if (!category) {
    return { success: false, message: '分类不存在' };
  }

  await CourseCategory.update(data, { where: { id } });

  return { success: true, message: '更新成功' };
};

export const deleteCourseCategory = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const category = await CourseCategory.findByPk(id);

  if (!category) {
    return { success: false, message: '分类不存在' };
  }

  const courseCount = await Course.count({ where: { categoryId: id } });
  if (courseCount > 0) {
    return { success: false, message: '该分类下还有课程，无法删除' };
  }

  await CourseCategory.destroy({ where: { id } });

  return { success: true, message: '删除成功' };
};

export const getCourses = async (options: {
  categoryId?: string;
  teacherId?: string;
  status?: 'draft' | 'published' | 'archived';
  keyword?: string;
  isHot?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{
  rows: Course[];
  count: number;
  totalPages: number;
}> => {
  const { categoryId, teacherId, status, keyword, isHot, page = 1, pageSize = 20 } = options;

  const where: Record<string, unknown> = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (teacherId) {
    where.teacherId = teacherId;
  }
  if (status) {
    where.status = status;
  }
  if (isHot !== undefined) {
    where.isHot = isHot;
  }
  if (keyword) {
    (where as Record<string, unknown>)[Op.or as unknown as string] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { code: { [Op.like]: `%${keyword}%` } },
    ];
  }

  const { rows, count } = await Course.findAndCountAll({
    where,
    include: [
      {
        association: 'category',
        attributes: ['id', 'name', 'code'],
      },
      {
        association: 'teacher',
        attributes: ['id', 'name', 'teacherNo'],
      },
      {
        association: 'schedules',
      },
    ],
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    rows,
    count,
    totalPages: Math.ceil(count / pageSize),
  };
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  return Course.findByPk(id, {
    include: [
      {
        association: 'category',
        attributes: ['id', 'name', 'code'],
      },
      {
        association: 'teacher',
        attributes: ['id', 'name', 'teacherNo'],
      },
      {
        association: 'schedules',
      },
    ],
  });
};

export const createCourse = async (data: {
  name: string;
  code: string;
  categoryId: string;
  teacherId: string;
  credit: number;
  totalHours?: number;
  maxStudents?: number;
  description?: string;
  syllabus?: string;
  prerequisites?: string;
  assessmentMethod?: string;
  sortOrder?: number;
  schedules?: Array<{
    dayOfWeek: number;
    startPeriod: number;
    endPeriod: number;
    location: string;
    startWeek?: number;
    endWeek?: number;
  }>;
}): Promise<{ success: boolean; message: string; course?: Course }> => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const existing = await Course.findOne({
      where: { code: data.code },
      transaction,
    });

    if (existing) {
      await transaction.rollback();
      return { success: false, message: '课程编码已存在' };
    }

    const course = await Course.create(
      {
        name: data.name,
        code: data.code,
        categoryId: data.categoryId,
        teacherId: data.teacherId,
        credit: data.credit,
        totalHours: data.totalHours ?? 36,
        maxStudents: data.maxStudents ?? 50,
        description: data.description,
        syllabus: data.syllabus,
        prerequisites: data.prerequisites,
        assessmentMethod: data.assessmentMethod,
        sortOrder: data.sortOrder ?? 0,
      },
      { transaction }
    );

    if (data.schedules && data.schedules.length > 0) {
      const schedulesData = data.schedules.map((s) => ({
        ...s,
        courseId: course.id,
      }));
      await CourseSchedule.bulkCreate(schedulesData, { transaction });
    }

    await transaction.commit();
    return { success: true, message: '创建成功', course };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateCourse = async (
  id: string,
  data: Partial<{
    name: string;
    categoryId: string;
    teacherId: string;
    credit: number;
    totalHours: number;
    maxStudents: number;
    description: string;
    syllabus: string;
    prerequisites: string;
    assessmentMethod: string;
    status: 'draft' | 'published' | 'archived';
    isHot: boolean;
    sortOrder: number;
    schedules?: Array<{
      dayOfWeek: number;
      startPeriod: number;
      endPeriod: number;
      location: string;
      startWeek?: number;
      endWeek?: number;
    }>;
  }>
): Promise<{ success: boolean; message: string }> => {
  const course = await Course.findByPk(id);

  if (!course) {
    return { success: false, message: '课程不存在' };
  }

  const { schedules, ...courseData } = data;

  const transaction: Transaction = await sequelize.transaction();

  try {
    await Course.update(courseData, { where: { id }, transaction });

    if (schedules !== undefined) {
      await CourseSchedule.destroy({ where: { courseId: id }, transaction });

      if (schedules.length > 0) {
        const schedulesData = schedules.map((s) => ({
          ...s,
          courseId: id,
        }));
        await CourseSchedule.bulkCreate(schedulesData, { transaction });
      }
    }

    await transaction.commit();
    return { success: true, message: '更新成功' };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const publishCourse = async (id: string): Promise<{ success: boolean; message: string }> => {
  const course = await Course.findByPk(id);

  if (!course) {
    return { success: false, message: '课程不存在' };
  }

  if (course.status === 'published') {
    return { success: false, message: '课程已发布' };
  }

  await Course.update({ status: 'published' }, { where: { id } });

  return { success: true, message: '发布成功' };
};

export const archiveCourse = async (id: string): Promise<{ success: boolean; message: string }> => {
  const course = await Course.findByPk(id);

  if (!course) {
    return { success: false, message: '课程不存在' };
  }

  const activeSelections = await CourseSelection.count({
    where: { courseId: id, status: 'selected' },
  });

  if (activeSelections > 0) {
    return { success: false, message: '该课程有学生已选，无法归档' };
  }

  await Course.update({ status: 'archived' }, { where: { id } });

  return { success: true, message: '归档成功' };
};

export const getPublishedCourses = async (options: {
  categoryId?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  rows: Course[];
  count: number;
  totalPages: number;
}> => {
  const { categoryId, keyword, page = 1, pageSize = 20 } = options;

  const where: Record<string, unknown> = {
    status: 'published',
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (keyword) {
    (where as Record<string, unknown>)[Op.or as unknown as string] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { code: { [Op.like]: `%${keyword}%` } },
    ];
  }

  const { rows, count } = await Course.findAndCountAll({
    where,
    include: [
      {
        association: 'category',
        attributes: ['id', 'name', 'code'],
      },
      {
        association: 'teacher',
        attributes: ['id', 'name', 'teacherNo'],
      },
      {
        association: 'schedules',
      },
    ],
    order: [['isHot', 'DESC'], ['sortOrder', 'ASC'], ['currentStudents', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    rows,
    count,
    totalPages: Math.ceil(count / pageSize),
  };
};
