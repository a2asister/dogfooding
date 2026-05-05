import jwt from 'jsonwebtoken';
import db from '../utils/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cms-jwt-secret-key-2024';

export const authenticate = async (ctx, next) => {
  try {
    const authHeader = ctx.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = { error: '未提供认证令牌' };
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.findById('users', decoded.userId);
      
      if (!user) {
        ctx.status = 401;
        ctx.body = { error: '用户不存在' };
        return;
      }
      
      ctx.state.user = user;
      await next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        ctx.status = 401;
        ctx.body = { error: '令牌已过期' };
      } else {
        ctx.status = 401;
        ctx.body = { error: '无效的令牌' };
      }
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '认证过程中发生错误' };
  }
};

export const authorize = (permission) => {
  return async (ctx, next) => {
    const user = ctx.state.user;
    
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: '未认证' };
      return;
    }
    
    const role = await db.findOne('roles', { name: user.role });
    
    if (!role) {
      ctx.status = 403;
      ctx.body = { error: '无此角色权限' };
      return;
    }
    
    if (role.permissions.includes('*') || role.permissions.includes(permission)) {
      await next();
    } else {
      ctx.status = 403;
      ctx.body = { error: '无此权限' };
    }
  };
};

export const sitePermission = (permission) => {
  return async (ctx, next) => {
    const user = ctx.state.user;
    const { siteId } = ctx.params;
    
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: '未认证' };
      return;
    }
    
    if (user.role === 'super_admin') {
      await next();
      return;
    }
    
    if (!siteId) {
      ctx.status = 400;
      ctx.body = { error: '缺少站点ID' };
      return;
    }
    
    const site = await db.findById('sites', siteId);
    if (!site) {
      ctx.status = 404;
      ctx.body = { error: '站点不存在' };
      return;
    }
    
    if (user.role === 'site_admin' && site.ownerId === user.id) {
      const role = await db.findOne('roles', { name: 'site_admin' });
      if (role.permissions.includes(permission) || role.permissions.includes('*')) {
        ctx.state.site = site;
        await next();
        return;
      }
    }
    
    ctx.status = 403;
    ctx.body = { error: '无此站点权限' };
  };
};

export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export { JWT_SECRET };
