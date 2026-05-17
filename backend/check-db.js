const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const dbPath = path.join(__dirname, 'database', 'community.db');

console.log('📊 检查数据库结构...\n');
console.log(`📁 数据库路径: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 无法连接数据库:', err.message);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功\n');
});

// 查询所有表
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ 查询失败:', err);
    db.close();
    process.exit(1);
  }

  console.log('📋 数据库中的表:');
  console.log('═'.repeat(50));
  
  if (tables.length === 0) {
    console.log('   (空)');
  } else {
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.name}`);
    });
  }
  
  console.log('═'.repeat(50) + '\n');

  // 如果有 user 表，显示其结构
  const userTable = tables.find(t => t.name === 'user' || t.name === 'User');
  if (userTable) {
    console.log('📋 user 表结构:');
    db.all(`PRAGMA table_info(${userTable.name})`, (err, columns) => {
      if (err) {
        console.error('❌ 查询表结构失败:', err);
      } else {
        columns.forEach(col => {
          console.log(`   - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''}`);
        });
      }
      
      // 显示现有用户
      console.log('\n👥 现有用户:');
      db.all(`SELECT id, username, nickname, role, isActive FROM ${userTable.name}`, (err, users) => {
        if (err) {
          console.error('❌ 查询用户失败:', err);
        } else if (users.length === 0) {
          console.log('   (无用户)');
        } else {
          users.forEach(user => {
            console.log(`   - ID:${user.id} ${user.username} (${user.role}) ${user.isActive ? '✅' : '❌'}`);
          });
        }
        db.close();
      });
    });
  } else {
    console.log('⚠️  user 表不存在，需要启动后端服务初始化数据库');
    db.close();
  }
});
