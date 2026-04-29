import { User } from '../models';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import type { UserRole } from '../types';

export const login = async (
  username: string,
  password: string
): Promise<{
  success: boolean;
  token?: string;
  user?: { id: string; username: string; name: string; role: UserRole };
  message?: string;
}> => {
  const user = await User.findOne({ where: { username } });

  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  if (!user.isActive) {
    return { success: false, message: '账号已被禁用' };
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    return { success: false, message: '密码错误' };
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });

  await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

  return {
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  };
};

export const register = async (data: {
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
}): Promise<{ success: boolean; message: string; user?: User }> => {
  const existingUser = await User.findOne({
    where: { username: data.username },
  });

  if (existingUser) {
    return { success: false, message: '用户名已存在' };
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    username: data.username,
    password: hashedPassword,
    name: data.name,
    role: data.role,
    email: data.email,
    phone: data.phone,
    studentNo: data.studentNo,
    teacherNo: data.teacherNo,
    gradeId: data.gradeId,
    classId: data.classId,
  });

  return { success: true, message: '注册成功', user };
};

export const getCurrentUser = async (
  userId: string
): Promise<User | null> => {
  return User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [
      { association: 'grade', attributes: ['id', 'name', 'year'] },
      { association: 'class', attributes: ['id', 'name'] },
    ],
  });
};

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  const user = await User.findByPk(userId);

  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  const isValidPassword = await comparePassword(oldPassword, user.password);
  if (!isValidPassword) {
    return { success: false, message: '原密码错误' };
  }

  const hashedPassword = await hashPassword(newPassword);
  await User.update({ password: hashedPassword }, { where: { id: userId } });

  return { success: true, message: '密码修改成功' };
};

export const resetPassword = async (
  userId: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  const user = await User.findByPk(userId);

  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  const hashedPassword = await hashPassword(newPassword);
  await User.update({ password: hashedPassword }, { where: { id: userId } });

  return { success: true, message: '密码重置成功' };
};
