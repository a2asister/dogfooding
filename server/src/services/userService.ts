import { Op } from 'sequelize';
import { User } from '../models';
import { hashPassword } from '../utils/password';
import type { UserRole } from '../types';

export const getUsers = async (options: {
  role?: UserRole;
  gradeId?: string;
  classId?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  rows: User[];
  count: number;
  totalPages: number;
}> => {
  const { role, gradeId, classId, keyword, page = 1, pageSize = 20 } = options;

  const where: Record<string, unknown> = {};

  if (role) {
    where.role = role;
  }
  if (gradeId) {
    where.gradeId = gradeId;
  }
  if (classId) {
    where.classId = classId;
  }
  if (keyword) {
    (where as Record<string, unknown>)[Op.or as unknown as string] = [
      { username: { [Op.like]: `%${keyword}%` } },
      { name: { [Op.like]: `%${keyword}%` } },
      { studentNo: { [Op.like]: `%${keyword}%` } },
      { teacherNo: { [Op.like]: `%${keyword}%` } },
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    include: [
      { association: 'grade', attributes: ['id', 'name', 'year'] },
      { association: 'class', attributes: ['id', 'name'] },
    ],
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

export const getUserById = async (id: string): Promise<User | null> => {
  return User.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [
      { association: 'grade', attributes: ['id', 'name', 'year'] },
      { association: 'class', attributes: ['id', 'name'] },
    ],
  });
};

export const createUser = async (data: {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  studentNo?: string;
  teacherNo?: string;
  gradeId?: string;
  classId?: string;
  avatar?: string;
}): Promise<{ success: boolean; message: string; user?: User }> => {
  const existingUser = await User.findOne({
    where: { username: data.username },
  });

  if (existingUser) {
    return { success: false, message: '用户名已存在' };
  }

  if (data.studentNo) {
    const existingStudent = await User.findOne({
      where: { studentNo: data.studentNo },
    });
    if (existingStudent) {
      return { success: false, message: '学号已存在' };
    }
  }

  if (data.teacherNo) {
    const existingTeacher = await User.findOne({
      where: { teacherNo: data.teacherNo },
    });
    if (existingTeacher) {
      return { success: false, message: '工号已存在' };
    }
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    ...data,
    password: hashedPassword,
  });

  return { success: true, message: '创建成功', user };
};

export const updateUser = async (
  id: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    avatar: string;
    gradeId: string;
    classId: string;
    isActive: boolean;
  }>
): Promise<{ success: boolean; message: string }> => {
  const user = await User.findByPk(id);

  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  await User.update(data, { where: { id } });

  return { success: true, message: '更新成功' };
};

export const deleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
  const user = await User.findByPk(id);

  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  await User.destroy({ where: { id } });

  return { success: true, message: '删除成功' };
};

export const toggleUserStatus = async (id: string): Promise<{ success: boolean; message: string; isActive?: boolean }> => {
  const user = await User.findByPk(id);

  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  const newStatus = !user.isActive;
  await User.update({ isActive: newStatus }, { where: { id } });

  return { success: true, message: '状态更新成功', isActive: newStatus };
};

export const getTeachers = async (): Promise<User[]> => {
  return User.findAll({
    where: { role: 'teacher', isActive: true },
    attributes: ['id', 'name', 'teacherNo'],
    order: [['name', 'ASC']],
  });
};
