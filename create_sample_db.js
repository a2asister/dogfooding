import Database from 'better-sqlite3';

const db = new Database('./sample.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    age INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const insertUser = db.prepare('INSERT INTO users (name, email, age) VALUES (?, ?, ?)');
insertUser.run('张三', 'zhangsan@example.com', 25);
insertUser.run('李四', 'lisi@example.com', 30);
insertUser.run('王五', 'wangwu@example.com', 28);

const insertPost = db.prepare('INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)');
insertPost.run('第一篇文章', '这是第一篇文章的内容', 1);
insertPost.run('第二篇文章', '这是第二篇文章的内容', 1);
insertPost.run('技术分享', '关于SQLite的使用技巧', 2);

console.log('示例数据库创建成功: sample.db');
db.close();
