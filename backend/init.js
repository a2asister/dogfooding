const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const password = '123456';
const saltRounds = 10;

console.log('========================================');
console.log('  统一登录门户 - 数据初始化');
console.log('========================================');
console.log('');
console.log('正在生成密码哈希...');

const hash = bcrypt.hashSync(password, saltRounds);

console.log(`密码: ${password}`);
console.log(`哈希: ${hash}`);
console.log('');

const users = [
  {
    "id": "1",
    "username": "admin",
    "password": hash,
    "name": "系统管理员",
    "roles": ["admin"],
    "permissions": ["system:*", "data:*", "content:*"],
    "subsystems": ["system-admin", "data-analytics", "content-management"]
  },
  {
    "id": "2",
    "username": "data-analyst",
    "password": hash,
    "name": "数据分析师",
    "roles": ["data-analyst"],
    "permissions": ["data:*"],
    "subsystems": ["data-analytics"]
  },
  {
    "id": "3",
    "username": "content-editor",
    "password": hash,
    "name": "内容编辑",
    "roles": ["content-editor"],
    "permissions": ["content:*"],
    "subsystems": ["content-management"]
  }
];

const dataPath = path.join(__dirname, 'data');
const usersPath = path.join(dataPath, 'users.json');

if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');

console.log('用户数据已保存到: data/users.json');
console.log('');
console.log('========================================');
console.log('  测试账号');
console.log('========================================');
console.log('');
console.log('1. 系统管理员');
console.log('   账号: admin');
console.log('   密码: 123456');
console.log('   角色: admin');
console.log('   权限: system:*, data:*, content:*');
console.log('   子系统: 系统管理、数据分析、内容管理');
console.log('');
console.log('2. 数据分析师');
console.log('   账号: data-analyst');
console.log('   密码: 123456');
console.log('   角色: data-analyst');
console.log('   权限: data:*');
console.log('   子系统: 数据分析');
console.log('');
console.log('3. 内容编辑');
console.log('   账号: content-editor');
console.log('   密码: 123456');
console.log('   角色: content-editor');
console.log('   权限: content:*');
console.log('   子系统: 内容管理');
console.log('');
console.log('========================================');
console.log('  启动方式');
console.log('========================================');
console.log('');
console.log('1. 安装依赖:');
console.log('   cd backend && npm install');
console.log('   cd ../frontend/portal && npm install');
console.log('   cd ../subsystems/system-admin && npm install');
console.log('   cd ../data-analytics && npm install');
console.log('   cd ../content-management && npm install');
console.log('');
console.log('2. 初始化数据 (首次运行需要):');
console.log('   cd backend && node init.js');
console.log('');
console.log('3. 启动服务 (需要多个终端):');
console.log('   后端: cd backend && npm run dev');
console.log('   主门户: cd frontend/portal && npm run dev');
console.log('   系统管理: cd frontend/subsystems/system-admin && npm run dev');
console.log('   数据分析: cd frontend/subsystems/data-analytics && npm run dev');
console.log('   内容管理: cd frontend/subsystems/content-management && npm run dev');
console.log('');
console.log('4. 访问地址:');
console.log('   主门户: http://localhost:3000');
console.log('   后端API: http://localhost:7100');
console.log('   系统管理: http://localhost:7101');
console.log('   数据分析: http://localhost:7102');
console.log('   内容管理: http://localhost:7103');
console.log('');
