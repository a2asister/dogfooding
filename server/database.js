import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS coupon_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    total_count INTEGER NOT NULL,
    used_count INTEGER DEFAULT 0,
    win_probability REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    batch_id INTEGER,
    amount REAL,
    is_winner INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (batch_id) REFERENCES coupon_batches(id)
  );
`);

const batchCount = db.prepare('SELECT COUNT(*) as count FROM coupon_batches').get().count;
if (batchCount === 0) {
  const batches = [
    { name: '10元优惠券', amount: 10, total_count: 100, win_probability: 0.3 },
    { name: '20元优惠券', amount: 20, total_count: 50, win_probability: 0.15 },
    { name: '50元优惠券', amount: 50, total_count: 20, win_probability: 0.05 },
  ];

  const insert = db.prepare('INSERT INTO coupon_batches (name, amount, total_count, win_probability) VALUES (?, ?, ?, ?)');
  for (const batch of batches) {
    insert.run(batch.name, batch.amount, batch.total_count, batch.win_probability);
  }
}

export default db;
