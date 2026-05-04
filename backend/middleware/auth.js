const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '令牌无效或已过期' });
    }
    req.user = user;
    next();
  });
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user || !user.permissions) {
      return res.status(403).json({ success: false, message: '没有权限访问' });
    }
    
    const hasPermission = user.permissions.some(permission => {
      if (permission === '*') return true;
      if (permission.endsWith(':*')) {
        const prefix = permission.slice(0, -1);
        return requiredPermission.startsWith(prefix);
      }
      return permission === requiredPermission;
    });

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: '没有权限访问' });
    }

    next();
  };
};

const checkSubsystemAccess = (subsystemId) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user || !user.subsystems) {
      return res.status(403).json({ success: false, message: '没有权限访问该子系统' });
    }
    
    if (!user.subsystems.includes(subsystemId)) {
      return res.status(403).json({ success: false, message: '没有权限访问该子系统' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  checkPermission,
  checkSubsystemAccess
};
