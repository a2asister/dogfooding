const express = require('express');
const router = express.Router();
const dataStore = require('../utils/dataStore');
const { checkPermission } = require('../middleware/auth');

router.get('/roles', checkPermission(['permission:view']), (req, res) => {
  const permissions = dataStore.readData('permissions.json');
  const roles = permissions?.roles || [];
  
  res.json({
    success: true,
    data: roles
  });
});

router.get('/permissions', checkPermission(['permission:view']), (req, res) => {
  const permissions = dataStore.readData('permissions.json');
  const allPermissions = permissions?.permissions || [];
  
  res.json({
    success: true,
    data: allPermissions
  });
});

router.get('/modules', checkPermission(['permission:view']), (req, res) => {
  const permissions = dataStore.readData('permissions.json');
  const modules = permissions?.modules || [];
  
  res.json({
    success: true,
    data: modules
  });
});

router.get('/user-permissions/:userId', checkPermission(['permission:view']), (req, res) => {
  const { userId } = req.params;
  const user = dataStore.getById('users.json', userId);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const permissions = dataStore.readData('permissions.json');
  const rolePermissions = permissions?.roles?.find(r => r.name === user.role)?.permissions || [];
  
  const allPermissions = [...new Set([...rolePermissions, ...(user.permissions || [])])];
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      rolePermissions,
      userPermissions: user.permissions || [],
      effectivePermissions: allPermissions
    }
  });
});

router.post('/roles', checkPermission(['permission:create']), (req, res) => {
  const { name, description, permissions } = req.body;
  
  const permData = dataStore.readData('permissions.json') || { roles: [], permissions: [], modules: [] };
  
  const existingRole = permData.roles.find(r => r.name === name);
  if (existingRole) {
    return res.status(400).json({ error: '角色已存在' });
  }
  
  const newRole = {
    id: Date.now().toString(),
    name,
    description,
    permissions: permissions || [],
    createdAt: new Date().toISOString()
  };
  
  permData.roles.push(newRole);
  dataStore.writeData('permissions.json', permData);
  
  res.status(201).json({
    success: true,
    message: '角色创建成功',
    data: newRole
  });
});

router.put('/roles/:roleId', checkPermission(['permission:edit']), (req, res) => {
  const { roleId } = req.params;
  const { name, description, permissions } = req.body;
  
  const permData = dataStore.readData('permissions.json') || { roles: [], permissions: [], modules: [] };
  
  const roleIndex = permData.roles.findIndex(r => r.id === roleId);
  if (roleIndex === -1) {
    return res.status(404).json({ error: '角色不存在' });
  }
  
  permData.roles[roleIndex] = {
    ...permData.roles[roleIndex],
    name: name || permData.roles[roleIndex].name,
    description: description || permData.roles[roleIndex].description,
    permissions: permissions || permData.roles[roleIndex].permissions,
    updatedAt: new Date().toISOString()
  };
  
  dataStore.writeData('permissions.json', permData);
  
  res.json({
    success: true,
    message: '角色更新成功',
    data: permData.roles[roleIndex]
  });
});

router.delete('/roles/:roleId', checkPermission(['permission:delete']), (req, res) => {
  const { roleId } = req.params;
  
  const permData = dataStore.readData('permissions.json') || { roles: [], permissions: [], modules: [] };
  
  const roleIndex = permData.roles.findIndex(r => r.id === roleId);
  if (roleIndex === -1) {
    return res.status(404).json({ error: '角色不存在' });
  }
  
  const deletedRole = permData.roles.splice(roleIndex, 1)[0];
  dataStore.writeData('permissions.json', permData);
  
  res.json({
    success: true,
    message: '角色删除成功',
    data: deletedRole
  });
});

module.exports = router;
