import type { Response } from 'express';
import { db } from '../database/init';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { Appointment } from '../types';
import { logOperation } from '../utils/operationLog';

export async function getAppointments(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  let sql = `
    SELECT a.*, 
           p.real_name as patient_name, 
           d.real_name as doctor_name,
           dep.name as department_name
    FROM appointments a
    LEFT JOIN users p ON a.patient_id = p.id
    LEFT JOIN users d ON a.doctor_id = d.id
    LEFT JOIN departments dep ON d.department_id = dep.id
    WHERE 1=1
  `;
  const params: (number | string)[] = [];

  if (req.user.role === 'patient') {
    sql += ' AND a.patient_id = ?';
    params.push(req.user.userId);
  } else if (req.user.role === 'doctor') {
    sql += ' AND a.doctor_id = ?';
    params.push(req.user.userId);
  }

  const status = req.query.status as string | undefined;
  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY a.created_at DESC';

  const appointments = db.prepare(sql).all(...params) as Appointment[];
  res.json(success(appointments));
}

export async function createAppointment(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const { scheduleId, appointmentDate, timeSlot, doctorId } = req.body as {
    scheduleId: number;
    appointmentDate: string;
    timeSlot: string;
    doctorId: number;
  };

  const schedule = db.prepare('SELECT * FROM doctor_schedules WHERE id = ?').get(
    scheduleId
  ) as DoctorSchedule | undefined;

  if (!schedule || !schedule.is_enabled) {
    res.json(error('该号源不可用'));
    return;
  }

  if (schedule.used_quota >= schedule.total_quota) {
    res.json(error('该时段号源已满'));
    return;
  }

  const existing = db
    .prepare(
      'SELECT id FROM appointments WHERE patient_id = ? AND schedule_id = ? AND status != ?'
    )
    .get(req.user.userId, scheduleId, 'cancelled');

  if (existing) {
    res.json(error('您已预约该时段'));
    return;
  }

  const tx = db.transaction(() => {
    db.prepare('UPDATE doctor_schedules SET used_quota = used_quota + 1 WHERE id = ?').run(
      scheduleId
    );

    const result = db
      .prepare(
        'INSERT INTO appointments (patient_id, doctor_id, schedule_id, appointment_date, time_slot, status) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(req.user.userId, doctorId, scheduleId, appointmentDate, timeSlot, 'confirmed');

    return result.lastInsertRowid;
  });

  const appointmentId = tx();

  logOperation(req.user.userId, `创建预约: ${appointmentId}`, 'appointment', req.ip);

  res.json(success({ id: appointmentId }, '预约成功'));
}

export async function cancelAppointment(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const id = parseInt(req.params.id, 10);

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as
    | Appointment
    | undefined;

  if (!appointment) {
    res.json(error('预约不存在'));
    return;
  }

  if (req.user.role === 'patient' && appointment.patient_id !== req.user.userId) {
    res.json(error('无权取消他人预约'));
    return;
  }

  if (appointment.status === 'cancelled' || appointment.status === 'completed') {
    res.json(error('该预约无法取消'));
    return;
  }

  const tx = db.transaction(() => {
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run('cancelled', id);
    db.prepare('UPDATE doctor_schedules SET used_quota = used_quota - 1 WHERE id = ?').run(
      appointment.schedule_id
    );
  });

  tx();

  logOperation(req.user.userId, `取消预约: ${id}`, 'appointment', req.ip);

  res.json(success(null, '取消成功'));
}

interface DoctorSchedule {
  id: number;
  doctor_id: number;
  department_id: number;
  schedule_date: string;
  time_slot: string;
  total_quota: number;
  used_quota: number;
  is_enabled: number;
}
