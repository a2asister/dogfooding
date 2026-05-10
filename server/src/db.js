import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '..', 'flash-sale.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    original_price REAL NOT NULL,
    sale_price REAL NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    total_stock INTEGER NOT NULL DEFAULT 0,
    current_stock INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id)
  );

  CREATE INDEX IF NOT EXISTS idx_orders_user_activity ON orders(user_id, activity_id);
`);

const now = Date.now();
const existing = db.prepare('SELECT COUNT(*) as count FROM activities').get();
if (existing.count === 0) {
  db.prepare(`
    INSERT INTO activities (
      name, product_name, product_image, original_price, sale_price,
      start_time, end_time, total_stock, current_stock, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    '限时秒杀iPhone 15',
    'iPhone 15 Pro Max 256GB',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20smartphone%20product%20photo%20white%20background&image_size=square_hd',
    9999,
    4999,
    now + 30000,
    now + 7200000,
    100,
    100,
    now
  );
  console.log('已创建演示活动：30秒后开始，持续2小时');
} else {
  console.log('数据库已存在活动数据，跳过初始化');
}

export default db;
