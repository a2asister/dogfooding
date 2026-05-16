const http = require('http');

// 图片的 base64 数据（使用实际的图片数据）
const imageData = 'https://picsum.photos/800/600?random=cute-lemoo';

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

async function createFile(token, name, content, type = 'file', parentId = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      name,
      content,
      type,
      parentId
    });

    const options = {
      hostname: 'localhost',
      port: 7890,
      path: '/api/files',
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
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`创建文件失败 (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getFiles(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 7890,
      path: '/api/files',
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
          reject(new Error(`获取文件列表失败: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🚀 开始添加图片到资源管理器...\n');

  try {
    // 1. 登录获取 token
    console.log('📝 步骤 1: 登录获取认证 Token...');
    const token = await login();
    console.log('✅ Token 获取成功\n');

    // 2. 创建可爱的柠檬图片文件
    console.log('🖼️ 步骤 2: 创建可爱柠檬图片文件...');
    
    const imageFiles = [
      {
        name: '可爱小柠檬.png',
        content: 'https://picsum.photos/800/600?random=lemoo-cute'
      },
      {
        name: '3D卡通头像.png',
        content: 'https://picsum.photos/600/600?random=avatar-3d'
      },
      {
        name: '桌面背景图.jpg',
        content: 'https://picsum.photos/1920/1080?random=wallpaper-nice'
      }
    ];

    for (const file of imageFiles) {
      const result = await createFile(token, file.name, file.content);
      console.log(`   ✅ 创建成功: ${file.name} (ID: ${result.id})`);
    }

    console.log('\n📋 步骤 3: 获取当前文件列表...');
    const files = await getFiles(token);
    
    console.log('\n📁 文件系统当前内容:');
    console.log('═'.repeat(80));
    
    const folders = files.filter(f => f.type === 'folder');
    const imageFilesList = files.filter(f => f.type === 'file' && 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name));
    const otherFiles = files.filter(f => f.type === 'file' && 
      !/\.(jpg|jpeg|png|gif|webp)$/i.test(f.name));

    if (folders.length > 0) {
      console.log('\n📂 文件夹:');
      folders.forEach(f => console.log(`   📁 ${f.name}`));
    }

    if (imageFilesList.length > 0) {
      console.log('\n🖼️  图片文件:');
      imageFilesList.forEach(f => console.log(`   🖼️  ${f.name}`));
    }

    if (otherFiles.length > 0) {
      console.log('\n📄 其他文件:');
      otherFiles.forEach(f => console.log(`   📄 ${f.name}`));
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ 总共 ${files.length} 个文件/文件夹`);
    console.log(`✅ 新增 ${imageFiles.length} 张图片`);
    console.log('\n💡 提示: 在文件资源管理器中双击图片文件即可打开图片查看器！');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.log('\n💡 请确保后端服务正在运行 (npm run start:dev)');
  }
}

main();
