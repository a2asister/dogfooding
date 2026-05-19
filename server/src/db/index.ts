import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { UserRole, AuthStatus } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || './data/auction.db';
const fullDbPath = path.resolve(__dirname, '../../', dbPath);
const dataDir = path.dirname(fullDbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(fullDbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT NOT NULL,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      realName TEXT,
      idCard TEXT,
      authStatus TEXT NOT NULL DEFAULT 'unverified',
      balance REAL NOT NULL DEFAULT 0,
      frozenBalance REAL NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS merchants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      companyName TEXT NOT NULL,
      businessLicense TEXT NOT NULL,
      contactName TEXT NOT NULL,
      contactPhone TEXT NOT NULL,
      authStatus TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS auction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      merchantId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      images TEXT NOT NULL,
      category TEXT NOT NULL,
      startPrice REAL NOT NULL,
      currentPrice REAL NOT NULL,
      minIncrement REAL NOT NULL DEFAULT 10,
      reservePrice REAL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      viewCount INTEGER NOT NULL DEFAULT 0,
      favoriteCount INTEGER NOT NULL DEFAULT 0,
      bidCount INTEGER NOT NULL DEFAULT 0,
      auditStatus TEXT NOT NULL DEFAULT 'pending',
      auditReason TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (merchantId) REFERENCES merchants(id)
    );

    CREATE TABLE IF NOT EXISTS bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auctionId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      amount REAL NOT NULL,
      isAutoBid INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auctionId) REFERENCES auction_items(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNo TEXT UNIQUE NOT NULL,
      auctionId INTEGER NOT NULL,
      buyerId INTEGER NOT NULL,
      sellerId INTEGER NOT NULL,
      amount REAL NOT NULL,
      depositAmount REAL NOT NULL,
      commissionAmount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_payment',
      payDeadline TEXT NOT NULL,
      paidAt TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auctionId) REFERENCES auction_items(id),
      FOREIGN KEY (buyerId) REFERENCES users(id),
      FOREIGN KEY (sellerId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS deposit_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      auctionId INTEGER,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      remark TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (auctionId) REFERENCES auction_items(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      isRead INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS system_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description TEXT,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      auctionId INTEGER NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (auctionId) REFERENCES auction_items(id),
      UNIQUE(userId, auctionId)
    );
  `);

  const configStmt = db.prepare('SELECT COUNT(*) as count FROM system_configs');
  const { count } = configStmt.get() as { count: number };
  
  if (count === 0) {
    const insertConfig = db.prepare(`
      INSERT INTO system_configs (key, value, description) VALUES (?, ?, ?)
    `);
    
    insertConfig.run('commission_rate', '0.05', '平台佣金比例');
    insertConfig.run('deposit_rate', '0.1', '保证金比例');
    insertConfig.run('pay_timeout', '1800', '尾款支付超时时间(秒)');
    insertConfig.run('bid_extension_time', '300', '竞拍延时时间(秒)');
    insertConfig.run('auto_bid_delay', '1000', '自动出价延迟(毫秒)');
  }

  const adminCountStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?');
  const adminResult = adminCountStmt.get(UserRole.ADMIN) as { count: number };
  
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
  }

  const operatorCountStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?');
  const operatorResult = operatorCountStmt.get(UserRole.OPERATOR) as { count: number };
  
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
  }
}

initTables();

export default db;
