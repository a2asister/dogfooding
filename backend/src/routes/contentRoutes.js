import Router from 'koa-router';
import db from '../utils/db.js';
import { authenticate, sitePermission } from '../middlewares/authMiddleware.js';

const router = new Router();

router.get('/:siteId', authenticate, sitePermission('content:read'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const { modelId, status, limit = 20, offset = 0 } = ctx.query;
    
    let query = {};
    if (modelId) query.modelId = modelId;
    if (status) query.status = status;
    
    const allContents = Object.keys(query).length > 0 
      ? await db.find('contents', query, siteId)
      : await db.findAll('contents', siteId);
    
    const contents = allContents.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    ctx.body = {
      success: true,
      data: {
        items: contents,
        total: allContents.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取内容列表失败' };
  }
});

router.get('/:siteId/:contentId', authenticate, sitePermission('content:read'), async (ctx) => {
  try {
    const { siteId, contentId } = ctx.params;
    const content = await db.findById('contents', contentId, siteId);
    
    if (!content) {
      ctx.status = 404;
      ctx.body = { error: '内容不存在' };
      return;
    }
    
    ctx.body = {
      success: true,
      data: content
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '获取内容信息失败' };
  }
});

router.post('/:siteId', authenticate, sitePermission('content:create'), async (ctx) => {
  try {
    const { siteId } = ctx.params;
    const { modelId, data, slug } = ctx.request.body;
    const user = ctx.state.user;
    
    if (!modelId || !data) {
      ctx.status = 400;
      ctx.body = { error: '模型ID和内容数据不能为空' };
      return;
    }
    
    const model = await db.findById('contentModels', modelId, siteId);
    if (!model) {
      ctx.status = 404;
      ctx.body = { error: '内容模型不存在' };
      return;
    }
    
    for (const field of model.fields) {
      if (field.required && (data[field.name] === undefined || data[field.name] === null || data[field.name] === '')) {
        ctx.status = 400;
        ctx.body = { error: `字段 "${field.label}" 不能为空` };
        return;
      }
    }
    
    const contentSlug = slug || data.slug || generateSlug(data.title || data.name || 'untitled');
    
    const existingContent = await db.findOne('contents', { slug: contentSlug }, siteId);
    if (existingContent) {
      ctx.status = 400;
      ctx.body = { error: 'URL别名已存在' };
      return;
    }
    
    const content = await db.create('contents', {
      modelId,
      modelSlug: model.slug,
      data,
      slug: contentSlug,
      status: 'draft',
      authorId: user.id,
      publishedAt: null,
      seo: {
        title: data.title || data.name || '',
        description: data.excerpt || data.description || '',
        keywords: []
      }
    }, siteId);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: content
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '创建内容失败' };
  }
});

router.put('/:siteId/:contentId', authenticate, sitePermission('content:update'), async (ctx) => {
  try {
    const { siteId, contentId } = ctx.params;
    const { data, slug, status, seo } = ctx.request.body;
    
    const content = await db.findById('contents', contentId, siteId);
    if (!content) {
      ctx.status = 404;
      ctx.body = { error: '内容不存在' };
      return;
    }
    
    const model = await db.findById('contentModels', content.modelId, siteId);
    if (!model) {
      ctx.status = 404;
      ctx.body = { error: '内容模型不存在' };
      return;
    }
    
    if (data) {
      for (const field of model.fields) {
        if (field.required && (data[field.name] === undefined || data[field.name] === null || data[field.name] === '')) {
          ctx.status = 400;
          ctx.body = { error: `字段 "${field.label}" 不能为空` };
          return;
        }
      }
    }
    
    if (slug && slug !== content.slug) {
      const existingContent = await db.findOne('contents', { slug }, siteId);
      if (existingContent && existingContent.id !== contentId) {
        ctx.status = 400;
        ctx.body = { error: 'URL别名已存在' };
        return;
      }
    }
    
    const updateData = {
      ...(data && { data }),
      ...(slug && { slug }),
      ...(status && { status }),
      ...(seo && { seo })
    };
    
    if (status === 'published' && content.status !== 'published') {
      updateData.publishedAt = new Date().toISOString();
    }
    
    const updatedContent = await db.update('contents', contentId, updateData, siteId);
    
    ctx.body = {
      success: true,
      data: updatedContent
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '更新内容失败' };
  }
});

router.delete('/:siteId/:contentId', authenticate, sitePermission('content:delete'), async (ctx) => {
  try {
    const { siteId, contentId } = ctx.params;
    
    const content = await db.findById('contents', contentId, siteId);
    if (!content) {
      ctx.status = 404;
      ctx.body = { error: '内容不存在' };
      return;
    }
    
    await db.delete('contents', contentId, siteId);
    
    ctx.body = {
      success: true,
      message: '内容已删除'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '删除内容失败' };
  }
});

router.post('/:siteId/:contentId/publish', authenticate, sitePermission('content:publish'), async (ctx) => {
  try {
    const { siteId, contentId } = ctx.params;
    
    const content = await db.findById('contents', contentId, siteId);
    if (!content) {
      ctx.status = 404;
      ctx.body = { error: '内容不存在' };
      return;
    }
    
    const updatedContent = await db.update('contents', contentId, {
      status: 'published',
      publishedAt: new Date().toISOString()
    }, siteId);
    
    ctx.body = {
      success: true,
      data: updatedContent
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: '发布内容失败' };
  }
});

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

export default router;
