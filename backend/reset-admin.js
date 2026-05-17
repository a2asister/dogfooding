const { AppDataSource } = require('./dist/config/database');
const { User, UserRole } = require('./dist/entities/User');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
  console.log('🔄 开始重置管理员账号...\n');

  try {
    // 1. 初始化数据库连接
    console.log('📝 步骤 1: 连接数据库...');
    await AppDataSource.initialize();
    console.log('✅ 数据库连接成功\n');

    const userRepository = AppDataSource.getRepository(User);

    // 2. 查找已存在的管理员
    console.log('🔍 步骤 2: 查找现有管理员...');
    const existingAdmin = await userRepository.findOne({ where: { role: UserRole.ADMIN } });
    
    if (existingAdmin) {
      console.log(`   找到现有管理员: ${existingAdmin.username}`);
      console.log('   正在更新密码...\n');
      
      // 更新现有管理员密码
      const hashedPassword = await bcrypt.hash('admin123', 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.isActive = true;
      await userRepository.save(existingAdmin);
      
      console.log('✅ 管理员密码已重置\n');
    } else {
      console.log('   未找到现有管理员，正在创建新账号...\n');
      
      // 创建新管理员
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = userRepository.create({
        username: 'admin',
        password: hashedPassword,
        nickname: '管理员',
        role: UserRole.ADMIN,
        isActive: true,
      });
      await userRepository.save(admin);
      
      console.log('✅ 管理员账号创建成功\n');
    }

    // 3. 验证管理员账号
    console.log('✅ 步骤 3: 验证管理员账号...');
    const admin = await userRepository.findOne({ where: { username: 'admin' } });
    
    if (admin) {
      console.log('\n' + '═'.repeat(60));
      console.log('🎉 管理员账号重置完成！');
      console.log('═'.repeat(60));
      console.log(`\n   用户名: admin`);
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

    await AppDataSource.destroy();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.log('\n💡 请确保:');
    console.log('   1. 已运行 npm run build:backend 编译后端代码');
    console.log('   2. 数据库文件存在且可访问');
    console.log('   3. 后端服务未在运行（否则数据库会被锁定）');
    
    try {
      await AppDataSource.destroy();
    } catch (e) {}
    
    process.exit(1);
  }
}

resetAdmin();
