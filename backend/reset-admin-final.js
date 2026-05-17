const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// 数据库路径
const dbPath = path.join(__dirname, 'database', 'community.db');

console.log('🔄 开始重置管理员账号...\n');
console.log(`📁 数据库路径: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 无法连接数据库:', err.message);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功\n');
});

async function main() {
  try {
    // 1. 检查 users 表结构
    console.log('🔍 步骤 1: 检查 users 表结构...');
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('   表结构:');
    columns.forEach(col => {
      console.log(`     - ${col.name} (${col.type})`);
    });
    console.log('');

    // 2. 检查是否已有管理员
    console.log('🔍 步骤 2: 查找现有管理员...');
    const admins = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM users WHERE role = 'admin'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const hashedPassword = await bcrypt.hash('admin123', 10);

    if (admins.length > 0) {
      const admin = admins[0];
      console.log(`   找到现有管理员: ${admin.username || admin.phone}`);
      console.log('   正在更新密码...\n');

      await new Promise((resolve, reject) => {
        db.run(
          "UPDATE users SET password = ?, isActive = 1 WHERE id = ?",
          [hashedPassword, admin.id],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });

      console.log('✅ 管理员密码已重置\n');
    } else {
      console.log('   未找到现有管理员，正在创建新账号...\n');

      // 检查需要的字段
      const columnNames = columns.map(c => c.name);
      
      // 构建插入语句
      const insertFields = ['username', 'password', 'nickname', 'role', 'isActive'];
      const insertValues = ['admin', hashedPassword, '管理员', 'admin', 1];
      const placeholders = ['?', '?', '?', '?', '?'];

      // 添加时间戳字段
      if (columnNames.includes('createdAt')) {
        insertFields.push('createdAt');
        insertValues.push(new Date().toISOString());
        placeholders.push('?');
      }
      if (columnNames.includes('updatedAt')) {
        insertFields.push('updatedAt');
        insertValues.push(new Date().toISOString());
        placeholders.push('?');
      }

      const sql = `INSERT INTO users (${insertFields.join(', ')}) VALUES (${placeholders.join(', ')})`;
      
      await new Promise((resolve, reject) => {
        db.run(sql, insertValues, function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });

      console.log('✅ 管理员账号创建成功\n');
    }

    // 3. 验证
    console.log('✅ 步骤 3: 验证管理员账号...');
    const admin = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE username = 'admin' OR phone = 'admin'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (admin) {
      console.log('\n' + '═'.repeat(60));
      console.log('🎉 管理员账号重置完成！');
      console.log('═'.repeat(60));
      console.log(`\n   用户名: ${admin.username || admin.phone || 'admin'}`);
      console.log(`   密码: admin123`);
      console.log(`   角色: ${admin.role}`);
      console.log(`   状态: ${admin.isActive ? '✅ 启用' : '❌ 禁用'}`);
      console.log('\n💡 现在可以使用以下账号登录:');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
      console.log('\n📍 后台地址: http://localhost:5173/admin');
      console.log('═'.repeat(60) + '\n');
    } else {
      throw new Error('管理员账号创建失败');
    }

    db.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    db.close();
    process.exit(1);
  }
}

main();
