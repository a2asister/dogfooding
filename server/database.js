const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'cart.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT NOT NULL,
    description TEXT
  );
  
  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

const products = [
  { name: '无线蓝牙耳机', price: 299.00, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', description: '高清音质，持久续航' },
  { name: '机械键盘', price: 399.00, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', description: '红轴手感，RGB背光' },
  { name: '无线鼠标', price: 199.00, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', description: '人体工学设计，精准定位' },
  { name: '智能手表', price: 899.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', description: '健康监测，运动追踪' },
  { name: '平板支架', price: 129.00, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', description: '多角度调节，稳固耐用' },
  { name: '便携充电宝', price: 159.00, image: 'https://images.unsplash.com/photo-1609592424830-2419354d44a5?w=400', description: '20000mAh，快充支持' },
];

const countProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (countProducts.count === 0) {
  const insert = db.prepare('INSERT INTO products (name, price, image, description) VALUES (?, ?, ?, ?)');
  for (const product of products) {
    insert.run(product.name, product.price, product.image, product.description);
  }
}

module.exports = db;
