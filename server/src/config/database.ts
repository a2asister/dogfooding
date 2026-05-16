import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'chat.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    console.log('数据库连接成功');
    initTables();
  }
});

function migrateDatabase() {
  db.serialize(() => {
    db.all("PRAGMA table_info(friends)", (_, rows: any[]) => {
      const columns = rows.map(r => r.name);
      if (!columns.includes('group_id')) {
        db.run('ALTER TABLE friends ADD COLUMN group_id INTEGER');
        console.log('已添加 friends.group_id 字段');
      }
      if (!columns.includes('remark')) {
        db.run('ALTER TABLE friends ADD COLUMN remark TEXT');
        console.log('已添加 friends.remark 字段');
      }
    });

    db.all("PRAGMA table_info(messages)", (_, rows: any[]) => {
      const columns = rows.map(r => r.name);
      const newColumns = ['chat_type', 'group_id', 'message_type', 'media_url', 'media_name', 'media_size', 'is_recalled', 'is_deleted'];
      newColumns.forEach(col => {
        if (!columns.includes(col)) {
          const colType = col.includes('url') || col.includes('name') ? 'TEXT' : 'INTEGER';
          const defaultValue = colType === 'TEXT' ? "''" : '0';
          db.run(`ALTER TABLE messages ADD COLUMN ${col} ${colType} DEFAULT ${defaultValue}`);
          console.log(`已添加 messages.${col} 字段`);
        }
      });

      const toUserIdCol = rows.find(r => r.name === 'to_user_id');
      if (toUserIdCol && toUserIdCol.notnull === 1) {
        console.log('重建 messages 表以移除 to_user_id NOT NULL 约束...');
        db.run(`
          CREATE TABLE IF NOT EXISTS messages_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT UNIQUE NOT NULL,
            chat_type INTEGER DEFAULT 1,
            from_user_id INTEGER NOT NULL,
            to_user_id INTEGER,
            group_id INTEGER,
            message_type INTEGER DEFAULT 1,
            content TEXT NOT NULL,
            media_url TEXT,
            media_name TEXT,
            media_size INTEGER,
            is_read INTEGER DEFAULT 0,
            is_recalled INTEGER DEFAULT 0,
            is_deleted INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err: any) => {
          if (err) {
            console.error('创建新表失败:', err);
            return;
          }
          db.run(`INSERT INTO messages_new (id, message_id, from_user_id, to_user_id, content, is_read, created_at, chat_type, group_id, message_type, is_recalled, is_deleted) 
                   SELECT id, message_id, from_user_id, to_user_id, content, is_read, created_at,
                          COALESCE(chat_type, 1), group_id, COALESCE(message_type, 1), COALESCE(is_recalled, 0), COALESCE(is_deleted, 0) FROM messages`, (err2: any) => {
            if (err2) {
              console.error('数据迁移失败:', err2);
              return;
            }
            db.run('DROP TABLE messages', () => {
              db.run('ALTER TABLE messages_new RENAME TO messages', () => {
                console.log('messages 表重建完成！');
              });
            });
          });
        });
      }
    });
  });
}

function initTables() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT UNIQUE,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS friend_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      group_name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      group_id INTEGER,
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, friend_id),
      FOREIGN KEY (group_id) REFERENCES friend_groups(id) ON DELETE SET NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT UNIQUE NOT NULL,
      chat_type INTEGER DEFAULT 1,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER,
      group_id INTEGER,
      message_type INTEGER DEFAULT 1,
      content TEXT NOT NULL,
      media_url TEXT,
      media_name TEXT,
      media_size INTEGER,
      is_read INTEGER DEFAULT 0,
      is_recalled INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS message_read_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      is_read INTEGER DEFAULT 0,
      read_at DATETIME,
      UNIQUE(message_id, user_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT UNIQUE NOT NULL,
      group_name TEXT NOT NULL,
      group_avatar TEXT,
      owner_id INTEGER NOT NULL,
      announcement TEXT,
      max_members INTEGER DEFAULT 500,
      is_dismissed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      role INTEGER DEFAULT 0,
      group_remark TEXT,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, user_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS group_announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id TEXT NOT NULL,
      publisher_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      operation_type TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      detail TEXT,
      ip TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS pending_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT UNIQUE NOT NULL,
      message_data TEXT NOT NULL,
      retry_count INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    migrateDatabase();
  });
}

export function backupDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const backupPath = path.join(dataDir, `backup_${Date.now()}.db`);
    db.backup(backupPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default db;
