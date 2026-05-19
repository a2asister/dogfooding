import { Context } from 'koa';
import { getDB } from '../models/database';
import { generateToken, comparePassword, successResponse, errorResponse } from '../utils/auth';
import { User } from '../types';

export async function login(ctx: Context): Promise<void> {
  const { studentId, password } = ctx.request.body as { studentId: string; password: string };

  if (!studentId || !password) {
    ctx.body = errorResponse('请输入学号和密码');
    return;
  }

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE student_id = ?').get(studentId) as any;

  if (!user) {
    ctx.body = errorResponse('用户不存在');
    return;
  }

  if (user.status !== 1) {
    ctx.body = errorResponse('账号已被禁用');
    return;
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    ctx.body = errorResponse('密码错误');
    return;
  }

  const token = generateToken({
    userId: user.id,
    studentId: user.student_id,
    name: user.name,
    role: user.role,
  });

  db.prepare('INSERT INTO login_records (user_id, ip_address, user_agent) VALUES (?, ?, ?)').run(
    user.id,
    ctx.ip,
    ctx.headers['user-agent'] || ''
  );

  ctx.body = successResponse(
    {
      token,
      user: {
        id: user.id,
        studentId: user.student_id,
        name: user.name,
        role: user.role,
        department: user.department,
        major: user.major,
        class: user.class,
      },
    },
    '登录成功'
  );
}

export async function logout(ctx: Context): Promise<void> {
  ctx.body = successResponse(null, '登出成功');
}

export async function getCurrentUser(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  if (!user) {
    ctx.status = 404;
    ctx.body = errorResponse('用户不存在');
    return;
  }

  ctx.body = successResponse({
    id: user.id,
    studentId: user.student_id,
    name: user.name,
    role: user.role,
    department: user.department,
    major: user.major,
    class: user.class,
    phone: user.phone,
    email: user.email,
    gender: user.gender,
    birthDate: user.birth_date,
    enrollmentDate: user.enrollment_date,
  });
}

export async function changePassword(ctx: Context): Promise<void> {
  const userId = ctx.state.user.userId;
  const { oldPassword, newPassword } = ctx.request.body as { oldPassword: string; newPassword: string };

  if (!oldPassword || !newPassword) {
    ctx.body = errorResponse('请输入原密码和新密码');
    return;
  }

  if (newPassword.length < 6) {
    ctx.body = errorResponse('新密码长度不能少于6位');
    return;
  }

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  const isValid = await comparePassword(oldPassword, user.password);
  if (!isValid) {
    ctx.body = errorResponse('原密码错误');
    return;
  }

  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);

  ctx.body = successResponse(null, '密码修改成功');
}
