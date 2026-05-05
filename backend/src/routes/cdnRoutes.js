import Router from 'koa-router';
import db from '../utils/db.js';
import { authenticate, sitePermission } from '../middlewares/authMiddleware.js';

const router = new Router();

router.get('/:siteId/config', authenticate, sitePermission('site:read'), async (ctx) => {
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
      data: site.settings?.cdn || {
        enabled: false,
        provider: 'local',
        config: {}
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取 CDN 配置失败' };
  }
});

router.put('/:siteId/config', authenticate, sitePermission('site:update'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const { enabled, provider, config } = ctx.request.body;
    
    const site = await db.findById('sites', siteId);
    if (!site) {
      ctx.status = 404;
      ctx.body = { error: '站点不存在' };
      return;
    }
    
    const updatedSettings = {
      ...site.settings,
      cdn: {
        enabled: enabled ?? false,
        provider: provider || 'local',
        config: config || {}
      }
    };
    
    const updatedSite = await db.update('sites', siteId, {
      settings: updatedSettings
    });
    
    ctx.body = {
      success: true,
      data: updatedSite.settings.cdn
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '更新 CDN 配置失败' };
  }
});

router.get('/:siteId/assets', authenticate, sitePermission('site:read'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const { limit = 20, offset = 0 } = ctx.query;
    
    const allAssets = await db.findAll('cdnAssets', siteId);
    const assets = allAssets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    ctx.body = {
      success: true,
      data: {
        items: assets,
        total: allAssets.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取 CDN 资源列表失败' };
  }
});

router.post('/:siteId/assets/sync', authenticate, sitePermission('site:update'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const { assetIds } = ctx.request.body;
    const user = ctx.state.user;
    
    const site = await db.findById('sites', siteId);
    if (!site) {
      ctx.status = 404;
      ctx.body = { error: '站点不存在' };
      return;
    }
    
    if (!site.settings?.cdn?.enabled) {
      ctx.status = 400;
      ctx.body = { error: 'CDN 未启用' };
      return;
    }
    
    const syncLog = {
      id: crypto.randomUUID(),
      siteId,
      triggeredBy: user.id,
      status: 'processing',
      assetCount: assetIds?.length || 0,
      createdAt: new Date().toISOString()
    };
    
    ctx.body = {
      success: true,
      data: {
        message: 'CDN 同步任务已启动',
        syncLog
      }
    };
    
    setTimeout(async () => {
      try {
        console.log(`Starting CDN sync for site ${siteId}`);
        
        const assets = await db.findAll('cdnAssets', siteId);
        const assetsToSync = assetIds && assetIds.length > 0
          ? assets.filter(a => assetIds.includes(a.id))
          : assets;
        
        for (const asset of assetsToSync) {
          await db.update('cdnAssets', asset.id, {
            status: 'synced',
            syncedAt: new Date().toISOString()
          }, siteId);
        }
        
        console.log(`CDN sync completed for site ${siteId}: ${assetsToSync.length} assets synced`);
      } catch (error) {
        console.error('CDN sync failed:', error);
      }
    }, 100);
    
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'CDN 同步失败' };
  }
});

router.get('/:siteId/providers', authenticate, sitePermission('site:read'), async (ctx) => {
  try {
    const providers = [
      {
        id: 'local',
        name: '本地存储',
        description: '使用服务器本地文件系统存储',
        configSchema: {}
      },
      {
        id: 'aliyun',
        name: '阿里云 OSS',
        description: '阿里云对象存储服务',
        configSchema: {
          accessKeyId: 'string',
          accessKeySecret: 'string',
          bucket: 'string',
          region: 'string',
          endpoint: 'string'
        }
      },
      {
        id: 'qiniu',
        name: '七牛云',
        description: '七牛云对象存储',
        configSchema: {
          accessKey: 'string',
          secretKey: 'string',
          bucket: 'string',
          domain: 'string'
        }
      },
      {
        id: 'aws',
        name: 'AWS S3',
        description: 'Amazon Simple Storage Service',
        configSchema: {
          accessKeyId: 'string',
          secretAccessKey: 'string',
          bucket: 'string',
          region: 'string'
        }
      }
    ];
    
    ctx.body = {
      success: true,
      data: providers
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取 CDN 提供商列表失败' };
  }
});

export default router;
