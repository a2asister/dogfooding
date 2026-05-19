import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

let db: Database.Database;

export function initDB(): Database.Database {
  const dataDir = path.dirname(config.database.path);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(config.database.path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  createTables();

  return db;
}

export function getDB(): Database.Database {
  if (!db) {
    return initDB();
  }
  return db;
}

function createTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'student',
      department VARCHAR(100),
      major VARCHAR(100),
      class VARCHAR(50),
      phone VARCHAR(20),
      email VARCHAR(100),
      gender VARCHAR(10),
      birth_date VARCHAR(20),
      enrollment_date VARCHAR(20),
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      teacher VARCHAR(50) NOT NULL,
      credit INTEGER NOT NULL,
      capacity INTEGER DEFAULT 60,
      enrolled INTEGER DEFAULT 0,
      description TEXT,
      semester VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      week_day INTEGER NOT NULL,
      start_period INTEGER NOT NULL,
      end_period INTEGER NOT NULL,
      location VARCHAR(100) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      course_name VARCHAR(100) NOT NULL,
      score INTEGER,
      grade_point DECIMAL(3,1),
      semester VARCHAR(50) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS selections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      author VARCHAR(50),
      views INTEGER DEFAULT 0,
      publish_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'system',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      course_name VARCHAR(100) NOT NULL,
      teacher_name VARCHAR(50) NOT NULL,
      teaching_score INTEGER,
      content_score INTEGER,
      overall_score INTEGER,
      comment TEXT,
      submitted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS login_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ip_address VARCHAR(50),
      user_agent TEXT,
      login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}
