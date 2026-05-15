const http = require('http');

async function login() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: 'testuser',
      password: 'password123'
    });

    const options = {
      hostname: 'localhost',
      port: 7890,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          const result = JSON.parse(data);
          resolve(result.access_token);
        } else {
          reject(new Error('登录失败: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getNotifications(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 7890,
      path: '/api/notifications',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`获取通知失败 (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function getUnreadCount(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 7890,
      path: '/api/notifications/unread/count',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`获取未读数量失败 (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🔍 检查后端通知接口...\n');
  
  try {
    // 1. 登录获取 token
    console.log('📝 步骤 1: 登录获取认证 Token...');
    const token = await login();
    console.log('✅ Token 获取成功\n');

    // 2. 获取未读数量
    console.log('📊 步骤 2: 获取未读通知数量...');
    const unreadResult = await getUnreadCount(token);
    console.log(`   未读通知数量: ${unreadResult.count}\n`);

    // 3. 获取通知列表
    console.log('📋 步骤 3: 获取通知列表...');
    const result = await getNotifications(token);
    console.log(`   总通知数: ${result.total}\n`);

    // 4. 打印通知详情
    console.log('📨 通知详情列表:');
    console.log('═'.repeat(80));
    
    result.notifications.forEach((n, index) => {
      const typeIcon = {
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌'
      }[n.type] || '📝';
      
      const readStatus = n.isRead ? '📖 (已读)' : '📄 (未读)';
      
      console.log(`\n#${index + 1} ${typeIcon} ${n.title} ${readStatus}`);
      console.log(`   分类: ${n.category}`);
      console.log(`   内容: ${n.message}`);
      console.log(`   时间: ${new Date(n.createdAt).toLocaleString('zh-CN')}`);
      if (n.actionData) {
        console.log(`   操作数据: ${JSON.stringify(n.actionData)}`);
      }
    });

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ 查询完成！共 ${result.notifications.length} 条通知`);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.log('\n💡 提示:');
    console.log('   1. 请确保后端服务正在运行 (npm run start:dev)');
    console.log('   2. 请先运行 send-test-notifications.js 发送测试通知');
    console.log('   3. 后端服务地址: http://localhost:7890');
    console.log('   4. API 端点: GET /api/notifications');
  }
}

main();
