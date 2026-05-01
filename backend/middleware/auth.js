const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'rms-secret-key-2024';

const usersData = require('../data/users.json');
const permissionsData = require('../data/permissions.json');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未授权访问，缺少token' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'token无效或已过期' });
    }
    req.user = user;
    next();
  });
}

function checkPermission(requiredPermissions) {
  return (req, res, next) => {
    const userRole = req.user.role;
    const userPermissions = getPermissionsByRole(userRole);
    
    const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));
    
    if (!hasPermission) {
      return res.status(403).json({ error: '权限不足' });
    }
    
    next();
  };
}

function getPermissionsByRole(role) {
  const rolePermissions = permissionsData.roles.find(r => r.name === role);
  if (rolePermissions) {
    return rolePermissions.permissions;
  }
  return [];
}

function hasPermission(userRole, permission) {
  const permissions = getPermissionsByRole(userRole);
  return permissions.includes(permission);
}

module.exports = {
  authenticateToken,
  checkPermission,
  getPermissionsByRole,
  hasPermission,
  JWT_SECRET
};
