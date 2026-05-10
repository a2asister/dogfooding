const User = require('../models/User');

async function seedAdminUser() {
  const existingAdmin = await User.findOne({ username: 'admin' });
  
  if (existingAdmin) {
    console.log('默认管理员用户已存在，跳过创建');
    return;
  }
  
  const admin = new User({
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    name: '系统管理员',
    roles: ['admin', 'user'],
    permissions: ['*'],
    department: 'IT部'
  });
  
  admin.isNew = true;
  await admin.save();
  
  console.log('默认管理员用户创建成功');
  console.log('  用户名: admin');
  console.log('  密码: admin123');
  console.log('  邮箱: admin@example.com');
  console.log('  角色: admin, user');
}

module.exports = { seedAdminUser };
