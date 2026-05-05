import Router from 'koa-router';
import db from '../utils/db.js';
import { authenticate, sitePermission } from '../middlewares/authMiddleware.js';

const router = new Router();

router.get('/:siteId', authenticate, sitePermission('route:read'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const routes = await db.findAll('routes', siteId);
    
    ctx.body = {
      success: true,
      data: routes
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取路由规则列表失败' };
  }
});

router.get('/:siteId/:routeId', authenticate, sitePermission('route:read'), async (ctx) => {
  try {
    const { siteId, routeId } = ctx.params;
    const route = await db.findById('routes', routeId, siteId);
    
    if (!route) {
      ctx.status = 404;
      ctx.body = { error: '路由规则不存在' };
      return;
    }
    
    ctx.body = {
      success: true,
      data: route
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取路由规则信息失败' };
  }
});

router.post('/:siteId', authenticate, sitePermission('route:create'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const { pattern, type, targetModel, template, renderType, priority } = ctx.request.body;
    
    if (!pattern || !type) {
      ctx.status = 400;
      ctx.body = { error: '路由模式和类型不能为空' };
      return;
    }
    
    if (type === 'model' && !targetModel) {
      ctx.status = 400;
      ctx.body = { error: '模型路由需要指定目标模型' };
      return;
    }
    
    const existingRoute = await db.findOne('routes', { pattern }, siteId);
    if (existingRoute) {
      ctx.status = 400;
      ctx.body = { error: '路由模式已存在' };
      return;
    }
    
    const route = await db.create('routes', {
      pattern,
      type,
      targetModel: targetModel || null,
      template: template || 'default',
      renderType: renderType || 'ssg',
      priority: priority || 0,
      status: 'active',
      seo: {
        title: '',
        description: '',
        keywords: []
      }
    }, siteId);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: route
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '创建路由规则失败' };
  }
});

router.put('/:siteId/:routeId', authenticate, sitePermission('route:update'), async (ctx) => {
  try {
    const { siteId, routeId } = ctx.params;
    const { pattern, type, targetModel, template, renderType, priority, status, seo } = ctx.request.body;
    
    const route = await db.findById('routes', routeId, siteId);
    if (!route) {
      ctx.status = 404;
      ctx.body = { error: '路由规则不存在' };
      return;
    }
    
    if (pattern && pattern !== route.pattern) {
      const existingRoute = await db.findOne('routes', { pattern }, siteId);
      if (existingRoute && existingRoute.id !== routeId) {
        ctx.status = 400;
        ctx.body = { error: '路由模式已存在' };
        return;
      }
    }
    
    const updateData = {
      ...(pattern && { pattern }),
      ...(type && { type }),
      ...(targetModel !== undefined && { targetModel }),
      ...(template && { template }),
      ...(renderType && { renderType }),
      ...(priority !== undefined && { priority }),
      ...(status && { status }),
      ...(seo && { seo })
    };
    
    const updatedRoute = await db.update('routes', routeId, updateData, siteId);
    
    ctx.body = {
      success: true,
      data: updatedRoute
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '更新路由规则失败' };
  }
});

router.delete('/:siteId/:routeId', authenticate, sitePermission('route:delete'), async (ctx) => {
  try {
    const { siteId, routeId } = ctx.params;
    
    const route = await db.findById('routes', routeId, siteId);
    if (!route) {
      ctx.status = 404;
      ctx.body = { error: '路由规则不存在' };
      return;
    }
    
    await db.delete('routes', routeId, siteId);
    
    ctx.body = {
      success: true,
      message: '路由规则已删除'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '删除路由规则失败' };
  }
});

export default router;
