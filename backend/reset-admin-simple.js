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
    console.log('\n💡 请确保:');
    console.log('   1. 数据库文件存在');
    console.log('   2. 后端服务未在运行（否则数据库会被锁定）');
    process.exit(1);
  }
  console.log('✅ 数据库连接成功\n');
});

async function main() {
  try {
    // 1. 查找用户表
    console.log('🔍 步骤 1: 检查用户表...');
    const tables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='user'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (tables.length === 0) {
      throw new Error('用户表不存在，请先启动后端服务初始化数据库');
    }
    console.log('✅ 用户表存在\n');

    // 2. 检查是否已有管理员
    console.log('🔍 步骤 2: 查找现有管理员...');
    const admins = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM user WHERE role = 'admin'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const hashedPassword = await bcrypt.hash('admin123', 10);

    if (admins.length > 0) {
      const admin = admins[0];
      console.log(`   找到现有管理员: ${admin.username}`);
      console.log('   正在更新密码...\n');

      await new Promise((resolve, reject) => {
        db.run(
          "UPDATE user SET password = ?, isActive = 1 WHERE id = ?",
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

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO user (username, password, nickname, role, isActive, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
          ['admin', hashedPassword, '管理员', 'admin'],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });

      console.log('✅ 管理员账号创建成功\n');
    }

    // 3. 验证
    console.log('✅ 步骤 3: 验证管理员账号...');
    const admin = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM user WHERE username = 'admin'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (admin) {
      console.log('\n' + '═'.repeat(60));
      console.log('🎉 管理员账号重置完成！');
      console.log('═'.repeat(60));
      console.log(`\n   用户名: ${admin.username}`);
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
