import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/init';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { Visit } from '../types';
import { logOperation } from '../utils/operationLog';

export async function getTodayVisits(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  let sql = `
    SELECT v.*, 
           p.real_name as patient_name,
           p.phone as patient_phone,
           d.real_name as doctor_name,
           dep.name as department_name
    FROM visits v
    LEFT JOIN users p ON v.patient_id = p.id
    LEFT JOIN users d ON v.doctor_id = d.id
    LEFT JOIN departments dep ON d.department_id = dep.id
    WHERE DATE(v.created_at) = ?
  `;
  const params: (string | number)[] = [today];

  if (req.user.role === 'doctor') {
    sql += ' AND v.doctor_id = ?';
    params.push(req.user.userId);
  }

  sql += ' ORDER BY v.created_at DESC';

  const visits = db.prepare(sql).all(...params) as Visit[];
  res.json(success(visits));
}

export async function receiveVisit(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const id = parseInt(req.params.id, 10);

  const visit = db.prepare('SELECT * FROM visits WHERE id = ?').get(id) as Visit | undefined;

  if (!visit) {
    res.json(error('就诊记录不存在'));
    return;
  }

  if (visit.doctor_id !== req.user.userId && req.user.role !== 'super_admin') {
    res.json(error('无权接诊该患者'));
    return;
  }

  if (visit.status !== 'waiting') {
    res.json(error('该就诊状态不支持接诊'));
    return;
  }

  db.prepare(
    'UPDATE visits SET status = ?, start_time = CURRENT_TIMESTAMP WHERE id = ?'
  ).run('in_progress', id);

  logOperation(req.user.userId, `接诊: ${id}`, 'visit', req.ip);

  res.json(success(null, '接诊成功'));
}

export async function finishVisit(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const id = parseInt(req.params.id, 10);

  const visit = db.prepare('SELECT * FROM visits WHERE id = ?').get(id) as Visit | undefined;

  if (!visit) {
    res.json(error('就诊记录不存在'));
    return;
  }

  if (visit.doctor_id !== req.user.userId && req.user.role !== 'super_admin') {
    res.json(error('无权操作该就诊'));
    return;
  }

  if (visit.status !== 'in_progress') {
    res.json(error('该就诊状态不支持结束'));
    return;
  }

  const tx = db.transaction(() => {
    db.prepare(
      'UPDATE visits SET status = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?'
    ).run('completed', id);

    if (visit.appointment_id) {
      db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(
        'completed',
        visit.appointment_id
      );
    }
  });

  tx();

  logOperation(req.user.userId, `结束接诊: ${id}`, 'visit', req.ip);

  res.json(success(null, '接诊结束'));
}

export async function createWalkInVisit(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const { patientName, patientPhone, doctorId } = req.body as {
    patientName: string;
    patientPhone: string;
    doctorId: number;
  };

  let patientId: number;
  const existingPatient = db
    .prepare('SELECT id FROM users WHERE phone = ? AND role = ?')
    .get(patientPhone, 'patient') as { id: number } | undefined;

  if (existingPatient) {
    patientId = existingPatient.id;
    db.prepare('UPDATE users SET real_name = ? WHERE id = ?').run(patientName, patientId);
  } else {
    const passwordHash = bcrypt.hashSync('123456', 10);
    const result = db
      .prepare(
        'INSERT INTO users (username, password_hash, phone, real_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(`walkin_${Date.now()}`, passwordHash, patientPhone, patientName, 'patient', 1);
    patientId = result.lastInsertRowid as number;
  }

  const result = db
    .prepare('INSERT INTO visits (patient_id, doctor_id, status) VALUES (?, ?, ?)')
    .run(patientId, doctorId, 'waiting');

  logOperation(req.user.userId, `创建现场挂号: ${result.lastInsertRowid}`, 'visit', req.ip);

  res.json(success({ id: result.lastInsertRowid }, '挂号成功'));
}
