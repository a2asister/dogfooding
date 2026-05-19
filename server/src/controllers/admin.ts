import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/init';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { User, DoctorSchedule } from '../types';
import { logOperation } from '../utils/operationLog';

export async function getAccounts(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const role = req.query.role as string | undefined;

  let sql = `
    SELECT u.*, d.name as department_name 
    FROM users u 
    LEFT JOIN departments d ON u.department_id = d.id 
    WHERE u.role != 'patient'
  `;
  const params: string[] = [];

  if (role === 'medical') {
    sql += " AND u.role IN ('doctor', 'nurse', 'pharmacist', 'technician')";
  } else if (role) {
    sql += ' AND u.role = ?';
    params.push(role);
  }

  sql += ' ORDER BY u.created_at DESC';

  const users = db.prepare(sql).all(...params) as (User & { department_name?: string })[];

  const result = users.map((u) => {
    const { password_hash: _pass, ...rest } = u;
    return rest;
  });

  res.json(success(result));
}

export async function createAccount(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const { username, password, phone, real_name, role, department_id, title, license_no, education, hire_date } = req.body as Omit<
    User,
    'id' | 'password_hash' | 'created_at' | 'is_active'
  > & { password: string };

  const existing = db
    .prepare('SELECT id FROM users WHERE username = ? OR phone = ?')
    .get(username, phone);
  if (existing) {
    res.json(error('用户名或手机号已存在'));
    return;
  }

  const passwordHash = bcrypt.hashSync(password || '123456', 10);

  const result = db
    .prepare(
      'INSERT INTO users (username, password_hash, phone, real_name, role, department_id, title, license_no, education, hire_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)'
    )
    .run(username, passwordHash, phone, real_name, role, department_id, title, license_no, education, hire_date);

  logOperation(req.user.userId, `创建账号: ${username}`, 'admin', req.ip);

  res.json(success({ id: result.lastInsertRowid }));
}

export async function updateAccount(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const id = parseInt(req.params.id, 10);
  const { real_name, phone, role, department_id, title, license_no, education, hire_date, is_active } = req.body as Partial<User>;

  db.prepare(
    `UPDATE users SET 
      real_name = COALESCE(?, real_name),
      phone = COALESCE(?, phone),
      role = COALESCE(?, role),
      department_id = COALESCE(?, department_id),
      title = COALESCE(?, title),
      license_no = COALESCE(?, license_no),
      education = COALESCE(?, education),
      hire_date = COALESCE(?, hire_date),
      is_active = COALESCE(?, is_active)
     WHERE id = ?`
  ).run(real_name, phone, role, department_id, title, license_no, education, hire_date, is_active, id);

  logOperation(req.user.userId, `更新账号: ${id}`, 'admin', req.ip);

  res.json(success(null, '更新成功'));
}

export async function resetPassword(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const id = parseInt(req.params.id, 10);
  const newPassword = req.body.newPassword as string | undefined;

  const passwordHash = bcrypt.hashSync(newPassword || '123456', 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);

  logOperation(req.user.userId, `重置密码: ${id}`, 'admin', req.ip);

  res.json(success(null, '密码重置成功'));
}

export async function getScheduleConfig(_req: AuthRequest, res: Response): Promise<void> {
  const schedules = db
    .prepare(
      `SELECT ds.*, 
              d.real_name as doctor_name,
              dep.name as department_name
       FROM doctor_schedules ds
       LEFT JOIN users d ON ds.doctor_id = d.id
       LEFT JOIN departments dep ON ds.department_id = dep.id
       ORDER BY ds.schedule_date, ds.doctor_id`
    )
    .all() as (DoctorSchedule & { doctor_name?: string; department_name?: string })[];

  res.json(success(schedules));
}

export async function saveScheduleConfig(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const schedules = req.body.schedules as DoctorSchedule[];

  const tx = db.transaction(() => {
    schedules.forEach((s) => {
      db.prepare(
        `INSERT INTO doctor_schedules 
          (doctor_id, department_id, schedule_date, time_slot, total_quota, used_quota, is_enabled)
         VALUES (?, ?, ?, ?, ?, 0, ?)
         ON CONFLICT(doctor_id, schedule_date, time_slot) DO UPDATE SET
          total_quota = excluded.total_quota,
          is_enabled = excluded.is_enabled`
      ).run(s.doctor_id, s.department_id, s.schedule_date, s.time_slot, s.total_quota, s.is_enabled);
    });
  });

  tx();

  logOperation(req.user.userId, '更新号源配置', 'admin', req.ip);

  res.json(success(null, '配置保存成功'));
}

export async function toggleSchedule(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const id = parseInt(req.params.id, 10);
  const isEnabled = parseInt(req.body.is_enabled as string, 10);

  db.prepare('UPDATE doctor_schedules SET is_enabled = ? WHERE id = ?').run(isEnabled, id);

  logOperation(req.user.userId, `切换号源状态: ${id}`, 'admin', req.ip);

  res.json(success(null, '操作成功'));
}

export async function getStatistics(_req: AuthRequest, res: Response): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const todayAppointments = (
    db
      .prepare('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?')
      .get(today) as { count: number }
  ).count;

  const todayVisits = (
    db
      .prepare('SELECT COUNT(*) as count FROM visits WHERE DATE(created_at) = ?')
      .get(today) as { count: number }
  ).count;

  const totalPatients = (
    db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'patient'").get() as {
      count: number;
    }
  ).count;

  const totalDoctors = (
    db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'doctor'").get() as {
      count: number;
    }
  ).count;

  const last7DaysAppointments = db
    .prepare(
      `SELECT appointment_date as date, COUNT(*) as count 
       FROM appointments 
       WHERE appointment_date >= DATE('now', '-7 days')
       GROUP BY appointment_date
       ORDER BY appointment_date`
    )
    .all() as { date: string; count: number }[];

  const departmentStats = db
    .prepare(
      `SELECT d.name as department_name, COUNT(DISTINCT a.id) as appointment_count
       FROM departments d
       LEFT JOIN users doc ON d.id = doc.department_id
       LEFT JOIN appointments a ON doc.id = a.doctor_id
       GROUP BY d.id
       ORDER BY appointment_count DESC`
    )
    .all() as { department_name: string; appointment_count: number }[];

  res.json(
    success({
      overview: {
        todayAppointments,
        todayVisits,
        totalPatients,
        totalDoctors,
      },
      last7DaysAppointments,
      departmentStats,
    })
  );
}
