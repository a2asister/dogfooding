import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_URL || path.join(dataDir, 'kids_coding.sqlite');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const initDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'parent', 'admin')),
      avatar TEXT,
      email TEXT,
      phone TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      grade TEXT,
      points INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      parentId TEXT,
      classId TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parentId) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS teacher_profiles (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      subject TEXT,
      school TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS parent_profiles (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      childrenIds TEXT DEFAULT '[]',
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      teacherId TEXT NOT NULL,
      description TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      level TEXT NOT NULL CHECK(level IN ('beginner', 'basic', 'advanced')),
      teacherId TEXT NOT NULL,
      content TEXT NOT NULL,
      thumbnail TEXT,
      isPublic INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_enrollments (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      enrolledAt TEXT NOT NULL,
      completedAt TEXT,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(courseId, studentId)
    );

    CREATE TABLE IF NOT EXISTS homeworks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      courseId TEXT NOT NULL,
      teacherId TEXT NOT NULL,
      classId TEXT NOT NULL,
      deadline TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS homework_submissions (
      id TEXT PRIMARY KEY,
      homeworkId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      content TEXT NOT NULL,
      code TEXT NOT NULL,
      score INTEGER,
      comment TEXT,
      submittedAt TEXT NOT NULL,
      gradedAt TEXT,
      FOREIGN KEY (homeworkId) REFERENCES homeworks(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(homeworkId, studentId)
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      level TEXT NOT NULL CHECK(level IN ('easy', 'medium', 'hard')),
      content TEXT NOT NULL,
      expectedOutput TEXT,
      points INTEGER DEFAULT 10,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS challenge_progress (
      id TEXT PRIMARY KEY,
      challengeId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      code TEXT,
      completedAt TEXT,
      FOREIGN KEY (challengeId) REFERENCES challenges(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(challengeId, studentId)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      studentId TEXT NOT NULL,
      code TEXT NOT NULL,
      blocksXml TEXT NOT NULL,
      isPublic INTEGER DEFAULT 0,
      category TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wrong_questions (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      challengeId TEXT,
      homeworkId TEXT,
      questionTitle TEXT NOT NULL,
      wrongCode TEXT NOT NULL,
      correctCode TEXT,
      note TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challengeId) REFERENCES challenges(id) ON DELETE SET NULL,
      FOREIGN KEY (homeworkId) REFERENCES homeworks(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      condition TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      badgeId TEXT NOT NULL,
      earnedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (badgeId) REFERENCES badges(id) ON DELETE CASCADE,
      UNIQUE(userId, badgeId)
    );

    CREATE TABLE IF NOT EXISTS monthly_reports (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      month TEXT NOT NULL,
      totalStudyHours REAL DEFAULT 0,
      completedCourses INTEGER DEFAULT 0,
      completedChallenges INTEGER DEFAULT 0,
      homeworkScore REAL DEFAULT 0,
      pointsEarned INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(studentId, month)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('course', 'homework', 'system')),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS study_records (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      type TEXT NOT NULL,
      contentId TEXT,
      duration INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.info('数据库初始化完成');
};
