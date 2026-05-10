import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

const db = new Database('products.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    properties TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

const seedData = [
  {
    name: 'iPhone 15 Pro',
    category: '智能手机',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20smartphone%20product%20photo&image_size=square',
    properties: {
      '屏幕尺寸': '6.1英寸',
      '处理器': 'A17 Pro芯片',
      '存储容量': '256GB',
      '电池容量': '3274mAh',
      '摄像头': '4800万像素主摄',
      '操作系统': 'iOS 17',
      '防水等级': 'IP68',
      '重量': '187g'
    }
  },
  {
    name: 'Samsung Galaxy S24',
    category: '智能手机',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Samsung%20Galaxy%20S24%20smartphone%20product%20photo&image_size=square',
    properties: {
      '屏幕尺寸': '6.2英寸',
      '处理器': '骁龙8 Gen 3',
      '存储容量': '256GB',
      '电池容量': '4000mAh',
      '摄像头': '5000万像素主摄',
      '操作系统': 'Android 14',
      '防水等级': 'IP68',
      '重量': '167g'
    }
  },
  {
    name: 'Xiaomi 14 Ultra',
    category: '智能手机',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xiaomi%2014%20Ultra%20smartphone%20product%20photo&image_size=square',
    properties: {
      '屏幕尺寸': '6.73英寸',
      '处理器': '骁龙8 Gen 3',
      '存储容量': '256GB',
      '电池容量': '5000mAh',
      '摄像头': '5000万像素徕卡主摄',
      '操作系统': 'HyperOS',
      '防水等级': 'IP68',
      '重量': '221g'
    }
  },
  {
    name: 'MacBook Pro 14',
    category: '笔记本电脑',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=MacBook%20Pro%2014%20inch%20laptop%20product%20photo&image_size=square',
    properties: {
      '屏幕尺寸': '14.2英寸',
      '处理器': 'M3 Pro芯片',
      '内存': '18GB',
      '存储容量': '512GB SSD',
      '电池续航': '18小时',
      '操作系统': 'macOS Sonoma',
      '重量': '1.61kg',
      '接口': '雷电4 x3'
    }
  },
  {
    name: 'Dell XPS 13',
    category: '笔记本电脑',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dell%20XPS%2013%20laptop%20product%20photo&image_size=square',
    properties: {
      '屏幕尺寸': '13.4英寸',
      '处理器': 'Intel Core i7',
      '内存': '16GB',
      '存储容量': '512GB SSD',
      '电池续航': '12小时',
      '操作系统': 'Windows 11',
      '重量': '1.26kg',
      '接口': '雷电4 x2'
    }
  }
];

const count = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (count.count === 0) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO products (id, name, category, image, properties, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const transaction = db.transaction((products: typeof seedData) => {
    for (const product of products) {
      stmt.run(
        uuidv4(),
        product.name,
        product.category,
        product.image,
        JSON.stringify(product.properties),
        now,
        now
      );
    }
  });
  transaction(seedData);
}

export const dbQueries = {
  getAll: db.prepare('SELECT * FROM products ORDER BY createdAt DESC'),
  getById: db.prepare('SELECT * FROM products WHERE id = ?'),
  getByCategory: db.prepare('SELECT * FROM products WHERE category = ? ORDER BY createdAt DESC'),
  create: db.prepare(`
    INSERT INTO products (id, name, category, image, properties, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  update: db.prepare(`
    UPDATE products 
    SET name = ?, category = ?, image = ?, properties = ?, updatedAt = ?
    WHERE id = ?
  `),
  delete: db.prepare('DELETE FROM products WHERE id = ?')
};

export function parseProduct(row: any): Product {
  return {
    ...row,
    properties: JSON.parse(row.properties)
  };
}
