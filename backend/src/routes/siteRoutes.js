import Router from 'koa-router';
import db from '../utils/db.js';
import { authenticate, authorize, sitePermission } from '../middlewares/authMiddleware.js';

const router = new Router();

router.get('/', authenticate, authorize('site:read'), async (ctx) => {
  try {
    const user = ctx.state.user;
    let sites;
    
    if (user.role === 'super_admin') {
      sites = await db.findAll('sites');
    } else {
      sites = await db.find('sites', { ownerId: user.id });
    }
    
    ctx.body = {
      success: true,
      data: sites
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取站点列表失败' };
  }
});

router.get('/:siteId', authenticate, sitePermission('site:read'), async (ctx) => {
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
      data: site
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取站点信息失败' };
  }
});

router.post('/', authenticate, authorize('site:create'), async (ctx) => {
  try {
    const { name, domain, description, settings } = ctx.request.body;
    const user = ctx.state.user;
    
    if (!name || !domain) {
      ctx.status = 400;
      ctx.body = { error: '站点名称和域名不能为空' };
      return;
    }
    
    const existingSite = await db.findOne('sites', { domain });
    if (existingSite) {
      ctx.status = 400;
      ctx.body = { error: '域名已被使用' };
      return;
    }
    
    const site = await db.create('sites', {
      name,
      domain,
      description: description || '',
      ownerId: user.id,
      settings: settings || {
        seo: {
          title: name,
          description: description || '',
          keywords: []
        },
        publish: {
          autoPublish: false,
          publishSchedule: null
        },
        cdn: {
          enabled: false,
          provider: 'local',
          config: {}
        }
      },
      status: 'active'
    });
    
    const sitePath = await db.getSiteDbPath(site.id);
    const defaultCollections = ['contentModels', 'contents', 'routes', 'publishLogs', 'cdnAssets'];
    for (const collection of defaultCollections) {
      await db.save(collection, [], site.id);
    }
    
    await db.create('contentModels', {
      name: '文章',
      slug: 'article',
      description: '默认文章内容模型',
      fields: [
        { name: 'title', label: '标题', type: 'text', required: true },
        { name: 'slug', label: 'URL别名', type: 'text', required: true },
        { name: 'content', label: '内容', type: 'richtext', required: false },
        { name: 'excerpt', label: '摘要', type: 'textarea', required: false },
        { name: 'featuredImage', label: '特色图片', type: 'image', required: false },
        { name: 'status', label: '状态', type: 'select', options: ['draft', 'published'], required: true, default: 'draft' }
      ],
      isSystem: true
    }, site.id);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: site
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '创建站点失败' };
  }
});

router.put('/:siteId', authenticate, sitePermission('site:update'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const { name, domain, description, settings, status } = ctx.request.body;
    
    const site = await db.findById('sites', siteId);
    if (!site) {
      ctx.status = 404;
      ctx.body = { error: '站点不存在' };
      return;
    }
    
    if (domain && domain !== site.domain) {
      const existingSite = await db.findOne('sites', { domain });
      if (existingSite && existingSite.id !== siteId) {
        ctx.status = 400;
        ctx.body = { error: '域名已被使用' };
        return;
      }
    }
    
    const updatedSite = await db.update('sites', siteId, {
      ...(name && { name }),
      ...(domain && { domain }),
      ...(description !== undefined && { description }),
      ...(settings && { settings }),
      ...(status && { status })
    });
    
    ctx.body = {
      success: true,
      data: updatedSite
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '更新站点失败' };
  }
});

router.delete('/:siteId', authenticate, sitePermission('site:delete'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    
    const site = await db.findById('sites', siteId);
    if (!site) {
      ctx.status = 404;
      ctx.body = { error: '站点不存在' };
      return;
    }
    
    await db.delete('sites', siteId);
    
    const fs = await import('fs-extra');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const sitePath = path.join(__dirname, '../../../../data/sites', siteId);
    
    await fs.remove(sitePath);
    
    ctx.body = {
      success: true,
      message: '站点已删除'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '删除站点失败' };
  }
});

export default router;
