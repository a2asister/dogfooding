import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'hospital.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      phone TEXT UNIQUE,
      real_name TEXT NOT NULL,
      id_card TEXT,
      role TEXT NOT NULL,
      department_id INTEGER,
      title TEXT,
      license_no TEXT,
      education TEXT,
      hire_date TEXT,
      is_active INTEGER DEFAULT 1,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS doctor_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      department_id INTEGER NOT NULL,
      schedule_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      total_quota INTEGER DEFAULT 20,
      used_quota INTEGER DEFAULT 0,
      is_enabled INTEGER DEFAULT 1,
      FOREIGN KEY (doctor_id) REFERENCES users(id),
      FOREIGN KEY (department_id) REFERENCES departments(id),
      UNIQUE(doctor_id, schedule_date, time_slot)
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      schedule_id INTEGER NOT NULL,
      appointment_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id),
      FOREIGN KEY (doctor_id) REFERENCES users(id),
      FOREIGN KEY (schedule_id) REFERENCES doctor_schedules(id)
    );

    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      appointment_id INTEGER,
      status TEXT DEFAULT 'waiting',
      start_time DATETIME,
      end_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id),
      FOREIGN KEY (doctor_id) REFERENCES users(id),
      FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    );

    CREATE TABLE IF NOT EXISTS medical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visit_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      chief_complaint TEXT,
      present_illness TEXT,
      diagnosis TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (visit_id) REFERENCES visits(id),
      FOREIGN KEY (doctor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS dictionaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      parent_code TEXT,
      sort_order INTEGER DEFAULT 0,
      UNIQUE(type, code)
    );

    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      operation TEXT NOT NULL,
      module TEXT NOT NULL,
      ip TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS hospital_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key TEXT UNIQUE NOT NULL,
      config_value TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      type TEXT DEFAULT 'system',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_visits_doctor ON visits(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id);
    CREATE INDEX IF NOT EXISTS idx_schedules_doctor_date ON doctor_schedules(doctor_id, schedule_date);
  `);

  const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin');
  if ((adminCount as { count: number }).count === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    db.prepare(
      'INSERT INTO users (username, password_hash, phone, real_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)'
    ).run('admin', passwordHash, '13800000000', '超级管理员', 'super_admin', 1);
  }

  const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get();
  if ((deptCount as { count: number }).count === 0) {
    const insertDept = db.prepare(
      'INSERT INTO departments (name, description, sort_order, icon) VALUES (?, ?, ?, ?)'
    );
    const departments = [
      { name: '内科', description: '内科诊疗', sort: 1, icon: '🫀' },
      { name: '外科', description: '外科诊疗', sort: 2, icon: '🩺' },
      { name: '儿科', description: '儿科诊疗', sort: 3, icon: '👶' },
      { name: '妇产科', description: '妇产科诊疗', sort: 4, icon: '🤰' },
      { name: '眼科', description: '眼科诊疗', sort: 5, icon: '👁️' },
      { name: '耳鼻喉科', description: '耳鼻喉诊疗', sort: 6, icon: '👂' },
      { name: '口腔科', description: '口腔诊疗', sort: 7, icon: '🦷' },
      { name: '皮肤科', description: '皮肤诊疗', sort: 8, icon: '🧴' },
    ];
    departments.forEach((d) => insertDept.run(d.name, d.description, d.sort, d.icon));
  }

  const doctorCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('doctor');
  if ((doctorCount as { count: number }).count === 0) {
    const passwordHash = bcrypt.hashSync('123456', 10);
    const insertDoctor = db.prepare(
      'INSERT INTO users (username, password_hash, phone, real_name, role, department_id, title, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const doctors = [
      { username: 'doctor1', phone: '13800000001', name: '张医生', dept: 1, title: '主任医师' },
      { username: 'doctor2', phone: '13800000002', name: '李医生', dept: 1, title: '副主任医师' },
      { username: 'doctor3', phone: '13800000003', name: '王医生', dept: 2, title: '主治医师' },
      { username: 'doctor4', phone: '13800000004', name: '刘医生', dept: 3, title: '主任医师' },
    ];
    doctors.forEach((d) =>
      insertDoctor.run(d.username, passwordHash, d.phone, d.name, 'doctor', d.dept, d.title, 1)
    );
  }

  const dictCount = db.prepare('SELECT COUNT(*) as count FROM dictionaries').get();
  if ((dictCount as { count: number }).count === 0) {
    const insertDict = db.prepare(
      'INSERT INTO dictionaries (type, code, name, parent_code, sort_order) VALUES (?, ?, ?, ?, ?)'
    );

    const timeSlots = [
      { code: 'morning', name: '上午 08:00-12:00' },
      { code: 'afternoon', name: '下午 14:00-17:30' },
    ];
    timeSlots.forEach((t, i) => insertDict.run('time_slot', t.code, t.name, null, i + 1));

    const titles = [
      { code: 'chief', name: '主任医师' },
      { code: 'associate_chief', name: '副主任医师' },
      { code: 'attending', name: '主治医师' },
      { code: 'resident', name: '住院医师' },
    ];
    titles.forEach((t, i) => insertDict.run('title', t.code, t.name, null, i + 1));

    const diseases = [
      { code: 'cold', name: '感冒' },
      { code: 'fever', name: '发烧' },
      { code: 'headache', name: '头痛' },
      { code: 'stomach', name: '胃病' },
      { code: 'hypertension', name: '高血压' },
      { code: 'diabetes', name: '糖尿病' },
    ];
    diseases.forEach((d, i) => insertDict.run('disease', d.code, d.name, null, i + 1));
  }

  const scheduleCount = db.prepare('SELECT COUNT(*) as count FROM doctor_schedules').get();
  if ((scheduleCount as { count: number }).count === 0) {
    const today = new Date();
    const insertSchedule = db.prepare(
      'INSERT INTO doctor_schedules (doctor_id, department_id, schedule_date, time_slot, total_quota, used_quota, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      for (let doctorId = 1; doctorId <= 4; doctorId++) {
        const deptId = doctorId <= 2 ? 1 : doctorId === 3 ? 2 : 3;
        insertSchedule.run(doctorId + 1, deptId, dateStr, 'morning', 20, Math.floor(Math.random() * 10), 1);
        insertSchedule.run(doctorId + 1, deptId, dateStr, 'afternoon', 15, Math.floor(Math.random() * 8), 1);
      }
    }
  }

  const patientCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('patient');
  if ((patientCount as { count: number }).count === 0) {
    const passwordHash = bcrypt.hashSync('123456', 10);
    const insertPatient = db.prepare(
      'INSERT INTO users (username, password_hash, phone, real_name, id_card, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    insertPatient.run(
      'patient1',
      passwordHash,
      '13900000001',
      '王小明',
      '110101199001011234',
      'patient',
      1
    );
    insertPatient.run(
      'patient2',
      passwordHash,
      '13900000002',
      '李小红',
      '110101199202022345',
      'patient',
      1
    );
  }
}
