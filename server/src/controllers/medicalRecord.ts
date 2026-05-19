import type { Response } from 'express';
import { db } from '../database/init';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { MedicalRecord } from '../types';
import { logOperation } from '../utils/operationLog';

export async function getMedicalRecord(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const visitId = parseInt(req.params.visitId, 10);

  const record = db
    .prepare(
      `SELECT mr.*, 
              p.real_name as patient_name,
              p.phone as patient_phone,
              d.real_name as doctor_name
       FROM medical_records mr
       LEFT JOIN visits v ON mr.visit_id = v.id
       LEFT JOIN users p ON v.patient_id = p.id
       LEFT JOIN users d ON mr.doctor_id = d.id
       WHERE mr.visit_id = ?`
    )
    .get(visitId) as (MedicalRecord & { patient_name?: string; patient_phone?: string; doctor_name?: string }) | undefined;

  if (!record) {
    res.json(success(null));
    return;
  }

  if (
    req.user.role === 'patient' &&
    record.doctor_id !== req.user.userId &&
    req.user.role !== 'super_admin'
  ) {
    const visit = db.prepare('SELECT patient_id FROM visits WHERE id = ?').get(visitId) as {
      patient_id: number;
    };
    if (visit.patient_id !== req.user.userId) {
      res.json(error('无权查看该病历'));
      return;
    }
  }

  res.json(success(record));
}

export async function saveMedicalRecord(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const { visitId, chiefComplaint, presentIllness, diagnosis } = req.body as {
    visitId: number;
    chiefComplaint?: string;
    presentIllness?: string;
    diagnosis?: string;
  };

  const visit = db.prepare('SELECT * FROM visits WHERE id = ?').get(visitId) as
    | { doctor_id: number; status: string }
    | undefined;

  if (!visit) {
    res.json(error('就诊记录不存在'));
    return;
  }

  if (visit.doctor_id !== req.user.userId && req.user.role !== 'super_admin') {
    res.json(error('无权操作该病历'));
    return;
  }

  const existing = db
    .prepare('SELECT id FROM medical_records WHERE visit_id = ?')
    .get(visitId) as { id: number } | undefined;

  if (existing) {
    db.prepare(
      `UPDATE medical_records SET 
        chief_complaint = COALESCE(?, chief_complaint),
        present_illness = COALESCE(?, present_illness),
        diagnosis = COALESCE(?, diagnosis),
        updated_at = CURRENT_TIMESTAMP
       WHERE visit_id = ?`
    ).run(chiefComplaint, presentIllness, diagnosis, visitId);

    logOperation(req.user.userId, `更新病历: ${existing.id}`, 'medical_record', req.ip);
  } else {
    db.prepare(
      `INSERT INTO medical_records 
        (visit_id, doctor_id, chief_complaint, present_illness, diagnosis) 
       VALUES (?, ?, ?, ?, ?)`
    ).run(visitId, req.user.userId, chiefComplaint, presentIllness, diagnosis);

    logOperation(req.user.userId, `创建病历: ${visitId}`, 'medical_record', req.ip);
  }

  res.json(success(null, '病历保存成功'));
}

export async function getPatientRecords(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  let patientId = req.user.userId;
  if (req.query.patientId && req.user.role !== 'patient') {
    patientId = parseInt(req.query.patientId as string, 10);
  }

  const records = db
    .prepare(
      `SELECT mr.*, 
              v.start_time as visit_time,
              d.real_name as doctor_name,
              dep.name as department_name
       FROM medical_records mr
       LEFT JOIN visits v ON mr.visit_id = v.id
       LEFT JOIN users d ON mr.doctor_id = d.id
       LEFT JOIN departments dep ON d.department_id = dep.id
       WHERE v.patient_id = ?
       ORDER BY mr.created_at DESC`
    )
    .all(patientId) as (MedicalRecord & { visit_time?: string; doctor_name?: string; department_name?: string })[];

  res.json(success(records));
}
