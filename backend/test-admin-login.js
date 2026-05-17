const http = require('http');

console.log('🔐 验证管理员登录...\n');

const loginData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => data += chunk);
  
  res.on('end', () => {
    console.log(`📡 响应状态: ${res.statusCode}`);
    
    try {
      const result = JSON.parse(data);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ 登录成功！');
        console.log('\n' + '═'.repeat(50));
        console.log('🎉 管理员账号验证通过！');
        console.log('═'.repeat(50));
        console.log(`\n   用户名: admin`);
        console.log(`   密码: admin123`);
        console.log(`   Token: ${result.token ? '✅ 已获取' : '❌ 未获取'}`);
        
        if (result.user) {
          console.log(`   角色: ${result.user.role}`);
          console.log(`   管理员权限: ${result.user.role === 'admin' ? '✅ 是' : '❌ 否'}`);
        }
        
        console.log('\n📍 后台地址: http://localhost:5173/admin');
        console.log('═'.repeat(50) + '\n');
      } else {
        console.log('\n❌ 登录失败！');
        console.log(`   错误信息: ${result.message || data}`);
        console.log('\n💡 请确保:');
        console.log('   1. 后端服务正在运行 (npm run start:dev)');
        console.log('   2. 服务端口是 3000');
        console.log('   3. 用户名和密码正确\n');
      }
    } catch (e) {
      console.log('❌ 解析响应失败:', data);
    }
    
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
  console.log('\n💡 请确保后端服务正在运行 (npm run start:dev)');
  console.log('   默认端口: 3000\n');
  process.exit(1);
});

req.write(loginData);
req.end();
