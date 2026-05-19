import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = './data/auction.db';
const fullDbPath = path.resolve(__dirname, dbPath);
const dataDir = path.dirname(fullDbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(fullDbPath);

const UserRole = {
  USER: 'user',
  MERCHANT: 'merchant',
  OPERATOR: 'operator',
  ADMIN: 'admin'
};

const AuthStatus = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

const adminCountStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?');
const adminResult = adminCountStmt.get(UserRole.ADMIN);

if (adminResult.count === 0) {
  const hashedPassword = bcrypt.hashSync('admin123456', 10);
  const insertAdmin = db.prepare(`
    INSERT INTO users (phone, password, nickname, role, authStatus, realName)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  insertAdmin.run(
    '13800000001',
    hashedPassword,
    '系统管理员',
    UserRole.ADMIN,
    AuthStatus.VERIFIED,
    '管理员'
  );
  console.log('✅ 管理员账号创建成功');
} else {
  console.log('ℹ️  管理员账号已存在');
}

const operatorCountStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?');
const operatorResult = operatorCountStmt.get(UserRole.OPERATOR);

if (operatorResult.count === 0) {
  const hashedPassword = bcrypt.hashSync('operator123', 10);
  const insertOperator = db.prepare(`
    INSERT INTO users (phone, password, nickname, role, authStatus, realName)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  insertOperator.run(
    '13800000002',
    hashedPassword,
    '运营人员',
    UserRole.OPERATOR,
    AuthStatus.VERIFIED,
    '运营'
  );
  console.log('✅ 运营人员账号创建成功');
} else {
  console.log('ℹ️  运营人员账号已存在');
}

db.close();
console.log('\n🎉 初始化完成！');
