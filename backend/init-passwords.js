const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const password = '123456';
const saltRounds = 10;

console.log('正在生成密码哈希...');
console.log(`密码: ${password}`);

const hash = bcrypt.hashSync(password, saltRounds);
console.log(`哈希值: ${hash}`);

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

const usersPath = path.join(__dirname, 'data', 'users.json');

if (!fs.existsSync(path.dirname(usersPath))) {
  fs.mkdirSync(path.dirname(usersPath), { recursive: true });
}

fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');

console.log('\n密码初始化完成！');
console.log(`用户数据已保存到: ${usersPath}`);
console.log('\n测试账号:');
console.log('1. 管理员: admin / 123456');
console.log('   - 可访问: 系统管理、数据分析、内容管理');
console.log('   - 权限: system:*, data:*, content:*');
console.log('');
console.log('2. 数据分析师: data-analyst / 123456');
console.log('   - 可访问: 数据分析');
console.log('   - 权限: data:*');
console.log('');
console.log('3. 内容编辑: content-editor / 123456');
console.log('   - 可访问: 内容管理');
console.log('   - 权限: content:*');
