const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const { getUsers, saveUsers } = require('../data/store');

const router = new Router({ prefix: '/users' });

router.get('/', async (ctx) => {
  const users = getUsers();
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  }));
  
  ctx.body = {
    success: true,
    message: '获取用户列表成功',
    data: safeUsers
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const users = getUsers();
  const user = users.find(u => u.id === id);
  
  if (!user) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '用户不存在',
      data: null
    };
    return;
  }
  
  const safeUser = {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
  
  ctx.body = {
    success: true,
    message: '获取用户详情成功',
    data: safeUser
  };
});

router.post('/', async (ctx) => {
  const { username, password, role = 'user' } = ctx.request.body;
  
  if (!username || !password) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '用户名和密码不能为空',
      data: null
    };
    return;
  }
  
  const users = getUsers();
  
  if (users.find(u => u.username === username)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '用户名已存在',
      data: null
    };
    return;
  }
  
  const newUser = {
    id: uuidv4(),
    username,
    password,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  const safeUser = {
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt
  };
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    message: '创建用户成功',
    data: safeUser
  };
});

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body;
  
  if (!username || !password) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '用户名和密码不能为空',
      data: null
    };
    return;
  }
  
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: '用户名或密码错误',
      data: null
    };
    return;
  }
  
  const safeUser = {
    id: user.id,
    username: user.username,
    role: user.role,
    token: btoa(`${user.id}:${user.username}`)
  };
  
  ctx.body = {
    success: true,
    message: '登录成功',
    data: safeUser
  };
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { password, role } = ctx.request.body;
  
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '用户不存在',
      data: null
    };
    return;
  }
  
  users[index] = {
    ...users[index],
    ...(password && { password }),
    ...(role && { role }),
    updatedAt: new Date().toISOString()
  };
  
  saveUsers(users);
  
  const safeUser = {
    id: users[index].id,
    username: users[index].username,
    role: users[index].role,
    createdAt: users[index].createdAt,
    updatedAt: users[index].updatedAt
  };
  
  ctx.body = {
    success: true,
    message: '更新用户成功',
    data: safeUser
  };
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '用户不存在',
      data: null
    };
    return;
  }
  
  users.splice(index, 1);
  saveUsers(users);
  
  ctx.body = {
    success: true,
    message: '删除用户成功',
    data: null
  };
});

module.exports = router;
