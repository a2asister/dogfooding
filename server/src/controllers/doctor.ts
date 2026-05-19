import type { Response } from 'express';
import { db } from '../database/init';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { User, DoctorSchedule } from '../types';

export async function getDoctors(req: AuthRequest, res: Response): Promise<void> {
  const departmentId = req.query.departmentId
    ? parseInt(req.query.departmentId as string, 10)
    : null;

  let sql = `
    SELECT u.*, d.name as department_name 
    FROM users u 
    LEFT JOIN departments d ON u.department_id = d.id 
    WHERE u.role = 'doctor' AND u.is_active = 1
  `;
  const params: (number | string)[] = [];

  if (departmentId) {
    sql += ' AND u.department_id = ?';
    params.push(departmentId);
  }

  sql += ' ORDER BY u.id';

  const doctors = db.prepare(sql).all(...params) as (User & { department_name?: string })[];
  res.json(success(doctors));
}

export async function getDoctorDetail(req: AuthRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);

  const doctor = db
    .prepare(
      `SELECT u.*, d.name as department_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.id = ? AND u.role = 'doctor'`
    )
    .get(id) as (User & { department_name?: string }) | undefined;

  if (!doctor) {
    res.json(error('医生不存在'));
    return;
  }

  const { password_hash: _pass, ...doctorWithoutPassword } = doctor;

  const today = new Date();
  const schedules: DoctorSchedule[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const daySchedules = db
      .prepare(
        'SELECT * FROM doctor_schedules WHERE doctor_id = ? AND schedule_date = ? AND is_enabled = 1 ORDER BY time_slot'
      )
      .all(id, dateStr) as DoctorSchedule[];

    schedules.push(...daySchedules);
  }

  res.json(success({ ...doctorWithoutPassword, schedules }));
}

export async function getDoctorSchedules(req: AuthRequest, res: Response): Promise<void> {
  const doctorId = parseInt(req.params.doctorId, 10);
  const date = req.query.date as string | undefined;

  let sql = 'SELECT * FROM doctor_schedules WHERE doctor_id = ?';
  const params: (number | string)[] = [doctorId];

  if (date) {
    sql += ' AND schedule_date = ?';
    params.push(date);
  }

  sql += ' AND is_enabled = 1 ORDER BY schedule_date, time_slot';

  const schedules = db.prepare(sql).all(...params) as DoctorSchedule[];
  res.json(success(schedules));
}
