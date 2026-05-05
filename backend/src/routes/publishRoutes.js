import Router from 'koa-router';
import db from '../utils/db.js';
import { authenticate, sitePermission } from '../middlewares/authMiddleware.js';
import { staticRenderer } from '../utils/staticRenderer.js';

const router = new Router();

router.get('/:siteId/logs', authenticate, sitePermission('content:publish'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const { limit = 20, offset = 0 } = ctx.query;
    
    const allLogs = await db.findAll('publishLogs', siteId);
    const logs = allLogs
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    ctx.body = {
      success: true,
      data: {
        items: logs,
        total: allLogs.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取发布日志失败' };
  }
});

router.post('/:siteId/publish', authenticate, sitePermission('content:publish'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const { contentIds, type = 'incremental' } = ctx.request.body;
    const user = ctx.state.user;
    
    const site = await db.findById('sites', siteId);
    if (!site) {
      ctx.status = 404;
      ctx.body = { error: '站点不存在' };
      return;
    }
    
    let contentsToPublish = [];
    
    if (type === 'incremental' && contentIds && contentIds.length > 0) {
      for (const contentId of contentIds) {
        const content = await db.findById('contents', contentId, siteId);
        if (content && content.status === 'published') {
          contentsToPublish.push(content);
        }
      }
    } else if (type === 'full') {
      const allPublishedContents = await db.find('contents', { status: 'published' }, siteId);
      contentsToPublish = allPublishedContents;
    }
    
    const publishLog = await db.create('publishLogs', {
      type,
      contentCount: contentsToPublish.length,
      status: 'processing',
      triggeredBy: user.id,
      triggeredAt: new Date().toISOString()
    }, siteId);
    
    try {
      const result = await staticRenderer.renderAndPublish(site, contentsToPublish, siteId);
      
      await db.update('publishLogs', publishLog.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        details: result
      }, siteId);
      
      ctx.body = {
        success: true,
        data: {
          logId: publishLog.id,
          publishedCount: contentsToPublish.length,
          details: result
        }
      };
    } catch (error) {
      await db.update('publishLogs', publishLog.id, {
        status: 'failed',
        completedAt: new Date().toISOString(),
        error: error.message
      }, siteId);
      
      ctx.status = 500;
      ctx.body = { error: '发布过程中发生错误' };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '发布失败' };
  }
});

router.post('/:siteId/schedule', authenticate, sitePermission('content:publish'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const { cronExpression, enabled, type = 'incremental' } = ctx.request.body;
    
    const site = await db.findById('sites', siteId);
    if (!site) {
      ctx.status = 404;
      ctx.body = { error: '站点不存在' };
      return;
    }
    
    const updatedSettings = {
      ...site.settings,
      publish: {
        ...site.settings.publish,
        autoPublish: enabled || false,
        publishSchedule: cronExpression || null,
        publishType: type
      }
    };
    
    const updatedSite = await db.update('sites', siteId, {
      settings: updatedSettings
    });
    
    ctx.body = {
      success: true,
      data: updatedSite.settings.publish
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '设置定时发布失败' };
  }
});

router.get('/:siteId/schedule', authenticate, sitePermission('content:publish'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    
    const site = await db.findById('sites', siteId);
    if (!site) {
      ctx.status = 404;
      ctx.body = { error: '站点不存在' };
      return;
    }
    
    ctx.body = {
      success: true,
      data: site.settings.publish || {
        autoPublish: false,
        publishSchedule: null,
        publishType: 'incremental'
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取定时发布设置失败' };
  }
});

export default router;
