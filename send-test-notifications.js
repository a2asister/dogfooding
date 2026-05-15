const http = require('http');

const API_BASE = 'http://localhost:7890/api';

// 注册或登录获取token
async function authenticate() {
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
          try {
            const result = JSON.parse(data);
            console.log('✅ 登录成功');
            resolve(result.access_token);
          } catch (e) {
            reject(e);
          }
        } else {
          // 尝试注册
          register().then(resolve).catch(reject);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function register() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: 'testuser',
      password: 'password123'
    });

    const options = {
      hostname: 'localhost',
      port: 7890,
      path: '/api/auth/register',
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
          console.log('✅ 注册成功');
          resolve(result.access_token);
        } else {
          reject(new Error('认证失败: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function sendNotification(token, notification) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(notification);

    const options = {
      hostname: 'localhost',
      port: 7890,
      path: '/api/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log(`✅ 发送通知: ${notification.title}`);
          resolve(JSON.parse(data));
        } else {
          console.error(`❌ 发送失败 (${res.statusCode}): ${data}`);
          reject(new Error(data));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🚀 开始发送测试通知...\n');

  try {
    const token = await authenticate();
    
    const testNotifications = [
      {
        title: '📁 文件系统',
        message: '您的文档 "2024年度报告.docx" 已保存成功。',
        type: 'success',
        category: 'file'
      },
      {
        title: '🔔 系统提醒',
        message: '系统将在今晚 23:00 进行例行维护，请保存好您的工作。',
        type: 'warning',
        category: 'system'
      },
      {
        title: '✅ 操作成功',
        message: '您已成功将 5 个文件移动到 "备份" 文件夹。',
        type: 'info',
        category: 'file'
      },
      {
        title: '🔒 安全提示',
        message: '检测到新的设备登录，请确认是否为您本人操作。',
        type: 'error',
        category: 'security'
      },
      {
        title: '🎨 个性化设置',
        message: '主题配置已更新，新的桌面主题已生效。',
        type: 'success',
        category: 'system'
      },
      {
        title: '📥 下载完成',
        message: '"安装包_v2.0.exe" 已下载完成，点击此处打开文件。',
        type: 'info',
        category: 'app',
        actionData: {
          actionType: 'open_file',
          payload: { path: '/downloads/安装包_v2.0.exe' }
        }
      }
    ];

    console.log(`\n📨 准备发送 ${testNotifications.length} 条测试通知...\n`);

    for (const notification of testNotifications) {
      await sendNotification(token, notification);
      await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n🎉 所有测试通知发送完成！');
    console.log('\n💡 提示：在桌面右下角点击通知图标即可查看这些消息。');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.log('\n💡 请确保后端服务正在运行 (npm run start:dev)');
  }
}

main();
